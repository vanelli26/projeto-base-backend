const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

const userController = {
    async login(req, res) {
        res.status(200).json({
            message: 'OK',
            user: {
                id: req.user.id,
                username: req.user.username,
                isAdmin: req.user.isAdmin
            }
        });
    },

    async register(req, res) {
        try {
            const {username, password} = req.body;

            if (!username || !password) {
                return res.status(400).json({error: 'Username e password são obrigatórios'});
            }

            if (password.length < 4) {
                return res.status(400).json({error: 'Password deve ter no mínimo 4 caracteres'});
            }

            const userCount = await prisma.user.count();
            const isAdmin = userCount === 0;

            const user = await prisma.user.create({
                data: {
                    username,
                    password,
                    isAdmin
                }
            });

            res.status(201).json({
                message: 'Usuário criado com sucesso',
                userId: user.id,
                isAdmin: user.isAdmin
            });
        } catch (error) {
            if (error.code === 'P2002') {
                return res.status(400).json({error: 'Username já existe'});
            }
            console.error('Erro ao registrar usuário:', error);
            res.status(500).json({error: 'Erro interno do servidor'});
        }
    }
};

module.exports = userController;
