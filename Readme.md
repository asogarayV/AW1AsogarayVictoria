# Entrega 4: Base de Datos No Relacional y Autenticación con JWT - AW1

**Estudiante:** Victoria Asogaray  
**Proyecto:** Backend E-commerce de Mates y Accesorios - "Noble Cebada"

En esta cuarta etapa, se migró la arquitectura del servidor basada en archivos locales hacia un motor de base de datos no relacional de producción. Además, se implementaron capas estrictas de ciberseguridad para la protección de datos sensibles y el control de acceso.

---

## Tecnologías Incorporadas
* **MongoDB & Mongoose:** Migración completa del almacenamiento de usuarios hacia colecciones NoSQL nativas.
* **Bcrypt:** Encriptación de contraseñas mediante hashing en segundo plano (Middleware de Mongoose) antes de guardarse en la base de datos.
* **JSON Web Tokens (JWT):** Generación de tokens de seguridad firmados para validar la sesión y proteger acciones críticas del usuario.

---

## Documentación de Rutas (Endpoints)

A continuación, se detallan las rutas disponibles para pruebas en herramientas como Postman. 
Nota: Los ID numéricos viejos fueron reemplazados por ObjectIDs de MongoDB.

### 1. Consultas (Método GET)
* **Listar catálogo:** `GET http://localhost:3000/productos`  
  Retorna el listado completo de productos distribuidos por categorías.
* **Buscar usuario por ID:** `GET http://localhost:3000/usuarios/6a1c0a78403b1ef358e2093a`  
  Busca y recupera un documento específico directamente desde MongoDB utilizando su `_id`.

### 2. Autenticación y Registro (Método POST)
* **Registrar Usuario:** `POST http://localhost:3000/usuarios`  
  Recibe los datos del formulario, valida que el email sea único y guarda el usuario encriptando la contraseña de forma segura.
  ```json
  {
    "nombre": "Zoe",
    "apellido": "Asogaray",
    "email": "zoeasogaray@gmail.com",
    "contrasena": "1234"
  }