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
    },

    async updateCondicao(request, response){
         try{
            const { codigo } = request.params;
            const {
                codPagamento,
                quantidadeParcela,
                parcelaInicial,
                intervaloParcelas
            } = request.body;

            const condicaoExistente = await prisma.condicaoPagamento.findUnique({
                where: { codigo: Number(codigo) }
            });

            if (!condicaoExistente) {
                return response.status(404).json({ message: 'Condição de pagamento não encontrada.' });
            }

            const condicaoAtualizada = await prisma.condicaoPagamento.update({
                where: { codigo: Number(codigo) },
                data: {
                    codPagamento,
                    quantidadeParcela,
                    parcelaInicial,
                    intervaloParcelas
                }
            });
            return response.json(condicaoAtualizada);
        }catch(error){
            return response.status(500).json({
                message: error.message
            })
        }
    },

    async deleteCondicao(request, response){
        try{
            const { codigo } = request.params;

            const condicaoExistente = await prisma.condicaoPagamento.findUnique({
                where: { codigo: Number(codigo) }
            });

            if (!condicaoExistente) {
                return response.status(404).json({ message: 'Condição de pagamento não encontrada.' });
            }

            await prisma.condicaoPagamento.delete({
                where: { codigo: Number(codigo) }
            });
            return response.status(204).send(); // 204 No Content para sucesso na deleção
        }catch(error){
            return response.status(500).json({
                message: error.message
            })
        }
    }



    // Terminar a função de Update e Delete
}