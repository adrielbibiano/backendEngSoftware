// src/services/AuthService.ts
import { PrismaClient } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';

const prisma = new PrismaClient();

export class AuthService {
  
  // Função para CRIAR um usuário (para a gente poder testar)
  async register(email: string, password: string) {
    // Criptografa a senha antes de salvar
    const passwordHash = await hash(password, 8);

    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash
      }
    });

    return user;
  }

  // Função para LOGAR (Autenticar)
  async login(email: string, password: string) {
    // 1. Verifica se o usuário existe
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error("Usuário ou senha incorretos");
    }

    // 2. Compara a senha enviada com a senha criptografada no banco
    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      throw new Error("Usuário ou senha incorretos");
    }

    // use env-based secret; fallback only for local dev
    const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';
    const token = sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // return shape uses 'accessToken' so frontend code can read consistently
    return { user, accessToken: token };
  }
}