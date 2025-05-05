import 'dotenv/config';
// DEBUG: verificar variables de entorno
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SERVICE_ROLE_KEY present?:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import inviteUserHandler from '../api/inviteUser.js';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/inviteUser', inviteUserHandler);
app.listen(3000, () => console.log('API server listening on http://localhost:3000'));
