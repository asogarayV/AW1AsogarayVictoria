import express from 'express';
import fs from 'fs/promises';

const app = express();
const port = 3000;

// Milddleware para que el servidor procese datos en formato JSON
app.use(express.json());

// Inicio del Servidor
app.listen(port, () => {
    console.log("--------------------------------------------------");
    console.log(`Servidor de Victoria corriendo en http://localhost:${port}`);
    console.log("--------------------------------------------------");
});

// Helperspara no repetir código de lectura de archivos
async function leerDatos(archivo) {
    const data = await fs.readFile(`./Data/${archivo}.json`, 'utf-8');
    return JSON.parse(data);
}

// ------------------------------------------------
// 1. SOLICITUDES GET 
// ------------------------------------------------

// GET: Listar todos los productos
app.get('/productos', async (req, res) => {
    try {
        const productos = await leerDatos('productos');
        res.status(200).json(productos);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al leer productos" });
    }
});

// GET: Buscar un usuario por su ID
app.get('/usuarios/:id', async (req, res) => {
    try {
        const usuarios = await leerDatos('usuarios');
        // req.params contiene lo que escribís en la URL (ej: /usuarios/101)
        const encontrado = usuarios.find(u => u.id === parseInt(req.params.id));
        
        if (encontrado) {
            res.status(200).json(encontrado);
        } else {
            res.status(404).json({ mensaje: "Usuario no encontrado" });
        }
    } catch (error) {
        res.status(500).json({ mensaje: "Error en el servidor" });
    }
});

// ------------------------------------------------
// 2. SOLICITUDES POST 
// ------------------------------------------------

// POST: Login (Manejo de email y contraseña en el Body)
app.post('/login', async (req, res) => {
    try {
        const { email, contrasena } = req.body; // Extraemos datos del Body 
        const usuarios = await leerDatos('usuarios');
        const user = usuarios.find(u => u.email === email && u.contrasena === contrasena);

        if (user) {
            res.status(200).json({ mensaje: `Bienvenida ${user.nombre}`, id: user.id });
        } else {
            res.status(401).json({ mensaje: "Email o clave incorrectos" });
        }
    } catch (error) {
        res.status(500).json({ mensaje: "Error al procesar login" });
    }
});

// POST: Registrar un nuevo producto 
app.post('/productos', (req, res) => {
    const nuevo = req.body;
    res.status(201).json({ mensaje: "Producto registrado con éxito", data: nuevo });
});

// ------------------------------------------------
// 3. SOLICITUD PUT 
// ------------------------------------------------

// PUT: Cambiar nombre o datos de un usuario
app.put('/usuarios/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const usuarios = await leerDatos('usuarios');
        const index = usuarios.findIndex(u => u.id === id);

        if (index !== -1) {
            // Unimos los datos viejos con los nuevos recibidos
            const actualizado = { ...usuarios[index], ...req.body };
            res.status(200).json({ mensaje: "Usuario actualizado", data: actualizado });
        } else {
            res.status(404).json({ mensaje: "No se encontró el usuario" });
        }
    } catch (error) {
        res.status(500).json({ mensaje: "Error al actualizar" });
    }
});

// ------------------------------------------------
// 4. SOLICITUD DELETE 
// ------------------------------------------------

