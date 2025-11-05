const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const lancamentoController = {
  async getAllLancamentos(req, res) {
    try {
      const lancamentos = await prisma.lancamento.findMany({
        select: {
          id: true,
          descricao: true,
          valor: true,
          data: true,
          tipo: true,
          categoriaId: true,
          categoria: {
            select: {
              id: true,
              nome: true
            }
          }
        },
        orderBy: {
          data: 'desc'
        }
      });

      res.json(lancamentos);
    } catch (error) {
      console.error('Erro ao buscar lançamentos:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async getLancamentoById(req, res) {
    try {
      const lancamentoId = parseInt(req.params.id);

      const lancamento = await prisma.lancamento.findUnique({
        where: { id: lancamentoId },
        select: {
          id: true,
          descricao: true,
          valor: true,
          data: true,
          tipo: true,
          categoriaId: true,
          categoria: {
            select: {
              id: true,
              nome: true
            }
          }
        }
      });

      if (!lancamento) {
        return res.status(404).json({ error: 'Lançamento não encontrado' });
      }

      res.json(lancamento);
    } catch (error) {
      console.error('Erro ao buscar lançamento:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async createLancamento(req, res) {
    try {
      const { descricao, valor, data, tipo, categoriaId } = req.body;

      // Validações
      if (!descricao) {
        return res.status(400).json({ error: 'Descrição é obrigatória' });
      }

      if (valor === undefined || valor === null) {
        return res.status(400).json({ error: 'Valor é obrigatório' });
      }

      if (!data) {
        return res.status(400).json({ error: 'Data é obrigatória' });
      }

      if (!tipo) {
        return res.status(400).json({ error: 'Tipo é obrigatório' });
      }

      if (tipo !== 'RECEITA' && tipo !== 'DESPESA') {
        return res.status(400).json({ error: 'Tipo deve ser RECEITA ou DESPESA' });
      }

      // Validar se categoria existe, caso categoriaId seja fornecido
      if (categoriaId) {
        const categoria = await prisma.category.findUnique({
          where: { id: parseInt(categoriaId) }
        });

        if (!categoria) {
          return res.status(404).json({ error: 'Categoria não encontrada' });
        }
      }

      const lancamento = await prisma.lancamento.create({
        data: {
          descricao,
          valor: parseFloat(valor),
          data: new Date(data),
          tipo,
          categoriaId: categoriaId ? parseInt(categoriaId) : null
        },
        include: {
          categoria: {
            select: {
              id: true,
              nome: true
            }
          }
        }
      });

      res.status(201).json({
        message: 'Lançamento criado com sucesso',
        lancamento: {
          id: lancamento.id,
          descricao: lancamento.descricao,
          valor: lancamento.valor,
          data: lancamento.data,
          tipo: lancamento.tipo,
          categoriaId: lancamento.categoriaId,
          categoria: lancamento.categoria
        }
      });
    } catch (error) {
      console.error('Erro ao criar lançamento:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async updateLancamento(req, res) {
    try {
      const lancamentoId = parseInt(req.params.id);
      const { descricao, valor, data, tipo, categoriaId } = req.body;

      const existingLancamento = await prisma.lancamento.findUnique({
        where: { id: lancamentoId }
      });

      if (!existingLancamento) {
        return res.status(404).json({ error: 'Lançamento não encontrado' });
      }

      // Validação do tipo se fornecido
      if (tipo && tipo !== 'RECEITA' && tipo !== 'DESPESA') {
        return res.status(400).json({ error: 'Tipo deve ser RECEITA ou DESPESA' });
      }

      // Validar se categoria existe, caso categoriaId seja fornecido
      if (categoriaId !== undefined && categoriaId !== null) {
        const categoria = await prisma.category.findUnique({
          where: { id: parseInt(categoriaId) }
        });

        if (!categoria) {
          return res.status(404).json({ error: 'Categoria não encontrada' });
        }
      }

      const updateData = {};
      if (descricao !== undefined) updateData.descricao = descricao;
      if (valor !== undefined) updateData.valor = parseFloat(valor);
      if (data !== undefined) updateData.data = new Date(data);
      if (tipo !== undefined) updateData.tipo = tipo;
      if (categoriaId !== undefined) {
        updateData.categoriaId = categoriaId ? parseInt(categoriaId) : null;
      }

      const lancamento = await prisma.lancamento.update({
        where: { id: lancamentoId },
        data: updateData,
        include: {
          categoria: {
            select: {
              id: true,
              nome: true
            }
          }
        }
      });

      res.json({
        message: 'Lançamento atualizado com sucesso',
        lancamento: {
          id: lancamento.id,
          descricao: lancamento.descricao,
          valor: lancamento.valor,
          data: lancamento.data,
          tipo: lancamento.tipo,
          categoriaId: lancamento.categoriaId,
          categoria: lancamento.categoria
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar lançamento:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  async deleteLancamento(req, res) {
    try {
      const lancamentoId = parseInt(req.params.id);

      const existingLancamento = await prisma.lancamento.findUnique({
        where: { id: lancamentoId }
      });

      if (!existingLancamento) {
        return res.status(404).json({ error: 'Lançamento não encontrado' });
      }

      await prisma.lancamento.delete({
        where: { id: lancamentoId }
      });

      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar lançamento:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
};

module.exports = lancamentoController;

