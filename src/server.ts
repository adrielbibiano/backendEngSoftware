import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';

import escolaRoutes from './routes/escola.routes';
import authRoutes from './routes/auth.routes';

// 1. Importar o Prisma Client (depois de dotenv.config())
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const app = express();

// --- Middlewares globais ---
app.use(express.json());

//Helmet com Content Security Policy (CSP)
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Swagger precisa de inline scripts
      styleSrc: ["'self'", "'unsafe-inline'"],  // Swagger precisa de inline styles
      imgSrc: ["'self'", "data:"],              // permite imagens inline/base64
      connectSrc: ["'self'"],                   // conexões apenas com a própria API
    },
  }),
);

// CORS: permitir acesso do frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  }),
);

// --- Rota de teste para verificar Helmet ---
app.get('/', (req, res) => {
  res.send('API rodando com Helmet 🚀');
});

// --- Swagger/OpenAPI: resolução robusta do caminho do YAML ---
const possiblePaths = [
  path.join(process.cwd(), 'openapi', 'v1', 'openapi.yaml'),
  path.join(__dirname, '..', 'openapi', 'v1', 'openapi.yaml'),
  path.join(__dirname, '..', '..', 'openapi', 'v1', 'openapi.yaml'),
];

const openapiFilePath = possiblePaths.find((p) => fs.existsSync(p));

if (!openapiFilePath) {
  console.error(
    'OpenAPI file not found. Paths tried:\n' +
      possiblePaths.map((p) => '  - ' + p).join('\n'),
  );
  process.exit(1);
}

const openapiDocumentV1 = YAML.load(openapiFilePath);

app.get('/openapi/v1/openapi.yaml', (req, res) => {
  res.sendFile(openapiFilePath);
});

app.use(
  '/docs/v1',
  swaggerUi.serve,
  swaggerUi.setup(openapiDocumentV1, {
    explorer: true,
  }),
);

// --- Configuração das Rotas ---
app.use('/escolas', escolaRoutes);
app.use('/auth', authRoutes);

app.get('/municipios', async (req, res) => {
  try {
    const municipios = await prisma.municipio.findMany({
      orderBy: { nome: 'asc' },
    });
    res.json(municipios);
  } catch (error) {
    console.error('Erro ao buscar municípios:', error);
    res.status(500).json({ error: 'Erro ao buscar municípios' });
  }
});

app.get('/destinos', async (req, res) => {
  try {
    const destinos = await prisma.destinoDoLixo.findMany();
    res.json(destinos);
  } catch (error) {
    console.error('Erro ao buscar destinos:', error);
    res.status(500).json({ error: 'Erro ao buscar destinos' });
  }
});

app.get('/dashboard/stats', async (req, res) => {
  try {
    const dados = await prisma.destinoDoLixo.findMany({
      include: {
        _count: {
          select: { servicosColeta: true },
        },
      },
    });

    const grafico = dados.map((item: any) => ({
      name: item.tipo,
      value: item._count?.servicosColeta ?? 0,
    }));

    res.json(grafico);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// --- Iniciar o servidor ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`📘 Swagger UI: http://localhost:${PORT}/docs/v1`);
  console.log(`📄 OpenAPI YAML served from: ${openapiFilePath}`);
});