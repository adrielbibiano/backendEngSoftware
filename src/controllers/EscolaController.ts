// src/controllers/EscolaController.ts
import { Request, Response } from 'express';
import { EscolaService } from '../services/EscolaService';

const escolaService = new EscolaService();

export class EscolaController {
  async listar(req: Request, res: Response) {
    try {
      const escolas = await escolaService.listarTodas();
      return res.json(escolas);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar escolas' });
    }
  }
}