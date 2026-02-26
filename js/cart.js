let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
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
    const id = Number(e.target.dataset.id);
    const name = e.target.dataset.name;
    const usd = Number(e.target.dataset.usd);

    addToCart(id, name, usd);
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

document.getElementById("btnComprar")?.addEventListener("click", async () => {

  if (cart.length === 0) {
    alert("El carrito está vacío");
    return;
  }

  // Convertir tu carrito al formato que Mercado Pago necesita
  const itemsParaMP = cart.map(item => ({
    title: item.name,
    quantity: item.cantidad,
    unit_price: Math.round(item.usd * dolar) // lo estamos enviando en pesos
  }));

  try {
    const response = await fetch("http://localhost:3000/create_preference", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ items: itemsParaMP })
    });

    const data = await response.json();

    // Redirigir al checkout oficial
    window.location.href = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${data.id}`;

  } catch (error) {
    console.error(error);
    alert("Error al iniciar el pago");
  }

});