/* Anima Editorial — theme.js (no dependencies, ~ES2017) */
(function () {
  'use strict';

  var T = window.theme || { routes: {}, strings: {} };
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    var items = $$(FOCUSABLE, container).filter(function (el) { return el.offsetParent !== null; });
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function openDrawer(drawer, trigger) {
    if (!drawer) return;
    lastFocus = trigger || document.activeElement;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('scroll-lock');
    $$('[aria-controls="' + drawer.id + '"]').forEach(function (b) { b.setAttribute('aria-expanded', 'true'); });
    var panel = $('.drawer__panel', drawer) || drawer;
    setTimeout(function () { var f = $(FOCUSABLE, panel); (f || panel).focus({ preventScroll: true }); }, 60);
  }

  function closeDrawer(drawer) {
    if (!drawer || !drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
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
    }
  });

  /* ------------------------------------------------------------------ */
  /* Header                                                              */
  /* ------------------------------------------------------------------ */
  function initHeader() {
    var header = $('[data-header]');
    if (!header) return;
    var setVars = function () {
      var r = header.getBoundingClientRect();
      document.documentElement.style.setProperty('--header-bottom', Math.max(r.bottom, 0) + 'px');
      document.documentElement.style.setProperty('--header-h', r.height + 'px');
    };
    setVars();
    window.addEventListener('resize', debounce(setVars, 100));
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 10);
      setVars();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    var items = $$('[data-nav-item]', header);
    var closeAll = function (except) {
      items.forEach(function (item) {
        if (item === except) return;
        item.classList.remove('is-open');
        var b = $('[data-nav-toggle]', item); if (b) b.setAttribute('aria-expanded', 'false');
      });
      header.classList.toggle('menu-open', !!except);
    };
    items.forEach(function (item) {
      var btn = $('[data-nav-toggle]', item);
      if (!btn) return;
      var open = function () { closeAll(item); setVars(); item.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); };
      var close = function () { item.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); header.classList.remove('menu-open'); };
      btn.addEventListener('click', function () { item.classList.contains('is-open') ? close() : open(); });
      var timer;
      item.addEventListener('mouseenter', function () { if (window.matchMedia('(hover: hover)').matches) { clearTimeout(timer); open(); } });
      item.addEventListener('mouseleave', function () { if (window.matchMedia('(hover: hover)').matches) { timer = setTimeout(close, 120); } });
      item.addEventListener('focusout', function (e) { if (!item.contains(e.relatedTarget)) close(); });
      item.addEventListener('keydown', function (e) { if (e.key === 'Escape' && item.classList.contains('is-open')) { close(); btn.focus(); } });
    });
    document.addEventListener('click', function (e) { if (!e.target.closest('[data-nav-item]')) closeAll(); });
  }

  /* ------------------------------------------------------------------ */
  /* Announcement bar                                                    */
  /* ------------------------------------------------------------------ */
  function initAnnouncement() {
    $$('[data-announcement-bar]').forEach(function (bar) {
      var slides = $$('[data-ab-slide]', bar);
      if (slides.length < 2) return;
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
    if (!searchModal) { window.location.href = (T.routes.root || '/') + 'search'; return; }
    lastFocus = trigger;
    searchModal.classList.add('is-open');
    searchModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('scroll-lock');
    setTimeout(function () { var i = $('input[type="search"]', searchModal); if (i) i.focus(); }, 80);
  }
  function closeSearch() {
    if (!searchModal) return;
    searchModal.classList.remove('is-open');
    searchModal.setAttribute('aria-hidden', 'true');
    if (!$('.drawer.is-open')) document.body.classList.remove('scroll-lock');
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  function initSearch() {
    document.addEventListener('click', function (e) {
      var o = e.target.closest('[data-search-open]'); if (o) { e.preventDefault(); openSearch(o); return; }
      if (e.target.closest('[data-search-close]')) closeSearch();
    });
    var input = $('[data-predictive-search]');
    var results = $('[data-predictive-results]');
    if (!input || !results) return;
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
  }

  function renderDrawerFromHTML(html) {
    var drawer = cartDrawer();
    if (!drawer || !html) return;
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var fresh = doc.querySelector('.drawer__panel');
    if (fresh) $('.drawer__panel', drawer).innerHTML = fresh.innerHTML;
    var src = doc.querySelector('[data-cart-count-source]');
    if (src) updateCount(parseInt(src.textContent, 10) || 0);
  }

  function refreshCartSections() {
    var ids = ['cart-drawer'];
    var page = $('[data-cart-page]');
    if (page) ids.push(page.dataset.sectionId);
    return fetch((T.routes.root || '/') + '?sections=' + ids.join(',')).then(function (r) { return r.json(); }).then(function (data) {
      renderDrawerFromHTML(data['cart-drawer']);
      if (page && data[page.dataset.sectionId]) {
        var doc = new DOMParser().parseFromString(data[page.dataset.sectionId], 'text/html');
        var fresh = doc.querySelector('[data-cart-page]');
        if (fresh) page.innerHTML = fresh.innerHTML;
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
        if (data.sections && data.sections['cart-drawer']) renderDrawerFromHTML(data.sections['cart-drawer']);
        else refreshCartSections();
        closeQuickAdd();
        openDrawer(cartDrawer(), button);
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

  function changeLine(line, quantity, el) {
    var container = el.closest('.cart-items');
    if (container) container.classList.add('is-updating');
    return fetch(T.routes.cartChange + '.js', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ line: line, quantity: quantity })
    }).then(function (r) { return r.json(); }).then(function (cart) {
      if (cart.status) { alert(cart.description || T.strings.error); }
      return refreshCartSections();
    }).catch(function () { alert(T.strings.error); }).finally(function () { if (container) container.classList.remove('is-updating'); });
  }

  document.addEventListener('click', function (e) {
    var cartOpen = e.target.closest('[data-cart-open]');
    if (cartOpen && T.cartType === 'drawer' && cartDrawer() && !document.body.classList.contains('template-cart')) {
      e.preventDefault(); openDrawer(cartDrawer(), cartOpen); return;
    }
    var step = e.target.closest('[data-qty-change]');
    if (step) {
      var item = step.closest('[data-line]');
      var input = $('[data-line-qty]', item);
      var next = Math.max(0, (parseInt(input.value, 10) || 0) + parseInt(step.dataset.qtyChange, 10));
      input.value = next;
      changeLine(parseInt(item.dataset.line, 10), next, step);
      return;
    }
    var rm = e.target.closest('[data-line-remove]');
    if (rm) { var it = rm.closest('[data-line]'); changeLine(parseInt(it.dataset.line, 10), 0, rm); }
  });
  document.addEventListener('change', function (e) {
    if (e.target.matches('[data-line-qty]')) {
      var item = e.target.closest('[data-line]');
      changeLine(parseInt(item.dataset.line, 10), Math.max(0, parseInt(e.target.value, 10) || 0), e.target);
    }
    if (e.target.matches('[data-cart-note]')) {
      fetch(T.routes.cart + '/update.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ note: e.target.value }) });
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
      if (!variant) {
        btn.disabled = true; btnText.textContent = T.strings.unavailable; return;
      }
      idInput.value = variant.id;
      btn.disabled = !variant.available;
      btnText.textContent = variant.available ? T.strings.addToCart : T.strings.soldOut;

      var priceWrap = $('[data-product-price]', section);
      if (priceWrap) {
        var onSale = variant.compare_at_price && variant.compare_at_price > variant.price;
        priceWrap.innerHTML = '<div class="price price--large' + (onSale ? ' price--on-sale' : '') + '"><span class="price__current">' + formatMoney(variant.price) + '</span>' +
          (onSale ? '<s class="price__compare">' + formatMoney(variant.compare_at_price) + '</s>' : '') + '</div>';
      }
      var inv = $('[data-product-inventory]', section);
      if (inv) {
        inv.classList.toggle('product__inventory--out', !variant.available);
        inv.textContent = variant.available ? (T.strings.inStock || 'In stock') : (T.strings.outOfStock || T.strings.soldOut);
      }
      if (!section.closest('.quick-add-modal')) {
        var url = new URL(window.location.href);
        url.searchParams.set('variant', variant.id);
        window.history.replaceState({}, '', url.toString());
      }
      if (variant.featured_media && gallery && gallery._goTo) gallery._goToMedia(variant.featured_media.id);
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
    $$('[data-zoom-index]', gallery).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var imgs = $$('img[data-src]', lbTrack);
        imgs.forEach(function (img) { img.src = img.dataset.src; img.removeAttribute('data-src'); });
        lastFocus = btn;
        lightbox.classList.add('is-open');
        document.body.classList.add('scroll-lock');
        var i = parseInt(btn.dataset.zoomIndex, 10);
        requestAnimationFrame(function () { lbTrack.scrollLeft = lbTrack.clientWidth * i; $('[data-lightbox-close]', lightbox).focus(); });
      });
    });
    $('[data-lightbox-close]', lightbox).addEventListener('click', function () { closeLightbox(lightbox); });
    $('[data-lightbox-prev]', lightbox).addEventListener('click', function () { lbTrack.scrollBy({ left: -lbTrack.clientWidth, behavior: 'smooth' }); });
    $('[data-lightbox-next]', lightbox).addEventListener('click', function () { lbTrack.scrollBy({ left: lbTrack.clientWidth, behavior: 'smooth' }); });
    lbTrack.addEventListener('click', function (e) { if (e.target.tagName === 'IMG') e.target.classList.toggle('is-zoomed'); });
  }

  function closeLightbox(lb) {
    lb.classList.remove('is-open');
    $$('img.is-zoomed', lb).forEach(function (i) { i.classList.remove('is-zoomed'); });
    if (!$('.drawer.is-open, .quick-add-modal.is-open')) document.body.classList.remove('scroll-lock');
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  /* ------------------------------------------------------------------ */
  /* Quick add                                                           */
  /* ------------------------------------------------------------------ */
  var quickModal;
  function ensureQuickModal() {
    if (quickModal) return quickModal;
    quickModal = document.createElement('div');
    quickModal.className = 'quick-add-modal';
    quickModal.setAttribute('aria-hidden', 'true');
    quickModal.innerHTML = '<button type="button" class="quick-add-modal__overlay" tabindex="-1" aria-label="Close"></button>' +
      '<div class="quick-add-modal__panel" role="dialog" aria-modal="true" aria-label="Quick add" tabindex="-1">' +
      '<button type="button" class="icon-button quick-add-modal__close" aria-label="Close"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19"/></svg></button>' +
      '<div data-quick-content></div></div>';
    document.body.appendChild(quickModal);
    quickModal.querySelector('.quick-add-modal__overlay').addEventListener('click', closeQuickAdd);
    quickModal.querySelector('.quick-add-modal__close').addEventListener('click', closeQuickAdd);
    return quickModal;
  }
  function closeQuickAdd() {
    if (!quickModal || !quickModal.classList.contains('is-open')) return;
    quickModal.classList.remove('is-open');
    quickModal.setAttribute('aria-hidden', 'true');
    if (!$('.drawer.is-open')) document.body.classList.remove('scroll-lock');
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-quick-add]');
    if (!b) return;
    e.preventDefault();
    var url = b.getAttribute('data-quick-add');
    lastFocus = b;
    b.classList.add('is-loading');
    fetchHTML(url + (url.indexOf('?') > -1 ? '&' : '?') + 'view=quick-view').then(function (doc) {
      var section = doc.querySelector('[data-product-section]');
      if (!section) { window.location.href = url; return; }
      var m = ensureQuickModal();
      var content = m.querySelector('[data-quick-content]');
      content.innerHTML = '';
      section.querySelectorAll('.breadcrumbs, [data-lightbox]').forEach(function (el) { el.remove(); });
      content.appendChild(section);
      section.style.setProperty('--pt', '0px'); section.style.setProperty('--pb', '0px');
      $$('.page-width', section).forEach(function (pw) { pw.style.padding = '0'; });
      initProduct(section);
      m.classList.add('is-open');
      m.setAttribute('aria-hidden', 'false');
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
      if (!track || !prev || !next) return;
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
      b.setAttribute('aria-pressed', playing ? 'true' : 'false');
      b.setAttribute('aria-label', playing ? 'Pause video' : 'Play video');
    }
    wrap.classList.toggle('is-playing', playing);
  }

  function initVideos(root) {
    $$('[data-inspo-video]', root).forEach(function (wrap) {
      if (wrap.dataset.ready) return;
      wrap.dataset.ready = 'true';
      var section = wrap.closest('[data-inspiration]');
      wrap.dataset.autoplay = section ? section.dataset.autoplayVideo : 'true';
      var video = wrap.querySelector('video');
      var btn = wrap.querySelector('[data-inspo-play]');
      if (reduceMotion) setPlayState(wrap, false);
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
  function initHero(root) {
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
        pause.addEventListener('click', function () { paused = !paused; pause.setAttribute('aria-pressed', paused ? 'true' : 'false'); pause.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow'); start(); });
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
      var go = function (n) { slides[i].classList.add('is-hidden'); i = (n + slides.length) % slides.length; slides[i].classList.remove('is-hidden'); };
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
  function initCollection() {
    var section = $('[data-collection-section]');
    if (!section) return;
    var sectionId = section.dataset.sectionId;

    var render = function (url, append) {
      var results = $('[data-collection-results]', section);
      var grid = $('[data-product-grid]', section);
      if (grid) grid.classList.add('is-loading');
      var u = new URL(url, window.location.origin);
      u.searchParams.set('section_id', sectionId);
      return fetchHTML(u.toString()).then(function (doc) {
        var freshResults = doc.querySelector('[data-collection-results]');
        if (append) {
          var newGrid = doc.querySelector('[data-product-grid]');
          if (newGrid && grid) { $$('li', newGrid).forEach(function (li) { grid.appendChild(li); }); }
          var lm = $('[data-load-more]', section), newLm = doc.querySelector('[data-load-more]');
          if (lm) { if (newLm) lm.replaceWith(newLm); else lm.remove(); }
        } else if (freshResults && results) {
          results.innerHTML = freshResults.innerHTML;
        }
        ['[data-product-count]', '[data-facets-drawer-body]', '.hide-mobile-sidebar'].forEach(function (sel) {
          var a = $(sel, section), b = doc.querySelector(sel);
          if (a && b) a.innerHTML = b.innerHTML;
        });
        if (!append) window.history.replaceState({}, '', url);
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
  function initRecommendations() {
    $$('[data-recommendations]').forEach(function (el) {
      var load = function () {
        fetchHTML(el.dataset.url).then(function (doc) {
          var fresh = doc.querySelector('[data-recommendations]');
          if (fresh && fresh.innerHTML.trim()) { el.innerHTML = fresh.innerHTML; initReveal(el); }
        }).catch(function () {});
      };
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io.disconnect(); load(); } }, { rootMargin: '400px' });
        io.observe(el);
      } else load();
    });
  }

  function initRecentlyViewed() {
    var el = $('[data-recently-viewed]');
    if (!el) return;
    var list = [];
    try { list = JSON.parse(localStorage.getItem('anima:recently-viewed') || '[]'); } catch (e) { return; }
    var current = el.dataset.current;
    var limit = parseInt(el.dataset.limit, 10) || 4;
    var handles = list.filter(function (h) { return h && h !== current; }).slice(0, limit);
    if (!handles.length) return;
    var target = $('[data-recently-viewed-list]', el);
    Promise.all(handles.map(function (h) {
      return fetch((T.routes.root || '/') + 'products/' + encodeURIComponent(h) + '?section_id=product-card-render')
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
  /* Boot                                                                */
  /* ------------------------------------------------------------------ */
  function boot() {
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
    if ($('[data-header]', root)) initHeader();
  });
  document.addEventListener('shopify:block:select', function (e) {
    var card = e.target.closest('.inspo-card');
    if (card) { var track = card.parentElement; track.scrollTo({ left: centerOffset(track, card), behavior: 'smooth' }); }
    var slide = e.target.closest('[data-hero-slide]');
    if (slide) { var hero = slide.closest('[data-hero]'); $$('[data-hero-slide]', hero).forEach(function (s) { s.classList.toggle('is-active', s === slide); }); }
  });
})();
