// src/routes/escola.routes.ts
import { Router } from 'express';
import { EscolaController } from '../controllers/EscolaController';

const router = Router();
const escolaController = new EscolaController();

// Definição das rotas
router.get('/', escolaController.listar);        // GET /escolas
router.get('/:id', escolaController.buscarPorId);// GET /escolas/1
router.post('/', escolaController.criar);        // POST /escolas
router.put('/:id', escolaController.atualizar);  // PUT /escolas/1
router.delete('/:id', escolaController.deletar); // DELETE /escolas/1

export default router;