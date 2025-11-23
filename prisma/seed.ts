import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs'; // Importe o hash aqui em cima para ficar mais limpo

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando a população do banco...');

  // --- 1. Inserir os 14 Municípios da RMR ---
  const nomesMunicipios = [
    'Abreu e Lima',
    'Araçoiaba',
    'Cabo de Santo Agostinho',
    'Camaragibe',
    'Igarassu',
    'Ilha de Itamaracá',
    'Ipojuca',
    'Itapissuma',
    'Jaboatão dos Guararapes',
    'Moreno',
    'Olinda',
    'Paulista',
    'Recife',
    'São Lourenço da Mata'
  ];

  console.log('Inserindo municípios...');
  
  for (const nome of nomesMunicipios) {
    // Verifica se já existe antes de criar para não duplicar
    const existe = await prisma.municipio.findFirst({
      where: { nome }
    });

    if (!existe) {
      await prisma.municipio.create({ data: { nome } });
    }
  }

  // Recuperar os IDs necessários para as relações
  const recife = await prisma.municipio.findFirst({ where: { nome: 'Recife' } });
  const olinda = await prisma.municipio.findFirst({ where: { nome: 'Olinda' } });
  const paulista = await prisma.municipio.findFirst({ where: { nome: 'Paulista' } });

  // Verificação de segurança do TypeScript (se algo deu errado no passo anterior)
  if (!recife || !olinda || !paulista) {
    throw new Error("Erro: Municípios base (Recife, Olinda, Paulista) não foram encontrados.");
  }

  // --- 2. Inserir Escolas ---
  // Usamos upsert para evitar erro se rodar o seed 2 vezes
  const escola1 = await prisma.escola.upsert({
    where: { id: 1 }, // Assume que o ID 1 está livre ou é dessa escola
    update: {},
    create: { nome: 'Escola Municipal Padre Lebret', tipo: 'Pública', idMunicipio: recife.id },
  });

  const escola2 = await prisma.escola.upsert({
    where: { id: 2 },
    update: {},
    create: { nome: 'Colégio Santa Maria', tipo: 'Privada', idMunicipio: recife.id },
  });

  const escola3 = await prisma.escola.upsert({
    where: { id: 3 },
    update: {},
    create: { nome: 'Escola Municipal Sítio Novo', tipo: 'Pública', idMunicipio: paulista.id },
  });

  // --- 3. Inserir Infraestrutura ---
  // Deletamos as antigas dessa escola para recriar limpo e evitar duplicidade
  await prisma.infraestrutura.deleteMany({ where: { idEscola: { in: [escola1.id, escola3.id] } } });
  
  await prisma.infraestrutura.createMany({
    data: [
      { tipo: 'Lixeiras Seletivas', idEscola: escola1.id },
      { tipo: 'Abrigo para Resíduos', idEscola: escola1.id },
      { tipo: 'Compostagem', idEscola: escola3.id },
    ],
  });

  // --- 4. Inserir Destino do Lixo ---
  const destino1 = await prisma.destinoDoLixo.upsert({
    where: { id: 1 },
    update: {},
    create: { tipo: 'Coleta pública regular' } 
  });
  
  const destino2 = await prisma.destinoDoLixo.upsert({
    where: { id: 2 },
    update: {},
    create: { tipo: 'Queimado' } 
  });
  
  // Apenas create aqui pois não estamos referenciando ele depois
  await prisma.destinoDoLixo.create({ data: { tipo: 'Enterrado' } });

  // --- 5. Inserir Tratamento ---
  // Limpa tratamentos antigos desses destinos
  await prisma.tratamentoResiduos.deleteMany({ where: { idDestino: { in: [destino1.id, destino2.id] } } });

  await prisma.tratamentoResiduos.create({
    data: { metodos: 'Reciclagem e Separação', eficiencia: 'Alta', idDestino: destino1.id },
  });
  await prisma.tratamentoResiduos.create({
    data: { metodos: 'Sem tratamento', eficiencia: 'Baixa', idDestino: destino2.id },
  });

  // --- 6. Inserir Serviço de Coleta ---
  // Limpa serviços antigos dessas escolas
  await prisma.servicoDeColeta.deleteMany({ where: { idEscola: { in: [escola1.id, escola3.id] } } });

  await prisma.servicoDeColeta.create({
    data: {
      tipo: 'Pública',
      frequencia: '3x por semana',
      idEscola: escola1.id,
      idMunicipio: recife.id,
      idDestino: destino1.id,
    },
  });
  await prisma.servicoDeColeta.create({
    data: {
      tipo: 'Inexistente',
      frequencia: '0',
      idEscola: escola3.id,
      idMunicipio: paulista.id,
      idDestino: destino2.id,
    },
  });

  // --- 7. Criar usuário de teste (admin) ---
  const passwordHash = await hash('admin123', 8);
  
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { password: passwordHash }, // Se já existir, atualiza a senha
    create: { email: 'admin@example.com', password: passwordHash }
  });

  console.log('Banco populado com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });