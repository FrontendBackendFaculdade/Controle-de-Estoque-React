import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export default {
    /**
     * Cria um novo item de venda.
     * @param {object} request - O objeto de requisição.
     * @param {object} response - O objeto de resposta.
     */
    async createItensVendas(request, response) {
        try {
            const {
                codVenda,
                codProduto,
                nomeProduto,
                custoProduto,
                quantidade,
                custoUnitariodeVenda,
                desconto,
                valorTotaldeVenda
            } = request.body;

            const itemVenda = await prisma.itensVendas.create({
                data: {
                    codVenda: Number(codVenda),
                    codProduto: Number(codProduto),
                    nomeProduto,
                    custoProduto: parseFloat(custoProduto), // Converte para float para Decimal no Prisma
                    quantidade: parseFloat(quantidade), // Converte para float para Float no Prisma
                    custoUnitariodeVenda: parseFloat(custoUnitariodeVenda), // Converte para float para Decimal no Prisma
                    desconto: parseFloat(desconto), // Converte para float para Decimal no Prisma
                    valorTotaldeVenda: parseFloat(valorTotaldeVenda) // Converte para float para Decimal no Prisma
                }
            });
            return response.status(201).json(itemVenda); // 201 Created
        } catch (error) {
            return response.status(500).json({
                message: error.message
            });
        }
    },

    /**
     * Lista todos os itens de vendas.
     * @param {object} request - O objeto de requisição.
     * @param {object} response - O objeto de resposta.
     */
    async listItensVendas(request, response) {
        try {
            const itensVendas = await prisma.itensVendas.findMany();
            return response.json(itensVendas);
        } catch (error) {
            return response.status(500).json({
                message: error.message
            });
        }
    },

    /**
     * Encontra um item de venda pelo código.
     * @param {object} request - O objeto de requisição.
     * @param {object} response - O objeto de resposta.
     */
    async findItensVendas(request, response) {
        try {
            const { codigo } = request.params;

            const itemVenda = await prisma.itensVendas.findUnique({
                where: { codigo: Number(codigo) }
            });

            if (!itemVenda) {
                return response.status(404).json({ message: 'Item de venda não encontrado.' });
            }
            return response.json(itemVenda);
        } catch (error) {
            return response.status(500).json({
                message: error.message
            });
        }
    },

    /**
     * Atualiza um item de venda existente.
     * @param {object} request - O objeto de requisição.
     * @param {object} response - O objeto de resposta.
     */
    async updateItensVendas(request, response) {
        try {
            const { codigo } = request.params;
            const {
                codVenda,
                codProduto,
                nomeProduto,
                custoProduto,
                quantidade,
                custoUnitariodeVenda,
                desconto,
                valorTotaldeVenda
            } = request.body;

            const itemVendaExistente = await prisma.itensVendas.findUnique({
                where: { codigo: Number(codigo) }
            });

            if (!itemVendaExistente) {
                return response.status(404).json({ message: 'Item de venda não encontrado para atualização.' });
            }

            const itemVendaAtualizado = await prisma.itensVendas.update({
                where: { codigo: Number(codigo) },
                data: {
                    codVenda: codVenda !== undefined ? Number(codVenda) : itemVendaExistente.codVenda,
                    codProduto: codProduto !== undefined ? Number(codProduto) : itemVendaExistente.codProduto,
                    nomeProduto: nomeProduto !== undefined ? nomeProduto : itemVendaExistente.nomeProduto,
                    custoProduto: custoProduto !== undefined ? parseFloat(custoProduto) : itemVendaExistente.custoProduto,
                    quantidade: quantidade !== undefined ? parseFloat(quantidade) : itemVendaExistente.quantidade,
                    custoUnitariodeVenda: custoUnitariodeVenda !== undefined ? parseFloat(custoUnitariodeVenda) : itemVendaExistente.custoUnitariodeVenda,
                    desconto: desconto !== undefined ? parseFloat(desconto) : itemVendaExistente.desconto,
                    valorTotaldeVenda: valorTotaldeVenda !== undefined ? parseFloat(valorTotaldeVenda) : itemVendaExistente.valorTotaldeVenda
                }
            });
            return response.json(itemVendaAtualizado);
        } catch (error) {
            return response.status(500).json({
                message: error.message
            });
        }
    },

    /**
     * Deleta um item de venda.
     * @param {object} request - O objeto de requisição.
     * @param {object} response - O objeto de resposta.
     */
    async deleteItensVendas(request, response) {
        try {
            const { codigo } = request.params;

            const itemVendaExistente = await prisma.itensVendas.findUnique({
                where: { codigo: Number(codigo) }
            });

            if (!itemVendaExistente) {
                return response.status(404).json({ message: 'Item de venda não encontrado para exclusão.' });
            }

            await prisma.itensVendas.delete({
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
