-- CreateTable
CREATE TABLE "Produtos" (
    "codigo" SERIAL NOT NULL,
    "produto" TEXT NOT NULL,
    "tipoUnidade" TEXT NOT NULL,
    "setor" TEXT NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL,
    "custoCompra" DECIMAL(18,2) NOT NULL,
    "margemLucro" DECIMAL(18,2) NOT NULL,
    "precoDeVenda" DECIMAL(18,2) NOT NULL,
    "ativo" TEXT NOT NULL,

    CONSTRAINT "Produtos_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "Clientes" (
    "codigo" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "numeroTelefone" TEXT NOT NULL,
    "ativo" TEXT NOT NULL,

    CONSTRAINT "Clientes_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "FormaDePagamento" (
    "codigo" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" TEXT NOT NULL,

    CONSTRAINT "FormaDePagamento_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "CodicaoDePagamento" (
    "codigo" SERIAL NOT NULL,
    "descricao" TEXT NOT NULL,
    "codPagamento" INTEGER NOT NULL,
    "quantidadeParcela" INTEGER NOT NULL,
    "parcelaInicial" INTEGER NOT NULL,
    "intervaloParcelas" INTEGER NOT NULL,

    CONSTRAINT "CodicaoDePagamento_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "Vendas" (
    "codigo" SERIAL NOT NULL,
    "codCliente" INTEGER NOT NULL,
    "nomeCliente" TEXT NOT NULL,
    "CodFormadePagamento" INTEGER NOT NULL,
    "CodCondicaoPagamento" INTEGER NOT NULL,
    "valorProdutos" DECIMAL(18,2) NOT NULL,
    "desconto" INTEGER NOT NULL,
    "valorTotaldeVenda" DECIMAL(18,2) NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vendas_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "ItensVendas" (
    "codigo" SERIAL NOT NULL,
    "codVenda" INTEGER NOT NULL,
    "codProduto" INTEGER NOT NULL,
    "nomeProduto" TEXT NOT NULL,
    "custoProduto" DECIMAL(18,2) NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL,
    "custoUnitariodeVenda" DECIMAL(18,2) NOT NULL,
    "desconto" DECIMAL(18,2) NOT NULL,
    "valorTotaldeVenda" DECIMAL(18,2) NOT NULL,

    CONSTRAINT "ItensVendas_pkey" PRIMARY KEY ("codigo")
);

-- CreateTable
CREATE TABLE "Titulos" (
    "codigo" SERIAL NOT NULL,
    "codVenda" INTEGER NOT NULL,
    "codFormadePagamento" INTEGER NOT NULL,
    "codCondicaoPagamento" INTEGER NOT NULL,
    "codCliente" INTEGER NOT NULL,
    "nomdeCliente" TEXT NOT NULL,
    "valorTitulo" DECIMAL(18,2) NOT NULL,
    "emissao" TIMESTAMP(3) NOT NULL,
    "vencimento" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Titulos_pkey" PRIMARY KEY ("codigo")
);
