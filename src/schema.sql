drop table if exists usuarios;

create table usuarios (
	id serial primary key not null,
  	nome text not null,
  	email text not null,
  	senha text not null  
);




drop table if exists categorias;

create table categorias (
	id serial primary key not null,
  	descricao text not null  
);



insert into categorias (descricao) values
('Alimentaçao') , ('Casa') , 
('Educação') , ('Lazer') , 
('Saúde') , ('Transporte'),
('Salário') , ('Outras receitas') , ('Outras despesas');




drop table if exists transacoes;

create table transacoes (
	id serial primary key not null ,
    descricao text not null,
  	valor integer  not null,
  	data_transacao timestamptz not null,
  	categoria_id integer not null references categorias (id),
  	usuario_id integer not null references usuarios (id),
  	tipos text not null
);

alter table transacoes
add column categoria_nome text;