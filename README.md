# avance Fullstack

## tecnologías
node.js, express, mongodb (mongoose), jwt, bcryptjs, html/css/vanilla js.

## ejecutar local
1. `npm install`
2. copiar `.env.example` a `.env` y completar valores:

PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/AVANCE_PROYECTO_FULL_STACK
JWT_SECRET=clave_secreta_super_simple

3. `node server.js`
4. abrir:
- `http://localhost:3000/login.html`
- `http://localhost:3000/index.html`

## endpoints
- POST `/api/users/register` {name,email,password}
- POST `/api/users/login` {email,password} -> devuelve token (JWT)
- GET `/api/users` (lista sin password)
- PUT `/api/users/:id` (Auth)
- DELETE `/api/users/:id` (Auth)

## deploy
para deploy en Render se requiere usar MongoDB Atlas y configurar `MONGO_URI` y `JWT_SECRET` en las env vars del servicio.
