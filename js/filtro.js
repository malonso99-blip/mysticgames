const buscador = document.getElementById("buscador");
const productos = document.querySelectorAll(".product_card");


function filtrar(categoria) {
    const productos = document.querySelectorAll(".product_card");

    productos.forEach(producto => {
        const categorias = producto.dataset.category;

        if (categoria === "todos" || categorias.includes(categoria)) {
            producto.style.display = "block";
        } else {
            producto.style.display = "none";
        }
    });
}
