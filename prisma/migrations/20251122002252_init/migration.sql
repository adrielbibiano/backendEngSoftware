-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Municipio" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,

    CONSTRAINT "Municipio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Escola" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(150) NOT NULL,
    "tipo" VARCHAR(50),
    "idMunicipio" INTEGER NOT NULL,

    CONSTRAINT "Escola_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Infraestrutura" (
    "id" SERIAL NOT NULL,
    "tipo" VARCHAR(150) NOT NULL,
    "idEscola" INTEGER NOT NULL,

    CONSTRAINT "Infraestrutura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DestinoDoLixo" (
    "id" SERIAL NOT NULL,
    "tipo" VARCHAR(100) NOT NULL,

    CONSTRAINT "DestinoDoLixo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TratamentoResiduos" (
    "id" SERIAL NOT NULL,
    "metodos" VARCHAR(200),
    "eficiencia" VARCHAR(100),
    "idDestino" INTEGER NOT NULL,

    CONSTRAINT "TratamentoResiduos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicoDeColeta" (
    "id" SERIAL NOT NULL,
    "tipo" VARCHAR(100),
    "frequencia" VARCHAR(50),
    "idEscola" INTEGER NOT NULL,
    "idMunicipio" INTEGER NOT NULL,
    "idDestino" INTEGER NOT NULL,

    CONSTRAINT "ServicoDeColeta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TratamentoResiduos_idDestino_key" ON "TratamentoResiduos"("idDestino");

-- AddForeignKey
ALTER TABLE "Escola" ADD CONSTRAINT "Escola_idMunicipio_fkey" FOREIGN KEY ("idMunicipio") REFERENCES "Municipio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Infraestrutura" ADD CONSTRAINT "Infraestrutura_idEscola_fkey" FOREIGN KEY ("idEscola") REFERENCES "Escola"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TratamentoResiduos" ADD CONSTRAINT "TratamentoResiduos_idDestino_fkey" FOREIGN KEY ("idDestino") REFERENCES "DestinoDoLixo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicoDeColeta" ADD CONSTRAINT "ServicoDeColeta_idEscola_fkey" FOREIGN KEY ("idEscola") REFERENCES "Escola"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicoDeColeta" ADD CONSTRAINT "ServicoDeColeta_idMunicipio_fkey" FOREIGN KEY ("idMunicipio") REFERENCES "Municipio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicoDeColeta" ADD CONSTRAINT "ServicoDeColeta_idDestino_fkey" FOREIGN KEY ("idDestino") REFERENCES "DestinoDoLixo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
