// src/controllers/EscolaController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

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
          id: 'asc',
        }
      });
      return res.json(escolas);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar escolas' });
    }
  }

  // 2. BUSCAR UMA POR ID (READ ONE)
  async buscarPorId(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const escola = await prisma.escola.findUnique({
        where: { id: Number(id) },
        include: { municipio: true }
      });
      
      if (!escola) return res.status(404).json({ error: 'Escola não encontrada' });

      return res.json(escola);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar escola' });
    }
  }

  // 3. CRIAR (CREATE)
  async criar(req: Request, res: Response) {
    const { nome, tipo, idMunicipio } = req.body;
    try {
      const novaEscola = await prisma.escola.create({
        data: {
          nome,
          tipo,
          idMunicipio: Number(idMunicipio)
        }
      });
      return res.status(201).json(novaEscola);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao criar escola' });
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
          idMunicipio: Number(idMunicipio)
        }
      });
      return res.json(escolaAtualizada);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar escola' });
    }
  }

  // 5. DELETAR (DELETE)
  async deletar(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await prisma.escola.delete({
        where: { id: Number(id) }
      });
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao deletar (pode haver dados vinculados)' });
    }
  }
}