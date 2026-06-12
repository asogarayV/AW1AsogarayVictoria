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

// Crear la tarjeta 
function crearCardProducto(producto, basePath = "") {
    const card = document.createElement("div");
    card.className = "card";
    
    const rutaImagen = producto.imagen.replace("assets/", "Assets/");

    card.innerHTML = `
        <img src="${basePath}${rutaImagen}" alt="${producto.nombre}">
        <div class="card-info">
            <h3>${producto.nombre}</h3>
            <p>${producto.desc || ''}</p>
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

// Lógica de agregar al carrito con cantidades
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

// Boton finalizar compra
async function finalizarCompra() {
    if (carrito.length === 0) {
        alert("Tu carrito está vacío. ¡Sumá productos antes de comprar!");
        return;
    }

    // Buscamos si existen las credenciales en el navegador
    const token = localStorage.getItem("token");
    const usuarioSesion = localStorage.getItem("usuario");

    // Si NO inició sesión (no hay token), la frenamos y la mandamos a loguearse
    if (!token || !usuarioSesion) {
        alert("Para finalizar la compra, primero debés iniciar sesión. ¡Te redirigimos!");
        const enSubcarpeta = window.location.pathname.includes("/Pages/");
        window.location.href = enSubcarpeta ? "./LogIn.html" : "./Pages/LogIn.html";
        return;
    }

    // Si está logueado redirigimos directo a página del carrito
    console.log("Usuario verificado con éxito. Redirigiendo al carrito...");
    
    const enSubcarpeta = window.location.pathname.includes("/Pages/");
    window.location.href = enSubcarpeta ? "./carrito.html" : "./Pages/carrito.html";
}

// Aseguramos el inicio de la carga al abrir el index.html
document.addEventListener("DOMContentLoaded", initHomePage);