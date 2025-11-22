// src/server.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import escolaRoutes from './routes/escola.routes';
import authRoutes from './routes/auth.routes';

// load env config early
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5174',
  credentials: true,
}));

// --- Swagger setup (minimal) ---
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Sistema Coleta API', version: '1.0.0' },
    servers: [{ url: process.env.API_URL || 'http://localhost:3000' }],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// --- Configuração das Rotas ---
// Tudo que for de escola, vai para o arquivo de rotas de escola
app.use('/escolas', escolaRoutes);
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});