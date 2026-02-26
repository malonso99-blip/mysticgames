document.getElementById("btnComprar").addEventListener("click", async () => {

  // EJEMPLO: reemplazar esto con tu carrito real
  const carrito = [
    {
      title: "Compra en MysticGames",
      quantity: 1,
      unit_price: 1000
    }
  ];

  try {
    const response = await fetch("http://localhost:3000/create_preference", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ items: carrito })
    });

    const data = await response.json();

    // Redirige al checkout oficial
    window.location.href = data.init_point;

  } catch (error) {
    console.error("Error:", error);
    alert("Hubo un error al iniciar el pago");
  }

});