// src/controllers/EscolaController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export class EscolaController {
  // 1. LISTAR TODAS (READ)
  async listar(req: Request, res: Response) {
    try {
      const escolas = await prisma.escola.findMany({
        include: {
          municipio: true, // Traz o nome do município junto
        },
        orderBy: {
          id: "asc",
        },
      });
      return res.json(escolas);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar escolas" });
    }
  }

  // 2. BUSCAR UMA POR ID (READ ONE)
  async buscarPorId(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const escola = await prisma.escola.findUnique({
        where: { id: Number(id) },
        include: { municipio: true },
      });

      if (!escola)
        return res.status(404).json({ error: "Escola não encontrada" });

      return res.json(escola);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar escola" });
    }
  }

  // No método criar (create) do EscolaController.ts

  async criar(req: Request, res: Response) {
    // Recebemos agora o idDestino também
    const { nome, tipo, idMunicipio, idDestino } = req.body;

    try {
      // Usa uma transação para garantir que cria tudo ou nada
      const resultado = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1. Cria a Escola
        const novaEscola = await tx.escola.create({
          data: {
            nome,
            tipo,
            idMunicipio: Number(idMunicipio),
          },
        });

        // 2. Se o usuário escolheu um destino, cria o serviço de coleta vinculado
        if (idDestino) {
          await tx.servicoDeColeta.create({
            data: {
              tipo: "Coleta Padrão", // Pode ser dinâmico depois se quiser
              frequencia: "Não informada",
              idEscola: novaEscola.id,
              idMunicipio: Number(idMunicipio),
              idDestino: Number(idDestino),
            },
          });
        }

        return novaEscola;
      });

      return res.status(201).json(resultado);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao criar escola e serviço." });
    }
  }
  // 4. ATUALIZAR (UPDATE)
  async atualizar(req: Request, res: Response) {
    const { id } = req.params;
    const { nome, tipo, idMunicipio } = req.body;
    try {
      const escolaAtualizada = await prisma.escola.update({
        where: { id: Number(id) },
        data: {
          nome,
          tipo,
          idMunicipio: Number(idMunicipio),
        },
      });
      return res.json(escolaAtualizada);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao atualizar escola" });
    }
  }

  // 5. DELETAR (DELETE)
  async deletar(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await prisma.escola.delete({
        where: { id: Number(id) },
      });
      return res.status(204).send();
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao deletar (pode haver dados vinculados)" });
    }
  }
}
