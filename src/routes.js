import { Router } from "express";
import ProdutoController from "./controllers/ProdutoController.js";
import FormaController from "./controllers/FormaController.js";
import ClienteController from "./controllers/ClienteController.js"
import CondicaoPagamento from "./controllers/CondicaoPagamento.js";


const router = Router();

// Rotas de Produtos
router.post('/createprodutos', ProdutoController.createProduto);
router.get('/listprodutos', ProdutoController.findAllProdutos);
router.get('/produtos/:codigo', ProdutoController.findProdutoByCodigo);
router.delete('/deletarproduto/:codigo', ProdutoController.deleteProduto);
router.put('/atualizarproduto/:codigo', ProdutoController.updateProduto);

// Rotas das Formas de Pagamento

router.post('/createforma', FormaController.cadastrarForma);
router.get('/listformas', FormaController.findFormasdepagamento);
router.get('/listforma/:codigo', FormaController.findFormadepagamento);
router.delete('/deleteforma/:codigo', FormaController.deleteForma);
router.put('/atualizarforma/:codigo', FormaController.updateForma);


// Rotas dos Clientes

router.post('/createcliente', ClienteController.createCliente);
router.get('/listclientes', ClienteController.listClientes);
router.get('/findcliente/:codigo', ClienteController.findCliente);
router.delete('/deletecliente/:codigo', ClienteController.deleteCliente);
router.put('/atualizarcliente/:codigo', ClienteController.updateCliente);



// Rotas das Condiçoes de pagamentos

router.post('/createcondicao', CondicaoPagamento.createCondicao);
router.get('/listcondicoes', CondicaoPagamento.listCondicao);
router.get('/condicoes/:codigo', CondicaoPagamento.findCondicao);
router.put('/atualizarcondicao/:codigo', CondicaoPagamento.updateCondicao);
router.delete('/deletecondicao/:codigo', CondicaoPagamento.deleteCondicao);



export { router }