const precios = document.querySelectorAll(".product_price");

precios.forEach(precio => {
    const usd = Number(precio.dataset.usd);
    const pesos = Math.round(usd * dolar);
    precio.textContent = "$" + pesos.toLocaleString("es-AR");
});

(function ensureCartScript() {
    try {
        const isProductPage = !!document.querySelector(".product_detail");
        const hasCart = !!document.querySelector('script[src*="js/cart.js"]');
        if (isProductPage && !hasCart) {
            const s = document.createElement("script");
            s.src = "./js/cart.js";
            document.body.appendChild(s);
        }
    } catch (_) {}
})();
