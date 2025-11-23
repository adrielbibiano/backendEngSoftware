// src/server.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import escolaRoutes from './routes/escola.routes';
import authRoutes from './routes/auth.routes';

// 1. ADICIONE ISTO: Importar o Prisma Client
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// load env config early
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Dica: '*' ajuda a evitar erro de CORS no começo
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
app.use('/escolas', escolaRoutes);
app.use('/auth', authRoutes);

// 2. ADICIONE ISTO: Rota para listar Municípios (usada no Select do Front)
app.get('/municipios', async (req, res) => {
  try {
    const municipios = await prisma.municipio.findMany({
      orderBy: { nome: 'asc' },
    });
    res.json(municipios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar municípios' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});