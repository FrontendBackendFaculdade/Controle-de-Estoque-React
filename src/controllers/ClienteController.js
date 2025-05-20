import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export default {
    async createCliente(request, response) {
        try {
            const {
                nome,
                numeroTelefone,
            } = request.body;

            await prisma.Cliente.create({
                data: {
                    nome,
                    numeroTelefone,
                    ativo: "SIM"
                }
            });

            return response.status(201).json({
                message: "Cliente cadastrado com sucesso"
            });
        } catch (error) {
            return response.status(500).json({
                message: error.message
            });
        }
    },

    async listClientes (request, response) {
        try{
            const cliente = await prisma.Cliente.findMany();
            return response.json(cliente)
        }catch(error){
            return response.status(500).json({
                message: error.message
            })
        }
    },

    async findCliente (request, response){
        try{
            const {codigo} = request.params;

            const cliente = await prisma.Cliente.findFirst({
                where: { codigo: Number(codigo)}
            });

            if(!cliente){
                return response.status(404).json({
                    message: "Cliente não encontrado"
                });
            }

            return response.json(cliente)
        }catch(error){
            return response.status(500).json({
                message: error.message
            })
        }
},

    async updateCliente(request, response){
        try{
            const {codigo} = request.params;

            const {
                nome,
                numeroTelefone,
                ativo
            } = request.body;

            const clienteExist = await prisma.Cliente.findUnique({
                where: {codigo: Number(codigo)}
            });

            if(!clienteExist){
                return response.status(400).json({
                    message: "Cliente não encontrado"
                });
            }

            const clienteAtualizado = {
                nome: nome !== undefined ? nome: undefined,
                numeroTelefone: numeroTelefone !== undefined ? numeroTelefone: undefined,
                 ativo: ativo !== undefined ? String(ativo) : undefined  // se for string no schema
            };

            Object.keys(clienteAtualizado).forEach(
                key => clienteAtualizado[key] === undefined && delete clienteAtualizado[key]
            );

            await prisma.Cliente.update({
                where: {codigo: Number(codigo)},
                data: clienteAtualizado
            });

            return response.json({
                message: "Cliente atualizado com sucesso!"
            })

        }catch(error){
            return response.status(500).json({
                message: error.message
            })
        }
    },

    async deleteCliente(request, response){
        try{
            const {codigo} = request.params;

            const cliente = await prisma.Cliente.findFirst({
                where: {codigo: Number(codigo)}
            });

            if(!cliente) {
                return response.status(404).json({
                    message: "Cliente não encontrado"
                });
            }

            await prisma.Cliente.delete({
                where: {codigo: Number(codigo)}
            });

            return response.json({
                message: "Produto excluido com sucesso"
            });
        }catch(error){
            return response.status(500).json({
                message: error.message
            })
        }
    }

};
