// src/routes/escola.routes.ts
import { Router } from 'express';
import { EscolaController } from '../controllers/EscolaController';

const router = Router();
const escolaController = new EscolaController();

// Define que quando acessarem GET /, chama o controller
router.get('/', escolaController.listar);

export default router;