# Lift a product shot off a smooth studio backdrop.
#
#   python3 tools/cutout.py oris-aquis.jpg img/about/oris-aquis.png
#
# Polished steel defeats the obvious approaches: it is neither consistently
# brighter nor more detailed than a grey backdrop, so neither a brightness
# threshold nor an edge-flood can separate the two on their own. What works is
# combining them and then filling:
#
#   1. Fit a smooth 2D polynomial to the backdrop, sampled well clear of the
#      subject. The gradient here is radial, so a per-row fit is not enough —
#      degree 4 lands within ~9 levels at p95.
#   2. Mark a pixel as subject if it departs from that model OR carries detail.
#   3. Flood the background inwards from the border. Anything the flood cannot
#      reach is subject — which fills every smooth patch of bracelet enclosed
#      by the outline, without needing to detect it directly.
import sys
from collections import deque
from PIL import Image, ImageFilter

SRC  = sys.argv[1] if len(sys.argv) > 1 else 'oris-aquis.jpg'
OUT  = sys.argv[2] if len(sys.argv) > 2 else 'cutout.png'
TONE = int(sys.argv[3]) if len(sys.argv) > 3 else 26   # departure from the backdrop model
EDGE = int(sys.argv[4]) if len(sys.argv) > 4 else 13   # detail
DEG  = 4

im = Image.open(SRC).convert('RGB')

# a white frame around the panel would trap the flood in its own border, so
# trim past the join
_nw = im.convert('L').point(lambda v: 0 if v >= 251 else 255)
_p = _nw.getbbox()
if _p and (_p[2] - _p[0]) > im.width * 0.4:
    im = im.crop((_p[0] + 6, _p[1] + 6, _p[2] - 6, _p[3] - 6))
W, H = im.size
px = im.load()

# --- 1. model the backdrop ------------------------------------------------
# The subject is assumed to sit in the middle; this box is only kept OUT of the
# fit, so it is deliberately generous.
EX = (int(W * 0.22), int(H * 0.16), int(W * 0.79), int(H * 0.83))
def terms(u, v):
    return [u**i * v**j for i in range(DEG + 1) for j in range(DEG + 1 - i)]

n = len(terms(0, 0))
A = [[0.0] * (n + 1) for _ in range(n)]
for y in range(0, H, 3):
    for x in range(0, W, 3):
        if EX[0] <= x <= EX[2] and EX[1] <= y <= EX[3]:
            continue
        t = terms(x / (W - 1), y / (H - 1))
        val = px[x, y][0]
        for a in range(n):
            ta = t[a]
            for b in range(n):
                A[a][b] += ta * t[b]
            A[a][n] += ta * val
for c in range(n):
    p = max(range(c, n), key=lambda r: abs(A[r][c]))
    A[c], A[p] = A[p], A[c]
    if abs(A[c][c]) < 1e-12:
        continue
    for r in range(n):
        if r == c:
            continue
        f = A[r][c] / A[c][c]
        for k in range(c, n + 1):
            A[r][k] -= f * A[c][k]
coef = [A[i][n] / A[i][i] if abs(A[i][i]) > 1e-12 else 0.0 for i in range(n)]

# --- 2. subject = departs from the model, or carries detail ---------------
g = im.convert('L').filter(ImageFilter.MedianFilter(3)).filter(ImageFilter.SMOOTH_MORE)
edges = g.filter(ImageFilter.FIND_EDGES).load()
RIM = 3

subj = bytearray(W * H)
for y in range(H):
    v = y / (H - 1)
    for x in range(W):
        m = sum(c * t for c, t in zip(coef, terms(x / (W - 1), v)))
        hit = abs(px[x, y][0] - m) >= TONE
        if not hit and RIM <= x < W - RIM and RIM <= y < H - RIM:
            hit = edges[x, y] >= EDGE
        if hit:
            subj[y * W + x] = 1

# close small gaps so the outline is watertight before the flood
tmp = Image.frombytes('L', (W, H), bytes(255 if v else 0 for v in subj))
tmp = tmp.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(3))
tp = tmp.load()
for y in range(H):
    for x in range(W):
        subj[y * W + x] = 1 if tp[x, y] > 127 else 0

# --- 3. flood the backdrop in from the border; the rest is subject --------
bg = bytearray(W * H)
dq = deque()
for x in range(W):
    for y in (0, H - 1):
        i = y * W + x
        if not subj[i] and not bg[i]:
            bg[i] = 1; dq.append((x, y))
for y in range(H):
    for x in (0, W - 1):
        i = y * W + x
        if not subj[i] and not bg[i]:
            bg[i] = 1; dq.append((x, y))
while dq:
    x, y = dq.popleft()
    for nx, ny in ((x+1, y), (x-1, y), (x, y+1), (x, y-1)):
        if 0 <= nx < W and 0 <= ny < H:
            j = ny * W + nx
            if not bg[j] and not subj[j]:
                bg[j] = 1; dq.append((nx, ny))
print('backdrop %.1f%%, subject %.1f%%' % (100.0*sum(bg)/(W*H), 100.0*(1-sum(bg)/(W*H))))

# keep only the biggest blob — stray specks of backdrop noise would otherwise
# survive and stretch the crop far past the subject
seen = bytearray(W * H)
best, bestn = None, 0
for sy in range(H):
    for sx in range(W):
        i0 = sy * W + sx
        if bg[i0] or seen[i0]:
            continue
        comp, dq2, cnt = [], deque([(sx, sy)]), 0
        seen[i0] = 1
        while dq2:
            x, y = dq2.popleft()
            comp.append(y * W + x); cnt += 1
            for nx, ny in ((x+1, y), (x-1, y), (x, y+1), (x, y-1)):
                if 0 <= nx < W and 0 <= ny < H:
                    j = ny * W + nx
                    if not bg[j] and not seen[j]:
                        seen[j] = 1; dq2.append((nx, ny))
        if cnt > bestn:
            best, bestn = comp, cnt
keep = bytearray(W * H)
for i in best or []:
    keep[i] = 1
print('largest blob: %d px (%.1f%% of frame)' % (bestn, 100.0 * bestn / (W * H)))

alpha = Image.frombytes('L', (W, H), bytes(255 if v else 0 for v in keep))
# undo the closing dilation, then feather so the edge is not cut with scissors
alpha = alpha.filter(ImageFilter.MinFilter(5))
alpha = alpha.filter(ImageFilter.GaussianBlur(0.7))

out = im.copy(); out.putalpha(alpha)
box = alpha.point(lambda v: 255 if v > 10 else 0).getbbox()
out = out.crop(box)
out.save(OUT)
print('wrote', OUT, out.size)
