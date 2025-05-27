import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export default {
    /**
     * Cria um novo registro de venda.
     * @param {object} request - O objeto de requisição.
     * @param {object} response - O objeto de resposta.
     */
    async createVenda(request, response) {
        try {
            const {
                codCliente,
                nomeCliente,
                CodFormadePagamento,
                CodCondicaoPagamento,
                valorProdutos,
                desconto,
                valorTotaldeVenda,
                // dataHora é @default(now()) no Prisma, então é opcional no corpo da requisição.
                // Se for fornecido, será usado, caso contrário, o Prisma definirá a data e hora atuais.
                dataHora
            } = request.body;

            const venda = await prisma.vendas.create({
                data: {
                    codCliente: Number(codCliente),
                    nomeCliente,
                    CodFormadePagamento: Number(CodFormadePagamento),
                    CodCondicaoPagamento: Number(CodCondicaoPagamento),
                    valorProdutos: parseFloat(valorProdutos), // Converte para float para Decimal no Prisma
                    desconto: Number(desconto),
                    valorTotaldeVenda: parseFloat(valorTotaldeVenda), // Converte para float para Decimal no Prisma
                    ...(dataHora && { dataHora: new Date(dataHora) }) // Adiciona dataHora se fornecido
                }
            });
            return response.status(201).json(venda); // 201 Created
        } catch (error) {
            return response.status(500).json({
                message: error.message
            });
        }
    },

    /**
     * Lista todos os registros de vendas.
     * @param {object} request - O objeto de requisição.
     * @param {object} response - O objeto de resposta.
     */
    async listVendas(request, response) {
        try {
            const vendas = await prisma.vendas.findMany();
            return response.json(vendas);
        } catch (error) {
            return response.status(500).json({
                message: error.message
            });
        }
    },

    /**
     * Encontra um registro de venda pelo código.
     * @param {object} request - O objeto de requisição.
     * @param {object} response - O objeto de resposta.
     */
    async findVenda(request, response) {
        try {
            const { codigo } = request.params;

            const venda = await prisma.vendas.findUnique({
                where: { codigo: Number(codigo) }
            });

            if (!venda) {
                return response.status(404).json({ message: 'Venda não encontrada.' });
            }
            return response.json(venda);
        } catch (error) {
            return response.status(500).json({
                message: error.message
            });
        }
    },

    /**
     * Atualiza um registro de venda existente.
     * @param {object} request - O objeto de requisição.
     * @param {object} response - O objeto de resposta.
     */
    async updateVenda(request, response) {
        try {
            const { codigo } = request.params;
            const {
                codCliente,
                nomeCliente,
                CodFormadePagamento,
                CodCondicaoPagamento,
                valorProdutos,
                desconto,
                valorTotaldeVenda,
                dataHora
            } = request.body;

            const vendaExistente = await prisma.vendas.findUnique({
                where: { codigo: Number(codigo) }
            });

            if (!vendaExistente) {
                return response.status(404).json({ message: 'Venda não encontrada para atualização.' });
            }

            const vendaAtualizada = await prisma.vendas.update({
                where: { codigo: Number(codigo) },
                data: {
                    codCliente: codCliente !== undefined ? Number(codCliente) : vendaExistente.codCliente,
                    nomeCliente: nomeCliente !== undefined ? nomeCliente : vendaExistente.nomeCliente,
                    CodFormadePagamento: CodFormadePagamento !== undefined ? Number(CodFormadePagamento) : vendaExistente.CodFormadePagamento,
                    CodCondicaoPagamento: CodCondicaoPagamento !== undefined ? Number(CodCondicaoPagamento) : vendaExistente.CodCondicaoPagamento,
                    valorProdutos: valorProdutos !== undefined ? parseFloat(valorProdutos) : vendaExistente.valorProdutos,
                    desconto: desconto !== undefined ? Number(desconto) : vendaExistente.desconto,
                    valorTotaldeVenda: valorTotaldeVenda !== undefined ? parseFloat(valorTotaldeVenda) : vendaExistente.valorTotaldeVenda,
                    dataHora: dataHora !== undefined ? new Date(dataHora) : vendaExistente.dataHora
                }
            });
            return response.json(vendaAtualizada);
        } catch (error) {
            return response.status(500).json({
                message: error.message
            });
        }
    },

    /**
     * Deleta um registro de venda.
     * @param {object} request - O objeto de requisição.
     * @param {object} response - O objeto de resposta.
     */
    async deleteVenda(request, response) {
        try {
            const { codigo } = request.params;

            const vendaExistente = await prisma.vendas.findUnique({
                where: { codigo: Number(codigo) }
            });

            if (!vendaExistente) {
                return response.status(404).json({ message: 'Venda não encontrada para exclusão.' });
            }

            await prisma.vendas.delete({
                where: { codigo: Number(codigo) }
            });
            return response.status(204).send(); // 204 No Content
        } catch (error) {
            return response.status(500).json({
                message: error.message
            });
        }
    }
};

// Controller finalizada por Welder Rafael