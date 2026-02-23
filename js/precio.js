const precios = document.querySelectorAll(".product_price");

precios.forEach(precio => {
    const usd = Number(precio.dataset.usd);
    const pesos = Math.round(usd * dolar);
    precio.textContent = "$" + pesos.toLocaleString("es-AR");
});
