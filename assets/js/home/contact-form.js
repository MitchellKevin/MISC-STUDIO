// Contact form -> email via EmailJS (https://www.emailjs.com).
// Fill in the three values below from the EmailJS dashboard. The public key is
// meant to be public; restrict it to this domain under Account -> Security.
//
// The template receives: first_name, last_name, name, company, email,
// message and services (e.g. "UX Design, Web Development").
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';

(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;

  if (window.emailjs) emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

  const button = form.querySelector('.cform__submit');
  const label = form.querySelector('.cform__submit-label');
  const status = form.querySelector('.cform__status');
  const idleLabel = label.textContent;

  const setStatus = (text, kind) => {
    status.textContent = text;
    status.classList.toggle('is-success', kind === 'success');
    status.classList.toggle('is-error', kind === 'error');
  };

  // MARK: Validation — the form is novalidate, so these messages replace the
  // browser's own bubbles. Each rule returns an error message, or '' if fine.
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const MESSAGE_MIN = 10;
  const rules = {
    first_name: (v) => (v ? '' : 'Please enter your first name.'),
    email: (v) => {
      if (!v) return 'Please enter your email address.';
      if (!EMAIL_RE.test(v)) return 'That email does not look right. Check for a missing @ or a typo.';
      return '';
    },
    message: (v) => {
      if (!v) return 'Please tell me a bit about your project.';
      if (v.length < MESSAGE_MIN) return `A little more detail helps. Write at least ${MESSAGE_MIN} characters.`;
      return '';
    },
  };

  // Shows or clears one field's error; returns true when the field is valid.
  const validateField = (input) => {
    const message = rules[input.name](input.value.trim());
    const error = document.getElementById(input.getAttribute('aria-describedby'));
    input.closest('.cfield').classList.toggle('is-invalid', !!message);
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    error.textContent = message;
    return !message;
  };

  const fields = Object.keys(rules).map((name) => form.elements[name]);
  fields.forEach((input) => {
    // check when the visitor leaves a field they typed in, not while they
    // are still typing it the first time
    input.addEventListener('blur', () => {
      if (input.value.trim()) validateField(input);
    });
    // once a field shows an error, clear it as soon as the input is fixed
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') !== 'true') return;
      validateField(input);
      // drop the "Please fix…" line once nothing is highlighted any more
      if (!form.querySelector('.cfield.is-invalid')) setStatus('', null);
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const invalid = fields.filter((input) => !validateField(input));
    if (invalid.length) {
      setStatus(invalid.length === 1 ? 'Please fix the highlighted field.' : 'Please fix the highlighted fields.', 'error');
      invalid[0].focus();
      return;
    }

    // the CDN script was blocked or failed to load
    if (!window.emailjs) {
      setStatus('The form could not load. Please refresh the page and try again.', 'error');
      return;
    }

    const data = new FormData(form);
    // send the visible card names rather than the checkbox values
    const services = Array.from(form.querySelectorAll('input[name="service"]:checked'))
      .map((cb) => cb.closest('.cservice__card').querySelector('.cservice__name').textContent.trim());
    const first = data.get('first_name').trim();
    const last = data.get('last_name').trim();

    button.disabled = true;
    label.textContent = 'Sending…';
    setStatus('', null);

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        first_name: first,
        last_name: last,
        name: [first, last].filter(Boolean).join(' '),
        company: data.get('company').trim(),
        email: data.get('email').trim(),
        message: data.get('message').trim(),
        services: services.length ? services.join(', ') : 'Not specified',
      });
      form.reset();
      fields.forEach((input) => input.removeAttribute('aria-invalid'));
      // reset() unticks "Not sure yet" but leaves the other cards locked
      form.querySelectorAll('input[name="service"]').forEach((cb) => { cb.disabled = false; });
      setStatus('Thanks, your message is on its way. I’ll get back to you the same day.', 'success');
    } catch (err) {
      console.error('EmailJS send failed', err);
      setStatus('Something went wrong sending your message. Please try again in a moment.', 'error');
    } finally {
      button.disabled = false;
      label.textContent = idleLabel;
    }
  });
})();
