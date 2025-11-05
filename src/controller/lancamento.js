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
          numeroParcelas: true,
          parcelaAtual: true,
          lancamentoPaiId: true,
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
          numeroParcelas: true,
          parcelaAtual: true,
          lancamentoPaiId: true,
          categoria: {
            select: {
              id: true,
              nome: true
            }
          },
          parcelas: {
            select: {
              id: true,
              descricao: true,
              valor: true,
              data: true,
              parcelaAtual: true
            },
            orderBy: {
              parcelaAtual: 'asc'
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
      const { descricao, valor, data, tipo, categoriaId, numeroParcelas, parcelaAtual, lancamentoPaiId } = req.body;

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

      // Validar lancamentoPaiId se fornecido
      if (lancamentoPaiId) {
        const lancamentoPai = await prisma.lancamento.findUnique({
          where: { id: parseInt(lancamentoPaiId) }
        });

        if (!lancamentoPai) {
          return res.status(404).json({ error: 'Lançamento pai não encontrado' });
        }
      }

      // Validações de parcelamento
      if (numeroParcelas && numeroParcelas < 1) {
        return res.status(400).json({ error: 'Número de parcelas deve ser maior que 0' });
      }

      if (parcelaAtual && numeroParcelas && parcelaAtual > numeroParcelas) {
        return res.status(400).json({ error: 'Parcela atual não pode ser maior que o número total de parcelas' });
      }

      const lancamento = await prisma.lancamento.create({
        data: {
          descricao,
          valor: parseFloat(valor),
          data: new Date(data),
          tipo,
          categoriaId: categoriaId ? parseInt(categoriaId) : null,
          numeroParcelas: numeroParcelas ? parseInt(numeroParcelas) : null,
          parcelaAtual: parcelaAtual ? parseInt(parcelaAtual) : null,
          lancamentoPaiId: lancamentoPaiId ? parseInt(lancamentoPaiId) : null
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
          numeroParcelas: lancamento.numeroParcelas,
          parcelaAtual: lancamento.parcelaAtual,
          lancamentoPaiId: lancamento.lancamentoPaiId,
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
      const { descricao, valor, data, tipo, categoriaId, numeroParcelas, parcelaAtual, lancamentoPaiId } = req.body;

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

      // Validar lancamentoPaiId se fornecido
      if (lancamentoPaiId !== undefined && lancamentoPaiId !== null) {
        const lancamentoPai = await prisma.lancamento.findUnique({
          where: { id: parseInt(lancamentoPaiId) }
        });

        if (!lancamentoPai) {
          return res.status(404).json({ error: 'Lançamento pai não encontrado' });
        }
      }

      // Validações de parcelamento
      if (numeroParcelas !== undefined && numeroParcelas !== null && numeroParcelas < 1) {
        return res.status(400).json({ error: 'Número de parcelas deve ser maior que 0' });
      }

      const updateData = {};
      if (descricao !== undefined) updateData.descricao = descricao;
      if (valor !== undefined) updateData.valor = parseFloat(valor);
      if (data !== undefined) updateData.data = new Date(data);
      if (tipo !== undefined) updateData.tipo = tipo;
      if (categoriaId !== undefined) {
        updateData.categoriaId = categoriaId ? parseInt(categoriaId) : null;
      }
      if (numeroParcelas !== undefined) {
        updateData.numeroParcelas = numeroParcelas ? parseInt(numeroParcelas) : null;
      }
      if (parcelaAtual !== undefined) {
        updateData.parcelaAtual = parcelaAtual ? parseInt(parcelaAtual) : null;
      }
      if (lancamentoPaiId !== undefined) {
        updateData.lancamentoPaiId = lancamentoPaiId ? parseInt(lancamentoPaiId) : null;
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
          numeroParcelas: lancamento.numeroParcelas,
          parcelaAtual: lancamento.parcelaAtual,
          lancamentoPaiId: lancamento.lancamentoPaiId,
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
  },

  async createLancamentoParcelado(req, res) {
    try {
      const { descricao, valorTotal, dataInicial, tipo, categoriaId, numeroParcelas } = req.body;

      // Validações
      if (!descricao) {
        return res.status(400).json({ error: 'Descrição é obrigatória' });
      }

      if (valorTotal === undefined || valorTotal === null) {
        return res.status(400).json({ error: 'Valor total é obrigatório' });
      }

      if (!dataInicial) {
        return res.status(400).json({ error: 'Data inicial é obrigatória' });
      }

      if (!tipo) {
        return res.status(400).json({ error: 'Tipo é obrigatório' });
      }

      if (tipo !== 'RECEITA' && tipo !== 'DESPESA') {
        return res.status(400).json({ error: 'Tipo deve ser RECEITA ou DESPESA' });
      }

      if (!numeroParcelas || numeroParcelas < 2) {
        return res.status(400).json({ error: 'Número de parcelas deve ser maior ou igual a 2' });
      }

      // Validar se categoria existe
      if (categoriaId) {
        const categoria = await prisma.category.findUnique({
          where: { id: parseInt(categoriaId) }
        });

        if (!categoria) {
          return res.status(404).json({ error: 'Categoria não encontrada' });
        }
      }

      const valorParcela = parseFloat(valorTotal) / parseInt(numeroParcelas);
      const dataBase = new Date(dataInicial);
      const parcelas = [];

      // Criar lançamento pai
      const lancamentoPai = await prisma.lancamento.create({
        data: {
          descricao: `${descricao} (Parcelado)`,
          valor: parseFloat(valorTotal),
          data: dataBase,
          tipo,
          categoriaId: categoriaId ? parseInt(categoriaId) : null,
          numeroParcelas: parseInt(numeroParcelas),
          parcelaAtual: 0
        }
      });

      // Criar parcelas
      for (let i = 1; i <= parseInt(numeroParcelas); i++) {
        const dataParcela = new Date(dataBase);
        dataParcela.setMonth(dataParcela.getMonth() + i - 1);

        const parcela = await prisma.lancamento.create({
          data: {
            descricao: `${descricao} (${i}/${numeroParcelas})`,
            valor: valorParcela,
            data: dataParcela,
            tipo,
            categoriaId: categoriaId ? parseInt(categoriaId) : null,
            numeroParcelas: parseInt(numeroParcelas),
            parcelaAtual: i,
            lancamentoPaiId: lancamentoPai.id
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

        parcelas.push(parcela);
      }

      res.status(201).json({
        message: 'Lançamento parcelado criado com sucesso',
        lancamentoPai: {
          id: lancamentoPai.id,
          descricao: lancamentoPai.descricao,
          valorTotal: lancamentoPai.valor,
          numeroParcelas: lancamentoPai.numeroParcelas
        },
        parcelas: parcelas.map(p => ({
          id: p.id,
          descricao: p.descricao,
          valor: p.valor,
          data: p.data,
          parcelaAtual: p.parcelaAtual,
          categoria: p.categoria
        }))
      });
    } catch (error) {
      console.error('Erro ao criar lançamento parcelado:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
};

module.exports = lancamentoController;

