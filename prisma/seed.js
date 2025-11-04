const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log(' Iniciando população do banco de dados...');
  try {
    await prisma.user.create({
      data: { username: 'admin', password: '1234', isAdmin: true }
    });
    console.log(' Usuário admin criado');
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('  Usuário admin já existe');
    }
  }

  try {
    await prisma.user.create({
      data: { username: 'user', password: '1234', isAdmin: false }
    });
    console.log(' Usuário user criado');
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('  Usuário user já existe');
    }
  }

  const books = [
    { title: '1984', author: 'George Orwell', available: true },
    { title: 'Dom Casmurro', author: 'Machado de Assis', available: true },
    { title: 'Harry Potter', author: 'J.K. Rowling', available: false },
    { title: 'Clean Code', author: 'Robert Martin', available: true }
  ];

  for (const book of books) {
    try {
      await prisma.book.create({
        data: book
      });
      console.log(` Livro "${book.title}" criado`);
    } catch (error) {
      console.log(`  Livro "${book.title}" já existe`);
    }
  }

  console.log(' Dados iniciais criados com sucesso!');
  console.log('Usuários: admin (senha: 1234) - user (senha: 1234)');
}

main()
  .catch((e) => {
    console.error(' Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
