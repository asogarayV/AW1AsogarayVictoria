let productos = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// Cargar productos desde el Servidor
async function cargarProductos() {
    try {
        const respuesta = await fetch("http://localhost:3000/productos");
        if (!respuesta.ok) throw new Error("Error en el servidor");
        const datos = await respuesta.json();
        
        const listaCompleta = [];
        for (const categoriaNombre in datos) {
            datos[categoriaNombre].forEach(prod => {
                prod.categoria = categoriaNombre; 
                listaCompleta.push(prod);
            });
        }
        
        productos = listaCompleta;
        return productos;
    } catch (error) {
        console.error("Error al conectar con el servidor:", error);
        return [];
    }
}

//  Crear la tarjeta 
function crearCardProducto(producto, basePath = "") {
    const card = document.createElement("div");
    card.className = "card";
    
    const rutaImagen = producto.imagen.replace("assets/", "Assets/");

    card.innerHTML = `
        <img src="${basePath}${rutaImagen}" alt="${producto.nombre}">
        <div class="card-info">
            <h3>${producto.nombre}</h3>
            <p>${producto.desc}</p>
            <p class="precio">$${producto.precio.toLocaleString("es-AR")}</p>
            
            <div class="cantidad-selector">
                <label>Cantidad:</label>
                <input type="number" id="cant-${producto.id}" value="1" min="1" max="${producto.stock}">
            </div>

            <button class="btn-agregar" onclick="prepararAgregado(${producto.id})">Agregar al carrito</button>
        </div>
    `;
    return card;
}


function mostrarProductosEnGrilla(listaProductos, containerId) {
    const contenedor = document.getElementById(containerId);
    if (!contenedor) return;
    
    contenedor.innerHTML = "";

    if (listaProductos.length === 0) {
        contenedor.innerHTML = "<p>No hay productos en esta categoría.</p>";
        return;
    }

    listaProductos.forEach(prod => {
        contenedor.appendChild(crearCardProducto(prod, ""));
    });
}


async function aplicarFiltro(categoriaSeleccionada) {
    const lista = await cargarProductos();
    
    const productosFiltrados = categoriaSeleccionada === 'todos' 
        ? lista 
        : lista.filter(p => p.categoria === categoriaSeleccionada);

    mostrarProductosEnGrilla(productosFiltrados, "productos-destacados");
}

async function initHomePage() {
    console.log("Noble Cebada: Cargando Home...");
    const lista = await cargarProductos();
    mostrarProductosEnGrilla(lista, "productos-destacados");
}

// 6. Lógica de agregar al carrito con cantidades
function organizarCompra() {} 

function prepararAgregado(id) {
    const inputCant = document.getElementById(`cant-${id}`);
    const cantidadSeleccionada = parseInt(inputCant.value);
    
    if (cantidadSeleccionada > 0) {
        agregarAlCarrito(id, cantidadSeleccionada);
    }
}

function agregarAlCarrito(id, cantidad = 1) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;

    const existe = carrito.find(item => item.id === id);
    if (existe) {
        existe.cantidad += cantidad;
    } else {
        carrito.push({ ...producto, cantidad: cantidad });
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    alert(`¡Sumaste ${cantidad} ${producto.nombre} al carrito! 🧉`);
}

async function finalizarCompra() {
    // Validamos que haya productos en el carrito
    if (carrito.length === 0) {
        alert("Tu carrito está vacío. ¡Sumá productos antes de comprar!");
        return;
    }

    // Buscamos si hay un usuario activo en la sesión
    const usuarioSesion = sessionStorage.getItem("usuarioActivo");

    // Si no inició sesión, lo frenamos y lo mandamos a loguearse
    if (!usuarioSesion) {
        alert("Para finalizar la compra, primero debés iniciar sesión. ¡Te redirigimos!");
        const enSubcarpeta = window.location.pathname.includes("/Pages/");
        window.location.href = enSubcarpeta ? "./LogIn.html" : "./Pages/LogIn.html";
        return;
    }

    const usuarioReal = JSON.parse(usuarioSesion);

    const orden = {
        usuario: {
            id: usuarioReal.id,
            nombre: `${usuarioReal.nombre} ${usuarioReal.apellido}`,
            email: usuarioReal.email
        },
        productos: carrito,
        total: carrito.reduce((acc, p) => acc + (p.precio * p.cantidad), 0)
    };

    try {
        // Enviamos la orden real al backend
        const respuesta = await fetch("http://localhost:3000/compras", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orden)
        });

        const data = await respuesta.json();

        if (respuesta.ok) {
            alert("¡Éxito! " + data.mensaje);
            
            // Limpiamos el carrito porque la compra ya se hizo
            carrito = [];
            localStorage.removeItem("carrito");
            location.reload(); 
        } else {
            alert("Error: " + data.mensaje);
        }
    } catch (error) {
        console.error("Error al procesar la compra:", error);
        alert("El servidor de Node.js está apagado o no responde.");
    }
}