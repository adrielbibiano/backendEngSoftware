// src/routes/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();
const authController = new AuthController();

router.post('/register', authController.register); // Rota para criar conta
router.post('/login', authController.login); // Rota para logar
router.post('/google', authController.googleLogin);
export default router;
