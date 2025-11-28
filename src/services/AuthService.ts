import { PrismaClient } from '@prisma/client';
import { hash, compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const prisma = new PrismaClient();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class AuthService {
  
  // 1. REGISTRO COM EMAIL/SENHA
  async register(email: string, password?: string) {
    // Verifica se já existe
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      throw new Error("Usuário já existe");
    }

    // Se tiver senha, criptografa. Se não (Google), deixa null.
    const passwordHash = password ? await hash(password, 8) : null;

    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
      },
    });

    return user;
  }

  // 2. LOGIN NORMAL
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || !user.password) {
      throw new Error("Usuário ou senha inválidos");
    }

    const passwordMatch = await compare(password, user.password);
    if (!passwordMatch) {
      throw new Error("Usuário ou senha inválidos");
    }

    const token = sign({ id: user.id }, process.env.JWT_SECRET || "seusecret", {
      expiresIn: "1d",
    });

    return { user, accessToken: token };
  }

  // 3. LOGIN SOCIAL (GOOGLE)
  async loginWithGoogle(tokenGoogle: string) {
    // Verifica se o token do Google é real
    const ticket = await googleClient.verifyIdToken({
      idToken: tokenGoogle,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) throw new Error("Token Google inválido");

    const { email, sub: googleId } = payload;

    // Procura usuário pelo email
    let user = await prisma.user.findUnique({ where: { email } });

    // Se não existe, CRIA automaticamente
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          googleId,
          password: null, // Sem senha
        }
      });
    } 
    // Se existe mas não tem googleId vinculado, vincula agora
    else if (!user.googleId) {
      user = await prisma.user.update({
        where: { email },
        data: { googleId }
      });
    }

    // Gera o NOSSO token JWT
    const token = sign({ id: user.id }, process.env.JWT_SECRET || "seusecret", {
      expiresIn: "1d",
    });

    return { user, accessToken: token };
  }
}