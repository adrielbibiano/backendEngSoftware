// src/services/EscolaService.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class EscolaService {
  // Método para listar todas as escolas
  async listarTodas() {
    return await prisma.escola.findMany({
      include: {
        municipio: true,      // Traz o nome do município
        servicosColeta: true, // Traz os dados da coleta
        infraestruturas: true // Traz a infraestrutura (lixeiras, etc.)
      }
    });
  }
}