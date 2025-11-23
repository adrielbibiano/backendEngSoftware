// src/routes/escola.routes.ts
import { Router } from 'express';
import { EscolaController } from '../controllers/EscolaController';

const router = Router();
const escolaController = new EscolaController();

/**
 * @swagger
 * tags:
 * name: Escolas
 * description: Gerenciamento de escolas e coleta
 */

/**
 * @swagger
 * /escolas:
 * get:
 * summary: Lista todas as escolas cadastradas
 * tags: [Escolas]
 * responses:
 * 200:
 * description: Lista retornada com sucesso
 */
router.get('/', escolaController.listar);

/**
 * @swagger
 * /escolas/{id}:
 * get:
 * summary: Busca uma escola pelo ID
 * tags: [Escolas]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * description: ID da escola
 * responses:
 * 200:
 * description: Detalhes da escola
 * 404:
 * description: Escola não encontrada
 */
router.get('/:id', escolaController.buscarPorId);

/**
 * @swagger
 * /escolas:
 * post:
 * summary: Cria uma nova escola
 * tags: [Escolas]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * nome:
 * type: string
 * tipo:
 * type: string
 * idMunicipio:
 * type: integer
 * idDestino:
 * type: integer
 * responses:
 * 201:
 * description: Escola criada com sucesso
 */
router.post('/', escolaController.criar);

/**
 * @swagger
 * /escolas/{id}:
 * put:
 * summary: Atualiza uma escola existente
 * tags: [Escolas]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * nome:
 * type: string
 * tipo:
 * type: string
 * idMunicipio:
 * type: integer
 * responses:
 * 200:
 * description: Escola atualizada
 */
router.put('/:id', escolaController.atualizar);

/**
 * @swagger
 * /escolas/{id}:
 * delete:
 * summary: Remove uma escola
 * tags: [Escolas]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * responses:
 * 204:
 * description: Escola removida com sucesso
 */
router.delete('/:id', escolaController.deletar);

export default router;