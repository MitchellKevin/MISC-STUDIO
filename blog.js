// MARK: Blog archive filter.
//
// Deliberately dependency-free — blog.html loads no GSAP, so the archive stays
// light. Filtering works straight off the DOM: every card carries data-tag and
// every button carries data-filter, so adding a post means adding one card, and
// adding a category means adding one button. Nothing here needs updating.
(() => {
  const grid = document.getElementById('archive-grid');
  if (!grid) return;

  const buttons = Array.from(document.querySelectorAll('.filters__btn'));
  const cards = Array.from(grid.querySelectorAll('.bpost'));
  const count = document.getElementById('filter-count');
  const empty = document.getElementById('archive-empty');

  const apply = (filter) => {
    let shown = 0;
    cards.forEach((card) => {
      const match = filter === 'all' || card.dataset.tag === filter;
      card.classList.toggle('is-filtered', !match);
      if (match) shown += 1;
    });

    buttons.forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.filter === filter));
    });

    if (count) {
      count.textContent =
        shown === cards.length ? `${cards.length} posts` : `${shown} van ${cards.length}`;
    }
    if (empty) empty.classList.toggle('is-shown', shown === 0);

    // keep the choice in the URL so a filtered view can be linked and survives
    // a reload or a back button
    const url = new URL(window.location);
    if (filter === 'all') url.searchParams.delete('tag');
    else url.searchParams.set('tag', filter);
    history.replaceState(null, '', url);
  };

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => apply(btn.dataset.filter));
  });

  // honour ?tag= on load, but only if it matches a filter that actually exists
  const wanted = new URLSearchParams(window.location.search).get('tag');
  const valid = buttons.some((b) => b.dataset.filter === wanted);
  apply(valid ? wanted : 'all');
})();
