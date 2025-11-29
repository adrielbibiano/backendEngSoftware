// src/routes/escola.routes.ts
import { Router } from "express";
import { EscolaController } from "../controllers/EscolaController";

const router = Router();
const escolaController = new EscolaController();

// --- Rotas de Escolas ---

router.get("/", escolaController.listar); // Lista todas
router.get("/:id", escolaController.buscarPorId); // Busca por ID
router.post("/", escolaController.criar); // Cria escola + vinculo
router.put("/:id", escolaController.atualizar); // Atualiza
router.delete("/:id", escolaController.deletar); // Deleta

export default router;
