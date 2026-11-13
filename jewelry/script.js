// Aurelle — single-product jewelry store (USA only)
(function () {
  "use strict";

  const PRODUCT = { name: "Lumière Solitaire Pendant", price: 1290 };
  const METALS = {
    yellow: "14k Yellow Gold",
    white: "14k White Gold",
    rose: "14k Rose Gold",
  };

  // 50 states + DC, with approximate statewide base sales tax rates (demo estimates)
  const STATES = [
    ["AL", "Alabama", 4], ["AK", "Alaska", 0], ["AZ", "Arizona", 5.6], ["AR", "Arkansas", 6.5],
    ["CA", "California", 7.25], ["CO", "Colorado", 2.9], ["CT", "Connecticut", 6.35], ["DE", "Delaware", 0],
    ["DC", "District of Columbia", 6], ["FL", "Florida", 6], ["GA", "Georgia", 4], ["HI", "Hawaii", 4],
    ["ID", "Idaho", 6], ["IL", "Illinois", 6.25], ["IN", "Indiana", 7], ["IA", "Iowa", 6],
    ["KS", "Kansas", 6.5], ["KY", "Kentucky", 6], ["LA", "Louisiana", 4.45], ["ME", "Maine", 5.5],
    ["MD", "Maryland", 6], ["MA", "Massachusetts", 6.25], ["MI", "Michigan", 6], ["MN", "Minnesota", 6.875],
    ["MS", "Mississippi", 7], ["MO", "Missouri", 4.225], ["MT", "Montana", 0], ["NE", "Nebraska", 5.5],
    ["NV", "Nevada", 6.85], ["NH", "New Hampshire", 0], ["NJ", "New Jersey", 6.625], ["NM", "New Mexico", 4.875],
    ["NY", "New York", 4], ["NC", "North Carolina", 4.75], ["ND", "North Dakota", 5], ["OH", "Ohio", 5.75],
    ["OK", "Oklahoma", 4.5], ["OR", "Oregon", 0], ["PA", "Pennsylvania", 6], ["RI", "Rhode Island", 7],
    ["SC", "South Carolina", 6], ["SD", "South Dakota", 4.2], ["TN", "Tennessee", 7], ["TX", "Texas", 6.25],
    ["UT", "Utah", 6.1], ["VT", "Vermont", 6], ["VA", "Virginia", 5.3], ["WA", "Washington", 6.5],
    ["WV", "West Virginia", 6], ["WI", "Wisconsin", 5], ["WY", "Wyoming", 4],
  ];

  const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  const $ = (sel) => document.querySelector(sel);

  // ---------- Cart state (saved per browser) ----------
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem("aurelle-cart")) || []; } catch (e) { cart = []; }
  const save = () => { try { localStorage.setItem("aurelle-cart", JSON.stringify(cart)); } catch (e) { /* ignore */ } };
  const subtotal = () => cart.reduce((s, i) => s + i.qty * PRODUCT.price, 0);

  // ---------- Metal selection ----------
  function setMetal(metal) {
    document.body.classList.remove("metal-yellow", "metal-white", "metal-rose");
    document.body.classList.add("metal-" + metal);
    $("#metalLabel").textContent = METALS[metal];
    $("#metalCaption").textContent = "Shown in " + METALS[metal];
  }
  document.querySelectorAll('input[name="metal"]').forEach((r) =>
    r.addEventListener("change", (e) => setMetal(e.target.value))
  );
  setMetal("yellow");

  // ---------- Quantity & engraving ----------
  const qtyInput = $("#qty");
  const clampQty = (n) => Math.min(5, Math.max(1, parseInt(n, 10) || 1));
  $("#qtyMinus").addEventListener("click", () => { qtyInput.value = clampQty(+qtyInput.value - 1); });
  $("#qtyPlus").addEventListener("click", () => { qtyInput.value = clampQty(+qtyInput.value + 1); });
  qtyInput.addEventListener("change", () => { qtyInput.value = clampQty(qtyInput.value); });

  const engraveToggle = $("#engraveToggle");
  const engraveText = $("#engraveText");
  engraveToggle.addEventListener("change", () => {
    engraveText.hidden = !engraveToggle.checked;
    if (engraveToggle.checked) engraveText.focus();
  });

  $("#installment").textContent = usd.format(PRODUCT.price / 4);

  // ---------- Add to bag ----------
  $("#buyForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const metal = document.querySelector('input[name="metal"]:checked').value;
    const length = document.querySelector('input[name="length"]:checked').value;
    const engraving = engraveToggle.checked ? engraveText.value.trim() : "";
    const qty = clampQty(qtyInput.value);

    const existing = cart.find((i) => i.metal === metal && i.length === length && i.engraving === engraving);
    if (existing) existing.qty = Math.min(5, existing.qty + qty);
    else cart.push({ metal, length, engraving, qty });

    save();
    renderCart();
    toast("Added to your bag ✨");
    openCart();
  });

  // ---------- Cart drawer ----------
  const drawer = $("#cart");
  const overlay = $("#overlay");

  function openCart() {
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    overlay.hidden = false;
  }
  function closeCart() {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    overlay.hidden = true;
  }
  $("#cartOpen").addEventListener("click", openCart);
  $("#cartClose").addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);

  function renderCart() {
    const wrap = $("#cartItems");
    const count = cart.reduce((s, i) => s + i.qty, 0);
    $("#cartCount").textContent = count;
    $("#cartSubtotal").textContent = usd.format(subtotal());
    $("#checkoutBtn").disabled = count === 0;

    if (!cart.length) {
      wrap.innerHTML = '<p class="empty">Your bag is empty.</p>';
      return;
    }
    wrap.innerHTML = "";
    cart.forEach((item, idx) => {
      const el = document.createElement("div");
      el.className = "item";
      el.innerHTML =
        '<div class="item-thumb">💎</div>' +
        "<div><h4></h4><p class=\"opts\"></p><p class=\"eng\"></p>" +
        '<button class="remove" type="button">Remove</button></div>' +
        "<div><strong></strong></div>";
      el.querySelector("h4").textContent = PRODUCT.name + " × " + item.qty;
      el.querySelector(".opts").textContent = METALS[item.metal] + " · " + item.length + " chain";
      el.querySelector(".eng").textContent = item.engraving ? 'Engraving: "' + item.engraving + '"' : "";
      el.querySelector("strong").textContent = usd.format(item.qty * PRODUCT.price);
      el.querySelector(".remove").addEventListener("click", () => {
        cart.splice(idx, 1);
        save();
        renderCart();
      });
      wrap.appendChild(el);
    });
  }

  // ---------- Checkout (US only) ----------
  const modal = $("#checkout");
  const form = $("#checkoutForm");
  const stateSelect = $("#stateSelect");
  STATES.forEach(([code, name]) => {
    const opt = document.createElement("option");
    opt.value = code;
    opt.textContent = name;
    stateSelect.appendChild(opt);
  });

  function updateTotals() {
    const sub = subtotal();
    const st = STATES.find((s) => s[0] === stateSelect.value);
    const tax = st ? sub * (st[2] / 100) : 0;
    $("#sumSubtotal").textContent = usd.format(sub);
    $("#sumTax").textContent = st ? usd.format(tax) : "Select state";
    $("#taxState").textContent = st ? "(" + st[0] + ")" : "";
    $("#sumTotal").textContent = usd.format(sub + tax);
    return sub + tax;
  }
  stateSelect.addEventListener("change", updateTotals);

  $("#checkoutBtn").addEventListener("click", () => {
    if (!cart.length) return;
    closeCart();
    $("#checkoutFormWrap").hidden = false;
    $("#confirmation").hidden = true;
    $("#formError").textContent = "";
    updateTotals();
    modal.hidden = false;
    form.elements.first.focus();
  });
  const closeModal = () => { modal.hidden = true; };
  $("#checkoutClose").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeModal(); closeCart(); }
  });

  const RULES = {
    zip: [/^\d{5}(-\d{4})?$/, "Enter a valid US ZIP code (e.g. 10001 or 10001-1234)."],
    phone: [/^(\+?1[\s.-]?)?\(?[2-9]\d{2}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, "Enter a valid 10-digit US phone number."],
    email: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address."],
    address: [/^(?!.*\b(p\.?\s*o\.?\s*box|post\s+office\s+box)\b)/i, "Sorry, we can't ship to P.O. boxes."],
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let error = "";
    [...form.elements].forEach((el) => el.classList && el.classList.remove("invalid"));

    for (const el of form.elements) {
      if (!el.name || el.disabled) continue;
      const val = el.value.trim();
      let msg = "";
      if (el.required && !val) msg = "Please fill in all required fields.";
      else if (val && RULES[el.name] && !RULES[el.name][0].test(val)) msg = RULES[el.name][1];
      if (msg) {
        el.classList.add("invalid");
        if (!error) { error = msg; el.focus(); }
      }
    }
    if (error) { $("#formError").textContent = error; return; }

    const total = updateTotals();
    const orderNo = "AU-" + Math.floor(100000 + Math.random() * 900000);
    const stateName = STATES.find((s) => s[0] === stateSelect.value)[1];
    $("#confirmText").textContent =
      "Order " + orderNo + " for " + usd.format(total) + " is confirmed, " + form.elements.first.value.trim() +
      ". It ships insured via FedEx 2-Day to " + form.elements.city.value.trim() + ", " + stateName +
      ". A confirmation has been sent to " + form.elements.email.value.trim() + ".";
    $("#checkoutFormWrap").hidden = true;
    $("#confirmation").hidden = false;
    cart = [];
    save();
    renderCart();
    form.reset();
  });
  $("#doneBtn").addEventListener("click", closeModal);

  // ---------- Newsletter ----------
  $("#newsForm").addEventListener("submit", (e) => {
    e.preventDefault();
    $("#newsMsg").textContent = "You're in! Check your inbox for your $50 code.";
    e.target.reset();
  });

  // ---------- Misc ----------
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }
  $("#year").textContent = new Date().getFullYear();
  renderCart();
})();
