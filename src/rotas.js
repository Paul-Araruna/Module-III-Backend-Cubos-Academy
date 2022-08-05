const express = require('express');
const usuario = require('./controladores/usuario');
const filtroDeNavegacao = require('./filtros/filtroDeNavegacao');
const categorias = require('./controladores/categorias');
const transacoes = require('./controladores/transacoes');


const rotas = express();

rotas.post('/usuario', usuario.cadastrarUsuario);
rotas.post('/login', usuario.login);


rotas.use(filtroDeNavegacao.filtroDeNavegacao);

rotas.get('/usuario', usuario.detalharUsuario);
rotas.put('/usuario', usuario.atualizarUsuario);

rotas.get('/categoria', categorias.listarCategorias);

rotas.get('/transacao', transacoes.listarTransacoes);
rotas.get('/transacao/extrato', transacoes.obterExtrato);
rotas.get('/transacao/:id', transacoes.detalharTransacoes);
rotas.post('/transacao', transacoes.cadastarTransacao);
rotas.put('/transacao/:id', transacoes.atualizarTransacao);
rotas.delete('/transacao/:id', transacoes.excluirTransacao);


module.exports = rotas;

//