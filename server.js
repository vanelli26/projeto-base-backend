const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/auth');
const bookRoutes = require('./src/routes/books');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/books', bookRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'API Sistema de Biblioteca',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /auth/login': 'Login (retorna token)',
        'POST /auth/register': 'Registrar novo usuário'
      },
      books: {
        'GET /books': 'Listar todos os livros (auth required)',
        'GET /books/:id': 'Buscar livro por ID (auth required)',
        'POST /books': 'Criar livro (admin only)',
        'PATCH /books/:id': 'Atualizar livro (admin only)',
        'DELETE /books/:id': 'Deletar livro (admin only)',
        'POST /books/:id/borrow': 'Pegar livro emprestado (auth required)',
        'POST /books/:id/return': 'Devolver livro (auth required)'
      }
    }
  });
});

app.listen(PORT, () => {
  console.log(` Servidor rodando na porta ${PORT}`);
  console.log(` API Biblioteca disponível em: http://localhost:${PORT}`);
});
