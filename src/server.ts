// src/server.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import escolaRoutes from "./routes/escola.routes";
import authRoutes from "./routes/auth.routes";

// 1. Importar o Prisma Client
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// load env config early
dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);

// --- Swagger setup (minimal) ---
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: { title: "Sistema Coleta API", version: "1.0.0" },
    servers: [{ url: process.env.API_URL || "http://localhost:3000" }],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Configuração das Rotas ---
app.use("/escolas", escolaRoutes);
app.use("/auth", authRoutes);

// Rota para listar Municípios (usada no Select do Front)
app.get("/municipios", async (req, res) => {
  try {
    const municipios = await prisma.municipio.findMany({
      orderBy: { nome: "asc" },
    });
    res.json(municipios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar municípios" });
  }
});

// Listar tipos de Destino do Lixo
app.get("/destinos", async (req, res) => {
  try {
    const destinos = await prisma.destinoDoLixo.findMany();
    res.json(destinos);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar destinos" });
  }
});

// Rota para Estatísticas do Dashboard (Movi para cá, antes do listen)
app.get("/dashboard/stats", async (req, res) => {
  try {
    // Busca todos os destinos e conta quantos serviços de coleta estão ligados a eles
    const dados = await prisma.destinoDoLixo.findMany({
      include: {
        _count: {
          select: { servicosColeta: true }, // Conta quantas escolas usam esse destino
        },
      },
    });

    // Formata para o padrão que o ECharts gosta (name e value)
    const grafico = dados.map((item) => ({
      name: item.tipo,
      value: item._count.servicosColeta,
    }));

    res.json(grafico);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar estatísticas" });
  }
});

// Iniciar o servidor (Sempre por último)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
