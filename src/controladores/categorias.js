const conexao = require('../conexao');

const listarCategorias = async (req, res) => {

    try {

        const query = 'select * from categorias';
        const listaDeCategorias = await conexao.query(query);

        return res.status(200).json(listaDeCategorias.rows);

    } catch (error) {
        return res.status(400).json(error.message);
    }
};


module.exports = {
    listarCategorias
};

//