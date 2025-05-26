import pkg from "@prisma/client";
import { response } from "express";
const { PrismaClient, Decimal } = pkg;

const prisma = new PrismaClient();

export default {
    async createProduto(request, response) {
        try {
            const {
                produto,
                tipoUnidade,
                setor,
                quantidade,
                custoCompra, 
                margemLucro,
                precoDeVenda,
                ativo
            } = request.body;

            // Se os valores de custoCompra e margemLucro forem passados como números, converta-os para Decimal
            const custoCompraDecimal = new Decimal(custoCompra);
            const margemLucroDecimal = new Decimal(margemLucro);

            await prisma.produtos.create({
                data: {
                    produto,
                    tipoUnidade,
                    setor,
                    quantidade,
                    custoCompra: custoCompraDecimal,
                    margemLucro: margemLucroDecimal,
                    precoDeVenda,
                    ativo
                }
            });

            return response.status(201).json({ message: "Produto criado com sucesso!" });
        } catch (error) {
            return response.status(500).json({ message: error.message });
        }
    },

    async findAllProdutos(request, response){
        try{
            const produto = await prisma.produtos.findMany();
            return response.json(produto);
        }catch(error){
            return response.json({message: error.message})
        }
    },

    async findProdutoByCodigo(request, response) {
        try {
            const { codigo } = request.params;
    
            const produto = await prisma.produtos.findFirst({
                where: { codigo: Number(codigo) }
            });
    
            if (!produto) {
                return response.json({ message: "Produto não encontrado." });
            }
    
            return response.json(produto);
    
        } catch (error) {
            return response.json({ message: error.message });
        }
    },

    async deleteProduto(request, response){
        try{
            const {codigo} = request.params;

            const produto = await prisma.produtos.findUnique({
                where: {codigo: Number(codigo)}
            });

            if(!produto) {return response.status(404).json({
                message: "Produto não encontrado."
            });
        }
            await prisma.produtos.delete({
                where: {codigo: Number(codigo)}
            });

            return response.json({message: "Produto deletado com sucesso!"});

        }catch(error){
            return response.status(500).json({
                message: error.message
            });
        }
    },


    async updateProduto(request, response) {
        try {
            const { codigo } = request.params;
            const {
                produto,
                tipoUnidade,
                setor,
                quantidade,
                custoCompra, 
                margemLucro,
                precoDeVenda,
                ativo
            } = request.body;
    
            const produtoExistente = await prisma.produtos.findUnique({
                where: { codigo: Number(codigo) }
            });
    
            if (!produtoExistente) {
                return response.status(404).json({ message: "Produto não encontrado." });
            }
    
            const dataAtualizada = {
                produto,
                tipoUnidade,
                setor,
                quantidade,
                custoCompra: custoCompra !== undefined ? new Decimal(custoCompra) : undefined,
                margemLucro: margemLucro !== undefined ? new Decimal(margemLucro) : undefined,
                precoDeVenda,
                ativo: ativo !== undefined ? String(ativo) : undefined
            };
    
            Object.keys(dataAtualizada).forEach(
                key => dataAtualizada[key] === undefined && delete dataAtualizada[key]
            );
    
            await prisma.produtos.update({
                where: { codigo: Number(codigo) },
                data: dataAtualizada
            });
    
            return response.json({ message: "Produto atualizado com sucesso!" });
        } catch (error) {
            return response.status(500).json({ message: error.message });
        }
    }
    
    
    
    
    
atestado por WELDER

};
