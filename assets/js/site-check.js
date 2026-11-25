// Free website check form: checks the fields and sends the request straight to John's inbox (FormSubmit, the same as the contact form).
// If it can't send, the email app opens with it all filled in. Nothing is checked or sent to the visitor automatically: John runs the check and sends it himself.
(() => {
  const form = document.querySelector('[data-site-check]');
  if (!form) return;
  const to = 'jb.designagency89@gmail.com';
  const error = form.querySelector('[data-error]');
  form.insertAdjacentHTML('beforeend', '<input name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px">');
  const f = form.elements;
  const val = el => el.value.replace(/\s+/g, ' ').trim();
  const looksLikeSite = s => /^(https?:\/\/)?[^\s\/.]+(\.[^\s\/.]+)+(\/\S*)?$/i.test(s);
  const counted = how => { if (!f._honey.value) window.va?.('event', { name: 'Website check: form', data: { result: how } }); };

  form.addEventListener('submit', e => {
    e.preventDefault();
    const need = [[f.name, 'your name'], [f.email, 'a valid email'], [f.business, 'your business name'], [f.website, 'your website address']];
    need.forEach(([el]) => el.removeAttribute('aria-invalid'));
    const problems = need.filter(([el]) => !val(el) || (el === f.email && !el.validity.valid) || (el === f.website && !looksLikeSite(val(el))));
    problems.forEach(([el]) => el.setAttribute('aria-invalid', 'true'));
    if (problems.length) { error.textContent = `Please add ${problems.map(p => p[1]).join(', ')}.`; problems[0][0].focus(); return; }
    error.textContent = '';
    const data = { name: val(f.name), email: val(f.email), business: val(f.business), website: val(f.website), town: val(f.town) || '-', message: f.message.value.trim() || '-' };
    const btn = form.querySelector('button[type="submit"]'), label = btn.innerHTML;
    const body = `Please send me a free website check.\n\nBusiness: ${data.business}\nWebsite: ${data.website}\nTown: ${data.town}\nAnything to look at: ${data.message}\n\nFrom: ${data.name} (${data.email})`;
    const mail = () => { location.href = `mailto:${to}?subject=${encodeURIComponent('Website check request: ' + data.business)}&body=${encodeURIComponent(body)}`; };
    btn.disabled = true; btn.textContent = 'Sending…';
    const send = f._honey.value ? Promise.resolve() : fetch(`https://formsubmit.co/ajax/${to}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, signal: AbortSignal.timeout?.(12000),
      body: JSON.stringify({ ...data, 'Seen on': document.title, _subject: `Website check request: ${data.business}`, _template: 'table', _captcha: 'false' })
    }).then(r => r.json()).then(j => { if (String(j.success) !== 'true') throw new Error(j.message || 'not sent'); });
    send.then(() => {
      counted('Sent');
      form.innerHTML = `<p class="sc-form__done" role="status" tabindex="-1">Thanks ${data.name.split(' ')[0]}, that’s with me. I’ll check ${data.website.replace(/^https?:\/\//i, '').replace(/\/$/, '')} and email your report to ${data.email}, usually within two working days.</p>`;
      form.querySelector('.sc-form__done').focus();
    }).catch(() => { counted('Email app'); btn.disabled = false; btn.innerHTML = label; mail(); });
  });
})();
