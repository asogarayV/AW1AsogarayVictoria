// Inicializar la lógica de la página de Login 
function initLogin() {
    const formulario = document.getElementById("form-login"); 
    if (!formulario) return;

    formulario.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Capturamos los campos de email y contraseña 
        const email = formulario.querySelectorAll("input")[0].value;
        const contrasena = formulario.querySelectorAll("input")[1].value;

        try {
            // Hacemos el fetch a servidor local
            const respuesta = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, contrasena })
            });

            const datos = await respuesta.json();

            if (respuesta.ok) {
                // Guardamos el JWT (Token) y los datos del usuario en el localStorage para que el sistema sepa quién está navegando
                localStorage.setItem("token", datos.token);
                localStorage.setItem("usuario", JSON.stringify(datos.usuario));

                // Mostramos el mensaje personalizado que viene del backend 
                alert(`🎉 ${datos.mensaje}! Iniciaste sesión correctamente.`);

                // Redirigimos a la tienda de productos
                window.location.href = "../index.html"; 
                
            } else {
                // Si el backend dice que la clave o el mail están mal
                alert("Error al iniciar sesión: " + datos.mensaje);
            }
        } catch (error) {
            console.error("Error en el fetch de login:", error);
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