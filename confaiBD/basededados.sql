

-- Tabela para o tipo de utilizador
CREATE TYPE user_type_enum AS ENUM ('admin', 'user');

-- Tabela de utilizadores
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  user_nome VARCHAR(100) NOT NULL,
  user_email VARCHAR(100) NOT NULL UNIQUE,
  user_password VARCHAR(255) NOT NULL,
  user_type user_type_enum DEFAULT 'user'
);

-- Tabela de eventos
CREATE TABLE eventos ( 
  evento_id SERIAL PRIMARY KEY,
  evento_nome VARCHAR(100) NOT NULL,
  evento_localizacao VARCHAR(200),
  evento_data DATE NOT NULL, 
  evento_criado INT,  -- id do utilizador que cria o evento
  evento_descricao TEXT,  
  evento_hora TIME,
  FOREIGN KEY (evento_criado) REFERENCES users(user_id)
);

-- Tabela de tipos de eventos
CREATE TABLE tipoevento ( 
  tipo_id SERIAL PRIMARY KEY,
  tipo_nome VARCHAR(100) NOT NULL
);

-- Tabela de recomendações
CREATE TABLE recomendacao ( 
  reco_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL, 
  evento_id INT NOT NULL,
  mensagem TEXT, 
  data_recomendacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (evento_id) REFERENCES eventos(evento_id)
);


INSERT INTO tipoevento (tipo_nome)
VALUES ('Festa'), ('Reunião');

select * from tipoevento

INSERT INTO users (user_nome, user_email, user_password, user_type) 
VALUES ('Pedro Dias', 'pedro@gmail.com', '12345', 'admin');

Select * From users

INSERT INTO eventos (evento_nome, evento_localizacao, evento_data, evento_hora, evento_criado)
VALUES ('Party', 'Lisboa', '2025-05-13', '15:00', 1)

Select * From eventos 

INSERT INTO recomendacao (user_id, evento_id, mensagem)
VALUES (1, 1, 'Adorei este evento, Incrivel!');

SELECT * FROM recomendacao 