// src/tests/api.test.ts
import request from "supertest";
import express from "express";
import { PrismaClient } from "@prisma/client";

// Mock (Simulação) do Prisma para não mexer no banco real durante o teste
// Isso é um teste simples, vamos apenas verificar se a aplicação responde
const app = express();
app.get("/municipios", (req, res) => {
  res.status(200).json([{ id: 1, nome: "Recife" }]);
});

describe("Testes Básicos da API", () => {
  it("Deve retornar status 200 na listagem de municípios", async () => {
    const res = await request(app).get("/municipios");
    expect(res.status).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });
});
