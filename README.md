Instalação e Uso

git clone https://github.com/senkoski/biblioteca.git

cd biblioteca

npm install

npx prisma generate

npx prisma migrate dev --name init

node prisma/seed.js

npm run dev

Credenciais

Admin: admin / 1234
User: user / 1234

Rotas

POST /auth/register

GET /books

GET /books/:id

POST /books/:id/borrow

POST /books/:id/return

POST /books (admin)

PATCH /books/:id (admin)

DELETE /books/:id (admin)

Headers

Authorization: Basic YWRtaW46MTIzNA== #admin

Authorization: Basic dXNlcjoxMjM0  #usuario normal

Content-Type: application/json
