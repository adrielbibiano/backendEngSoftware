import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando a população do banco...");

  // --- 1. Inserir os 14 Municípios da RMR ---
  const nomesMunicipios = [
    "Abreu e Lima",
    "Araçoiaba",
    "Cabo de Santo Agostinho",
    "Camaragibe",
    "Igarassu",
    "Ilha de Itamaracá",
    "Ipojuca",
    "Itapissuma",
    "Jaboatão dos Guararapes",
    "Moreno",
    "Olinda",
    "Paulista",
    "Recife",
    "São Lourenço da Mata",
  ];

  console.log("Inserindo municípios...");
  for (const nome of nomesMunicipios) {
    const existe = await prisma.municipio.findFirst({ where: { nome } });
    if (!existe) {
      await prisma.municipio.create({ data: { nome } });
    }
  }

  // --- 2. Inserir os Tipos de Destino do Lixo (Baseado na imagem) ---
  // ... dentro do main()
  const tiposDestino = [
    "Serviço de coleta",
    "Queima",
    "Enterra",
    "Destino Público",
    "Descarta em outra área",
    "Joga em outra área",
    "Outros",
  ];
  // ...

  console.log("Inserindo tipos de destino...");
  for (const tipo of tiposDestino) {
    // Verifica se já existe para não duplicar
    const existe = await prisma.destinoDoLixo.findFirst({ where: { tipo } });
    if (!existe) {
      await prisma.destinoDoLixo.create({ data: { tipo } });
    }
  }

  // --- 3. Usuário Admin (Garante que existe) ---
  const passwordHash = await hash("admin123", 8);
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: { email: "admin@example.com", password: passwordHash },
  });

  console.log("Banco populado com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
