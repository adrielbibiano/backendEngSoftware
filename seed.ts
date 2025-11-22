import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando a população do banco...');

  // 1. Inserir Municipios
  const recife = await prisma.municipio.create({ data: { nome: 'Recife' } });
  const olinda = await prisma.municipio.create({ data: { nome: 'Olinda' } });
  const paulista = await prisma.municipio.create({ data: { nome: 'Paulista' } });

  // 2. Inserir Escolas
  const escola1 = await prisma.escola.create({
    data: { nome: 'Escola Municipal Padre Lebret', tipo: 'Pública', idMunicipio: recife.id },
  });
  const escola2 = await prisma.escola.create({
    data: { nome: 'Colégio Santa Maria', tipo: 'Privada', idMunicipio: recife.id },
  });
  const escola3 = await prisma.escola.create({
    data: { nome: 'Escola Municipal Sítio Novo', tipo: 'Pública', idMunicipio: paulista.id },
  });

  // 3. Inserir Infraestrutura
  await prisma.infraestrutura.createMany({
    data: [
      { tipo: 'Lixeiras Seletivas', idEscola: escola1.id },
      { tipo: 'Abrigo para Resíduos', idEscola: escola1.id },
      { tipo: 'Compostagem', idEscola: escola3.id },
    ],
  });

  // 4. Inserir Destino do Lixo
  const destino1 = await prisma.destinoDoLixo.create({ data: { tipo: 'Coleta pública regular' } });
  const destino2 = await prisma.destinoDoLixo.create({ data: { tipo: 'Queimado' } });
  const destino3 = await prisma.destinoDoLixo.create({ data: { tipo: 'Enterrado' } });

  // 5. Inserir Tratamento
  await prisma.tratamentoResiduos.create({
    data: { metodos: 'Reciclagem e Separação', eficiencia: 'Alta', idDestino: destino1.id },
  });
  await prisma.tratamentoResiduos.create({
    data: { metodos: 'Sem tratamento', eficiencia: 'Baixa', idDestino: destino2.id },
  });

  // 6. Inserir Serviço de Coleta
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