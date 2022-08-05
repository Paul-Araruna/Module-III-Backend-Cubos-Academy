const conexao = require('../conexao');
const securePassword = require('secure-password');
const pwd = securePassword();
const jwt = require('jsonwebtoken');
const jwtSecret = require('../jwt');



const cadastrarUsuario = async (req, res) => {

    const { nome, email, senha } = req.body;

    if (!nome) {
        return res.status(400).json('O nome não foi preenchido');
    }

    if (!email) {
        return res.status(400).json('O email não foi preenchido');
    }

    if (!senha) {
        return res.status(400).json('A senha não foi preenchida');
    }

    try {
        const query = 'select * from usuarios where email = $1';
        const busca = await conexao.query(query, [email]);

        if (busca.rowCount > 0) {
            return res.status(400).json('Já existe usuário cadastrado com o e-mail informado.');
        }
    } catch (error) {
        return res.status(400).json(error.message);
    }

    try {
        const hash = (await pwd.hash(Buffer.from(senha))).toString('hex');
        const query = 'insert into usuarios (nome , email , senha) values ($1,$2,$3)';
        const usuario = await conexao.query(query, [nome, email, hash]);

        if (usuario.rowCount === 0) {
            return res.status(400).json('Não foi possível realizar o cadastro');
        }

        const novaQuery = 'select * from usuarios where email = $1';
        const { rows } = await conexao.query(novaQuery, [email]);

        const usuarioCadastrado = rows[0];

        return res.status(200).json({
            id: usuarioCadastrado.id,
            nome: usuarioCadastrado.nome,
            email: usuarioCadastrado.email
        });

    } catch (error) {
        return res.status(400).json(error.message);
    }
};

const login = async (req, res) => {

    const { email, senha } = req.body;

    if (!email) {
        return res.status(400).json('O email não foi preenchido');
    }

    if (!senha) {
        return res.status(400).json('A senha não foi preenchida');
    }

    try {
        const query = 'select * from usuarios where email = $1';
        const busca = await conexao.query(query, [email]);

        if (busca.rowCount === 0) {
            return res.status(400).json('E-mail ou senha incorretos');
        }

        const usuarioLogado = busca.rows[0];

        const conferenciaDoHash = await pwd.verify(Buffer.from(senha), Buffer.from(usuarioLogado.senha, "hex"));

        switch (conferenciaDoHash) {
            case securePassword.INVALID_UNRECOGNIZED_HASH:
                return res.status(400).json('Email ou Senha incorretos');
            case securePassword.INVALID:
                return res.status(400).json('Email ou Senha incorretos');
            case securePassword.VALID:
                break;
            case securePassword.VALID_NEEDS_REHASH:

                try {

                    const hash = (await pwd.hash(Buffer.from(senha))).toString('hex');
                    const query = 'update usuarios set senha = $1 where email = $2';
                    await conexao.query(query, [hash, email]);

                } catch {
                }
                break;
        };

        const token = jwt.sign({
            id: usuarioLogado.id
        }, jwtSecret);

        const { senha: senhaDoUsuarioLogado, ...dadosUsuarioLogado } = usuarioLogado;

        return res.status(200).json({
            usuario: dadosUsuarioLogado,
            token
        });

    } catch (error) {
        return res.status(400).json(error.message);
    }
};


const detalharUsuario = async (req, res) => {

    const { usuario } = req;

    try {
        return res.status(200).json(usuario);
    } catch (error) {
        return res.status(400).json(error.message);
    }

};

const atualizarUsuario = async (req, res) => {
    const { usuario } = req;
    const { nome, email, senha } = req.body;

    if (!nome) {
        return res.status(400).json('O nome não foi atualizado');
    }

    if (!email) {
        return res.status(400).json('O email não foi atualizado');
    }

    if (!senha) {
        return res.status(400).json('A senha não foi atualizado');
    }

    try {

        const queryBuscaEmail = 'select * from usuarios where email = $1';
        const { rowCount } = await conexao.query(queryBuscaEmail, [email]);

        if (rowCount > 0) {
            return res.status(400).json('O e-mail informado já está sendo utilizado por outro usuário.');
        }

        const hash = (await pwd.hash(Buffer.from(senha))).toString('hex');
        const queryUpDate = 'update usuarios set nome = $1, email = $2, senha = $3 where id = $4 ';
        const usuarioEmAtualizacao = await conexao.query(queryUpDate, [nome, email, hash, usuario.id]);

        if (usuarioEmAtualizacao.rowCount === 0) {
            return res.status(400).json('Não foi possível realizar a atualização');
        }

        return res.status(200).json();


    } catch (error) {
        return res.status(400).json(error.message);
    }

};


module.exports = {
    cadastrarUsuario,
    login,
    detalharUsuario,
    atualizarUsuario
}

//