import 'dotenv/config';
// DEBUG: verificar variables de entorno
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SERVICE_ROLE_KEY present?:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import inviteUserHandler from '../api/inviteUser.js';
import usersHandler from '../api/users.js';
import restaurantsHandler from '../api/restaurants.js';
import branchesHandler from '../api/branches.js';

const app = express();
app.use(cors());
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log('[API]', req.method, req.originalUrl);
  next();
});

// Define API routes
app.post('/api/inviteUser', inviteUserHandler); // Invitar usuario
app.get('/api/users', usersHandler); // Listar usuarios
app.patch('/api/users', usersHandler); // Actualizar usuario
app.get('/api/restaurants', restaurantsHandler); // Listar restaurantes
app.get('/api/branches', branchesHandler); // Listar sucursales

// Inicializa el servidor
app.listen(3000, () => console.log('API server listening on http://localhost:3000'));
