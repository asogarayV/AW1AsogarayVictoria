import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// 1. Esquema de la Base de Datos para el usuario
const usuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    contrasena: { type: String, required: true }
});

// 2. 🔒 ENCRIPTACIÓN EN SEGUNDO PLANO (Middleware Moderno)
// Antes de guardar, interceptamos el proceso y encriptamos la clave con async/await
usuarioSchema.pre('save', async function () {
    // Si la contraseña no se modificó, salimos de la función sin hacer nada
    if (!this.isModified('contrasena')) return;
    
    try {
        // Generamos un "salt" aleatorio de 10 rondas de seguridad
        const salt = await bcrypt.genSalt(10);
        // Mezclamos la contraseña en texto plano con el salt para crear el Hash secreto
        this.contrasena = await bcrypt.hash(this.contrasena, salt);
    } catch (error) {
        throw error; // Al lanzar el error, lo atrapa el bloque catch de app.js
    }
});

// 3. Método auxiliar para usar en el inicio de sesión (Login)
usuarioSchema.methods.compararContrasena = async function (contrasenaCandidata) {
    return await bcrypt.compare(contrasenaCandidata, this.contrasena);
};

const Usuario = mongoose.model('Usuario', usuarioSchema);
export default Usuario;