import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export default{
    async createCondicao(request, response){
        try{
            const {
                codPagamento,
                quantidadeParcela,
                parcelaInicial,
                intervaloParcelas
            }= request.body;

            await prisma.condicaoPagamento.create({
                data: {
                    codPagamento,
                    quantidadeParcela,
                    parcelaInicial,
                    intervaloParcelas
                }
            })
        }catch(error){
            return response.status(500).json({
                message: error.message
            })
        }
    },

    async listCondicao(request, response){
        try{
            const condicao = await prisma.CondicaoPagamento.findMany()
            return response.json(condicao)
        }catch(error){
            return response.status(500).json({
                message: error.message
            })
        }
    },

    async findCondicao(request, response){
        try{

            const {codigo} = request.params;


            const condicao = await prisma.CondicaoPagamento.findfisrt({
                where: {codigo: Number(codigo)}
            });

            if(!condicao){
                return
            }
        }catch(error){
            return response.status(500).json({
                message: error.message
            })
        }
    }
}