// Recuperar carrito desde localStorage
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
    window.location.href = "Productos.html";
  });
}


// Datos de productos 
const productos = [
  {
    id: 1,
    nombre: "Mate Imperial",
    descripcion: "Mate de calabaza forrado en cuero, estilo imperial.",
    precio: 21990,
    imagen: "Assets/img/mateimperial.png"
  },
  {
    id: 2,
    nombre: "Termo Acero 1L",
    descripcion: "Termo de acero inoxidable, ideal para uso diario.",
    precio: 30500,
    imagen: "Assets/img/termo.png"
  },
  {
    id: 3,
    nombre: "Yerba Selección 500gr",
    descripcion: "Yerba suave para mates largos y parejos.",
    precio: 5990,
    imagen: "Assets/img/yerba.png"
  }
];

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
function renderProductos(containerId, basePath = "") {
  const contenedor = document.getElementById(containerId);
  if (!contenedor) return;

  contenedor.innerHTML = "";
  productos.forEach(prod => {
    const card = crearCardProducto(prod, basePath);
    contenedor.appendChild(card);
  });
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

    lista.appendChild(row);
  });

  resumen.textContent = `Total: $${total.toLocaleString("es-AR")}`;
}

// Registro 
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-registro");
    const modal = document.getElementById("modal-exito");
    const btnOk = document.getElementById("btn-modal-ok");

    if (!form) return;

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
});