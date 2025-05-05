import 'dotenv/config';
// DEBUG: verificar variables de entorno
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SERVICE_ROLE_KEY present?:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import inviteUserHandler from '../api/inviteUser.js';
import usersHandler from '../api/users.js';

const app = express();
app.use(cors());
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
  console.log('[API]', req.method, req.originalUrl);
  next();
});

// Define API routes
app.post('/api/inviteUser', inviteUserHandler);
app.get('/api/users', usersHandler);
app.listen(3000, () => console.log('API server listening on http://localhost:3000'));
