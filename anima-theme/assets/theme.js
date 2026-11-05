/* Anima Editorial — theme.js (no dependencies, ~ES2017) */
(function () {
  'use strict';

  var T = window.theme || { routes: {}, strings: {} };
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ROOT = (T.routes.root || '/').replace(/\/?$/, '/');
  var S = T.strings || {};

  function debounce(fn, wait) {
    var t; return function () { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, wait); };
  }

  function formatMoney(cents, format) {
    if (typeof cents === 'string') cents = cents.replace('.', '');
    format = format || T.moneyFormat || '${{amount}}';
    function delimit(number, precision, thousands, decimal) {
      if (isNaN(number) || number == null) return '0';
      number = (number / 100.0).toFixed(precision);
      var parts = number.split('.');
      var dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
      return dollars + (parts[1] ? decimal + parts[1] : '');
    }
    var match = format.match(/\{\{\s*(\w+)\s*\}\}/);
    var value = '';
    switch (match ? match[1] : 'amount') {
      case 'amount_no_decimals': value = delimit(cents, 0, ',', '.'); break;
      case 'amount_with_comma_separator': value = delimit(cents, 2, '.', ','); break;
      case 'amount_no_decimals_with_comma_separator': value = delimit(cents, 0, '.', ','); break;
      case 'amount_with_apostrophe_separator': value = delimit(cents, 2, "'", '.'); break;
      case 'amount_with_space_separator': value = delimit(cents, 2, ' ', ','); break;
      case 'amount_no_decimals_with_space_separator': value = delimit(cents, 0, ' ', ''); break;
      default: value = delimit(cents, 2, ',', '.');
    }
    return format.replace(/\{\{\s*\w+\s*\}\}/, value);
  }

  function fetchHTML(url) {
    return fetch(url, { credentials: 'same-origin' }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.text();
    }).then(function (t) { return new DOMParser().parseFromString(t, 'text/html'); });
  }

  /* ------------------------------------------------------------------ */
  /* Drawers & focus management                                          */
  /* ------------------------------------------------------------------ */
  var lastFocus = null;
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';

  function trapFocus(container, e) {
    var items = $$(FOCUSABLE, container).filter(function (el) {
      return el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden' && !el.closest('[hidden], [aria-hidden="true"]');
    });
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  // Hide everything behind an open dialog from assistive tech.
  function setInert(dialog, on) {
    Array.prototype.forEach.call(document.body.children, function (el) {
      if (el === dialog || el.contains(dialog) || el.tagName === 'SCRIPT') return;
      if (on) { if (!el.hasAttribute('inert')) { el.setAttribute('inert', ''); el.dataset.inertBy = 'theme'; } }
      else if (el.dataset.inertBy === 'theme') { el.removeAttribute('inert'); delete el.dataset.inertBy; }
    });
  }
  function anyDialogOpen() { return !!$('.drawer.is-open, .search-modal.is-open, .quick-add-modal.is-open'); }

  function openDrawer(drawer, trigger) {
    if (!drawer) return;
    lastFocus = trigger || document.activeElement;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    setInert(drawer, false); setInert(drawer, true);
    document.body.classList.add('scroll-lock');
    $$('[aria-controls="' + drawer.id + '"]').forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
    var panel = $('.drawer__panel', drawer) || drawer;
    setTimeout(function () { var f = $(FOCUSABLE, panel); (f || panel).focus({ preventScroll: true }); }, 60);
  }

  function closeDrawer(drawer) {
    if (!drawer || !drawer.classList.contains('is-open')) return;
    if (quickModal && quickModal.style.visibility === 'hidden') quickModal.style.visibility = '';
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    setInert(null, false);
    var stillOpen = $('.drawer.is-open, .quick-add-modal.is-open'); if (stillOpen) setInert(stillOpen, true);
    $$('[aria-controls="' + drawer.id + '"]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
    if (!$('.drawer.is-open, .search-modal.is-open, .quick-add-modal.is-open, .lightbox.is-open')) document.body.classList.remove('scroll-lock');
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }

  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-drawer-open]');
    if (opener) { e.preventDefault(); openDrawer(document.getElementById(opener.getAttribute('data-drawer-open')), opener); return; }
    var closer = e.target.closest('[data-drawer-close]');
    if (closer) { closeDrawer(closer.closest('.drawer')); }
  });

  document.addEventListener('keydown', function (e) {
    var open = $('.lightbox.is-open') || $('.quick-add-modal.is-open') || $('.search-modal.is-open') || $('.drawer.is-open');
    if (!open) return;
    if (e.key === 'Escape') {
      if (open.classList.contains('drawer')) closeDrawer(open);
      else if (open.classList.contains('search-modal')) closeSearch();
      else if (open.classList.contains('quick-add-modal')) closeQuickAdd();
      else if (open.classList.contains('lightbox')) closeLightbox(open);
    } else if (e.key === 'Tab') {
      trapFocus(open.querySelector('.drawer__panel, .search-modal__panel, .quick-add-modal__panel') || open, e);
    } else if (open.classList.contains('lightbox') && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
      e.preventDefault();
      var b = open.querySelector(e.key === 'ArrowRight' ? '[data-lightbox-next]' : '[data-lightbox-prev]');
      if (b && !b.disabled) b.click();
    }
  });

  /* ------------------------------------------------------------------ */
  /* Header                                                              */
  /* ------------------------------------------------------------------ */
  var headerGlobalsBound = false;
  function currentHeader() { return $('[data-header]'); }
  function setHeaderVars() {
    var header = currentHeader(); if (!header) return;
    var r = header.getBoundingClientRect();
    document.documentElement.style.setProperty('--header-bottom', Math.max(r.bottom, 0) + 'px');
    document.documentElement.style.setProperty('--header-h', r.height + 'px');
  }
  function fitNav() {
    var header = currentHeader(); if (!header) return;
    var inner = $('.header', header), nav = $('.header__nav', header);
    if (!inner || !nav) return;
    if (!window.matchMedia('(min-width: 990px)').matches) { header.classList.remove('is-collapsed'); return; }
    var items = $$('.nav-list > li', nav);
    var gapNav = parseFloat(getComputedStyle($('.nav-list', nav)).columnGap) || 0;
    var needed = items.reduce(function (sum, li) { return sum + li.getBoundingClientRect().width; }, 0) + gapNav * Math.max(items.length - 1, 0);
    var cs = getComputedStyle(inner);
    var gap = parseFloat(cs.columnGap) || 0;
    var logo = $('.header__logo', header), icons = $('.header__icons', header);
    var available = inner.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) -
      (logo ? logo.getBoundingClientRect().width : 0) - (icons ? icons.getBoundingClientRect().width : 0) - gap * 2;
    if (header.classList.contains('header-wrapper--logo-center') || inner.classList.contains('header--logo-center')) {
      available = (inner.clientWidth - (logo ? logo.getBoundingClientRect().width : 0)) / 2 - gap * 2;
    }
    header.classList.toggle('is-collapsed', needed > available + 1);
  }
  function initHeader() {
    var header = currentHeader();
    if (!header || header.dataset.ready) return;
    header.dataset.ready = 'true';
    var section = header.closest('.shopify-section');
    if (section && header.classList.contains('header-wrapper--sticky')) section.classList.add('section-site-header--sticky');
    fitNav();
    setHeaderVars();
    if (!headerGlobalsBound) {
      headerGlobalsBound = true;
      window.addEventListener('resize', debounce(function () { fitNav(); setHeaderVars(); }, 100));
      window.addEventListener('scroll', function () {
        var h = currentHeader(); if (!h) return;
        h.classList.toggle('is-scrolled', window.scrollY > 10);
        setHeaderVars();
      }, { passive: true });
      document.addEventListener('click', function (e) {
        if (e.target.closest('[data-nav-item]')) return;
        var h = currentHeader(); if (!h) return;
        $$('[data-nav-item].is-open', h).forEach(function (item) {
          item.classList.remove('is-open');
          var b = $('[data-nav-toggle]', item); if (b) b.setAttribute('aria-expanded', 'false');
        });
        h.classList.remove('menu-open');
      });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitNav);
    }
    header.classList.toggle('is-scrolled', window.scrollY > 10);

    var items = $$('[data-nav-item]', header);
    var closeAll = function (except) {
      items.forEach(function (item) {
        if (item === except) return;
        item.classList.remove('is-open');
        var b = $('[data-nav-toggle]', item); if (b) b.setAttribute('aria-expanded', 'false');
      });
      header.classList.toggle('menu-open', !!except);
    };
    var canHover = function () { return window.matchMedia('(hover: hover) and (pointer: fine)').matches; };
    items.forEach(function (item) {
      var btn = $('[data-nav-toggle]', item);
      if (!btn) return;
      var hoverOpenedAt = 0;
      var open = function () { closeAll(item); setHeaderVars(); item.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); };
      var close = function () { item.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); header.classList.remove('menu-open'); };
      btn.addEventListener('click', function () {
        // A click right after hover-open should not immediately close the menu.
        if (item.classList.contains('is-open') && Date.now() - hoverOpenedAt < 600) return;
        item.classList.contains('is-open') ? close() : open();
      });
      var timer;
      item.addEventListener('mouseenter', function () { if (canHover()) { clearTimeout(timer); if (!item.classList.contains('is-open')) { open(); hoverOpenedAt = Date.now(); } } });
      item.addEventListener('mouseleave', function () { if (canHover()) { timer = setTimeout(close, 160); } });
      item.addEventListener('focusout', function (e) { if (e.relatedTarget && !item.contains(e.relatedTarget)) close(); });
      item.addEventListener('keydown', function (e) { if (e.key === 'Escape' && item.classList.contains('is-open')) { close(); btn.focus(); } });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Announcement bar                                                    */
  /* ------------------------------------------------------------------ */
  function initAnnouncement() {
    $$('[data-announcement-bar]').forEach(function (bar) {
      var slides = $$('[data-ab-slide]', bar);
      if (slides.length < 2 || bar.dataset.ready) return;
      bar.dataset.ready = 'true';
      var i = 0, timer = null;
      var show = function (n) { slides[i].classList.remove('is-active'); i = (n + slides.length) % slides.length; slides[i].classList.add('is-active'); };
      var start = function () { if (bar.dataset.autoplay === 'true' && !reduceMotion) { stop(); timer = setInterval(function () { show(i + 1); }, parseInt(bar.dataset.speed, 10) || 5000); } };
      var stop = function () { clearInterval(timer); };
      var prev = $('[data-ab-prev]', bar), next = $('[data-ab-next]', bar);
      if (prev) prev.addEventListener('click', function () { show(i - 1); start(); });
      if (next) next.addEventListener('click', function () { show(i + 1); start(); });
      bar.addEventListener('mouseenter', stop); bar.addEventListener('mouseleave', start);
      bar.addEventListener('focusin', stop); bar.addEventListener('focusout', start);
      start();
    });
  }

  /* ------------------------------------------------------------------ */
  /* Search                                                              */
  /* ------------------------------------------------------------------ */
  var searchModal;
  function openSearch(trigger) {
    searchModal = searchModal || $('[data-search-modal]');
    if (!searchModal || !document.contains(searchModal)) searchModal = $('[data-search-modal]');
    if (!searchModal) { window.location.href = ROOT + 'search'; return; }
    lastFocus = trigger;
    searchModal.classList.add('is-open');
    searchModal.setAttribute('aria-hidden', 'false');
    setInert(searchModal.closest('.shopify-section') || searchModal, true);
    document.body.classList.add('scroll-lock');
    setTimeout(function () { var i = $('input[type="search"]', searchModal); if (i) i.focus(); }, 80);
  }
  function closeSearch() {
    if (!searchModal || !searchModal.classList.contains('is-open')) return;
    searchModal.classList.remove('is-open');
    searchModal.setAttribute('aria-hidden', 'true');
    setInert(null, false);
    if (!$('.drawer.is-open')) document.body.classList.remove('scroll-lock');
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  var searchClickBound = false;
  function initSearch() {
    if (!searchClickBound) {
      searchClickBound = true;
      document.addEventListener('click', function (e) {
        var o = e.target.closest('[data-search-open]'); if (o) { e.preventDefault(); openSearch(o); return; }
        if (e.target.closest('[data-search-close]')) closeSearch();
      });
    }
    searchModal = $('[data-search-modal]');
    var input = $('[data-predictive-search]');
    var results = $('[data-predictive-results]');
    if (!input || !results || input.dataset.ready) return;
    input.dataset.ready = 'true';
    var controller;
    input.addEventListener('input', debounce(function () {
      var q = input.value.trim();
      if (!q) { results.innerHTML = ''; input.setAttribute('aria-expanded', 'false'); return; }
      if (controller) controller.abort();
      controller = 'AbortController' in window ? new AbortController() : null;
      var url = (T.routes.search || '/search/suggest') + '?q=' + encodeURIComponent(q) + '&resources[type]=product,query&resources[limit]=4&section_id=predictive-search';
      fetch(url, controller ? { signal: controller.signal } : {}).then(function (r) { return r.text(); }).then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var s = doc.querySelector('.shopify-section') || doc.body;
        results.innerHTML = s.innerHTML;
        input.setAttribute('aria-expanded', 'true');
      }).catch(function () {});
    }, 250));
  }

  /* ------------------------------------------------------------------ */
  /* Cart                                                                */
  /* ------------------------------------------------------------------ */
  function cartDrawer() { return $('[data-cart-drawer]'); }

  function updateCount(count) {
    $$('[data-cart-count]').forEach(function (el) {
      el.hidden = !count;
      var s = el.querySelector('span'); if (s) s.textContent = count;
    });
    var tpl = count === 1 ? S.cartCountOne : S.cartCountOther;
    if (tpl) $$('[data-cart-open]').forEach(function (a) { a.setAttribute('aria-label', (S.cart || 'Cart') + ', ' + tpl.replace('[count]', count)); });
  }

  // Remember which cart control had focus so it can be restored after a re-render.
  function focusKey() {
    var a = document.activeElement;
    if (!a || a === document.body) return null;
    var line = a.closest('[data-key]');
    if (!line) return null;
    var role = a.matches('[data-line-remove]') ? 'remove' : a.matches('[data-line-qty]') ? 'qty' : a.dataset.qtyChange ? 'step' + a.dataset.qtyChange : null;
    return role ? { key: line.dataset.key, role: role } : null;
  }
  function restoreFocus(container, fk) {
    if (!container) return;
    var target = null;
    if (fk) {
      var line = container.querySelector('[data-key="' + (window.CSS && CSS.escape ? CSS.escape(fk.key) : fk.key) + '"]');
      if (line) {
        target = fk.role === 'remove' ? $('[data-line-remove]', line) : fk.role === 'qty' ? $('[data-line-qty]', line) : $('[data-qty-change="' + fk.role.replace('step', '') + '"]', line);
      }
    }
    if (!target) target = $('[data-cart-focus-fallback]', container) || $(FOCUSABLE, container);
    if (target) target.focus({ preventScroll: true });
  }

  function renderDrawerFromHTML(html, fk) {
    var drawer = cartDrawer();
    if (!drawer || !html) return;
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var fresh = doc.querySelector('.drawer__panel');
    var panel = $('.drawer__panel', drawer);
    if (fresh) panel.innerHTML = fresh.innerHTML;
    var src = doc.querySelector('[data-cart-count-source]');
    if (src) updateCount(parseInt(src.textContent, 10) || 0);
    if (fk !== undefined && drawer.classList.contains('is-open')) restoreFocus(panel, fk);
  }

  function refreshCartSections(fk) {
    var ids = ['cart-drawer'];
    var page = $('[data-cart-page]');
    if (page) ids.push(page.dataset.sectionId);
    return fetch(T.routes.cart + '?sections=' + ids.join(','), { credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (data) {
      renderDrawerFromHTML(data['cart-drawer'], page ? undefined : fk);
      if (page && data[page.dataset.sectionId]) {
        var doc = new DOMParser().parseFromString(data[page.dataset.sectionId], 'text/html');
        // Replace only the parts that change, so accelerated checkout buttons keep working.
        ['[data-cart-items]', '[data-cart-totals]'].forEach(function (sel) {
          var a = $(sel, page), b = doc.querySelector(sel);
          if (a && b) a.innerHTML = b.innerHTML;
          else if (a && !b) { var fp = doc.querySelector('[data-cart-page]'); if (fp) page.innerHTML = fp.innerHTML; }
        });
        restoreFocus(page, fk);
      }
    });
  }

  function addToCart(form, button) {
    var errorEl = form.querySelector('[data-form-error]');
    if (errorEl) { errorEl.hidden = true; errorEl.textContent = ''; }
    if (button) button.classList.add('is-loading');
    var fd = new FormData(form);
    var qtyInput = form.id ? document.querySelector('input[name="quantity"][form="' + form.id + '"]') : null;
    if (qtyInput) fd.set('quantity', qtyInput.value);
    fd.append('sections', 'cart-drawer');
    fd.append('sections_url', window.location.pathname);
    return fetch(T.routes.cartAdd + '.js', { method: 'POST', headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' }, body: fd })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.status) {
          if (errorEl) { errorEl.textContent = data.description || data.message || T.strings.error; errorEl.hidden = false; }
          else alert(data.description || data.message || T.strings.error);
          return;
        }
        if (T.cartType === 'page') { window.location.href = T.routes.cart; return; }
        var returnTo = (quickModal && quickModal.contains(button)) ? quickTrigger : button;
        if (data.sections && data.sections['cart-drawer']) renderDrawerFromHTML(data.sections['cart-drawer']);
        else refreshCartSections();
        closeQuickAdd(true);
        openDrawer(cartDrawer(), returnTo);
        fetch(T.routes.cart + '.js', { credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (c) { updateCount(c.item_count); }).catch(function () {});
      })
      .catch(function () { if (errorEl) { errorEl.textContent = T.strings.error; errorEl.hidden = false; } })
      .finally(function () { if (button) button.classList.remove('is-loading'); });
  }

  document.addEventListener('submit', function (e) {
    var form = e.target.closest('[data-product-form]');
    if (!form || form.tagName !== 'FORM') return;
    if (!window.fetch) return;
    e.preventDefault();
    addToCart(form, form.querySelector('[type="submit"]'));
  });

  function changeLine(key, quantity, el) {
    var container = el.closest('.cart-items');
    var fk = focusKey();
    if (container) container.classList.add('is-updating');
    return fetch(T.routes.cartChange + '.js', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ id: key, quantity: quantity })
    }).then(function (r) { return r.json(); }).then(function (cart) {
      if (cart.status) { alert(cart.description || S.error); }
      if (typeof cart.item_count === 'number') updateCount(cart.item_count);
      return refreshCartSections(fk);
    }).catch(function () { alert(S.error); }).finally(function () { if (container) container.classList.remove('is-updating'); });
  }

  document.addEventListener('click', function (e) {
    var cartOpen = e.target.closest('[data-cart-open]');
    if (cartOpen && T.cartType === 'drawer' && cartDrawer() && !document.body.classList.contains('template-cart')) {
      e.preventDefault(); openDrawer(cartDrawer(), cartOpen); return;
    }
    var step = e.target.closest('[data-qty-change]');
    if (step) {
      var item = step.closest('[data-key]');
      var input = $('[data-line-qty]', item);
      var next = Math.max(0, (parseInt(input.value, 10) || 0) + parseInt(step.dataset.qtyChange, 10));
      input.value = next;
      changeLine(item.dataset.key, next, step);
      return;
    }
    var rm = e.target.closest('[data-line-remove]');
    if (rm) { var it = rm.closest('[data-key]'); changeLine(it.dataset.key, 0, rm); }
  });
  document.addEventListener('change', function (e) {
    if (e.target.matches('[data-line-qty]')) {
      var item = e.target.closest('[data-key]');
      changeLine(item.dataset.key, Math.max(0, parseInt(e.target.value, 10) || 0), e.target);
    }
    if (e.target.matches('[data-cart-note]')) {
      fetch(T.routes.cartUpdate + '.js', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ note: e.target.value }) });
    }
    if (e.target.matches('input[name="quantity"][type="number"]')) {
      var min = parseInt(e.target.min, 10) || 1;
      if ((parseInt(e.target.value, 10) || 0) < min) e.target.value = min;
    }
  });

  /* ------------------------------------------------------------------ */
  /* Product                                                             */
  /* ------------------------------------------------------------------ */
  function initProduct(section) {
    if (!section || section.dataset.ready) return;
    section.dataset.ready = 'true';
    var picker = $('[data-variant-picker]', section);
    var form = $('form[data-product-form]', section);
    var gallery = $('[data-gallery]', section);

    // Sticky add to bag (mobile)
    initStickyAtc(section);

    // Quantity
    $$('[data-qty-step]', section).forEach(function (b) {
      b.addEventListener('click', function () {
        var input = b.parentElement.querySelector('input');
        input.value = Math.max(1, (parseInt(input.value, 10) || 1) + parseInt(b.dataset.qtyStep, 10));
      });
    });

    // Gallery
    if (gallery) initGallery(gallery, section);

    if (!picker || !form) return;
    var variants = [];
    try { variants = JSON.parse($('[data-variants-json]', picker).textContent); } catch (err) { return; }

    var update = function () {
      var selected = $$('fieldset', picker).map(function (fs) {
        var checked = $('input:checked', fs);
        var label = $('[data-selected-value]', fs);
        if (label && checked) label.textContent = checked.value;
        return checked ? checked.value : null;
      });
      var variant = variants.find(function (v) { return v.options.every(function (o, i) { return o === selected[i]; }); });

      // availability marks
      $$('fieldset', picker).forEach(function (fs, idx) {
        $$('input', fs).forEach(function (input) {
          var possible = variants.some(function (v) {
            return v.available && v.options[idx] === input.value && v.options.every(function (o, j) { return j === idx || j > idx || o === selected[j]; });
          });
          input.classList.toggle('is-unavailable', !possible);
        });
      });

      var btn = $('[data-add-to-cart]', form);
      var btnText = $('[data-add-to-cart-text]', form);
      var idInput = $('[data-variant-id]', form);
      var payment = $('.shopify-payment-button', form);
      var sticky = $('[data-sticky-atc]', section);
      var setButtons = function (enabled, label) {
        btn.disabled = !enabled; btnText.textContent = label;
        if (payment) { payment.hidden = !enabled; $$('button', payment).forEach(function (b) { b.disabled = !enabled; }); }
        if (sticky) { var sb = $('[data-sticky-atc-button]', sticky); if (sb) { sb.disabled = !enabled; sb.textContent = label; } var sv = $('[data-sticky-atc-variant]', sticky); if (sv) sv.textContent = variant ? variant.title : selected.filter(Boolean).join(' / '); }
      };
      if (!variant) { idInput.value = ''; setButtons(false, S.unavailable); return; }
      idInput.value = variant.id;
      setButtons(variant.available, variant.available ? S.addToCart : S.soldOut);

      var priceWrap = $('[data-product-price]', section);
      if (priceWrap) {
        var onSale = variant.compare_at_price && variant.compare_at_price > variant.price;
        var priceHTML = '<div class="price price--large' + (onSale ? ' price--on-sale' : '') + '"><span class="price__current">' + formatMoney(variant.price) + '</span>' +
          (onSale ? '<s class="price__compare">' + formatMoney(variant.compare_at_price) + '</s>' : '') + '</div>';
        priceWrap.innerHTML = priceHTML;
        if (sticky) { var sp = $('[data-sticky-atc-price]', sticky); if (sp) sp.innerHTML = priceHTML.replace('price--large', ''); }
      }
      var inv = $('[data-product-inventory]', section);
      if (inv) {
        var low = {};
        try { low = JSON.parse(($('[data-low-stock-json]', section) || {}).textContent || '{}'); } catch (err) { low = {}; }
        inv.classList.toggle('product__inventory--out', !variant.available);
        inv.classList.toggle('product__inventory--low', !!(variant.available && low[variant.id]));
        inv.textContent = !variant.available ? (S.outOfStock || S.soldOut) : (low[variant.id] || S.inStock);
      }
      if (!section.closest('.quick-add-modal')) {
        var url = new URL(window.location.href);
        url.searchParams.set('variant', variant.id);
        window.history.replaceState({}, '', url.toString());
      }
      if (variant.featured_media && gallery && gallery._goToMedia) gallery._goToMedia(variant.featured_media.id);
    };
    picker.addEventListener('change', update);
  }

  function initGallery(gallery, section) {
    var track = $('[data-gallery-track]', gallery);
    var slides = $$('[data-gallery-track] > li', gallery);
    var thumbs = $$('[data-thumb-index]', gallery);
    var dots = $$('.product-gallery__dots span', gallery);
    var setActive = function (i) {
      thumbs.forEach(function (t, j) { t.setAttribute('aria-current', j === i ? 'true' : 'false'); });
      dots.forEach(function (d, j) { d.classList.toggle('is-active', j === i); });
    };
    gallery._goTo = function (i) {
      var s = slides[i]; if (!s) return;
      var isGrid = gallery.classList.contains('product-gallery--grid') && window.matchMedia('(min-width: 990px)').matches;
      if (isGrid) s.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
      else track.scrollTo({ left: s.offsetLeft - track.offsetLeft, behavior: reduceMotion ? 'auto' : 'smooth' });
      setActive(i);
    };
    gallery._goToMedia = function (id) {
      var idx = slides.findIndex(function (s) { return s.dataset.mediaId == id; });
      if (idx > -1) gallery._goTo(idx);
    };
    thumbs.forEach(function (t) { t.addEventListener('click', function () { gallery._goTo(parseInt(t.dataset.thumbIndex, 10)); }); });
    track.addEventListener('scroll', debounce(function () {
      var i = Math.round(track.scrollLeft / Math.max(track.clientWidth, 1));
      setActive(i);
    }, 60), { passive: true });

    // Lightbox zoom
    var lightbox = $('[data-lightbox]', section);
    if (!lightbox) return;
    var lbTrack = $('[data-lightbox-track]', lightbox);
    var lbSlides = $$('[data-lightbox-media-id]', lbTrack);
    var lbPrev = $('[data-lightbox-prev]', lightbox), lbNext = $('[data-lightbox-next]', lightbox);
    var lbIndex = function () { return Math.round(lbTrack.scrollLeft / Math.max(lbTrack.clientWidth, 1)); };
    var lbSync = function () { var i = lbIndex(); lbPrev.disabled = i <= 0; lbNext.disabled = i >= lbSlides.length - 1; };
    lbTrack.addEventListener('scroll', debounce(lbSync, 60), { passive: true });
    $$('[data-zoom-media-id]', gallery).forEach(function (btn) {
      btn.addEventListener('click', function () {
        $$('img[data-src]', lbTrack).forEach(function (img) { img.src = img.dataset.src; img.removeAttribute('data-src'); });
        lastFocus = btn;
        lightbox.hidden = false;
        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('scroll-lock');
        var i = Math.max(0, lbSlides.findIndex(function (sl) { return sl.dataset.lightboxMediaId === btn.dataset.zoomMediaId; }));
        requestAnimationFrame(function () { lbTrack.scrollLeft = lbTrack.clientWidth * i; lbSync(); $('[data-lightbox-close]', lightbox).focus(); });
      });
    });
    $('[data-lightbox-close]', lightbox).addEventListener('click', function () { closeLightbox(lightbox); });
    lbPrev.addEventListener('click', function () { lbTrack.scrollBy({ left: -lbTrack.clientWidth, behavior: reduceMotion ? 'auto' : 'smooth' }); });
    lbNext.addEventListener('click', function () { lbTrack.scrollBy({ left: lbTrack.clientWidth, behavior: reduceMotion ? 'auto' : 'smooth' }); });
    lbTrack.addEventListener('click', function (e) { if (e.target.tagName === 'IMG') e.target.classList.toggle('is-zoomed'); });
  }

  function closeLightbox(lb) {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    $$('img.is-zoomed', lb).forEach(function (i) { i.classList.remove('is-zoomed'); });
    if (!$('.drawer.is-open, .quick-add-modal.is-open')) document.body.classList.remove('scroll-lock');
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  function initStickyAtc(section) {
    var bar = $('[data-sticky-atc]', section);
    var main = $('[data-add-to-cart]', section);
    if (!bar || !main || !('IntersectionObserver' in window) || section.closest('.quick-add-modal')) return;
    var mainVisible = true;
    var sync = function () {
      var show = !mainVisible && main.getBoundingClientRect().top < 0;
      bar.classList.toggle('is-visible', show);
      document.body.classList.toggle('has-sticky-atc', show);
      bar.setAttribute('aria-hidden', show ? 'false' : 'true');
      $$('button, a', bar).forEach(function (b) { b.tabIndex = show ? 0 : -1; });
    };
    new IntersectionObserver(function (en) { mainVisible = en[0].isIntersecting; sync(); }).observe(main);
    var sb = $('[data-sticky-atc-button]', bar);
    if (sb) sb.addEventListener('click', function () {
      if (main.disabled) return;
      main.click();
    });
    sync();
  }

  /* ------------------------------------------------------------------ */
  /* Quick add                                                           */
  /* ------------------------------------------------------------------ */
  var quickModal, quickTrigger;
  function ensureQuickModal() {
    if (quickModal) return quickModal;
    quickModal = document.createElement('div');
    quickModal.className = 'quick-add-modal';
    quickModal.setAttribute('aria-hidden', 'true');
    quickModal.innerHTML = '<button type="button" class="quick-add-modal__overlay" tabindex="-1" aria-label="' + (S.close || 'Close') + '"></button>' +
      '<div class="quick-add-modal__panel" role="dialog" aria-modal="true" aria-label="' + (S.quickAdd || 'Quick add') + '" tabindex="-1">' +
      '<button type="button" class="icon-button quick-add-modal__close" aria-label="' + (S.close || 'Close') + '"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19"/></svg></button>' +
      '<div data-quick-content></div></div>';
    document.body.appendChild(quickModal);
    quickModal.querySelector('.quick-add-modal__overlay').addEventListener('click', closeQuickAdd);
    quickModal.querySelector('.quick-add-modal__close').addEventListener('click', closeQuickAdd);
    return quickModal;
  }
  function closeQuickAdd(skipFocus) {
    if (!quickModal || !quickModal.classList.contains('is-open')) return;
    quickModal.classList.remove('is-open');
    quickModal.setAttribute('aria-hidden', 'true');
    setInert(null, false);
    if (!$('.drawer.is-open')) document.body.classList.remove('scroll-lock');
    if (skipFocus !== true && quickTrigger && document.contains(quickTrigger)) quickTrigger.focus({ preventScroll: true });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-quick-add]');
    if (!b) return;
    e.preventDefault();
    var url = b.getAttribute('data-quick-add');
    quickTrigger = b;
    b.classList.add('is-loading');
    fetchHTML(url + (url.indexOf('?') > -1 ? '&' : '?') + 'view=quick-view').then(function (doc) {
      var section = doc.querySelector('[data-product-section]');
      if (!section) { window.location.href = url; return; }
      var m = ensureQuickModal();
      var content = m.querySelector('[data-quick-content]');
      content.innerHTML = '';
      section.querySelectorAll('.breadcrumbs, [data-lightbox], [data-sticky-atc]').forEach(function (el) { el.remove(); });
      section.querySelectorAll('[data-zoom-media-id]').forEach(function (z) { z.removeAttribute('data-zoom-media-id'); z.setAttribute('tabindex', '-1'); z.removeAttribute('aria-label'); z.setAttribute('aria-hidden', 'true'); });
      content.appendChild(section);
      section.style.setProperty('--pt', '0px'); section.style.setProperty('--pb', '0px');
      $$('.page-width', section).forEach(function (pw) { pw.style.padding = '0'; });
      initProduct(section);
      m.classList.add('is-open');
      m.setAttribute('aria-hidden', 'false');
      setInert(m, true);
      document.body.classList.add('scroll-lock');
      setTimeout(function () { m.querySelector('.quick-add-modal__panel').focus(); }, 50);
    }).catch(function () { window.location.href = url; }).finally(function () { b.classList.remove('is-loading'); });
  });

  /* ------------------------------------------------------------------ */
  /* Sliders (product carousels)                                         */
  /* ------------------------------------------------------------------ */
  function initSliders() {
    $$('[data-slider-section]').forEach(function (sec) {
      var track = $('[data-slider]', sec);
      var prev = $('[data-slider-prev]', sec), next = $('[data-slider-next]', sec);
      if (!track || !prev || !next || track.dataset.ready) return;
      track.dataset.ready = 'true';
      var step = function () { var c = track.children[0]; return c ? c.getBoundingClientRect().width + 16 : track.clientWidth * 0.8; };
      var sync = function () {
        prev.disabled = track.scrollLeft <= 2;
        next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
      };
      prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
      next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
      track.addEventListener('scroll', debounce(sync, 50), { passive: true });
      window.addEventListener('resize', debounce(sync, 150));
      sync();
    });
  }

  /* ------------------------------------------------------------------ */
  /* Inspiration Station                                                 */
  /* ------------------------------------------------------------------ */
  var videoObserver = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var wrap = entry.target;
      var video = wrap.querySelector('video');
      if (!video) return;
      if (entry.isIntersecting) {
        if (video.dataset.src && !video.src) { video.src = video.dataset.src; }
        if (wrap.dataset.autoplay === 'true' && wrap.dataset.userPaused !== 'true' && !reduceMotion) {
          var p = video.play(); if (p && p.catch) p.catch(function () {});
          setPlayState(wrap, true);
        }
      } else if (!video.paused) {
        video.pause(); setPlayState(wrap, false);
      }
    });
  }, { rootMargin: '200px 0px', threshold: 0.25 }) : null;

  function setPlayState(wrap, playing) {
    var b = wrap.querySelector('[data-inspo-play]');
    if (b) {
      b.dataset.state = playing ? 'playing' : 'paused';
      b.setAttribute('aria-label', playing ? (S.pauseVideo || 'Pause video') : (S.playVideo || 'Play video'));
    }
    wrap.classList.toggle('is-playing', playing);
  }

  function initVideos(root) {
    $$('[data-inspo-video]', root).forEach(function (wrap) {
      if (wrap.dataset.ready) return;
      wrap.dataset.ready = 'true';
      var section = wrap.closest('[data-inspiration]');
      wrap.dataset.autoplay = section ? section.dataset.autoplayVideo : (wrap.dataset.autoplay || 'true');
      var video = wrap.querySelector('video');
      var btn = wrap.querySelector('[data-inspo-play]');
      setPlayState(wrap, false);
      if (btn) btn.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        if (video.dataset.src && !video.src) video.src = video.dataset.src;
        if (video.paused) { var p = video.play(); if (p && p.catch) p.catch(function () {}); wrap.dataset.userPaused = 'false'; setPlayState(wrap, true); }
        else { video.pause(); wrap.dataset.userPaused = 'true'; setPlayState(wrap, false); }
      });
      if (videoObserver) videoObserver.observe(wrap);
      else if (video.dataset.src) video.src = video.dataset.src;
    });
  }

  function centerOffset(track, el) {
    var tr = track.getBoundingClientRect(), er = el.getBoundingClientRect();
    return track.scrollLeft + (er.left - tr.left) - (track.clientWidth - er.width) / 2;
  }

  function initInspiration(root) {
    $$('[data-inspiration]', root).forEach(function (sec) {
      var track = $('[data-inspo-track]', sec);
      if (!track || track.dataset.ready) return;
      track.dataset.ready = 'true';
      var bar = $('[data-inspo-progress]', sec);
      var prev = $('[data-inspo-prev]', sec), next = $('[data-inspo-next]', sec);
      var footer = $('.inspo__footer', sec);
      var cardStep = function () { var c = track.querySelector('.inspo-card'); return c ? c.getBoundingClientRect().width + 20 : 260; };
      var sync = function () {
        var max = track.scrollWidth - track.clientWidth;
        var scrollable = max > 4;
        if (footer) footer.style.visibility = scrollable ? 'visible' : 'hidden';
        if (prev) prev.disabled = track.scrollLeft <= 2;
        if (next) next.disabled = track.scrollLeft >= max - 2;
        if (bar) {
          var visible = track.clientWidth / Math.max(track.scrollWidth, 1);
          bar.style.width = Math.max(visible * 100, 8) + '%';
          bar.style.transform = 'translateX(' + (max > 0 ? (track.scrollLeft / max) * ((1 / Math.max(visible, 0.08)) - 1) * 100 : 0) + '%)';
        }
      };
      if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -cardStep() * 2, behavior: 'smooth' }); });
      if (next) next.addEventListener('click', function () { track.scrollBy({ left: cardStep() * 2, behavior: 'smooth' }); });
      track.addEventListener('scroll', function () { window.requestAnimationFrame(sync); }, { passive: true });
      track.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { e.preventDefault(); track.scrollBy({ left: cardStep(), behavior: 'smooth' }); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); track.scrollBy({ left: -cardStep(), behavior: 'smooth' }); }
      });
      window.addEventListener('resize', debounce(sync, 150));
      if (sec.dataset.startCentered === 'true' && track.scrollWidth > track.clientWidth) {
        var cards = $$('.inspo-card', track);
        var mid = cards[Math.floor((Math.min(cards.length, 5) - 1) / 2)] || cards[0];
        var lg = cards.find(function (c) { return c.classList.contains('inspo-card--lg'); });
        var target = lg || mid;
        if (target) track.scrollLeft = centerOffset(track, target);
      }
      sync();
      initVideos(sec);
    });
    initVideos(root);
  }

  /* ------------------------------------------------------------------ */
  /* Hero slideshow & fade carousel                                      */
  /* ------------------------------------------------------------------ */
  function initHeroVideos(root) {
    $$('[data-hero-video-toggle]', root).forEach(function (btn) {
      if (btn.dataset.ready) return;
      btn.dataset.ready = 'true';
      var video = btn.parentElement.querySelector('.hero__media video') || (btn.closest('[data-hero-slide]') || btn.parentElement).querySelector('video');
      if (!video) { btn.hidden = true; return; }
      var set = function (playing) {
        btn.dataset.state = playing ? 'playing' : 'paused';
        btn.setAttribute('aria-label', playing ? (S.pauseVideo || 'Pause video') : (S.playVideo || 'Play video'));
      };
      if (reduceMotion) { video.removeAttribute('autoplay'); video.pause(); set(false); } else set(!video.paused || video.autoplay);
      btn.addEventListener('click', function () {
        if (video.paused) { var p = video.play(); if (p && p.catch) p.catch(function () {}); set(true); } else { video.pause(); set(false); }
      });
    });
  }

  function initHero(root) {
    initHeroVideos(root);
    $$('[data-hero]', root).forEach(function (hero) {
      var slides = $$('[data-hero-slide]', hero);
      if (slides.length < 2 || hero.dataset.ready) return;
      hero.dataset.ready = 'true';
      var dots = $$('[data-hero-dot]', hero);
      var pause = $('[data-hero-pause]', hero);
      var i = 0, timer, paused = reduceMotion;
      var go = function (n) {
        slides[i].classList.remove('is-active'); dots[i] && dots[i].removeAttribute('aria-current');
        i = (n + slides.length) % slides.length;
        slides[i].classList.add('is-active'); dots[i] && dots[i].setAttribute('aria-current', 'true');
      };
      var start = function () { clearInterval(timer); if (hero.dataset.autoplay === 'true' && !paused) timer = setInterval(function () { go(i + 1); }, parseInt(hero.dataset.speed, 10) || 6000); };
      dots.forEach(function (d) { d.addEventListener('click', function () { go(parseInt(d.dataset.heroDot, 10)); start(); }); });
      if (pause) {
        pause.setAttribute('aria-pressed', paused ? 'true' : 'false');
        pause.setAttribute('aria-label', paused ? (S.playSlideshow || 'Play slideshow') : (S.pauseSlideshow || 'Pause slideshow'));
        pause.addEventListener('click', function () { paused = !paused; pause.setAttribute('aria-pressed', paused ? 'true' : 'false'); pause.setAttribute('aria-label', paused ? (S.playSlideshow || 'Play slideshow') : (S.pauseSlideshow || 'Pause slideshow')); start(); });
      }
      hero.addEventListener('focusin', function () { clearInterval(timer); });
      hero.addEventListener('focusout', start);
      start();
    });
  }

  function initFadeCarousels(root) {
    $$('[data-fade-carousel]', root).forEach(function (c) {
      var slides = $$('[data-fade-slide]', c);
      if (slides.length < 2) return;
      var i = 0;
      if (c.dataset.ready) return;
      c.dataset.ready = 'true';
      var live = $('[data-fade-live]', c);
      var go = function (n) { slides[i].classList.add('is-hidden'); i = (n + slides.length) % slides.length; slides[i].classList.remove('is-hidden'); if (live) live.textContent = (i + 1) + ' / ' + slides.length; };
      var p = $('[data-fade-prev]', c), n = $('[data-fade-next]', c);
      if (p) p.addEventListener('click', function () { go(i - 1); });
      if (n) n.addEventListener('click', function () { go(i + 1); });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Reveal on scroll                                                    */
  /* ------------------------------------------------------------------ */
  function initReveal(root) {
    var els = $$('.reveal:not(.is-visible)', root);
    if (!('IntersectionObserver' in window) || reduceMotion || getComputedStyle(document.documentElement).getPropertyValue('--duration').trim() === '0ms') {
      els.forEach(function (el) { el.classList.add('is-visible'); }); return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.05 });
    els.forEach(function (el) { io.observe(el); });
    // Safety net: never leave content hidden.
    setTimeout(function () { els.forEach(function (el) { el.classList.add('is-visible'); }); }, 2500);
  }

  /* ------------------------------------------------------------------ */
  /* Collection filtering / sorting / load more                          */
  /* ------------------------------------------------------------------ */
  function initCollection(root) {
    var section = $('[data-collection-section]', root || document);
    if (!section || section.dataset.ready) return;
    section.dataset.ready = 'true';
    var sectionId = section.dataset.sectionId;

    var render = function (url, append) {
      var results = $('[data-collection-results]', section);
      var grid = $('[data-product-grid]', section);
      if (grid) grid.classList.add('is-loading');
      var u = new URL(url, window.location.origin);
      u.searchParams.set('section_id', sectionId);
      // Remember focus and which filter groups are open, then restore after re-render.
      var active = document.activeElement;
      var focusSel = active && active.name ? 'input[name="' + active.name + '"]' + (active.type === 'checkbox' ? '[value="' + (window.CSS && CSS.escape ? CSS.escape(active.value) : active.value) + '"]' : '') : null;
      var openGroups = $$('details[data-facet-group]', document).filter(function (d) { return d.open; }).map(function (d) { return d.dataset.facetGroup; });
      return fetchHTML(u.toString()).then(function (doc) {
        var freshResults = doc.querySelector('[data-collection-results]');
        if (append) {
          var newGrid = doc.querySelector('[data-product-grid]');
          var firstNew = null;
          if (newGrid && grid) { $$(':scope > li', newGrid).forEach(function (li) { if (!firstNew) firstNew = li; grid.appendChild(li); }); }
          var lm = $('[data-load-more]', section), newLm = doc.querySelector('[data-load-more]');
          if (lm) { if (newLm) lm.replaceWith(newLm); else lm.remove(); }
          var firstLink = firstNew && firstNew.querySelector('a[href]:not([tabindex="-1"])');
          if (firstLink) firstLink.focus({ preventScroll: true });
        } else if (freshResults && results) {
          results.innerHTML = freshResults.innerHTML;
        }
        ['[data-product-count]', '[data-facets-drawer-body]', '.hide-mobile-sidebar'].forEach(function (sel) {
          var a = $(sel, document), b = doc.querySelector(sel);
          if (a && b) a.innerHTML = b.innerHTML;
        });
        $$('details[data-facet-group]', document).forEach(function (d) { if (openGroups.indexOf(d.dataset.facetGroup) > -1) d.open = true; });
        if (!append && focusSel) {
          var again = $$(focusSel, document).filter(function (el) { return el.getClientRects().length; })[0];
          if (again) again.focus({ preventScroll: true });
        }
        window.history.replaceState({}, '', append ? url.replace(/([?&])section_id=[^&]*&?/, '$1') : url);
        initReveal(section);
      }).catch(function () { window.location.href = url; })
        .finally(function () { var g = $('[data-product-grid]', section); if (g) g.classList.remove('is-loading'); });
    };

    var buildUrl = function (form) {
      var params = new URLSearchParams(new FormData(form));
      var sort = $('[data-sort-select]', section);
      if (sort) params.set('sort_by', sort.value);
      ['filter.v.price.gte', 'filter.v.price.lte'].forEach(function (k) { if (params.get(k) === '') params.delete(k); });
      return window.location.pathname + '?' + params.toString();
    };

    section.addEventListener('change', debounce(function (e) {
      var form = e.target.closest('[data-facets-form]');
      if (form) { render(buildUrl(form)); return; }
      if (e.target.matches('[data-sort-select]')) {
        var params = new URLSearchParams(window.location.search);
        params.set('sort_by', e.target.value); params.delete('page');
        render(window.location.pathname + '?' + params.toString());
      }
    }, 350));
    section.addEventListener('submit', function (e) { var form = e.target.closest('[data-facets-form]'); if (form) { e.preventDefault(); render(buildUrl(form)); } });
    section.addEventListener('click', function (e) {
      var link = e.target.closest('[data-facet-link]');
      if (link) { e.preventDefault(); render(link.href); var top = section.getBoundingClientRect().top + window.scrollY - 120; if (window.scrollY > top) window.scrollTo({ top: top, behavior: 'smooth' }); return; }
      var more = e.target.closest('[data-load-more-link]');
      if (more) { e.preventDefault(); more.classList.add('is-loading'); render(more.href, true); }
    });
    // Drawer forms live outside the section in some layouts
    $$('#FacetsDrawer [data-facets-form]').forEach(function (form) {
      if (section.contains(form)) return;
      form.addEventListener('change', debounce(function () { render(buildUrl(form)); }, 350));
    });
  }

  /* ------------------------------------------------------------------ */
  /* Recommendations & recently viewed                                   */
  /* ------------------------------------------------------------------ */
  function initRecommendations(root) {
    $$('[data-recommendations]', root || document).forEach(function (el) {
      if (el.dataset.ready) return;
      el.dataset.ready = 'true';
      var load = function () {
        fetchHTML(el.dataset.url).then(function (doc) {
          var fresh = doc.querySelector('[data-recommendations]');
          if (fresh && fresh.innerHTML.trim()) { el.innerHTML = fresh.innerHTML; el.classList.add('has-results'); initReveal(el); }
        }).catch(function () {});
      };
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); load(); } }, { rootMargin: '400px' });
        io.observe(el);
      } else load();
    });
  }

  function initRecentlyViewed(root) {
    var el = $('[data-recently-viewed]', root || document);
    if (!el || el.dataset.ready) return;
    el.dataset.ready = 'true';
    var list = [];
    try { list = JSON.parse(localStorage.getItem('anima:recently-viewed') || '[]'); } catch (e) { return; }
    var current = el.dataset.current;
    var limit = parseInt(el.dataset.limit, 10) || 4;
    var handles = list.filter(function (h) { return h && h !== current; }).slice(0, limit);
    if (!handles.length) return;
    var target = $('[data-recently-viewed-list]', el);
    Promise.all(handles.map(function (h) {
      return fetch(ROOT + 'products/' + encodeURIComponent(h) + '?section_id=product-card-render')
        .then(function (r) { return r.ok ? r.text() : ''; }).catch(function () { return ''; });
    })).then(function (htmls) {
      var html = htmls.map(function (t) {
        var d = new DOMParser().parseFromString(t, 'text/html');
        var li = d.querySelector('li'); return li ? li.outerHTML : '';
      }).join('');
      if (html) { target.innerHTML = html; el.hidden = false; }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Size guide: open the guide page in a side drawer, stay on the PDP   */
  /* ------------------------------------------------------------------ */
  var sizeDrawer;
  document.addEventListener('click', function (e) {
    var link = e.target.closest('[data-size-guide]');
    if (!link || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    if (!sizeDrawer) {
      sizeDrawer = document.createElement('div');
      sizeDrawer.className = 'drawer drawer--right size-guide-drawer';
      sizeDrawer.id = 'SizeGuideDrawer';
      sizeDrawer.setAttribute('aria-hidden', 'true');
      sizeDrawer.innerHTML = '<button type="button" class="drawer__overlay" data-drawer-close tabindex="-1" aria-label="' + (S.close || 'Close') + '"></button>' +
        '<div class="drawer__panel" role="dialog" aria-modal="true" aria-labelledby="SizeGuideTitle" tabindex="-1">' +
        '<div class="drawer__header"><h2 class="drawer__title" id="SizeGuideTitle"></h2><button type="button" class="icon-button" data-drawer-close aria-label="' + (S.close || 'Close') + '"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19"/></svg></button></div>' +
        '<div class="drawer__body size-guide-drawer__body" data-size-guide-body></div></div>';
      document.body.appendChild(sizeDrawer);
    }
    $('#SizeGuideTitle', sizeDrawer).textContent = link.textContent.trim();
    var body = $('[data-size-guide-body]', sizeDrawer);
    body.innerHTML = '';
    var returnTo = link;
    fetchHTML(link.href).then(function (doc) {
      var main = doc.querySelector('#MainContent') || doc.body;
      $$('script, form, .breadcrumbs', main).forEach(function (n) { n.remove(); });
      $$('h1', main).forEach(function (h) { var h2 = document.createElement('h3'); h2.innerHTML = h.innerHTML; h2.className = 'h3'; h.replaceWith(h2); });
      body.innerHTML = main.innerHTML;
      if (quickModal && quickModal.classList.contains('is-open')) quickModal.style.visibility = 'hidden';
      openDrawer(sizeDrawer, returnTo);
    }).catch(function () { window.location.href = link.href; });
  });

  /* ------------------------------------------------------------------ */
  /* Boot                                                                */
  /* ------------------------------------------------------------------ */
  function initFooter(root) {
    if (!window.matchMedia('(max-width: 749px)').matches) return;
    $$('[data-footer-details]', root).forEach(function (d) { d.open = false; });
  }

  function boot() {
    initFooter(document);
    initHeader();
    initAnnouncement();
    initSearch();
    $$('[data-product-section]').forEach(initProduct);
    initSliders();
    initInspiration(document);
    initHero(document);
    initFadeCarousels(document);
    initReveal(document);
    initCollection();
    initRecommendations();
    initRecentlyViewed();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  // Theme Editor support: re-init sections when they are added or changed.
  document.addEventListener('shopify:section:load', function (e) {
    var root = e.target;
    $$('[data-product-section]', root).forEach(initProduct);
    initInspiration(root); initHero(root); initFadeCarousels(root); initReveal(root); initSliders(); initAnnouncement();
    initCollection(root); initRecommendations(root); initRecentlyViewed(root);
    if ($('[data-header]', root)) { initHeader(); initSearch(); }
  });
  document.addEventListener('shopify:block:select', function (e) {
    var card = e.target.closest('.inspo-card');
    if (card) { var track = card.parentElement; track.scrollTo({ left: centerOffset(track, card), behavior: 'smooth' }); }
    var slide = e.target.closest('[data-hero-slide]');
    if (slide) { var hero = slide.closest('[data-hero]'); $$('[data-hero-slide]', hero).forEach(function (s) { s.classList.toggle('is-active', s === slide); }); }
  });
})();
