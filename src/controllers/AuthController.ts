// src/controllers/AuthController.ts
import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

const authService = new AuthService();

export class AuthController {
  
  async register(req: Request, res: Response) {
    const { email, password } = req.body;
    try {
      const user = await authService.register(email, password);
      return res.status(201).json(user);
    } catch (error) {
      return res.status(400).json({ error: "Erro ao criar usuário" });
    }
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    try {
      const result = await authService.login(email, password);
      // normalize response: prefer accessToken, but accept legacy token field
      const normalized = {
        user: result.user,
        accessToken: result.accessToken ?? (result as any).token,
      };
      return res.json(normalized);
    } catch (error) {
      return res.status(401).json({ error: "Autenticação falhou" });
    }
  }
}