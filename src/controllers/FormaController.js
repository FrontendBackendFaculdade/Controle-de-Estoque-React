import pkg from "@prisma/client";
import { response } from "express";
const { PrismaClient, Decimal } = pkg;


const prisma = new PrismaClient();


export default {
    async cadastrarForma(request, response){
        try{
            const criandoAtivo = "SIM"
            
            const {
                nome
            } = request.body;

            await prisma.FormaDePagamento.create({
                data: {
                    nome,
                    ativo: "SIM"
                }
            });
                return response.status(201).json({message: "Forma de pagamento cadastrada com sucesso"})  
        }catch(error){
            return response.status(500).json({message: error.message});
        }
    },
    async findFormasdepagamento(request, response){
        try{
            const forma = await prisma.FormaDePagamento.findMany();
            return response.json(forma)
        }catch(error){
            return response.json({message: error.message})
        }
    },

async findFormadepagamento(request, response) {
    try {
        const { codigo } = request.params;

        const forma = await prisma.formaDePagamento.findFirst({
            where: { codigo: Number(codigo) }
        });

        if (!forma) {
            return response.status(404).json({ message: "Forma de pagamento não encontrada." });
        }

        return response.json(forma);
    } catch (error) {
        return response.status(500).json({ message: error.message });
    }
},


    async deleteForma(request, response){
        try{
            const {codigo} = request.params;

            const forma = await prisma.FormaDePagamento.findUnique({
                where: {codigo: Number(codigo)}
            });

            if(!forma) {return response.status(404).json({
                message: "Produto não encontrado."
            });
        }
            await prisma.FormaDePagamento.delete({
                where: {codigo: Number(codigo)}
            });

            return response.json({message: "Produto deletado com sucesso!"});

        }catch(error){
            return response.status(500).json({
                message: error.message
            });
        }
    },

    async updateForma(request, response) {
        try {
            const { codigo } = request.params;
    
            const {
                nome,
                ativo
            } = request.body;
    
            const formaExiste = await prisma.FormaDePagamento.findUnique({
                where: { codigo: Number(codigo) }
            });
    
            if (!formaExiste) {
                return response.status(400).json({ message: "Forma de pagamento não encontrada" });
            }
    
            const formaAtualizada = {
                nome: nome !== undefined ? nome : undefined,
                ativo: ativo !== undefined ? String(ativo) : undefined  // se for string no schema
            };
    
            Object.keys(formaAtualizada).forEach(
                key => formaAtualizada[key] === undefined && delete formaAtualizada[key]
            );
    
            await prisma.FormaDePagamento.update({
                where: { codigo: Number(codigo) },
                data: formaAtualizada
            });
    
            return response.json({ message: "Forma de pagamento atualizada com sucesso!" });
        } catch (error) {
            return response.status(500).json({ message: error.message });
        }
    }
    


}
