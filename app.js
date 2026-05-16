import express from 'express';
import cors from 'cors'; 
import fs from 'fs/promises';

const app = express(); 
const port = 3000;

// Middlewares: Permisos y lectura de JSON
app.use(cors()); 
app.use(express.json());

// HELPER: Función para leer los archivos JSON de la carpeta /Data
async function leerDatos(archivo) {
    try {
        const data = await fs.readFile(`./Data/${archivo}.json`, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error leyendo el archivo ${archivo}:`, error);
        throw error;
    }
}

// ------------------------------------------------
// 3. SOLICITUDES GET (Obtener datos)
// Listar todos los productos para la tienda
app.get('/productos', async (req, res) => {
    try {
        const productos = await leerDatos('productos');
        res.status(200).json(productos);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al leer productos" });
    }
});

// Buscar un usuario específico por su ID
app.get('/usuarios/:id', async (req, res) => {
    try {
        const usuarios = await leerDatos('usuarios');
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
// 4. SOLICITUDES POST (Enviar datos nuevos)
// Login: Verifica email y contraseña, enviando el objeto de usuario completo
app.post('/login', async (req, res) => {
    try {
        const { email, contrasena } = req.body; 
        const usuarios = await leerDatos('usuarios');
        const user = usuarios.find(u => u.email === email && u.contrasena === contrasena);

        if (user) {
           
            res.status(200).json({ 
                mensaje: `Bienvenida ${user.nombre}`, 
                usuario: { id: user.id, nombre: user.nombre, apellido: user.apellido, email: user.email } 
            });
        } else {
            res.status(401).json({ mensaje: "Email o clave incorrectos" });
        }
    } catch (error) {
        res.status(500).json({ mensaje: "Error al procesar login" });
    }
});

app.post('/usuarios', async (req, res) => {
    try {
        const { nombre, apellido, email, contrasena } = req.body;
        const usuarios = await leerDatos('usuarios');

        const existe = usuarios.find(u => u.email === email);
        if (existe) {
            return res.status(400).json({ mensaje: "El email ya está registrado" });
        }

        const nuevoUsuario = {
            id: Date.now(),
            nombre,
            apellido,
            email,
            contrasena
        };

        usuarios.push(nuevoUsuario);

        await fs.writeFile('./Data/usuarios.json', JSON.stringify(usuarios, null, 2), 'utf-8');

        console.log("¡Nuevo usuario registrado con éxito!", nuevoUsuario);
        
      
        return res.status(201).json({ 
            mensaje: "Usuario registrado exitosamente", 
            usuarioId: nuevoUsuario.id 
        });

    } catch (error) {
        console.error("DETALLE DEL ERROR EN EL REGISTRO:", error);
        return res.status(500).json({ mensaje: "Error al procesar el registro en el servidor" });
    }
});

// Procesar Orden de Compra
app.post('/compras', async (req, res) => {
    try {
        const nuevaOrden = req.body; 
        
        nuevaOrden.idOrden = Date.now();
        nuevaOrden.fecha = new Date().toLocaleString("es-AR");

        let ventas = [];
        
        try {
            const dataVentas = await fs.readFile('./Data/ventas.json', 'utf-8');
            ventas = JSON.parse(dataVentas);
        } catch (error) {
            ventas = []; 
        }

        ventas.push(nuevaOrden);

       
        await fs.writeFile('./Data/ventas.json', JSON.stringify(ventas, null, 2), 'utf-8');

        console.log("¡Nueva orden recibida y guardada con éxito en ventas.json!", nuevaOrden);

        res.status(201).json({ 
            mensaje: "Compra procesada y registrada exitosamente en el servidor", 
            idOrden: nuevaOrden.idOrden 
        });
    } catch (error) {
        console.error("Error al procesar la compra:", error);
        res.status(500).json({ mensaje: "Error al procesar la compra en el servidor" });
    }
});

// Registrar un nuevo producto
app.post('/productos', (req, res) => {
    const nuevo = req.body;
    res.status(201).json({ mensaje: "Producto registrado con éxito", data: nuevo });
});

// ------------------------------------------------
// 5. SOLICITUDES PUT Y DELETE (Actualizar y Borrar)
// Actualizar datos de un usuario
app.put('/usuarios/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const usuarios = await leerDatos('usuarios');
        const index = usuarios.findIndex(u => u.id === id);

        if (index !== -1) {
            const actualizado = { ...usuarios[index], ...req.body };
            res.status(200).json({ mensaje: "Usuario actualizado", data: actualizado });
        } else {
            res.status(404).json({ mensaje: "No se encontró el usuario" });
        }
    } catch (error) {
        res.status(500).json({ mensaje: "Error al actualizar" });
    }
});

// Eliminar un usuario 
app.delete('/usuarios/:id', async (req, res) => {
    try {
        const idAEliminar = parseInt(req.params.id);
        const ventas = await leerDatos('ventas');
        const usuarios = await leerDatos('usuarios');

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

// 6. INICIO DEL SERVIDOR
app.listen(port, () => {
    console.log("--------------------------------------------------");
    console.log(`Servidor de Victoria corriendo en http://localhost:${port}`);
    console.log("--------------------------------------------------");
});



