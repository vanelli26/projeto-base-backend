const express = require('express');
const router = express.Router();
const lancamentoController = require('../controller/lancamento');
const authMiddleware = require('../middlewares/auth');

// Listar todos os lançamentos (requer autenticação)
router.get('/', authMiddleware, lancamentoController.getAllLancamentos);

// Buscar lançamento por ID (requer autenticação)
router.get('/:id', authMiddleware, lancamentoController.getLancamentoById);

// Criar novo lançamento (requer autenticação)
router.post('/', authMiddleware, lancamentoController.createLancamento);

// Atualizar lançamento (requer autenticação)
router.put('/:id', authMiddleware, lancamentoController.updateLancamento);

// Deletar lançamento (requer autenticação)
router.delete('/:id', authMiddleware, lancamentoController.deleteLancamento);

module.exports = router;

