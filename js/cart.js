let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

function generateIdFromName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || Date.now();
}

function ensureAddToCart() {
  const info = document.querySelector(".product_detail_info");
  const titleEl = document.querySelector(".product_title_detail");
  const priceEl = document.querySelector(".product_price");
  const name = titleEl?.textContent?.trim();
  const usd = priceEl?.dataset?.usd;

  if (info && name && usd) {
    let target = document.querySelector(".add-to-cart");
    if (!target) {
      target = info.querySelector(".cta");
    }
    if (target) {
      target.classList.add("add-to-cart");
      if (!target.dataset.id) target.dataset.id = String(generateIdFromName(name));
      if (!target.dataset.name) target.dataset.name = name;
      if (!target.dataset.usd) target.dataset.usd = String(usd);
      if (!target.textContent?.trim()) target.textContent = "Agregar al carrito";
    } else {
      const btn = document.createElement("button");
      btn.className = "add-to-cart";
      btn.dataset.id = String(generateIdFromName(name));
      btn.dataset.name = name;
      btn.dataset.usd = String(usd);
      btn.textContent = "Agregar al carrito";
      info.appendChild(btn);
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  ensureAddToCart();
});

if (document.readyState !== "loading") {
  ensureAddToCart();
}

function addToCart(id, name, usd) {
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.cantidad++;
  } else {
    cart.push({
      id,
      name,
      usd,
      cantidad: 1
    });
  }

  saveCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
}

function renderCart() {
  const cartContainer = document.getElementById("cart-items");
  const totalContainer = document.getElementById("cart-total");

  if (!cartContainer) return;

  cartContainer.innerHTML = "";

  let total = 0;

  cart.forEach(item => {

    const precioPesos = Math.round(item.usd * dolar);
    const subtotal = precioPesos * item.cantidad;

    total += subtotal;

    cartContainer.innerHTML += `
  <div class="cart-item">
    <p>${item.name}</p>

    <div class="cart-controls">
      <button onclick="decreaseQuantity(${item.id})">−</button>
      <span>${item.cantidad}</span>
      <button onclick="increaseQuantity(${item.id})">+</button>
    </div>

    <p>$${subtotal.toLocaleString("es-AR")}</p>
  </div>
`;
  });

  totalContainer.textContent = "$" + total.toLocaleString("es-AR");
}

document.addEventListener("click", function(e) {
  if (e.target.classList.contains("add-to-cart")) {
    e.preventDefault?.();
    const id = Number(e.target.dataset.id);
    const name = e.target.dataset.name;
    const usd = Number(e.target.dataset.usd);

    addToCart(id, name, usd);
    window.location.href = "carrito.html";
  }
});

renderCart();

function increaseQuantity(id) {
  const item = cart.find(item => item.id === id);
  if (item) {
    item.cantidad++;
    saveCart();
  }
}

function decreaseQuantity(id) {
  const item = cart.find(item => item.id === id);
  if (item) {
    item.cantidad--;
    if (item.cantidad <= 0) {
      cart = cart.filter(i => i.id !== id);
    }
    saveCart();
  }
}

function showCheckoutForm() {
  const wrapper = document.getElementById("checkout-form");
  const form = document.getElementById("formDatos");
  const cancel = document.getElementById("cf-cancel");

  if (!wrapper || !form) return false;

  wrapper.style.display = "block";

  cancel?.addEventListener("click", () => {
    wrapper.style.display = "none";
  }, { once: true });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nameEl = document.getElementById("cf-name");
    const addressEl = document.getElementById("cf-address");
    const contactEl = document.getElementById("cf-contact");
    const name = nameEl && nameEl.value ? nameEl.value.trim() : "";
    const address = addressEl && addressEl.value ? addressEl.value.trim() : "";
    const contact = contactEl && contactEl.value ? contactEl.value.trim() : "";

    if (!name || !address || !contact) {
      alert("Completá todos los datos para continuar.");
      return;
    }

    if (cart.length === 0) {
      alert("El carrito está vacío");
      return;
    }

    const itemsParaMP = cart.map(item => ({
      title: item.name,
      quantity: item.cantidad,
      unit_price: Math.round(item.usd * Number(dolar || 0))
    }));

    if (!dolar) {
      alert("El valor del dólar aún no cargó. Esperá un momento.");
      return;
    }

    try {
      const response = await fetch((typeof backendUrl === "string" ? backendUrl : "") + "/create_preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          items: itemsParaMP,
          customer: { name, address, contact },
          notify_email: "mysticgames.argentina@gmail.com"
        })
      });

      const data = await response.json();
      const url = (typeof mpSandbox !== "undefined" && mpSandbox && data.sandbox_init_point) ? data.sandbox_init_point : data.init_point;
      window.location.href = url;
    } catch (error) {
      console.error(error);
      alert("Error al iniciar el pago");
    }
  }, { once: true });

  return true;
}

document.getElementById("btnComprar")?.addEventListener("click", async () => {

  if (cart.length === 0) {
    alert("El carrito está vacío");
    return;
  }

  if (showCheckoutForm()) {
    return;
  }

  const itemsParaMP = cart.map(item => ({
    title: item.name,
    quantity: item.cantidad,
    unit_price: Math.round(item.usd * Number(dolar || 0))
  }));

  if (!dolar) {
    alert("El valor del dólar aún no cargó. Esperá un momento.");
    return;
  }

  try {
    const response = await fetch((typeof backendUrl === "string" ? backendUrl : "") + "/create_preference", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ items: itemsParaMP })
    });

    const data = await response.json();
    const url = (typeof mpSandbox !== "undefined" && mpSandbox && data.sandbox_init_point) ? data.sandbox_init_point : data.init_point;
    window.location.href = url;
  } catch (error) {
    console.error(error);
    alert("Error al iniciar el pago");
  }

});
