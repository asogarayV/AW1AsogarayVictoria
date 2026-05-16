// Inicializar la lógica de la página de Login
function initLogin() {
    const formulario = document.getElementById("form-login");
    if (!formulario) return;

    formulario.addEventListener("submit", async (e) => {
        e.preventDefault(); 

        // Capturamos los inputs del formulario por su orden
        const email = formulario.querySelectorAll("input")[0].value;
        const contrasena = formulario.querySelectorAll("input")[1].value;

        try {
            // Enviamos los datos al backend
            const respuesta = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, contrasena })
            });

            const datos = await respuesta.json();

            if (respuesta.ok) {
                alert("¡Ingreso exitoso! " + datos.mensaje);
                
                sessionStorage.setItem("usuarioActivo", JSON.stringify(datos.usuario));
                
                // Volvemos a la tienda listos para comprar
                window.location.href = "../index.html";
            } else {
                alert("Error: " + datos.mensaje);
            }
        } catch (error) {
            console.error("Error en el login:", error);
            alert("No se pudo conectar con el servidor.");
        }
    });
}

// Inicializar la lógica de la página de Registro 
function initRegistro() {
    const formulario = document.getElementById("form-registro");
    if (!formulario) return;

    formulario.addEventListener("submit", async (e) => {
        e.preventDefault(); 

        const nombre = formulario.querySelectorAll("input")[0].value;
        const apellido = formulario.querySelectorAll("input")[1].value;
        const email = formulario.querySelectorAll("input")[2].value;
        const contrasena = formulario.querySelectorAll("input")[3].value;

        try {
            const respuesta = await fetch("http://localhost:3000/usuarios", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre, apellido, email, contrasena })
            });

            const datos = await respuesta.json();

            if (respuesta.ok) {
                alert("🎉 ¡Usuario creado con éxito! Presioná Aceptar para ir a Iniciar Sesión.");
                
                window.location.href = "LogIn.html";
                
            } else {
                alert("Error al registrarse: " + datos.mensaje);
            }
        } catch (error) {
            console.error("Error en el registro:", error);
            alert("Error de conexión con el servidor.");
        }
    });
}