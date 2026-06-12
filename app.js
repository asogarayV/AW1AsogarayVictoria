import express from 'express';
import cors from 'cors'; 
import fs from 'fs/promises';
import mongoose from 'mongoose';
import Usuario from './Models/Usuario.js';
import jwt from 'jsonwebtoken'; 

const app = express(); 
const port = 3000;

// Permisos y lectura de JSON
app.use(cors()); 
app.use(express.json());

// Función para leer los archivos JSON de la carpeta Data 
async function leerDatos(archivo) {
    try {
        const data = await fs.readFile(`./Data/${archivo}.json`, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error leyendo el archivo ${archivo}:`, error);
        throw error;
    }
}

// Solicitudes GET

// Listar todos los productos para la tienda
app.get('/productos', async (req, res) => {
    try {
        const productos = await leerDatos('productos');
        res.status(200).json(productos);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al leer productos" });
    }
});

// Buscar un usuario específico por su ID directamente en MongoDB
app.get('/usuarios/:id', async (req, res) => {
    try {
        const encontrado = await Usuario.findById(req.params.id);
        
        if (encontrado) {
            res.status(200).json(encontrado);
        } else {
            res.status(404).json({ mensaje: "Usuario no encontrado" });
        }
    } catch (error) {
        res.status(500).json({ mensaje: "Error en el servidor al buscar usuario" });
    }
});

// Verifica si el usuario tiene permiso para realizar acciones 
function verificarToken(req, res, next) {
    // Buscamos el token en los encabezados de la petición
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ mensaje: "Acceso denegado. Se requiere un token de seguridad para operar." });
    }

    try {
        const tokenLimpio = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
        const verificado = jwt.verify(tokenLimpio, 'ULTRA_SECRETO_NOBLE_CEBADA');
        req.usuarioVerificado = verificado; 
        next(); 
    } catch (error) {
        return res.status(401).json({ mensaje: "Token inválido o expirado. Por favor, vuelva a iniciar sesión." });
    }
}

// Solicittudes POST
// Guarda un nuevo usuario directamente en MongoDB con clave encriptada
app.post('/usuarios', async (req, res) => {
    try {
        const { nombre, apellido, email, contrasena } = req.body;

        console.log("Datos recibidos en el registro:", { nombre, apellido, email, contrasena });

        if (!nombre || !apellido || !email || !contrasena) {
            return res.status(400).json({ mensaje: "Todos los campos son obligatorios" });
        }

        const existe = await Usuario.findOne({ email });
        if (existe) {
            return res.status(400).json({ mensaje: "El email ya está registrado" });
        }

        const nuevoUsuario = await Usuario.create({
            nombre,
            apellido,
            email,
            contrasena
        });

        console.log("Usuario guardado de forma segura en MongoDB", nuevoUsuario);
        
        return res.status(201).json({ 
            mensaje: "Usuario registrado exitosamente", 
            usuarioId: nuevoUsuario._id 
        });

    } catch (error) {
        console.error("Error detallado en el registro de MongoDB:", error);
        return res.status(500).json({ mensaje: "Error al procesar el registro en el servidor" });
    }
});

// Verifica las credenciales en MongoDB y genera un Token de seguridad (JWT)
app.post('/login', async (req, res) => {
    try {
        const { email, contrasena } = req.body;

        console.log("Intento de login para:", email);

        // Buscamos si el usuario existe en MongoDB
        const usuarioEncontrado = await Usuario.findOne({ email });
        if (!usuarioEncontrado) {
            return res.status(401).json({ mensaje: "Email o contraseña incorrectos" });
        }

        // Comparamos las contraseñas usando Bcrypt
        const esValida = await usuarioEncontrado.compararContrasena(contrasena);
        if (!esValida) {
            return res.status(401).json({ mensaje: "Email o contraseña incorrectos" });
        }

        // Creamos el Token de seguridad (JWT)
        const token = jwt.sign(
            { id: usuarioEncontrado._id, email: usuarioEncontrado.email },
            'ULTRA_SECRETO_NOBLE_CEBADA', 
            { expiresIn: '2h' }
        );

        console.log(`Token generado con éxito para: ${usuarioEncontrado.email}`);

        return res.status(200).json({
            mensaje: `Bienvenido ${usuarioEncontrado.nombre}`,
            token: token,
            usuario: {
                id: usuarioEncontrado._id,
                nombre: usuarioEncontrado.nombre,
                apellido: usuarioEncontrado.apellido,
                email: usuarioEncontrado.email
            }
        });

    } catch (error) {
        console.error("Error en el proceso de Login:", error);
        return res.status(500).json({ mensaje: "Error al procesar el login en el servidor" });
    }
});

// Procesar orden de compra
app.post('/compras', verificarToken, async (req, res) => {
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

// Solicitudes PUT Y DELETE 
// Actualizar datos de un usuario
app.put('/usuarios/:id', async (req, res) => {
    try {
        const actualizado = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (actualizado) {
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
        // Validación de integridad simulada con el JSON de ventas actual
        const ventas = await leerDatos('ventas');
        const tieneVentas = ventas.some(v => v.id_usuario === req.params.id);

        if (tieneVentas) {
            return res.status(400).json({ 
                mensaje: "ERROR DE INTEGRIDAD: El usuario tiene ventas y no puede eliminarse." 
            });
        }

        const eliminado = await Usuario.findByIdAndDelete(req.params.id);
        if (!eliminado) return res.status(404).json({ mensaje: "Usuario no existe" });

        res.status(200).json({ mensaje: "Usuario eliminado con éxito de MongoDB" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al intentar eliminar" });
    }
});

// Inicio del servidor y conexion con Mongo
mongoose.connect('mongodb://localhost:27017/noble_cebada')
    .then(() => {
        console.log("----------------================------------------");
        console.log("¡Conectado con éxito a MongoDB (noble_cebada)!");
        console.log("----------------================------------------");

        app.listen(port, () => {
            console.log(`Servidor de Victoria corriendo en http://localhost:${port}`);
            console.log("--------------------------------------------------");
        });
    })
    .catch((error) => {
        console.error("Error fatal al conectar a MongoDB:", error);
    });