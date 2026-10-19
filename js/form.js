// Interest form -> Supabase edge function "landings-api" (shared schema landings.signups).
(function () {
  var C = window.LANDING_CONFIG, f = document.getElementById('signup');
  if (!f) return;
  var t0 = Date.now(), msg = document.getElementById('signup-msg'), btn = f.querySelector('button[type=submit]');
  function show(cls, text) { msg.className = 'msg ' + cls; msg.textContent = text; }
  f.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var d = new FormData(f), interest = [d.get('interest'), d.get('note')].filter(Boolean).join(' | ');
    btn.disabled = true; show('', ''); msg.style.display = 'none';
    fetch(C.API_URL, { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'signup', t: t0, website_url: d.get('website_url') || '',
        data: { domain: C.DOMAIN, name: d.get('name'), email: d.get('email'), interest: interest, consent: d.get('consent') === 'on' } }) })
      .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
      .then(function (j) {
        msg.style.display = '';
        if (j.ok) { show('ok', j.already ? "You're already on the list. Thank you!" : "Thanks! You're on the list. We'll email you when there's news."); f.reset(); }
        else show('err', j.error || 'Something went wrong. Please try again.');
      })
      .catch(function () { msg.style.display = ''; show('err', 'Could not reach the server. Please try again in a moment.'); })
      .finally(function () { btn.disabled = false; });
  });
})();
