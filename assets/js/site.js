/* Structa Global — site behaviour. Progressive enhancement: every page works without this file. */
(function () {
  'use strict';
  var doc = document.documentElement;
  window.__sgReady = true; /* head script un-hides reveal content if this file never runs */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header logo: animated build plays once per session, then the static wordmark is used. */
  var logo = document.querySelector('.site-header .sg-logo img');
  if (logo) {
    try {
      if (reduce || sessionStorage.getItem('sg-logo-played')) {
        logo.src = '/brand/logo/structa-wordmark-primary.svg';
      } else {
        sessionStorage.setItem('sg-logo-played', '1');
      }
    } catch (e) { /* storage blocked: keep whichever source is set */ }
  }

  /* Mobile navigation */
  var toggle = document.querySelector('.nav-toggle');
  var panel = document.getElementById('mobile-nav');
  function setNav(open) {
    doc.classList.toggle('nav-open', open);
    if (toggle) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      var t = toggle.querySelector('.nav-toggle__text');
      if (t) t.textContent = open ? 'Close' : 'Menu';
    }
    if (panel) panel.hidden = !open;
  }
  if (toggle && panel) {
    toggle.addEventListener('click', function () { setNav(!doc.classList.contains('nav-open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && doc.classList.contains('nav-open')) { setNav(false); toggle.focus(); } });
    window.addEventListener('resize', function () { if (window.innerWidth > 1079 && doc.classList.contains('nav-open')) setNav(false); });
  }

  /* Content reveals: fade + 16px rise, 800ms, staggered 80ms (brand book §9). */
  var items = Array.prototype.slice.call(document.querySelectorAll('.rv'));
  if (!reduce && 'IntersectionObserver' in window && items.length) {
    var io = new IntersectionObserver(function (entries) {
      var batch = entries.filter(function (en) { return en.isIntersecting; });
      batch.forEach(function (en, i) {
        en.target.style.transitionDelay = (i * 80) + 'ms';
        en.target.classList.add('in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
    /* Safety net: never leave content hidden. */
    setTimeout(function () { items.forEach(function (el) { el.classList.add('in'); }); }, 4000);
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* Specification request form */
  var form = document.getElementById('spec-form');
  if (form) {
    var status = document.getElementById('form-status');
    var endpoint = form.getAttribute('data-endpoint') || '';
    var to = form.getAttribute('data-mailto') || 'hello@structaglobal.com';

    function fieldError(input, msg) {
      var err = document.getElementById(input.id + '-err');
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (err) err.textContent = msg || '';
    }
    function validate() {
      var ok = true, first = null;
      Array.prototype.forEach.call(form.querySelectorAll('[required]'), function (input) {
        var v = (input.value || '').trim(), msg = '';
        if (!v) msg = 'Please complete this field.';
        else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = 'Please enter a valid email address.';
        fieldError(input, msg);
        if (msg) { ok = false; if (!first) first = input; }
      });
      if (first) first.focus();
      return ok;
    }
    function label(name) {
      var el = form.querySelector('[name="' + name + '"]');
      if (!el) return '';
      if (el.tagName === 'SELECT') return el.selectedIndex > 0 ? el.options[el.selectedIndex].text : '';
      return (el.value || '').trim();
    }
    function show(html) { status.innerHTML = html; status.hidden = false; status.focus(); }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.querySelector('.hp input') && form.querySelector('.hp input').value) return; /* bot */
      if (!validate()) return;
      var btn = form.querySelector('button[type="submit"]');
      var name = label('first_name') + ' ' + label('last_name');
      var subject = 'Specification request: ' + (label('enquiry') || 'General') + (label('location') ? ' (' + label('location') + ')' : '');
      var body = [
        'Name: ' + name.trim(),
        'Company: ' + label('company'),
        'Email: ' + label('email'),
        'Phone: ' + label('phone'),
        'Role: ' + label('role'),
        'Project location: ' + label('location'),
        'Enquiry: ' + label('enquiry'),
        '',
        label('message')
      ].join('\n');

      if (endpoint) {
        btn.disabled = true; btn.textContent = 'Sending';
        fetch(endpoint, { method: 'POST', headers: { 'Accept': 'application/json' }, body: new FormData(form) })
          .then(function (r) { if (!r.ok) throw new Error(r.status); return r; })
          .then(function () {
            form.reset();
            show('<p class="sg-label sg-label--strong">Request received</p><p class="mt-4">Thank you. A member of our technical team will reply within one business day.</p>');
            if (window.dataLayer) window.dataLayer.push({ event: 'generate_lead', form_id: 'spec-form' });
          })
          .catch(function () {
            show('<p class="sg-label sg-label--strong">Not sent</p><p class="mt-4">Something interrupted the connection. Please email <a href="mailto:' + to + '">' + to + '</a> or call <a href="tel:+919947106111">+91 99471 06111</a>.</p>');
          })
          .then(function () { btn.disabled = false; btn.textContent = 'Send request'; });
      } else {
        /* No form service configured: open the visitor's email app with the request pre-filled. */
        window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
        show('<p class="sg-label sg-label--strong">One more step</p><p class="mt-4">Your email app should now be open with the request filled in. Press send to reach our technical team. If nothing opened, email <a href="mailto:' + to + '">' + to + '</a> or call <a href="tel:+919947106111">+91 99471 06111</a>.</p>');
        if (window.dataLayer) window.dataLayer.push({ event: 'generate_lead', form_id: 'spec-form', method: 'mailto' });
      }
    });
    Array.prototype.forEach.call(form.querySelectorAll('[required]'), function (input) {
      /* Clear a field's error as soon as it is corrected (on input, so the layout never shifts mid-click). */
      var clear = function () { if (input.getAttribute('aria-invalid') === 'true' && (input.value || '').trim()) fieldError(input, ''); };
      input.addEventListener('input', clear);
      input.addEventListener('change', clear);
    });
  }
})();
