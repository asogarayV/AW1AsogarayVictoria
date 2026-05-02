# Entrega 2: Servidor con Express.js - AW1

**Estudiante:** Victoria Asogaray   
**Proyecto:** Backend E-commerce de Mates y Accesorios

Documentación de Rutas (Endpoints)
A continuación, se detallan las rutas disponibles para agilizar la corrección y pruebas en herramientas como Postman.

1. Consultas (Método GET)
Listar catálogo: GET http://localhost:3000/productos

Retorna el JSON completo con categorías de mates, termos, yerbas y accesorios.

Buscar usuario por ID: GET http://localhost:3000/usuarios/101

Captura el ID mediante req.params para devolver los datos de un usuario específico.

2. Creación y Datos Sensibles (Método POST)
Login de Usuario: POST http://localhost:3000/login

Procesa parámetros sensibles (email y contraseña) enviados en el req.body.

Registrar Producto: POST http://localhost:3000/productos

Simula la inserción de un nuevo registro recibiendo un objeto JSON.

3. Actualización (Método PUT)
Editar Perfil: PUT http://localhost:3000/usuarios/102

Actualiza la información de un usuario existente sin perder los datos previos.

4. Eliminación e Integridad (Método DELETE)
Borrar Usuario: DELETE http://localhost:3000/usuarios/:id

Caso Error (Integridad): Si se intenta borrar el ID 101, el servidor responde con un 400 Bad Request debido a que existen registros vinculados en ventas.json.

Caso Exitoso: Al borrar un usuario sin historial de ventas (ej. ID 106), la operación se realiza correctamente.