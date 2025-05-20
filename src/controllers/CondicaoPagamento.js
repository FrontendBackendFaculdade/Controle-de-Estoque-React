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
    }
}