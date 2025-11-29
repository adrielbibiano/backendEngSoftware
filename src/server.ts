// src/server.ts
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import YAML from "yamljs";
import swaggerUi from "swagger-ui-express";

import escolaRoutes from "./routes/escola.routes";
import authRoutes from "./routes/auth.routes";

// 1. Importar o Prisma Client (depois de dotenv.config())
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);

// --- Swagger/OpenAPI: resolução robusta do caminho do YAML ---
const possiblePaths = [
  // quando executado a partir da raiz do projeto (ex: npm run dev)
  path.join(process.cwd(), "openapi", "v1", "openapi.yaml"),

  // quando compilado para dist/src/server.js (dirname = dist/src -> ../openapi => dist/openapi)
  path.join(__dirname, "..", "openapi", "v1", "openapi.yaml"),

  // outro layout possível (dist/server.js)
  path.join(__dirname, "..", "..", "openapi", "v1", "openapi.yaml"),
];

const openapiFilePath = possiblePaths.find((p) => fs.existsSync(p));

if (!openapiFilePath) {
  console.error(
    "OpenAPI file not found. Paths tried:\n" + possiblePaths.map((p) => "  - " + p).join("\n")
  );
  // encerra com erro para que a plataforma de deploy marque como falho
  process.exit(1);
}

// carregar o YAML somente após confirmar que o arquivo existe
const openapiDocumentV1 = YAML.load(openapiFilePath);

// rota pública servindo o YAML (usa caminho absoluto)
app.get("/openapi/v1/openapi.yaml", (req, res) => {
  res.sendFile(openapiFilePath);
});

// Swagger UI apontando para o YAML carregado
app.use(
  "/docs/v1",
  swaggerUi.serve,
  swaggerUi.setup(openapiDocumentV1, {
    explorer: true,
  })
);

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
    console.error("Erro ao buscar municípios:", error);
    res.status(500).json({ error: "Erro ao buscar municípios" });
  }
});

// Listar tipos de Destino do Lixo
app.get("/destinos", async (req, res) => {
  try {
    const destinos = await prisma.destinoDoLixo.findMany();
    res.json(destinos);
  } catch (error) {
    console.error("Erro ao buscar destinos:", error);
    res.status(500).json({ error: "Erro ao buscar destinos" });
  }
});

// Rota para Estatísticas do Dashboard
app.get("/dashboard/stats", async (req, res) => {
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
    console.error("Erro ao buscar estatísticas:", error);
    res.status(500).json({ error: "Erro ao buscar estatísticas" });
  }
});

// Iniciar o servidor (Sempre por último)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`📘 Swagger UI: http://localhost:${PORT}/docs/v1`);
  console.log(`📄 OpenAPI YAML served from: ${openapiFilePath}`);
});