app.delete('/usuarios/:id', async (req, res) => {
    try {
        const idAEliminar = parseInt(req.params.id);
        const ventas = await leerDatos('ventas');
        const usuarios = await leerDatos('usuarios');

        // Si el usuario tiene ventas, no se borra
        const tieneVentas = ventas.some(v => v.id_usuario === idAEliminar);

        if (tieneVentas) {
            return res.status(400).json({ 
                mensaje: "ERROR DE INTEGRIDAD: El usuario tiene ventas y no puede eliminarse." 
            });
        }

        const existe = usuarios.find(u => u.id === idAEliminar);
        if (!existe) return res.status(404).json({ mensaje: "Usuario no existe" });

        res.status(200).json({ mensaje: "Usuario eliminado (Simulado)" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al intentar eliminar" });
    }
});





/* // Recuperar carrito desde localStorage
function cargarCarritoDesdeStorage() {
  const data = localStorage.getItem("carrito");
  carrito = data ? JSON.parse(data) : [];
  
// actualizar el total de items
  totalItemsCarrito = carrito.reduce((acc, item) => acc + item.cantidad, 0);
}

// Guardar carrito en storage
function guardarCarritoEnStorage() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

// array de objetos de direcciones y títulos de las páginas 
const rutas = [
  { href: "index.html",           titulo: "Inicio" },
  { href: "Pages/Productos.html", titulo: "Tienda" },
  { href: "Pages/Nosotros.html",  titulo: "Nosotros" },
  { href: "Pages/Carrito.html",   titulo: "Carrito" }
];

// Estado simple del carrito
let carrito = [];                // {id, nombre, precio, cantidad}
let totalItemsCarrito = 0;

// Productos cargados desde JSON
let productos = [];

// Actualizar contador del carrito
function actualizarCarritoNavbar() {
  const carritoSpan = document.getElementById("carrito-count");
  if (carritoSpan) {
    carritoSpan.textContent = totalItemsCarrito;
  }
}

// Agregar producto al carrito
function agregarAlCarrito(producto, cantidad) {
  const existente = carrito.find(item => item.id === producto.id);

  if (existente) {
    existente.cantidad += cantidad;
  } else {
    carrito.push({ ...producto, cantidad });
  }

  totalItemsCarrito += cantidad;
  guardarCarritoEnStorage();   
  actualizarCarritoNavbar();

  alert(`Agregaste ${cantidad} x ${producto.nombre} al carrito`);
}

// Navbar con menú hamburguesa
function renderNavbar(containerId, loggedIn, basePath = "") {
  const contenedor = document.getElementById(containerId);
  if (!contenedor) return;

  let linksHTML = "";
  rutas.forEach(ruta => {
    const fullHref = basePath + ruta.href;
    const esCarrito = ruta.titulo === "Carrito";

    if (esCarrito) {
      linksHTML += `
        <a href="${fullHref}" class="nav-cart-link">
          ${ruta.titulo}
          <span id="carrito-count" class="cart-badge">0</span>
        </a>
      `;
    } else {
      linksHTML += `<a href="${fullHref}">${ruta.titulo}</a>`;
    }
  });

  let authHTML = "";
  if (loggedIn) {
    authHTML = `<button id="btn-logout" class="btn-logout">Cerrar sesión</button>`;
  } else {
    authHTML = `
      <a href="${basePath}Pages/LogIn.html" class="btn-login">Ingresar</a>
      <a href="${basePath}Pages/SingUp.html" class="btn-login">Registro</a>
    `;
  }

  const logoSrc = basePath + "Assets/img/LogoNC.png";

  contenedor.innerHTML = `
    <div class="navbar-inner">
      <div class="navbar-left">
        <img src="${logoSrc}" alt="Noble Cebada" class="logo">
        <span class="brand-name">Noble Cebada</span>
      </div>

      <button class="nav-toggle" id="nav-toggle" aria-label="Abrir menú">
        ☰
      </button>

      <nav class="nav-links" id="nav-links">
        ${linksHTML}
        ${authHTML}
      </nav>
    </div>
  `;

  const btnToggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");

  if (btnToggle && navLinks) {
    btnToggle.addEventListener("click", () => {
      navLinks.classList.toggle("nav-open");
    });
  }

    const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      // Vaciar carrito al cerrar sesión
      carrito = [];
      totalItemsCarrito = 0;
      localStorage.removeItem("carrito");

      // Borrar usuario logueado
      sessionStorage.removeItem("usuario");

      // Redirigir al login
      window.location.href = basePath + "Pages/LogIn.html";
    });
  }

  actualizarCarritoNavbar();
}

// Login
function initLoginPage() {
  renderNavbar("navbar", false, "../");

  const form = document.getElementById("form-login");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = form.querySelector('input[type="email"]').value;

    // Guardar usuario logueado en sessionStorage
    sessionStorage.setItem("usuario", JSON.stringify({ email }));

    // Ir a la tienda
    window.location.href = "Productos.html";
  });
}


// Cargar productos desde JSON con fetch
async function cargarProductos(basePath = "") {
  if (productos.length > 0) return productos;

  try {
    const respuesta = await fetch(basePath + "Assets/productos.json");
    if (!respuesta.ok) {
      throw new Error("Error al cargar productos");
    }

    const datos = await respuesta.json();
    productos = datos;
    return productos;
  } catch (error) {
    console.error("No se pudieron cargar los productos:", error);
    return [];
  }
}

// Card de producto
function crearCardProducto(producto, basePath = "") {
  const card = document.createElement("div");
  card.className = "card";

  let cantidad = 1;

  card.innerHTML = `
    <img src="${basePath + producto.imagen}" alt="${producto.nombre}">
    <h2>${producto.nombre}</h2>
    <p>${producto.descripcion}</p>
    <p class="precio">$${producto.precio.toLocaleString("es-AR")}</p>
    <div class="cantidad">
      <button class="btn-restar">-</button>
      <span class="valor">${cantidad}</span>
      <button class="btn-sumar">+</button>
    </div>
    <button class="btn-agregar">Agregar al carrito</button>
  `;

  const btnRestar = card.querySelector(".btn-restar");
  const btnSumar = card.querySelector(".btn-sumar");
  const spanValor = card.querySelector(".valor");
  const btnAgregar = card.querySelector(".btn-agregar");

  btnRestar.addEventListener("click", () => {
    if (cantidad > 1) {
      cantidad--;
      spanValor.textContent = cantidad;
    }
  });

  btnSumar.addEventListener("click", () => {
    cantidad++;
    spanValor.textContent = cantidad;
  });

  btnAgregar.addEventListener("click", () => {
    agregarAlCarrito(producto, cantidad);
  });

  return card;
}

// Render productos 
async function renderProductos(containerId, basePath = "") {
  const contenedor = document.getElementById(containerId);
  if (!contenedor) return;

  const lista = await cargarProductos(basePath);

  contenedor.innerHTML = "";
  lista.forEach(prod => {
    const card = crearCardProducto(prod, basePath);
    contenedor.appendChild(card);
  });
}

// Render productos en el HOME: 2–3 por categoría
async function renderHomeProductos(containerId, basePath = "") {
  const contenedor = document.getElementById(containerId);
  if (!contenedor) return;

  const lista = await cargarProductos(basePath);
  contenedor.innerHTML = "";

  const categorias = [...new Set(lista.map(p => p.categoria))];

  categorias.forEach(categoria => {
    const tituloCat = document.createElement("h3");
    tituloCat.textContent = 
      categoria.charAt(0).toUpperCase() + categoria.slice(1);
    tituloCat.className = "subtitulo-categoria";
    contenedor.appendChild(tituloCat);

    const fila = document.createElement("div");
    fila.className = "productos";

    const productosCat = lista
      .filter(p => p.categoria === categoria)
      .slice(0, 3);

    productosCat.forEach(prod => {
      const card = crearCardProducto(prod, basePath);
      fila.appendChild(card);
    });

    contenedor.appendChild(fila);
  });
}

function initHomePage() {
  // Usuario logueado, navbar normal
  initLoggedPage("navbar", null, "");
  // Productos por categoría en el home
  renderHomeProductos("productos-destacados", "");
}

// Páginas logueadas
function initLoggedPage(navbarId, contenedorProductosId = null, basePath = "") {
  // Cargar carrito desde localStorage
  cargarCarritoDesdeStorage();

  // Render navbar con paths correctos
  renderNavbar(navbarId, true, basePath);

  // Render productos si corresponde
  if (contenedorProductosId) {
    renderProductos(contenedorProductosId, basePath);
  }
}

// Carrito
function initCartPage(basePath = "../") {

  // Renderizamos navbar + cargamos carrito de storage una sola vez
  initLoggedPage("navbar", null, basePath);

  const lista = document.getElementById("cart-items");
  const resumen = document.getElementById("cart-summary");

  if (!lista || !resumen) return;

  if (carrito.length === 0) {
    lista.innerHTML = "<p>Tu carrito está vacío.</p>";
    resumen.textContent = "Total: $0";
    return;
  }

  let total = 0;
  lista.innerHTML = "";

  carrito.forEach(item => {
    const row = document.createElement("div");
    row.className = "cart-row";

    const subtotal = item.precio * item.cantidad;
    total += subtotal;

    row.innerHTML = `
      <span>${item.nombre} (x${item.cantidad})</span>
      <span>$${subtotal.toLocaleString("es-AR")}</span>
    `;

    // Botón para eliminar este producto del carrito
    const btnEliminar = document.createElement("button");
    btnEliminar.className = "btn-eliminar";
    btnEliminar.textContent = "Eliminar";

    btnEliminar.addEventListener("click", () => {
      // Sacar producto del array
      carrito = carrito.filter(p => p.id !== item.id);

      // Guardar cambios y recargar carrito
      guardarCarritoEnStorage();
      initCartPage(basePath);
    });

    row.appendChild(btnEliminar);
    lista.appendChild(row);
  });

  resumen.textContent = `Total: $${total.toLocaleString("es-AR")}`;
}

// Registro 
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-registro");
    const modal = document.getElementById("modal-exito");
    const btnOk = document.getElementById("btn-modal-ok");

    if (!form || !modal || !btnOk) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        // Mostrar modal
        modal.style.display = "flex";
    });

    btnOk.addEventListener("click", () => {
        modal.style.display = "none";

        // Redirigir al login
        window.location.href = "LogIn.html";
    });
}); */