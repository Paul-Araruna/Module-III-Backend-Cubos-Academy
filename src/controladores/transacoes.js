const conexao = require('../conexao');

const listarTransacoes = async (req, res) => {

    const { usuario } = req;

    try {
        const query = 'select * from transacoes where usuario_id = $1';
        const listaDeTransacoes = await conexao.query(query, [usuario.id]);


        return res.status(200).json(listaDeTransacoes.rows);

    } catch (error) {
        return res.status(400).json(error.message);
    }
};

const detalharTransacoes = async (req, res) => {

    const { usuario } = req;
    const { id } = req.params;

    try {
        const query = 'select * from transacoes where id = $1 and usuario_id = $2';
        const listaDeTransacoes = await conexao.query(query, [id, usuario.id]);

        if (listaDeTransacoes.rowCount === 0) {
            return res.status(404).json('Transação não encontrada.');
        }

        const transacaoEncontrada = listaDeTransacoes.rows[0];

        return res.status(200).json(transacaoEncontrada);

    } catch (error) {
        return res.status(400).json(error.message);
    }
};

const cadastarTransacao = async (req, res) => {

    const { usuario } = req;
    const { descricao, valor, data, categoria_id, tipo } = req.body;

    if (!descricao) {
        return res.status(400).json('Descrição não informada!');
    }
    if (!valor) {
        return res.status(400).json('Valor não informado!');
    }
    if (!data) {
        return res.status(400).json('Data não informada!');
    }
    if (!categoria_id) {
        return res.status(400).json('Categoria não informada!');
    }
    if (!tipo) {
        return res.status(400).json('Tipo de transação não informado');
    }
    if (tipo === "entrada" || tipo === "saida") {
        try {

            const queryTipoCategorias = 'select * from categorias where id = $1';
            const categoriaBusca = await conexao.query(queryTipoCategorias, [categoria_id]);

            if (categoriaBusca.rowCount === 0) {
                return res.status(404).json('A categoria não foi encontrada');
            }

            const categoriaNome = categoriaBusca.rows[0].descricao;

            const queryInserirTransacao = 'insert into transacoes (descricao, valor, data_transacao, categoria_id, usuario_id, tipo , categoria_nome) values ($1, $2, $3, $4, $5, $6, $7)';
            const { rowCount } = await conexao.query(queryInserirTransacao, [descricao, valor, data, categoria_id, usuario.id, tipo, categoriaNome]);

            if (rowCount === 0) {
                return res.status(400).json('Não foi possível realizar a transação');
            }

            const queryTransacaoRealizada = 'select * from transacoes order by id desc limit 1';
            const { rows } = await conexao.query(queryTransacaoRealizada);

            return res.status(200).json(rows[0]);

        } catch (error) {
            return res.status(400).json(error.message);
        }

    } else {
        return res.status(400).json('Tipo de transação incorreto');
    }
};

const atualizarTransacao = async (req, res) => {
    const { usuario } = req;
    const { descricao, valor, data, categoria_id, tipo } = req.body;
    const { id } = req.params;

    if (!descricao) {
        return res.status(400).json('Descrição não informada!');
    }
    if (!valor) {
        return res.status(400).json('Valor não informado!');
    }
    if (!data) {
        return res.status(400).json('Data não informada!');
    }
    if (!categoria_id) {
        return res.status(400).json('Categoria não informada!');
    }
    if (!tipo) {
        return res.status(400).json('Tipo de transação não informado');
    }
    if (tipo === "entrada" || tipo === "saida") {
        try {

            const queryTipoCategorias = 'select * from categorias where id = $1';
            const categoriaBusca = await conexao.query(queryTipoCategorias, [categoria_id]);

            if (categoriaBusca.rowCount === 0) {
                return res.status(404).json('A categoria não foi encontrada');
            }

            const categoriaNome = categoriaBusca.rows[0].descricao;

            const existeTransacao = await conexao.query('select * from transacoes where id = $1 and usuario_id = $2', [id, usuario.id]);

            if (existeTransacao.rowCount === 0) {
                return res.status(404).json('A transação não foi encontrada na base de dados');
            }

            const queryAtualizarTransacao = 'update transacoes set descricao = $1, valor = $2 , data_transacao = $3 , categoria_id = $4 ,usuario_id = $5, tipo = $6, categoria_nome = $7 where id = $8 ';
            const { rowCount } = await conexao.query(queryAtualizarTransacao, [descricao, valor, data, categoria_id, usuario.id, tipo, categoriaNome, id]);

            if (rowCount === 0) {
                return res.status(400).json('Não foi possível atualizar a transação');
            }

            return res.status(200).json();

        } catch (error) {
            return res.status(400).json(error.message);
        }

    } else {
        return res.status(400).json('Tipo de transação incorreto');
    }

};

const excluirTransacao = async (req, res) => {

    const { id } = req.params;
    const { usuario } = req;

    try {
        const existeTransacao = await conexao.query('select * from transacoes where id = $1 and usuario_id = $2', [id, usuario.id]);

        if (existeTransacao.rowCount === 0) {
            return res.status(404).json('Transação não encontrada.');
        }

        const query = 'delete from transacoes where id = $1 and usuario_id = $2 ';
        const { rowCount } = await conexao.query(query, [id, usuario.id]);

        if (rowCount === 0) {
            return res.status(400).json('Não foi possível excluir a transação');
        }

        return res.status(200).json();

    } catch (error) {
        return res.status(400).json(error.message);
    }
};

const obterExtrato = async (req, res) => {
    const { usuario } = req;

    try {

        const queryEntrada = "select sum(valor) from transacoes where usuario_id = $1 and tipo = 'entrada'";
        const somaEntrada = await conexao.query(queryEntrada, [usuario.id]);

        if (somaEntrada.rowCount === 0) {
            return res.status(400).json('Não foi possível realizar a soma de entradas de valores');
        }

        let totalEntrada = somaEntrada.rows[0].sum;

        if (!totalEntrada) {
            totalEntrada = 0;
        }

        const querySaida = "select sum(valor) from transacoes where usuario_id = $1 and tipo = 'saida'";
        const somaSaida = await conexao.query(querySaida, [usuario.id]);

        if (somaSaida.rowCount === 0) {
            return res.status(400).json('Não foi possível realizar a soma de saidas de valores');
        }

        let totalSaida = somaSaida.rows[0].sum;

        if (!totalSaida) {
            totalSaida = 0;
        }

        const extrato = {
            entrada: totalEntrada,
            saida: totalSaida
        }

        return res.status(200).json(extrato);

    } catch (error) {
        return res.status(400).json(error.message);
    }


};

module.exports = {
    listarTransacoes,
    detalharTransacoes,
    cadastarTransacao,
    atualizarTransacao,
    excluirTransacao,
    obterExtrato
};

//