-- ============================================================================
-- ============================================================================
--
--   CAC LTDA. — SISTEMA DE COMPRAS
--   BANCO DE DADOS — ESQUEMA CONSOLIDADO E AUTORITATIVO
--   Versão 2 (pós-correções da 1ª entrega)
--
-- ============================================================================
--
--   Este é o ARQUIVO ÚNICO E DEFINITIVO do banco de dados. Ele reúne, em
--   ordem de execução, os cinco módulos do projeto. Qualquer código de
--   aplicação que toque o banco deve usar ESTE arquivo como referência.
--
--   AMBIENTE:
--     - Azure SQL Database, compatibility level 150 (SQL Server 2019)
--     - Conecte-se ao database de destino antes de executar
--     - Execute o arquivo inteiro, de cima para baixo, em um banco limpo
--
--   CONTEÚDO (12 tabelas · 47 procedures · 10 views · 3 triggers · 2 TVPs):
--     MÓDULO 1 — Esquema, índices, TVPs, procedures base, views R1-R5
--     MÓDULO 2 — Relatórios R6 e R7
--     MÓDULO 3 — Log de auditoria, triggers, relatórios R8 e R9
--     MÓDULO 4 — Autenticação: tabelas Perfil e Usuario, procedures de login
--     MÓDULO 5 — Procedures de consulta, edição, inativação e relatórios
--
--   A ORDEM IMPORTA: o Módulo 5 referencia views e tabelas criadas nos
--   módulos anteriores. Não reordene.
--
-- ============================================================================
-- ============================================================================




-- ############################################################################
-- ###  MÓDULO 1 de 5 — ESQUEMA, PROCEDURES BASE, TVPs E RELATÓRIOS R1-R5
-- ############################################################################


-- ============================================================
-- CAC Ltda. — Sistema de Compras
-- DDL v2.0  (refatorado após feedback do professor)
-- SQL Server 2019/2021
-- ============================================================
-- MUDANÇAS vs v1.0:
--   1. Entrada  -> EntradaCabecalho + ItemEntrada
--   2. Saida    -> SaidaCabecalho   + ItemSaida
--   3. Fornecedor.endereco -> 7 campos atômicos (3FN/1FN)
--   4. SetorGrupo eliminada -> view derivada de movimentos reais
--   5. SPs de movimentação reescritas com TVP (Table-Valued Parameter)
--      permitindo registrar uma nota inteira em uma única transação
-- ============================================================


-- ============================================================
-- TABELAS DE CADASTRO
-- ============================================================

CREATE TABLE Grupo (
    id_grupo    INT          IDENTITY(1,1) NOT NULL,
    nome        VARCHAR(100) NOT NULL,
    descricao   VARCHAR(200) NULL,
    CONSTRAINT PK_Grupo PRIMARY KEY CLUSTERED (id_grupo)
);
GO

CREATE TABLE Setor (
    id_setor    INT          IDENTITY(1,1) NOT NULL,
    nome        VARCHAR(100) NOT NULL,
    descricao   VARCHAR(200) NULL,
    ativo       BIT          NOT NULL DEFAULT 1,
    CONSTRAINT PK_Setor PRIMARY KEY CLUSTERED (id_setor)
);
GO

-- ------------------------------------------------------------
-- Fornecedor: endereço DECOMPOSTO (atende 1FN/3FN)
-- ------------------------------------------------------------
CREATE TABLE Fornecedor (
    id_fornecedor   INT          IDENTITY(1,1) NOT NULL,
    razao_social    VARCHAR(150) NOT NULL,
    cnpj            CHAR(14)     NOT NULL,
    telefone        VARCHAR(20)  NULL,
    email           VARCHAR(100) NULL,
    -- endereço atômico
    logradouro      VARCHAR(150) NULL,
    numero          VARCHAR(10)  NULL,
    complemento     VARCHAR(50)  NULL,
    bairro          VARCHAR(80)  NULL,
    cidade          VARCHAR(80)  NULL,
    uf              CHAR(2)      NULL,
    cep             CHAR(8)      NULL,
    ativo           BIT          NOT NULL DEFAULT 1,
    CONSTRAINT PK_Fornecedor      PRIMARY KEY CLUSTERED (id_fornecedor),
    CONSTRAINT UQ_Fornecedor_CNPJ UNIQUE (cnpj),
    CONSTRAINT CK_Fornecedor_UF   CHECK (uf IS NULL OR LEN(uf) = 2),
    CONSTRAINT CK_Fornecedor_CEP  CHECK (cep IS NULL OR LEN(cep) = 8)
);
GO

CREATE TABLE Produto (
    id_produto      INT           IDENTITY(1,1) NOT NULL,
    id_grupo        INT           NOT NULL,
    nome            VARCHAR(150)  NOT NULL,
    descricao       VARCHAR(300)  NULL,
    unidade_medida  VARCHAR(20)   NOT NULL,
    estoque_minimo  DECIMAL(10,3) NOT NULL DEFAULT 0,
    saldo           DECIMAL(10,3) NOT NULL DEFAULT 0,
    preco_medio     DECIMAL(10,4) NOT NULL DEFAULT 0,
    ativo           BIT           NOT NULL DEFAULT 1,
    CONSTRAINT PK_Produto            PRIMARY KEY CLUSTERED (id_produto),
    CONSTRAINT FK_Produto_Grupo      FOREIGN KEY (id_grupo) REFERENCES Grupo(id_grupo),
    CONSTRAINT CK_Produto_Saldo      CHECK (saldo >= 0),
    CONSTRAINT CK_Produto_EstMin     CHECK (estoque_minimo >= 0),
    CONSTRAINT CK_Produto_PrecoMedio CHECK (preco_medio >= 0)
);
GO

CREATE TABLE FornecedorProduto (
    id_fornecedor_produto INT IDENTITY(1,1) NOT NULL,
    id_fornecedor         INT NOT NULL,
    id_produto            INT NOT NULL,
    ativo                 BIT NOT NULL DEFAULT 1,
    CONSTRAINT PK_FornecedorProduto   PRIMARY KEY CLUSTERED (id_fornecedor_produto),
    CONSTRAINT FK_FornProd_Fornecedor FOREIGN KEY (id_fornecedor) REFERENCES Fornecedor(id_fornecedor),
    CONSTRAINT FK_FornProd_Produto    FOREIGN KEY (id_produto)    REFERENCES Produto(id_produto),
    CONSTRAINT UQ_FornecedorProduto   UNIQUE (id_fornecedor, id_produto)
);
GO

-- ------------------------------------------------------------
-- SetorGrupo: ELIMINADA
-- Substituída pela view vw_SetorGrupo (no final), que deriva a
-- relação Setor x Grupo do consumo real (ItemSaida), eliminando
-- redundância e a interpretação ambígua de "grupo pertence a setor".
-- ------------------------------------------------------------


-- ============================================================
-- TABELAS DE MOVIMENTAÇÃO  (cabeçalho + itens)
-- ============================================================

-- ------------------------------------------------------------
-- ENTRADA: cabeçalho (1 NF) + itens (N produtos da mesma NF)
-- ------------------------------------------------------------
CREATE TABLE EntradaCabecalho (
    id_entrada          INT          IDENTITY(1,1) NOT NULL,
    id_fornecedor       INT          NOT NULL,
    data_entrada        DATETIME     NOT NULL DEFAULT GETDATE(),
    numero_nota_fiscal  VARCHAR(50)  NULL,
    observacao          VARCHAR(300) NULL,
    CONSTRAINT PK_EntradaCabecalho        PRIMARY KEY CLUSTERED (id_entrada),
    CONSTRAINT FK_EntradaCab_Fornecedor   FOREIGN KEY (id_fornecedor) REFERENCES Fornecedor(id_fornecedor)
);
GO

CREATE TABLE ItemEntrada (
    id_item_entrada     INT           IDENTITY(1,1) NOT NULL,
    id_entrada          INT           NOT NULL,
    id_produto          INT           NOT NULL,
    quantidade          DECIMAL(10,3) NOT NULL,
    preco_unitario      DECIMAL(10,4) NOT NULL,
    CONSTRAINT PK_ItemEntrada          PRIMARY KEY CLUSTERED (id_item_entrada),
    CONSTRAINT FK_ItemEntrada_Entrada  FOREIGN KEY (id_entrada) REFERENCES EntradaCabecalho(id_entrada),
    CONSTRAINT FK_ItemEntrada_Produto  FOREIGN KEY (id_produto) REFERENCES Produto(id_produto),
    CONSTRAINT CK_ItemEntrada_Qtd      CHECK (quantidade > 0),
    CONSTRAINT CK_ItemEntrada_Preco    CHECK (preco_unitario > 0)
);
GO

-- ------------------------------------------------------------
-- SAÍDA: cabeçalho (1 requisição) + itens (N produtos)
-- ------------------------------------------------------------
CREATE TABLE SaidaCabecalho (
    id_saida    INT          IDENTITY(1,1) NOT NULL,
    id_setor    INT          NOT NULL,
    data_saida  DATETIME     NOT NULL DEFAULT GETDATE(),
    observacao  VARCHAR(300) NULL,
    CONSTRAINT PK_SaidaCabecalho     PRIMARY KEY CLUSTERED (id_saida),
    CONSTRAINT FK_SaidaCab_Setor     FOREIGN KEY (id_setor) REFERENCES Setor(id_setor)
);
GO

CREATE TABLE ItemSaida (
    id_item_saida          INT           IDENTITY(1,1) NOT NULL,
    id_saida               INT           NOT NULL,
    id_produto             INT           NOT NULL,
    quantidade             DECIMAL(10,3) NOT NULL,
    preco_medio_unitario   DECIMAL(10,4) NOT NULL,  -- snapshot histórico do PM
    CONSTRAINT PK_ItemSaida         PRIMARY KEY CLUSTERED (id_item_saida),
    CONSTRAINT FK_ItemSaida_Saida   FOREIGN KEY (id_saida)   REFERENCES SaidaCabecalho(id_saida),
    CONSTRAINT FK_ItemSaida_Produto FOREIGN KEY (id_produto) REFERENCES Produto(id_produto),
    CONSTRAINT CK_ItemSaida_Qtd     CHECK (quantidade > 0),
    CONSTRAINT CK_ItemSaida_PM      CHECK (preco_medio_unitario >= 0)
);
GO


-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE NONCLUSTERED INDEX IDX_Produto_Grupo         ON Produto(id_grupo);
CREATE NONCLUSTERED INDEX IDX_FornProd_Produto      ON FornecedorProduto(id_produto);
CREATE NONCLUSTERED INDEX IDX_FornProd_Fornecedor   ON FornecedorProduto(id_fornecedor);
CREATE NONCLUSTERED INDEX IDX_EntradaCab_Fornecedor ON EntradaCabecalho(id_fornecedor);
CREATE NONCLUSTERED INDEX IDX_EntradaCab_Data       ON EntradaCabecalho(data_entrada);
CREATE NONCLUSTERED INDEX IDX_ItemEntrada_Entrada   ON ItemEntrada(id_entrada);
CREATE NONCLUSTERED INDEX IDX_ItemEntrada_Produto   ON ItemEntrada(id_produto);
CREATE NONCLUSTERED INDEX IDX_SaidaCab_Setor        ON SaidaCabecalho(id_setor);
CREATE NONCLUSTERED INDEX IDX_SaidaCab_Data         ON SaidaCabecalho(data_saida);
CREATE NONCLUSTERED INDEX IDX_ItemSaida_Saida       ON ItemSaida(id_saida);
CREATE NONCLUSTERED INDEX IDX_ItemSaida_Produto     ON ItemSaida(id_produto);
GO


-- ============================================================
-- TVPs (Table-Valued Parameters) p/ as SPs de movimentação
-- ============================================================
CREATE TYPE TVP_ItensEntrada AS TABLE (
    id_produto     INT           NOT NULL,
    quantidade     DECIMAL(10,3) NOT NULL,
    preco_unitario DECIMAL(10,4) NOT NULL
);
GO

CREATE TYPE TVP_ItensSaida AS TABLE (
    id_produto INT           NOT NULL,
    quantidade DECIMAL(10,3) NOT NULL
);
GO


-- ============================================================
-- STORED PROCEDURES — CADASTRO
-- ============================================================

CREATE PROCEDURE sp_CadastrarFornecedor
    @razao_social VARCHAR(150),
    @cnpj         CHAR(14),
    @telefone     VARCHAR(20)  = NULL,
    @email        VARCHAR(100) = NULL,
    @logradouro   VARCHAR(150) = NULL,
    @numero       VARCHAR(10)  = NULL,
    @complemento  VARCHAR(50)  = NULL,
    @bairro       VARCHAR(80)  = NULL,
    @cidade       VARCHAR(80)  = NULL,
    @uf           CHAR(2)      = NULL,
    @cep          CHAR(8)      = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM Fornecedor WHERE cnpj = @cnpj)
    BEGIN
        RAISERROR('Já existe um fornecedor cadastrado com este CNPJ.', 16, 1);
        RETURN;
    END

    INSERT INTO Fornecedor
        (razao_social, cnpj, telefone, email,
         logradouro, numero, complemento, bairro, cidade, uf, cep)
    VALUES
        (@razao_social, @cnpj, @telefone, @email,
         @logradouro, @numero, @complemento, @bairro, @cidade, @uf, @cep);

    SELECT SCOPE_IDENTITY() AS id_fornecedor_criado;
END;
GO

CREATE PROCEDURE sp_CadastrarGrupo
    @nome      VARCHAR(100),
    @descricao VARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Grupo (nome, descricao) VALUES (@nome, @descricao);
    SELECT SCOPE_IDENTITY() AS id_grupo_criado;
END;
GO

CREATE PROCEDURE sp_CadastrarSetor
    @nome      VARCHAR(100),
    @descricao VARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Setor (nome, descricao) VALUES (@nome, @descricao);
    SELECT SCOPE_IDENTITY() AS id_setor_criado;
END;
GO

CREATE PROCEDURE sp_CadastrarProduto
    @id_grupo       INT,
    @nome           VARCHAR(150),
    @descricao      VARCHAR(300)  = NULL,
    @unidade_medida VARCHAR(20),
    @estoque_minimo DECIMAL(10,3) = 0
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Grupo WHERE id_grupo = @id_grupo)
    BEGIN
        RAISERROR('Grupo informado não existe.', 16, 1);
        RETURN;
    END

    INSERT INTO Produto (id_grupo, nome, descricao, unidade_medida, estoque_minimo)
    VALUES (@id_grupo, @nome, @descricao, @unidade_medida, @estoque_minimo);

    SELECT SCOPE_IDENTITY() AS id_produto_criado;
END;
GO

CREATE PROCEDURE sp_AssociarFornecedorProduto
    @id_fornecedor INT,
    @id_produto    INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Fornecedor WHERE id_fornecedor = @id_fornecedor AND ativo = 1)
    BEGIN
        RAISERROR('Fornecedor não encontrado ou inativo.', 16, 1);
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM Produto WHERE id_produto = @id_produto AND ativo = 1)
    BEGIN
        RAISERROR('Produto não encontrado ou inativo.', 16, 1);
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM FornecedorProduto
               WHERE id_fornecedor = @id_fornecedor AND id_produto = @id_produto)
    BEGIN
        RAISERROR('Associação entre fornecedor e produto já existe.', 16, 1);
        RETURN;
    END

    INSERT INTO FornecedorProduto (id_fornecedor, id_produto)
    VALUES (@id_fornecedor, @id_produto);
END;
GO


-- ============================================================
-- STORED PROCEDURES — MOVIMENTAÇÃO (refatoradas com TVP)
-- ============================================================

-- ------------------------------------------------------------
-- sp_RegistrarEntrada
--   Recebe 1 cabeçalho + N itens via TVP.
--   Faz tudo em uma única transação:
--     1) valida fornecedor e itens
--     2) insere EntradaCabecalho
--     3) insere ItemEntrada (todos os itens)
--     4) atualiza saldo e preço médio ponderado para cada
--        produto envolvido (agrupado caso o mesmo produto venha
--        mais de uma vez no mesmo cabeçalho)
--   Fórmula do PM ponderado:
--     novo_pm = (saldo*pm + soma(qtd*preco)) / (saldo + soma(qtd))
-- ------------------------------------------------------------
CREATE PROCEDURE sp_RegistrarEntrada
    @id_fornecedor      INT,
    @numero_nota_fiscal VARCHAR(50)  = NULL,
    @observacao         VARCHAR(300) = NULL,
    @itens              TVP_ItensEntrada READONLY
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    BEGIN TRANSACTION;

    BEGIN TRY

        -- Validações --------------------------------------------------
        IF NOT EXISTS (SELECT 1 FROM Fornecedor WHERE id_fornecedor = @id_fornecedor AND ativo = 1)
        BEGIN
            RAISERROR('Fornecedor não encontrado ou inativo.', 16, 1);
            ROLLBACK TRANSACTION; RETURN;
        END

        IF NOT EXISTS (SELECT 1 FROM @itens)
        BEGIN
            RAISERROR('A entrada precisa ter pelo menos um item.', 16, 1);
            ROLLBACK TRANSACTION; RETURN;
        END

        IF EXISTS (SELECT 1 FROM @itens WHERE quantidade <= 0 OR preco_unitario <= 0)
        BEGIN
            RAISERROR('Quantidade e preço unitário precisam ser maiores que zero.', 16, 1);
            ROLLBACK TRANSACTION; RETURN;
        END

        IF EXISTS (
            SELECT 1 FROM @itens i
            WHERE NOT EXISTS (
                SELECT 1 FROM Produto p
                WHERE p.id_produto = i.id_produto AND p.ativo = 1
            )
        )
        BEGIN
            RAISERROR('Um ou mais produtos não existem ou estão inativos.', 16, 1);
            ROLLBACK TRANSACTION; RETURN;
        END

        -- Cabeçalho ---------------------------------------------------
        INSERT INTO EntradaCabecalho (id_fornecedor, numero_nota_fiscal, observacao)
        VALUES (@id_fornecedor, @numero_nota_fiscal, @observacao);

        DECLARE @id_entrada INT = SCOPE_IDENTITY();

        -- Itens -------------------------------------------------------
        INSERT INTO ItemEntrada (id_entrada, id_produto, quantidade, preco_unitario)
        SELECT @id_entrada, id_produto, quantidade, preco_unitario
        FROM @itens;

        -- Recálculo de saldo e PM ponderado --------------------------
        -- Agrupado por produto para suportar o mesmo produto aparecer
        -- em múltiplas linhas do TVP.
        ;WITH AggItens AS (
            SELECT
                id_produto,
                SUM(quantidade)                  AS qtd_total,
                SUM(quantidade * preco_unitario) AS valor_total
            FROM @itens
            GROUP BY id_produto
        )
        UPDATE p
        SET
            preco_medio = (p.saldo * p.preco_medio + a.valor_total)
                          / (p.saldo + a.qtd_total),
            saldo       = p.saldo + a.qtd_total
        FROM Produto p
        INNER JOIN AggItens a ON a.id_produto = p.id_produto;

        COMMIT TRANSACTION;

        SELECT @id_entrada AS id_entrada_criada;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- ------------------------------------------------------------
-- sp_RegistrarSaida
--   1 cabeçalho + N itens, transacional.
--   Bloqueia se algum item levar o saldo abaixo de zero.
--   Cada item registra snapshot do preço médio vigente.
-- ------------------------------------------------------------
CREATE PROCEDURE sp_RegistrarSaida
    @id_setor    INT,
    @observacao  VARCHAR(300) = NULL,
    @itens       TVP_ItensSaida READONLY
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    BEGIN TRANSACTION;

    BEGIN TRY

        -- Validações --------------------------------------------------
        IF NOT EXISTS (SELECT 1 FROM Setor WHERE id_setor = @id_setor AND ativo = 1)
        BEGIN
            RAISERROR('Setor não encontrado ou inativo.', 16, 1);
            ROLLBACK TRANSACTION; RETURN;
        END

        IF NOT EXISTS (SELECT 1 FROM @itens)
        BEGIN
            RAISERROR('A saída precisa ter pelo menos um item.', 16, 1);
            ROLLBACK TRANSACTION; RETURN;
        END

        IF EXISTS (SELECT 1 FROM @itens WHERE quantidade <= 0)
        BEGIN
            RAISERROR('Quantidade precisa ser maior que zero.', 16, 1);
            ROLLBACK TRANSACTION; RETURN;
        END

        -- Verifica saldo p/ todos os produtos (somando duplicatas)
        IF EXISTS (
            SELECT 1
            FROM (
                SELECT id_produto, SUM(quantidade) AS qtd_total
                FROM @itens
                GROUP BY id_produto
            ) a
            INNER JOIN Produto p ON p.id_produto = a.id_produto
            WHERE p.ativo = 0 OR p.saldo < a.qtd_total
        )
        BEGIN
            RAISERROR('Saldo insuficiente ou produto inativo em pelo menos um item.', 16, 1);
            ROLLBACK TRANSACTION; RETURN;
        END

        -- Cabeçalho ---------------------------------------------------
        INSERT INTO SaidaCabecalho (id_setor, observacao)
        VALUES (@id_setor, @observacao);

        DECLARE @id_saida INT = SCOPE_IDENTITY();

        -- Itens (com snapshot do PM atual de cada produto) ------------
        INSERT INTO ItemSaida (id_saida, id_produto, quantidade, preco_medio_unitario)
        SELECT
            @id_saida,
            i.id_produto,
            i.quantidade,
            p.preco_medio
        FROM @itens i
        INNER JOIN Produto p ON p.id_produto = i.id_produto;

        -- Decrementa saldo --------------------------------------------
        ;WITH AggItens AS (
            SELECT id_produto, SUM(quantidade) AS qtd_total
            FROM @itens
            GROUP BY id_produto
        )
        UPDATE p
        SET saldo = p.saldo - a.qtd_total
        FROM Produto p
        INNER JOIN AggItens a ON a.id_produto = p.id_produto;

        COMMIT TRANSACTION;

        SELECT @id_saida AS id_saida_criada;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO


-- ============================================================
-- VIEWS DE RELATÓRIO  (atualizadas para o novo esquema)
-- ============================================================

-- ------------------------------------------------------------
-- Relatório 1 — Consumo por setor
-- ------------------------------------------------------------
CREATE VIEW vw_ConsumoPorSetor AS
    SELECT
        s.id_setor,
        s.nome                                              AS setor,
        p.id_produto,
        p.nome                                              AS produto,
        g.nome                                              AS grupo,
        SUM(ise.quantidade)                                 AS qtd_consumida,
        SUM(ise.quantidade * ise.preco_medio_unitario)      AS valor_consumido
    FROM ItemSaida ise
    INNER JOIN SaidaCabecalho sc ON sc.id_saida   = ise.id_saida
    INNER JOIN Setor          s  ON s.id_setor    = sc.id_setor
    INNER JOIN Produto        p  ON p.id_produto  = ise.id_produto
    INNER JOIN Grupo          g  ON g.id_grupo    = p.id_grupo
    GROUP BY s.id_setor, s.nome, p.id_produto, p.nome, g.nome;
GO

-- ------------------------------------------------------------
-- Relatório 2 — Ficha do produto (entradas + saídas unificadas)
-- ------------------------------------------------------------
CREATE VIEW vw_FichaProduto AS
    SELECT
        p.id_produto,
        p.nome                                AS produto,
        'ENTRADA'                             AS tipo_movimento,
        ec.data_entrada                       AS data_movimento,
        ie.quantidade,
        ie.preco_unitario                     AS preco_unitario,
        ie.quantidade * ie.preco_unitario     AS valor_total,
        f.razao_social                        AS fornecedor_ou_setor,
        ec.numero_nota_fiscal                 AS referencia
    FROM ItemEntrada ie
    INNER JOIN EntradaCabecalho ec ON ec.id_entrada    = ie.id_entrada
    INNER JOIN Produto          p  ON p.id_produto     = ie.id_produto
    INNER JOIN Fornecedor       f  ON f.id_fornecedor  = ec.id_fornecedor

    UNION ALL

    SELECT
        p.id_produto,
        p.nome                                          AS produto,
        'SAIDA'                                         AS tipo_movimento,
        sc.data_saida                                   AS data_movimento,
        ise.quantidade,
        ise.preco_medio_unitario                        AS preco_unitario,
        ise.quantidade * ise.preco_medio_unitario       AS valor_total,
        s.nome                                          AS fornecedor_ou_setor,
        NULL                                            AS referencia
    FROM ItemSaida ise
    INNER JOIN SaidaCabecalho sc ON sc.id_saida    = ise.id_saida
    INNER JOIN Produto        p  ON p.id_produto   = ise.id_produto
    INNER JOIN Setor          s  ON s.id_setor     = sc.id_setor;
GO

-- ------------------------------------------------------------
-- Relatório 3 — Fornecedores por produto (inalterado)
-- ------------------------------------------------------------
CREATE VIEW vw_FornecedoresPorProduto AS
    SELECT
        p.id_produto,
        p.nome           AS produto,
        g.nome           AS grupo,
        f.id_fornecedor,
        f.razao_social   AS fornecedor,
        f.cnpj,
        f.telefone,
        f.email,
        fp.ativo         AS associacao_ativa
    FROM FornecedorProduto fp
    INNER JOIN Produto    p ON p.id_produto    = fp.id_produto
    INNER JOIN Fornecedor f ON f.id_fornecedor = fp.id_fornecedor
    INNER JOIN Grupo      g ON g.id_grupo      = p.id_grupo
    WHERE p.ativo = 1 AND f.ativo = 1;
GO

-- ------------------------------------------------------------
-- Relatório 4 — Produtos em falta (inalterado)
-- ------------------------------------------------------------
CREATE VIEW vw_ProdutosEmFalta AS
    SELECT
        p.id_produto,
        p.nome                              AS produto,
        g.nome                              AS grupo,
        p.unidade_medida,
        p.saldo                             AS saldo_atual,
        p.estoque_minimo,
        p.estoque_minimo - p.saldo          AS qtd_em_falta,
        p.preco_medio
    FROM Produto p
    INNER JOIN Grupo g ON g.id_grupo = p.id_grupo
    WHERE p.ativo = 1 AND p.saldo < p.estoque_minimo;
GO

-- ------------------------------------------------------------
-- Relatório 5 — Menor preço de compra por produto
-- (refeito sobre EntradaCabecalho + ItemEntrada)
-- ------------------------------------------------------------
CREATE VIEW vw_MenorPrecoPorProduto AS
    WITH UltimoPrecoPorFornecedor AS (
        SELECT
            ie.id_produto,
            ec.id_fornecedor,
            ie.preco_unitario,
            ec.data_entrada,
            ROW_NUMBER() OVER (
                PARTITION BY ie.id_produto, ec.id_fornecedor
                ORDER BY ec.data_entrada DESC
            ) AS rn
        FROM ItemEntrada ie
        INNER JOIN EntradaCabecalho ec ON ec.id_entrada = ie.id_entrada
    ),
    MenorPreco AS (
        SELECT id_produto, MIN(preco_unitario) AS menor_preco
        FROM UltimoPrecoPorFornecedor
        WHERE rn = 1
        GROUP BY id_produto
    )
    SELECT
        p.id_produto,
        p.nome              AS produto,
        g.nome              AS grupo,
        f.id_fornecedor,
        f.razao_social      AS fornecedor,
        f.cnpj,
        f.telefone,
        up.preco_unitario   AS menor_preco,
        up.data_entrada     AS data_ultima_compra
    FROM MenorPreco mp
    INNER JOIN UltimoPrecoPorFornecedor up
        ON up.id_produto      = mp.id_produto
       AND up.preco_unitario  = mp.menor_preco
       AND up.rn              = 1
    INNER JOIN Produto    p ON p.id_produto    = up.id_produto
    INNER JOIN Fornecedor f ON f.id_fornecedor = up.id_fornecedor
    INNER JOIN Grupo      g ON g.id_grupo      = p.id_grupo
    WHERE p.ativo = 1 AND f.ativo = 1;
GO

-- ------------------------------------------------------------
-- vw_SetorGrupo  (SUBSTITUI a tabela eliminada)
-- Deriva, a partir das saídas reais, quais grupos cada setor
-- de fato consome. Mais fiel à realidade que um cadastro estático.
-- ------------------------------------------------------------
CREATE VIEW vw_SetorGrupo AS
    SELECT DISTINCT
        s.id_setor,
        s.nome    AS setor,
        g.id_grupo,
        g.nome    AS grupo
    FROM ItemSaida ise
    INNER JOIN SaidaCabecalho sc ON sc.id_saida    = ise.id_saida
    INNER JOIN Setor          s  ON s.id_setor     = sc.id_setor
    INNER JOIN Produto        p  ON p.id_produto   = ise.id_produto
    INNER JOIN Grupo          g  ON g.id_grupo     = p.id_grupo;
GO


-- ============================================================
-- EXEMPLOS DE USO DAS SPs COM TVP
-- ============================================================
/*
-- Entrada com 3 itens da mesma NF
DECLARE @itens TVP_ItensEntrada;
INSERT INTO @itens (id_produto, quantidade, preco_unitario) VALUES
    (1, 100, 12.50),
    (2,  50,  8.30),
    (3,  20, 45.00);

EXEC sp_RegistrarEntrada
    @id_fornecedor      = 1,
    @numero_nota_fiscal = 'NF-000123',
    @observacao         = 'Compra mensal',
    @itens              = @itens;

-- Saída com 2 itens (uma requisição do setor)
DECLARE @saida TVP_ItensSaida;
INSERT INTO @saida (id_produto, quantidade) VALUES
    (1, 10),
    (2,  5);

EXEC sp_RegistrarSaida
    @id_setor    = 1,
    @observacao  = 'Requisição semanal',
    @itens       = @saida;
*/


-- ############################################################################
-- ###  MÓDULO 2 de 5 — RELATÓRIOS ADICIONAIS R6 E R7
-- ############################################################################


-- ============================================================
-- CAC Ltda. — Relatórios adicionais (v2.1)
-- Para rodar APÓS o cac_ddl_v2.sql
-- ============================================================
-- Atende ao feedback do professor:
--   "Poderiam ter criado relatório como produtos mais demandados,
--    histórico de preço de um produto, etc..."
-- ============================================================


-- ------------------------------------------------------------
-- RELATÓRIO 6 — Produtos Mais Demandados
-- ------------------------------------------------------------
-- SP parametrizada que devolve o Top N produtos mais consumidos.
--
-- Parâmetros (todos opcionais exceto @criterio que tem default):
--   @top_n        : quantos retornar (default 10)
--   @data_inicio  : filtra saídas a partir desta data
--   @data_fim     : filtra saídas até esta data
--   @id_grupo     : restringe a um grupo de produtos
--   @id_setor     : restringe a um setor consumidor
--   @criterio     : 'VALOR' (default) ou 'QUANTIDADE'
--
-- Retorna métricas combinadas — quantidade consumida, valor
-- consumido, número de setores que usaram, número de saídas,
-- primeira/última saída, saldo atual — para apoiar decisão
-- de compra e priorização.
-- ------------------------------------------------------------
CREATE PROCEDURE sp_ProdutosMaisDemandados
    @top_n        INT          = 10,
    @data_inicio  DATETIME     = NULL,
    @data_fim     DATETIME     = NULL,
    @id_grupo     INT          = NULL,
    @id_setor     INT          = NULL,
    @criterio     VARCHAR(20)  = 'VALOR'
AS
BEGIN
    SET NOCOUNT ON;

    IF @criterio NOT IN ('VALOR', 'QUANTIDADE')
    BEGIN
        RAISERROR('Critério inválido. Use ''VALOR'' ou ''QUANTIDADE''.', 16, 1);
        RETURN;
    END

    IF @top_n <= 0
    BEGIN
        RAISERROR('Top N deve ser maior que zero.', 16, 1);
        RETURN;
    END

    SELECT TOP (@top_n)
        p.id_produto,
        p.nome                                          AS produto,
        g.nome                                          AS grupo,
        p.unidade_medida,
        SUM(ise.quantidade)                             AS qtd_total_consumida,
        SUM(ise.quantidade * ise.preco_medio_unitario)  AS valor_total_consumido,
        COUNT(DISTINCT sc.id_setor)                     AS setores_consumidores,
        COUNT(DISTINCT ise.id_saida)                    AS num_saidas,
        MIN(sc.data_saida)                              AS primeira_saida,
        MAX(sc.data_saida)                              AS ultima_saida,
        p.saldo                                         AS saldo_atual,
        p.estoque_minimo,
        -- alerta visual: se saldo < mínimo, sinaliza
        CASE
            WHEN p.saldo < p.estoque_minimo THEN 'EM FALTA'
            WHEN p.saldo < p.estoque_minimo * 1.5 THEN 'BAIXO'
            ELSE 'OK'
        END                                             AS status_estoque
    FROM ItemSaida ise
    INNER JOIN SaidaCabecalho sc ON sc.id_saida   = ise.id_saida
    INNER JOIN Produto        p  ON p.id_produto  = ise.id_produto
    INNER JOIN Grupo          g  ON g.id_grupo    = p.id_grupo
    WHERE
        p.ativo = 1
        AND (@data_inicio IS NULL OR sc.data_saida >= @data_inicio)
        AND (@data_fim    IS NULL OR sc.data_saida <= @data_fim)
        AND (@id_grupo    IS NULL OR p.id_grupo   = @id_grupo)
        AND (@id_setor    IS NULL OR sc.id_setor  = @id_setor)
    GROUP BY
        p.id_produto, p.nome, g.nome, p.unidade_medida,
        p.saldo, p.estoque_minimo
    ORDER BY
        CASE WHEN @criterio = 'VALOR'
             THEN SUM(ise.quantidade * ise.preco_medio_unitario) END DESC,
        CASE WHEN @criterio = 'QUANTIDADE'
             THEN SUM(ise.quantidade) END DESC;
END;
GO


-- ------------------------------------------------------------
-- RELATÓRIO 7 — Comparativo de Preços entre Fornecedores
-- ------------------------------------------------------------
-- Para cada produto que tem mais de um fornecedor com histórico
-- de compra, mostra o último preço praticado por cada fornecedor
-- e como ele se posiciona vs:
--   - menor preço entre fornecedores do mesmo produto
--   - preço médio entre fornecedores do mesmo produto
--
-- Ferramenta de negociação: o Comprador identifica de imediato
-- onde estão as oportunidades de troca de fornecedor ou de
-- negociação direta com o atual.
--
-- Técnica: 2 CTEs encadeadas
--   UltimaCompra        — pega o preço da compra mais recente
--                         por (produto, fornecedor) usando ROW_NUMBER
--   EstatisticasProduto — calcula min/max/avg cruzando fornecedores
--                         do mesmo produto
-- ------------------------------------------------------------
CREATE VIEW vw_ComparativoPrecosFornecedores AS
    WITH UltimaCompra AS (
        SELECT
            ie.id_produto,
            ec.id_fornecedor,
            ie.preco_unitario,
            ie.quantidade,
            ec.data_entrada,
            ROW_NUMBER() OVER (
                PARTITION BY ie.id_produto, ec.id_fornecedor
                ORDER BY ec.data_entrada DESC
            ) AS rn
        FROM ItemEntrada ie
        INNER JOIN EntradaCabecalho ec ON ec.id_entrada = ie.id_entrada
    ),
    EstatisticasProduto AS (
        SELECT
            id_produto,
            MIN(preco_unitario)                AS menor_preco,
            MAX(preco_unitario)                AS maior_preco,
            AVG(preco_unitario)                AS preco_medio,
            COUNT(DISTINCT id_fornecedor)      AS qtd_fornecedores
        FROM UltimaCompra
        WHERE rn = 1
        GROUP BY id_produto
    )
    SELECT
        p.id_produto,
        p.nome                  AS produto,
        g.nome                  AS grupo,
        f.id_fornecedor,
        f.razao_social          AS fornecedor,
        f.cnpj,
        uc.preco_unitario       AS ultimo_preco,
        uc.data_entrada         AS data_ultima_compra,
        uc.quantidade           AS qtd_ultima_compra,
        ep.menor_preco,
        ep.preco_medio,
        ep.qtd_fornecedores,
        -- diferença absoluta para o menor preço
        uc.preco_unitario - ep.menor_preco                AS delta_vs_menor,
        -- % acima do menor preço disponível
        CASE
            WHEN ep.menor_preco = 0 THEN NULL
            ELSE ROUND(
                (uc.preco_unitario - ep.menor_preco)
                / ep.menor_preco * 100, 2
            )
        END                                                AS pct_acima_do_menor,
        -- % vs preço médio entre fornecedores
        CASE
            WHEN ep.preco_medio = 0 THEN NULL
            ELSE ROUND(
                (uc.preco_unitario - ep.preco_medio)
                / ep.preco_medio * 100, 2
            )
        END                                                AS pct_vs_media,
        -- classificação rápida
        CASE
            WHEN uc.preco_unitario = ep.menor_preco THEN 'MELHOR PREÇO'
            WHEN uc.preco_unitario = ep.maior_preco THEN 'PIOR PREÇO'
            ELSE 'INTERMEDIÁRIO'
        END                                                AS classificacao
    FROM UltimaCompra uc
    INNER JOIN EstatisticasProduto ep ON ep.id_produto    = uc.id_produto
    INNER JOIN Produto             p  ON p.id_produto     = uc.id_produto
    INNER JOIN Fornecedor          f  ON f.id_fornecedor  = uc.id_fornecedor
    INNER JOIN Grupo               g  ON g.id_grupo       = p.id_grupo
    WHERE uc.rn = 1
      AND p.ativo = 1
      AND f.ativo = 1;
GO


-- ============================================================
-- EXEMPLOS DE USO
-- ============================================================
/*
-- Top 10 produtos mais demandados por valor (default)
EXEC sp_ProdutosMaisDemandados;

-- Top 5 do mês passado, por quantidade
EXEC sp_ProdutosMaisDemandados
    @top_n       = 5,
    @data_inicio = '2026-04-01',
    @data_fim    = '2026-04-30',
    @criterio    = 'QUANTIDADE';

-- Top 20 do setor 3 (ex: Manutenção), só do grupo 1 (ex: Ferramentas)
EXEC sp_ProdutosMaisDemandados
    @top_n    = 20,
    @id_grupo = 1,
    @id_setor = 3,
    @criterio = 'VALOR';

-- Ver onde tem espaço pra negociar preço
SELECT *
FROM vw_ComparativoPrecosFornecedores
WHERE pct_acima_do_menor > 10        -- pagando 10%+ a mais que o menor
  AND qtd_fornecedores  >  1         -- há alternativa real
ORDER BY pct_acima_do_menor DESC;

-- Detalhe de um produto específico
SELECT *
FROM vw_ComparativoPrecosFornecedores
WHERE id_produto = 42
ORDER BY ultimo_preco;
*/


-- ############################################################################
-- ###  MÓDULO 3 de 5 — AUDITORIA E RELATÓRIOS R8 E R9
-- ############################################################################


-- ============================================================
-- CAC Ltda. — Recursos avançados (v2.2)
-- Para rodar APÓS o cac_ddl_v2.sql e o cac_ddl_v2_1_relatorios.sql
-- ============================================================
-- Conteúdo:
--   1) Log de Auditoria  — tabela + triggers (Entrada, Saída, Produto)
--   2) vw_HistoricoPrecos — média móvel + delta vs compra anterior
--   3) vw_CurvaABC        — classificação A/B/C por valor consumido
-- ============================================================


-- ============================================================
-- 1) LOG DE AUDITORIA
-- ============================================================
-- Atende RNF12/RNF13 (rastreabilidade) e o stakeholder Auditoria
-- Externa. Captura inserções de movimentações e mudanças no
-- saldo/preço médio do Produto (que são os campos mais sensíveis
-- do sistema porque guiam todos os relatórios financeiros).
--
-- Estratégia:
--   - Tabela LogAuditoria com payload em JSON (NVARCHAR(MAX))
--   - Triggers AFTER em EntradaCabecalho, SaidaCabecalho e Produto
--   - Os triggers rodam dentro da mesma transação da SP, então se
--     a SP rollback, o log também rollback (consistência atômica)
-- ============================================================

CREATE TABLE LogAuditoria (
    id_log           INT           IDENTITY(1,1) NOT NULL,
    tabela           VARCHAR(50)   NOT NULL,
    operacao         VARCHAR(10)   NOT NULL,         -- INSERT, UPDATE, DELETE
    id_registro      INT           NOT NULL,
    dados_anteriores NVARCHAR(MAX) NULL,             -- estado antes (JSON)
    dados_novos      NVARCHAR(MAX) NULL,             -- estado depois (JSON)
    usuario          VARCHAR(100)  NOT NULL DEFAULT SYSTEM_USER,
    data_hora        DATETIME      NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_LogAuditoria PRIMARY KEY CLUSTERED (id_log)
);
GO

CREATE NONCLUSTERED INDEX IDX_Log_Tabela_Data ON LogAuditoria(tabela, data_hora);
CREATE NONCLUSTERED INDEX IDX_Log_Registro    ON LogAuditoria(tabela, id_registro);
GO


-- ------------------------------------------------------------
-- Trigger: auditoria de EntradaCabecalho
-- ------------------------------------------------------------
CREATE TRIGGER trg_Aud_EntradaCabecalho
ON EntradaCabecalho
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO LogAuditoria (tabela, operacao, id_registro, dados_novos)
    SELECT
        'EntradaCabecalho',
        'INSERT',
        i.id_entrada,
        (SELECT i2.id_entrada, i2.id_fornecedor, i2.data_entrada,
                i2.numero_nota_fiscal, i2.observacao
         FROM inserted i2
         WHERE i2.id_entrada = i.id_entrada
         FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
    FROM inserted i;
END;
GO

-- ------------------------------------------------------------
-- Trigger: auditoria de SaidaCabecalho
-- ------------------------------------------------------------
CREATE TRIGGER trg_Aud_SaidaCabecalho
ON SaidaCabecalho
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO LogAuditoria (tabela, operacao, id_registro, dados_novos)
    SELECT
        'SaidaCabecalho',
        'INSERT',
        i.id_saida,
        (SELECT i2.id_saida, i2.id_setor, i2.data_saida, i2.observacao
         FROM inserted i2
         WHERE i2.id_saida = i.id_saida
         FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
    FROM inserted i;
END;
GO

-- ------------------------------------------------------------
-- Trigger: auditoria de Produto (saldo e preço médio)
-- ------------------------------------------------------------
-- Loga apenas quando saldo OU preco_medio efetivamente mudaram.
-- UPDATE() filtra rápido pelas colunas mencionadas na cláusula
-- SET; depois validamos a mudança real comparando inserted/deleted.
-- ------------------------------------------------------------
CREATE TRIGGER trg_Aud_Produto
ON Produto
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF UPDATE(saldo) OR UPDATE(preco_medio)
    BEGIN
        INSERT INTO LogAuditoria
            (tabela, operacao, id_registro, dados_anteriores, dados_novos)
        SELECT
            'Produto',
            'UPDATE',
            i.id_produto,
            (SELECT id_produto, saldo, preco_medio
             FROM deleted
             WHERE id_produto = i.id_produto
             FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
            (SELECT id_produto, saldo, preco_medio
             FROM inserted
             WHERE id_produto = i.id_produto
             FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
        FROM inserted i
        INNER JOIN deleted d ON d.id_produto = i.id_produto
        WHERE i.saldo       <> d.saldo
           OR i.preco_medio <> d.preco_medio;
    END
END;
GO


-- ============================================================
-- 2) vw_HistoricoPrecos — Histórico com média móvel e delta
-- ============================================================
-- Para cada (produto, fornecedor), traz a linha do tempo das
-- compras com duas métricas analíticas:
--   - media_movel_3_compras : média das últimas 3 compras
--   - delta_vs_anterior     : variação em R$ vs compra anterior
--
-- Útil para o Comprador e o Financeiro identificarem tendências
-- de aumento de preço antes de aprovar uma nova compra.
--
-- Técnicas:
--   - AVG OVER (PARTITION BY ... ROWS BETWEEN 2 PRECEDING AND
--     CURRENT ROW) → média móvel deslizante de 3 itens
--   - LAG() → valor da linha anterior dentro da mesma partição
-- ============================================================
CREATE VIEW vw_HistoricoPrecos AS
    SELECT
        p.id_produto,
        p.nome                  AS produto,
        g.nome                  AS grupo,
        f.id_fornecedor,
        f.razao_social          AS fornecedor,
        ec.data_entrada,
        ie.preco_unitario,
        ie.quantidade,
        -- média móvel das 3 últimas compras (deste produto/fornecedor)
        AVG(ie.preco_unitario) OVER (
            PARTITION BY ie.id_produto, ec.id_fornecedor
            ORDER BY ec.data_entrada
            ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
        ) AS media_movel_3_compras,
        -- preço da compra imediatamente anterior (mesmo prod/forn)
        LAG(ie.preco_unitario) OVER (
            PARTITION BY ie.id_produto, ec.id_fornecedor
            ORDER BY ec.data_entrada
        ) AS preco_compra_anterior,
        -- variação absoluta em relação à compra anterior
        ie.preco_unitario - LAG(ie.preco_unitario) OVER (
            PARTITION BY ie.id_produto, ec.id_fornecedor
            ORDER BY ec.data_entrada
        ) AS delta_vs_anterior
    FROM ItemEntrada ie
    INNER JOIN EntradaCabecalho ec ON ec.id_entrada    = ie.id_entrada
    INNER JOIN Produto          p  ON p.id_produto     = ie.id_produto
    INNER JOIN Fornecedor       f  ON f.id_fornecedor  = ec.id_fornecedor
    INNER JOIN Grupo            g  ON g.id_grupo       = p.id_grupo;
GO


-- ============================================================
-- 3) vw_CurvaABC — Classificação ABC por valor consumido
-- ============================================================
-- Princípio de Pareto aplicado ao estoque: classifica produtos em
--   A : acumulam até 80% do valor total consumido (foco máximo)
--   B : entre 80% e 95% (atenção média)
--   C : os 5% finais (controle simplificado)
--
-- Permite ao Gerente focar tempo/negociação nos produtos certos
-- em vez de tratar todos como igualmente importantes.
--
-- Técnicas:
--   - CTE para agregar consumo por produto
--   - CTE aninhada com 2 Window Functions:
--       SUM() OVER ()                          → total geral
--       SUM() OVER (ORDER BY ... UNBOUNDED PRECEDING) → acumulado ranqueado
-- ============================================================
CREATE VIEW vw_CurvaABC AS
    WITH ConsumoTotal AS (
        SELECT
            p.id_produto,
            p.nome                                          AS produto,
            g.nome                                          AS grupo,
            SUM(ise.quantidade)                             AS qtd_total_consumida,
            SUM(ise.quantidade * ise.preco_medio_unitario)  AS valor_total_consumido
        FROM ItemSaida ise
        INNER JOIN SaidaCabecalho sc ON sc.id_saida   = ise.id_saida
        INNER JOIN Produto        p  ON p.id_produto  = ise.id_produto
        INNER JOIN Grupo          g  ON g.id_grupo    = p.id_grupo
        WHERE p.ativo = 1
        GROUP BY p.id_produto, p.nome, g.nome
    ),
    Ranking AS (
        SELECT
            ct.*,
            -- total geral (cruza todos os produtos)
            SUM(valor_total_consumido) OVER ()              AS total_geral,
            -- soma acumulada na ordem decrescente de valor
            SUM(valor_total_consumido) OVER (
                ORDER BY valor_total_consumido DESC
                ROWS UNBOUNDED PRECEDING
            )                                               AS acumulado
        FROM ConsumoTotal ct
    )
    SELECT
        id_produto,
        produto,
        grupo,
        qtd_total_consumida,
        valor_total_consumido,
        -- % do total geral que este produto representa sozinho
        CASE
            WHEN total_geral = 0 THEN 0
            ELSE ROUND(valor_total_consumido / total_geral * 100, 2)
        END                                                 AS pct_individual,
        -- % acumulada até este produto (no ranking decrescente)
        CASE
            WHEN total_geral = 0 THEN 0
            ELSE ROUND(acumulado / total_geral * 100, 2)
        END                                                 AS pct_acumulado,
        -- classificação ABC
        CASE
            WHEN total_geral = 0                       THEN 'N/A'
            WHEN acumulado / total_geral <= 0.80       THEN 'A'
            WHEN acumulado / total_geral <= 0.95       THEN 'B'
            ELSE 'C'
        END                                                 AS classe_abc
    FROM Ranking;
GO


-- ============================================================
-- EXEMPLOS DE USO
-- ============================================================
/*
-- Ver últimas movimentações sensíveis no Produto
SELECT TOP 50 *
FROM LogAuditoria
WHERE tabela = 'Produto'
ORDER BY data_hora DESC;

-- Auditar histórico completo de um produto específico
SELECT *
FROM LogAuditoria
WHERE tabela = 'Produto' AND id_registro = 42
ORDER BY data_hora;

-- Tendência de preço de um produto X em todos os fornecedores
SELECT *
FROM vw_HistoricoPrecos
WHERE id_produto = 42
ORDER BY fornecedor, data_entrada;

-- Apenas compras onde o preço aumentou vs a anterior
SELECT *
FROM vw_HistoricoPrecos
WHERE delta_vs_anterior > 0
ORDER BY delta_vs_anterior DESC;

-- Lista classe A (foco de gestão)
SELECT *
FROM vw_CurvaABC
WHERE classe_abc = 'A'
ORDER BY valor_total_consumido DESC;

-- Visão consolidada da curva
SELECT
    classe_abc,
    COUNT(*)                         AS qtd_produtos,
    SUM(valor_total_consumido)       AS valor_total,
    MIN(pct_acumulado)               AS faixa_pct_inicio,
    MAX(pct_acumulado)               AS faixa_pct_fim
FROM vw_CurvaABC
GROUP BY classe_abc
ORDER BY classe_abc;
*/


-- ############################################################################
-- ###  MÓDULO 4 de 5 — AUTENTICAÇÃO E PERFIS
-- ############################################################################


-- ============================================================
-- CAC Ltda. — Autenticação e Perfis (v2.3)
-- Para rodar APÓS cac_ddl_v2.sql
-- ============================================================
-- Adiciona:
--   - Tabela Perfil (com seed dos 7 perfis dos stakeholders)
--   - Tabela Usuario (com senha hasheada via bcrypt na API .NET)
--   - SPs de cadastro e busca para o fluxo de login
--
-- Importante: a API NÃO envia senha em texto puro ao banco.
-- O bcrypt roda em C# (BCrypt.Net-Next). A SP só armazena/lê o hash.
-- ============================================================


-- ============================================================
-- Tabela Perfil
-- ============================================================
CREATE TABLE Perfil (
    id_perfil   INT          IDENTITY(1,1) NOT NULL,
    codigo      VARCHAR(30)  NOT NULL,                 -- usado nas claims do JWT
    nome        VARCHAR(80)  NOT NULL,
    descricao   VARCHAR(200) NULL,
    CONSTRAINT PK_Perfil       PRIMARY KEY CLUSTERED (id_perfil),
    CONSTRAINT UQ_Perfil_Codigo UNIQUE (codigo)
);
GO

-- Seed: 7 perfis da Etapa 1 (stakeholders internos do artigo)
INSERT INTO Perfil (codigo, nome, descricao) VALUES
    ('COMPRADOR',       'Comprador',                'Registra compras e gerencia fornecedores'),
    ('ALMOXARIFE',      'Almoxarife',               'Controla entradas, saídas e estoque'),
    ('GESTOR_SETOR',    'Gestor de Setor',          'Requisita produtos e acompanha consumo do setor'),
    ('GERENTE_COMPRAS', 'Gerente de Compras',       'Supervisão geral, acesso a relatórios gerenciais'),
    ('DIRETOR',         'Diretor / Gerência Geral', 'Visão estratégica de custos e consumo'),
    ('FINANCEIRO',      'Setor Financeiro',         'Controle de custos e orçamento'),
    ('TI',              'Equipe de TI',             'Administração do sistema');
GO


-- ============================================================
-- Tabela Usuario
-- ============================================================
CREATE TABLE Usuario (
    id_usuario     INT          IDENTITY(1,1) NOT NULL,
    id_perfil      INT          NOT NULL,
    username       VARCHAR(50)  NOT NULL,
    senha_hash     VARCHAR(255) NOT NULL,           -- hash bcrypt (gerado em C#)
    nome_completo  VARCHAR(150) NOT NULL,
    email          VARCHAR(100) NULL,
    ativo          BIT          NOT NULL DEFAULT 1,
    data_criacao   DATETIME     NOT NULL DEFAULT GETDATE(),
    ultimo_login   DATETIME     NULL,
    CONSTRAINT PK_Usuario          PRIMARY KEY CLUSTERED (id_usuario),
    CONSTRAINT UQ_Usuario_Username UNIQUE (username),
    CONSTRAINT FK_Usuario_Perfil   FOREIGN KEY (id_perfil) REFERENCES Perfil(id_perfil)
);
GO

CREATE NONCLUSTERED INDEX IDX_Usuario_Perfil ON Usuario(id_perfil);
GO


-- ============================================================
-- SP: Cadastrar Usuário
-- ============================================================
-- A API gera o bcrypt hash da senha e passa pronto para a SP.
-- Aqui só validamos e gravamos.
-- ============================================================
CREATE PROCEDURE sp_CadastrarUsuario
    @username      VARCHAR(50),
    @senha_hash    VARCHAR(255),
    @nome_completo VARCHAR(150),
    @email         VARCHAR(100) = NULL,
    @codigo_perfil VARCHAR(30)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @id_perfil INT;
    SELECT @id_perfil = id_perfil FROM Perfil WHERE codigo = @codigo_perfil;

    IF @id_perfil IS NULL
    BEGIN
        RAISERROR('Perfil informado não existe.', 16, 1);
        RETURN;
    END

    IF EXISTS (SELECT 1 FROM Usuario WHERE username = @username)
    BEGIN
        RAISERROR('Username já cadastrado.', 16, 1);
        RETURN;
    END

    INSERT INTO Usuario (id_perfil, username, senha_hash, nome_completo, email)
    VALUES (@id_perfil, @username, @senha_hash, @nome_completo, @email);

    SELECT SCOPE_IDENTITY() AS id_usuario_criado;
END;
GO


-- ============================================================
-- SP: Buscar Usuário por Username (para login)
-- ============================================================
-- Retorna o hash e o perfil para a API validar via BCrypt.Verify.
-- NÃO retorna o hash se o usuário estiver inativo.
-- ============================================================
CREATE PROCEDURE sp_BuscarUsuarioPorUsername
    @username VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        u.id_usuario,
        u.username,
        u.senha_hash,
        u.nome_completo,
        u.email,
        u.ativo,
        p.codigo  AS perfil_codigo,
        p.nome    AS perfil_nome
    FROM Usuario u
    INNER JOIN Perfil p ON p.id_perfil = u.id_perfil
    WHERE u.username = @username AND u.ativo = 1;
END;
GO


-- ============================================================
-- SP: Registrar último login (chamada após login bem-sucedido)
-- ============================================================
CREATE PROCEDURE sp_RegistrarUltimoLogin
    @id_usuario INT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Usuario
    SET ultimo_login = GETDATE()
    WHERE id_usuario = @id_usuario;
END;
GO


-- ============================================================
-- View útil: usuários com perfil (para tela de admin)
-- ============================================================
CREATE VIEW vw_Usuarios AS
    SELECT
        u.id_usuario,
        u.username,
        u.nome_completo,
        u.email,
        u.ativo,
        u.data_criacao,
        u.ultimo_login,
        p.codigo  AS perfil_codigo,
        p.nome    AS perfil_nome
    FROM Usuario u
    INNER JOIN Perfil p ON p.id_perfil = u.id_perfil;
GO


-- ============================================================
-- EXEMPLO DE USO
-- ============================================================
/*
-- Cadastro (a API gera o hash via BCrypt.HashPassword antes de chamar)
EXEC sp_CadastrarUsuario
    @username      = 'lucas.catanio',
    @senha_hash    = '$2a$11$ABCDEFGH...',  -- hash gerado em C#
    @nome_completo = 'Lucas Catanio',
    @email         = 'lucas@cac.com.br',
    @codigo_perfil = 'COMPRADOR';

-- Login (API recebe username+senha, busca, e verifica via BCrypt.Verify)
EXEC sp_BuscarUsuarioPorUsername @username = 'lucas.catanio';
-- Em C#:
--   var user = await connection.QuerySingleOrDefaultAsync(...);
--   if (user == null) return Unauthorized();
--   if (!BCrypt.Net.BCrypt.Verify(senhaInput, user.senha_hash)) return Unauthorized();
--   await connection.ExecuteAsync("sp_RegistrarUltimoLogin", new { user.id_usuario });
--   return Ok(new { token = GerarJwt(user) });
*/


-- ############################################################################
-- ###  MÓDULO 5 de 5 — PROCEDURES DE CONSULTA, EDIÇÃO E INATIVAÇÃO
-- ############################################################################


-- ============================================================
-- CAC Ltda. — Camada completa de SPs de consulta (v2.4)
-- Para rodar APÓS v2 + v2.1 + v2.2 + v2.3
-- ============================================================
-- Objetivo: atender ao requisito do enunciado que diz
--   "Todas as inserções / deleções / exclusões E CONSULTAS
--    devem ser efetuadas via STORED PROCEDURE ou TRIGGERS"
-- 
-- Conteúdo:
--   §1 SPs de Listagem (com paginação + filtros + busca textual)
--   §2 SPs de Busca por Id
--   §3 SPs de Edição
--   §4 SPs de Inativação / Reativação (soft delete)
--   §5 SPs Wrappers das Views de Relatório (uniformiza acesso via SP)
--   §6 SP de Auditoria
-- 
-- Convenções:
--   - Paginação: @pagina (1-based) + @tamanho_pagina (default 50, max 200)
--   - Filtro de ativo: @ativo (NULL = todos, 1 = ativos, 0 = inativos)
--   - Busca textual: @busca (LIKE '%busca%' em campos relevantes)
--   - total_registros: retornado via COUNT(*) OVER() em cada linha
-- ============================================================


-- ============================================================
-- §1 SPs DE LISTAGEM
-- ============================================================

-- ------------------------------------------------------------
-- sp_ListarFornecedores
-- ------------------------------------------------------------
CREATE PROCEDURE sp_ListarFornecedores
    @ativo          BIT          = NULL,
    @busca          VARCHAR(150) = NULL,
    @pagina         INT          = 1,
    @tamanho_pagina INT          = 50
AS
BEGIN
    SET NOCOUNT ON;

    IF @pagina < 1 SET @pagina = 1;
    IF @tamanho_pagina < 1 OR @tamanho_pagina > 200 SET @tamanho_pagina = 50;

    SELECT
        f.id_fornecedor,
        f.razao_social,
        f.cnpj,
        f.telefone,
        f.email,
        f.cidade,
        f.uf,
        f.ativo,
        COUNT(*) OVER() AS total_registros
    FROM Fornecedor f
    WHERE
        (@ativo IS NULL OR f.ativo = @ativo)
        AND (@busca IS NULL
             OR f.razao_social LIKE '%' + @busca + '%'
             OR f.cnpj         LIKE '%' + @busca + '%')
    ORDER BY f.razao_social
    OFFSET (@pagina - 1) * @tamanho_pagina ROWS
    FETCH NEXT @tamanho_pagina ROWS ONLY;
END;
GO

-- ------------------------------------------------------------
-- sp_ListarProdutos
-- ------------------------------------------------------------
CREATE PROCEDURE sp_ListarProdutos
    @ativo          BIT          = NULL,
    @id_grupo       INT          = NULL,
    @apenas_em_falta BIT         = 0,
    @busca          VARCHAR(150) = NULL,
    @pagina         INT          = 1,
    @tamanho_pagina INT          = 50
AS
BEGIN
    SET NOCOUNT ON;

    IF @pagina < 1 SET @pagina = 1;
    IF @tamanho_pagina < 1 OR @tamanho_pagina > 200 SET @tamanho_pagina = 50;

    SELECT
        p.id_produto,
        p.nome,
        p.descricao,
        p.unidade_medida,
        p.saldo,
        p.estoque_minimo,
        p.preco_medio,
        p.ativo,
        g.id_grupo,
        g.nome AS grupo_nome,
        CASE
            WHEN p.saldo < p.estoque_minimo THEN 'EM_FALTA'
            WHEN p.saldo < p.estoque_minimo * 1.5 THEN 'BAIXO'
            ELSE 'OK'
        END AS status_estoque,
        COUNT(*) OVER() AS total_registros
    FROM Produto p
    INNER JOIN Grupo g ON g.id_grupo = p.id_grupo
    WHERE
        (@ativo IS NULL OR p.ativo = @ativo)
        AND (@id_grupo IS NULL OR p.id_grupo = @id_grupo)
        AND (@apenas_em_falta = 0 OR p.saldo < p.estoque_minimo)
        AND (@busca IS NULL OR p.nome LIKE '%' + @busca + '%')
    ORDER BY p.nome
    OFFSET (@pagina - 1) * @tamanho_pagina ROWS
    FETCH NEXT @tamanho_pagina ROWS ONLY;
END;
GO

-- ------------------------------------------------------------
-- sp_ListarGrupos
-- ------------------------------------------------------------
CREATE PROCEDURE sp_ListarGrupos
    @busca VARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        g.id_grupo,
        g.nome,
        g.descricao,
        (SELECT COUNT(*) FROM Produto p WHERE p.id_grupo = g.id_grupo AND p.ativo = 1)
            AS qtd_produtos_ativos
    FROM Grupo g
    WHERE @busca IS NULL OR g.nome LIKE '%' + @busca + '%'
    ORDER BY g.nome;
END;
GO

-- ------------------------------------------------------------
-- sp_ListarSetores
-- ------------------------------------------------------------
CREATE PROCEDURE sp_ListarSetores
    @ativo BIT          = NULL,
    @busca VARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        s.id_setor,
        s.nome,
        s.descricao,
        s.ativo
    FROM Setor s
    WHERE
        (@ativo IS NULL OR s.ativo = @ativo)
        AND (@busca IS NULL OR s.nome LIKE '%' + @busca + '%')
    ORDER BY s.nome;
END;
GO

-- ------------------------------------------------------------
-- sp_ListarPerfis
-- ------------------------------------------------------------
CREATE PROCEDURE sp_ListarPerfis
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id_perfil, codigo, nome, descricao
    FROM Perfil
    ORDER BY nome;
END;
GO

-- ------------------------------------------------------------
-- sp_ListarUsuarios
-- ------------------------------------------------------------
CREATE PROCEDURE sp_ListarUsuarios
    @ativo          BIT          = NULL,
    @codigo_perfil  VARCHAR(30)  = NULL,
    @busca          VARCHAR(150) = NULL,
    @pagina         INT          = 1,
    @tamanho_pagina INT          = 50
AS
BEGIN
    SET NOCOUNT ON;

    IF @pagina < 1 SET @pagina = 1;
    IF @tamanho_pagina < 1 OR @tamanho_pagina > 200 SET @tamanho_pagina = 50;

    SELECT
        u.id_usuario,
        u.username,
        u.nome_completo,
        u.email,
        u.ativo,
        u.data_criacao,
        u.ultimo_login,
        p.codigo AS perfil_codigo,
        p.nome   AS perfil_nome,
        COUNT(*) OVER() AS total_registros
    FROM Usuario u
    INNER JOIN Perfil p ON p.id_perfil = u.id_perfil
    WHERE
        (@ativo IS NULL OR u.ativo = @ativo)
        AND (@codigo_perfil IS NULL OR p.codigo = @codigo_perfil)
        AND (@busca IS NULL
             OR u.username      LIKE '%' + @busca + '%'
             OR u.nome_completo LIKE '%' + @busca + '%')
    ORDER BY u.nome_completo
    OFFSET (@pagina - 1) * @tamanho_pagina ROWS
    FETCH NEXT @tamanho_pagina ROWS ONLY;
END;
GO

-- ------------------------------------------------------------
-- sp_ListarFornecedoresProduto (associações)
-- ------------------------------------------------------------
CREATE PROCEDURE sp_ListarFornecedoresProduto
    @id_produto    INT = NULL,
    @id_fornecedor INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        fp.id_fornecedor_produto,
        fp.id_fornecedor,
        f.razao_social AS fornecedor,
        f.cnpj,
        fp.id_produto,
        p.nome AS produto,
        fp.ativo
    FROM FornecedorProduto fp
    INNER JOIN Fornecedor f ON f.id_fornecedor = fp.id_fornecedor
    INNER JOIN Produto    p ON p.id_produto    = fp.id_produto
    WHERE
        (@id_produto    IS NULL OR fp.id_produto    = @id_produto)
        AND (@id_fornecedor IS NULL OR fp.id_fornecedor = @id_fornecedor)
    ORDER BY f.razao_social, p.nome;
END;
GO

-- ------------------------------------------------------------
-- sp_ListarEntradas
-- ------------------------------------------------------------
CREATE PROCEDURE sp_ListarEntradas
    @data_inicio    DATETIME = NULL,
    @data_fim       DATETIME = NULL,
    @id_fornecedor  INT      = NULL,
    @pagina         INT      = 1,
    @tamanho_pagina INT      = 50
AS
BEGIN
    SET NOCOUNT ON;

    IF @pagina < 1 SET @pagina = 1;
    IF @tamanho_pagina < 1 OR @tamanho_pagina > 200 SET @tamanho_pagina = 50;

    SELECT
        ec.id_entrada,
        ec.data_entrada,
        ec.numero_nota_fiscal,
        ec.observacao,
        ec.id_fornecedor,
        f.razao_social  AS fornecedor,
        (SELECT COUNT(*) FROM ItemEntrada ie WHERE ie.id_entrada = ec.id_entrada)
            AS qtd_itens,
        (SELECT SUM(ie.quantidade * ie.preco_unitario)
         FROM ItemEntrada ie WHERE ie.id_entrada = ec.id_entrada)
            AS valor_total,
        COUNT(*) OVER() AS total_registros
    FROM EntradaCabecalho ec
    INNER JOIN Fornecedor f ON f.id_fornecedor = ec.id_fornecedor
    WHERE
        (@data_inicio   IS NULL OR ec.data_entrada >= @data_inicio)
        AND (@data_fim      IS NULL OR ec.data_entrada <= @data_fim)
        AND (@id_fornecedor IS NULL OR ec.id_fornecedor = @id_fornecedor)
    ORDER BY ec.data_entrada DESC
    OFFSET (@pagina - 1) * @tamanho_pagina ROWS
    FETCH NEXT @tamanho_pagina ROWS ONLY;
END;
GO

-- ------------------------------------------------------------
-- sp_ListarSaidas
-- ------------------------------------------------------------
CREATE PROCEDURE sp_ListarSaidas
    @data_inicio    DATETIME = NULL,
    @data_fim       DATETIME = NULL,
    @id_setor       INT      = NULL,
    @pagina         INT      = 1,
    @tamanho_pagina INT      = 50
AS
BEGIN
    SET NOCOUNT ON;

    IF @pagina < 1 SET @pagina = 1;
    IF @tamanho_pagina < 1 OR @tamanho_pagina > 200 SET @tamanho_pagina = 50;

    SELECT
        sc.id_saida,
        sc.data_saida,
        sc.observacao,
        sc.id_setor,
        s.nome AS setor,
        (SELECT COUNT(*) FROM ItemSaida ise WHERE ise.id_saida = sc.id_saida)
            AS qtd_itens,
        (SELECT SUM(ise.quantidade * ise.preco_medio_unitario)
         FROM ItemSaida ise WHERE ise.id_saida = sc.id_saida)
            AS valor_total,
        COUNT(*) OVER() AS total_registros
    FROM SaidaCabecalho sc
    INNER JOIN Setor s ON s.id_setor = sc.id_setor
    WHERE
        (@data_inicio IS NULL OR sc.data_saida >= @data_inicio)
        AND (@data_fim    IS NULL OR sc.data_saida <= @data_fim)
        AND (@id_setor    IS NULL OR sc.id_setor    = @id_setor)
    ORDER BY sc.data_saida DESC
    OFFSET (@pagina - 1) * @tamanho_pagina ROWS
    FETCH NEXT @tamanho_pagina ROWS ONLY;
END;
GO


-- ============================================================
-- §2 SPs DE BUSCA POR ID
-- ============================================================

CREATE PROCEDURE sp_BuscarFornecedorPorId
    @id_fornecedor INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        id_fornecedor, razao_social, cnpj, telefone, email,
        logradouro, numero, complemento, bairro, cidade, uf, cep, ativo
    FROM Fornecedor
    WHERE id_fornecedor = @id_fornecedor;
END;
GO

CREATE PROCEDURE sp_BuscarProdutoPorId
    @id_produto INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        p.id_produto, p.id_grupo, g.nome AS grupo_nome,
        p.nome, p.descricao, p.unidade_medida,
        p.estoque_minimo, p.saldo, p.preco_medio, p.ativo
    FROM Produto p
    INNER JOIN Grupo g ON g.id_grupo = p.id_grupo
    WHERE p.id_produto = @id_produto;
END;
GO

CREATE PROCEDURE sp_BuscarGrupoPorId
    @id_grupo INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id_grupo, nome, descricao FROM Grupo WHERE id_grupo = @id_grupo;
END;
GO

CREATE PROCEDURE sp_BuscarSetorPorId
    @id_setor INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT id_setor, nome, descricao, ativo FROM Setor WHERE id_setor = @id_setor;
END;
GO

CREATE PROCEDURE sp_BuscarUsuarioPorId
    @id_usuario INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        u.id_usuario, u.username, u.nome_completo, u.email, u.ativo,
        u.data_criacao, u.ultimo_login,
        p.id_perfil, p.codigo AS perfil_codigo, p.nome AS perfil_nome
    FROM Usuario u
    INNER JOIN Perfil p ON p.id_perfil = u.id_perfil
    WHERE u.id_usuario = @id_usuario;
END;
GO

-- ------------------------------------------------------------
-- sp_BuscarEntradaPorId — retorna cabeçalho + itens em 2 result sets
-- ------------------------------------------------------------
CREATE PROCEDURE sp_BuscarEntradaPorId
    @id_entrada INT
AS
BEGIN
    SET NOCOUNT ON;

    -- result set 1: cabeçalho
    SELECT
        ec.id_entrada,
        ec.data_entrada,
        ec.numero_nota_fiscal,
        ec.observacao,
        ec.id_fornecedor,
        f.razao_social  AS fornecedor,
        f.cnpj
    FROM EntradaCabecalho ec
    INNER JOIN Fornecedor f ON f.id_fornecedor = ec.id_fornecedor
    WHERE ec.id_entrada = @id_entrada;

    -- result set 2: itens
    SELECT
        ie.id_item_entrada,
        ie.id_produto,
        p.nome AS produto,
        p.unidade_medida,
        ie.quantidade,
        ie.preco_unitario,
        ie.quantidade * ie.preco_unitario AS valor_total
    FROM ItemEntrada ie
    INNER JOIN Produto p ON p.id_produto = ie.id_produto
    WHERE ie.id_entrada = @id_entrada
    ORDER BY ie.id_item_entrada;
END;
GO

-- ------------------------------------------------------------
-- sp_BuscarSaidaPorId — retorna cabeçalho + itens em 2 result sets
-- ------------------------------------------------------------
CREATE PROCEDURE sp_BuscarSaidaPorId
    @id_saida INT
AS
BEGIN
    SET NOCOUNT ON;

    -- result set 1: cabeçalho
    SELECT
        sc.id_saida,
        sc.data_saida,
        sc.observacao,
        sc.id_setor,
        s.nome AS setor
    FROM SaidaCabecalho sc
    INNER JOIN Setor s ON s.id_setor = sc.id_setor
    WHERE sc.id_saida = @id_saida;

    -- result set 2: itens
    SELECT
        ise.id_item_saida,
        ise.id_produto,
        p.nome AS produto,
        p.unidade_medida,
        ise.quantidade,
        ise.preco_medio_unitario,
        ise.quantidade * ise.preco_medio_unitario AS valor_total
    FROM ItemSaida ise
    INNER JOIN Produto p ON p.id_produto = ise.id_produto
    WHERE ise.id_saida = @id_saida
    ORDER BY ise.id_item_saida;
END;
GO


-- ============================================================
-- §3 SPs DE EDIÇÃO
-- ============================================================
-- Política:
--   - NÃO editamos PK, nem CNPJ/username (chaves naturais únicas)
--   - NÃO editamos saldo/preço_medio (calculados via movimentação)
-- ============================================================

CREATE PROCEDURE sp_EditarFornecedor
    @id_fornecedor INT,
    @razao_social  VARCHAR(150),
    @telefone      VARCHAR(20)  = NULL,
    @email         VARCHAR(100) = NULL,
    @logradouro    VARCHAR(150) = NULL,
    @numero        VARCHAR(10)  = NULL,
    @complemento   VARCHAR(50)  = NULL,
    @bairro        VARCHAR(80)  = NULL,
    @cidade        VARCHAR(80)  = NULL,
    @uf            CHAR(2)      = NULL,
    @cep           CHAR(8)      = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Fornecedor WHERE id_fornecedor = @id_fornecedor)
    BEGIN
        RAISERROR('Fornecedor não encontrado.', 16, 1);
        RETURN;
    END

    UPDATE Fornecedor
    SET razao_social = @razao_social,
        telefone     = @telefone,
        email        = @email,
        logradouro   = @logradouro,
        numero       = @numero,
        complemento  = @complemento,
        bairro       = @bairro,
        cidade       = @cidade,
        uf           = @uf,
        cep          = @cep
    WHERE id_fornecedor = @id_fornecedor;
END;
GO

CREATE PROCEDURE sp_EditarProduto
    @id_produto     INT,
    @id_grupo       INT,
    @nome           VARCHAR(150),
    @descricao      VARCHAR(300)  = NULL,
    @unidade_medida VARCHAR(20),
    @estoque_minimo DECIMAL(10,3) = 0
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Produto WHERE id_produto = @id_produto)
    BEGIN
        RAISERROR('Produto não encontrado.', 16, 1);
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM Grupo WHERE id_grupo = @id_grupo)
    BEGIN
        RAISERROR('Grupo informado não existe.', 16, 1);
        RETURN;
    END

    UPDATE Produto
    SET id_grupo       = @id_grupo,
        nome           = @nome,
        descricao      = @descricao,
        unidade_medida = @unidade_medida,
        estoque_minimo = @estoque_minimo
    WHERE id_produto = @id_produto;
END;
GO

CREATE PROCEDURE sp_EditarGrupo
    @id_grupo  INT,
    @nome      VARCHAR(100),
    @descricao VARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Grupo WHERE id_grupo = @id_grupo)
    BEGIN
        RAISERROR('Grupo não encontrado.', 16, 1);
        RETURN;
    END

    UPDATE Grupo SET nome = @nome, descricao = @descricao
    WHERE id_grupo = @id_grupo;
END;
GO

CREATE PROCEDURE sp_EditarSetor
    @id_setor  INT,
    @nome      VARCHAR(100),
    @descricao VARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Setor WHERE id_setor = @id_setor)
    BEGIN
        RAISERROR('Setor não encontrado.', 16, 1);
        RETURN;
    END

    UPDATE Setor SET nome = @nome, descricao = @descricao
    WHERE id_setor = @id_setor;
END;
GO

CREATE PROCEDURE sp_EditarUsuario
    @id_usuario    INT,
    @nome_completo VARCHAR(150),
    @email         VARCHAR(100) = NULL,
    @codigo_perfil VARCHAR(30)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @id_perfil INT;
    SELECT @id_perfil = id_perfil FROM Perfil WHERE codigo = @codigo_perfil;

    IF @id_perfil IS NULL
    BEGIN
        RAISERROR('Perfil informado não existe.', 16, 1);
        RETURN;
    END

    IF NOT EXISTS (SELECT 1 FROM Usuario WHERE id_usuario = @id_usuario)
    BEGIN
        RAISERROR('Usuário não encontrado.', 16, 1);
        RETURN;
    END

    UPDATE Usuario
    SET nome_completo = @nome_completo,
        email         = @email,
        id_perfil     = @id_perfil
    WHERE id_usuario = @id_usuario;
END;
GO

-- ------------------------------------------------------------
-- sp_AlterarSenhaUsuario — recebe novo hash já calculado em C#
-- ------------------------------------------------------------
CREATE PROCEDURE sp_AlterarSenhaUsuario
    @id_usuario      INT,
    @novo_senha_hash VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Usuario WHERE id_usuario = @id_usuario)
    BEGIN
        RAISERROR('Usuário não encontrado.', 16, 1);
        RETURN;
    END

    UPDATE Usuario SET senha_hash = @novo_senha_hash
    WHERE id_usuario = @id_usuario;
END;
GO


-- ============================================================
-- §4 SPs DE INATIVAÇÃO / REATIVAÇÃO (soft delete)
-- ============================================================

CREATE PROCEDURE sp_DefinirAtivoFornecedor
    @id_fornecedor INT,
    @ativo         BIT
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM Fornecedor WHERE id_fornecedor = @id_fornecedor)
    BEGIN
        RAISERROR('Fornecedor não encontrado.', 16, 1);
        RETURN;
    END
    UPDATE Fornecedor SET ativo = @ativo WHERE id_fornecedor = @id_fornecedor;
END;
GO

CREATE PROCEDURE sp_DefinirAtivoProduto
    @id_produto INT,
    @ativo      BIT
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM Produto WHERE id_produto = @id_produto)
    BEGIN
        RAISERROR('Produto não encontrado.', 16, 1);
        RETURN;
    END
    UPDATE Produto SET ativo = @ativo WHERE id_produto = @id_produto;
END;
GO

CREATE PROCEDURE sp_DefinirAtivoSetor
    @id_setor INT,
    @ativo    BIT
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM Setor WHERE id_setor = @id_setor)
    BEGIN
        RAISERROR('Setor não encontrado.', 16, 1);
        RETURN;
    END
    UPDATE Setor SET ativo = @ativo WHERE id_setor = @id_setor;
END;
GO

CREATE PROCEDURE sp_DefinirAtivoUsuario
    @id_usuario INT,
    @ativo      BIT
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM Usuario WHERE id_usuario = @id_usuario)
    BEGIN
        RAISERROR('Usuário não encontrado.', 16, 1);
        RETURN;
    END
    UPDATE Usuario SET ativo = @ativo WHERE id_usuario = @id_usuario;
END;
GO

CREATE PROCEDURE sp_DefinirAtivoFornecedorProduto
    @id_fornecedor_produto INT,
    @ativo                 BIT
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM FornecedorProduto
                   WHERE id_fornecedor_produto = @id_fornecedor_produto)
    BEGIN
        RAISERROR('Associação fornecedor-produto não encontrada.', 16, 1);
        RETURN;
    END
    UPDATE FornecedorProduto
    SET ativo = @ativo
    WHERE id_fornecedor_produto = @id_fornecedor_produto;
END;
GO


-- ============================================================
-- §5 SPs WRAPPERS DAS VIEWS DE RELATÓRIO
-- ============================================================
-- A API sempre chama SPs, nunca SELECT direto.
-- As views ficam como infraestrutura, as SPs são o contrato.
-- ============================================================

-- Relatório 1
CREATE PROCEDURE sp_Relatorio_ConsumoPorSetor
    @id_setor    INT      = NULL,
    @id_grupo    INT      = NULL,
    @data_inicio DATETIME = NULL,
    @data_fim    DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;
    -- Wrapper agregado que respeita filtros temporais (a view não filtra data)
    SELECT
        s.id_setor,
        s.nome                                              AS setor,
        p.id_produto,
        p.nome                                              AS produto,
        g.nome                                              AS grupo,
        SUM(ise.quantidade)                                 AS qtd_consumida,
        SUM(ise.quantidade * ise.preco_medio_unitario)      AS valor_consumido
    FROM ItemSaida ise
    INNER JOIN SaidaCabecalho sc ON sc.id_saida   = ise.id_saida
    INNER JOIN Setor          s  ON s.id_setor    = sc.id_setor
    INNER JOIN Produto        p  ON p.id_produto  = ise.id_produto
    INNER JOIN Grupo          g  ON g.id_grupo    = p.id_grupo
    WHERE
        (@id_setor    IS NULL OR s.id_setor   = @id_setor)
        AND (@id_grupo    IS NULL OR p.id_grupo   = @id_grupo)
        AND (@data_inicio IS NULL OR sc.data_saida >= @data_inicio)
        AND (@data_fim    IS NULL OR sc.data_saida <= @data_fim)
    GROUP BY s.id_setor, s.nome, p.id_produto, p.nome, g.nome
    ORDER BY valor_consumido DESC;
END;
GO

-- Relatório 2
CREATE PROCEDURE sp_Relatorio_FichaProduto
    @id_produto  INT,
    @data_inicio DATETIME = NULL,
    @data_fim    DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT *
    FROM vw_FichaProduto
    WHERE id_produto = @id_produto
      AND (@data_inicio IS NULL OR data_movimento >= @data_inicio)
      AND (@data_fim    IS NULL OR data_movimento <= @data_fim)
    ORDER BY data_movimento;
END;
GO

-- Relatório 3
CREATE PROCEDURE sp_Relatorio_FornecedoresPorProduto
    @id_produto INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT *
    FROM vw_FornecedoresPorProduto
    WHERE @id_produto IS NULL OR id_produto = @id_produto
    ORDER BY produto, fornecedor;
END;
GO

-- Relatório 4
CREATE PROCEDURE sp_Relatorio_ProdutosEmFalta
    @id_grupo INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT *
    FROM vw_ProdutosEmFalta
    WHERE @id_grupo IS NULL OR id_produto IN (
        SELECT id_produto FROM Produto WHERE id_grupo = @id_grupo
    )
    ORDER BY qtd_em_falta DESC;
END;
GO

-- Relatório 5
CREATE PROCEDURE sp_Relatorio_MenorPrecoPorProduto
    @id_produto INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT *
    FROM vw_MenorPrecoPorProduto
    WHERE @id_produto IS NULL OR id_produto = @id_produto
    ORDER BY produto;
END;
GO

-- Relatório 7
CREATE PROCEDURE sp_Relatorio_ComparativoPrecos
    @id_produto INT     = NULL,
    @min_pct_acima_menor DECIMAL(5,2) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT *
    FROM vw_ComparativoPrecosFornecedores
    WHERE (@id_produto IS NULL OR id_produto = @id_produto)
      AND (@min_pct_acima_menor IS NULL
           OR pct_acima_do_menor >= @min_pct_acima_menor)
    ORDER BY produto, ultimo_preco;
END;
GO

-- Relatório 8 (Curva ABC)
CREATE PROCEDURE sp_Relatorio_CurvaABC
    @classe CHAR(1) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT *
    FROM vw_CurvaABC
    WHERE @classe IS NULL OR classe_abc = @classe
    ORDER BY valor_total_consumido DESC;
END;
GO

-- Relatório 9 (Histórico de Preços)
CREATE PROCEDURE sp_Relatorio_HistoricoPrecos
    @id_produto    INT,
    @id_fornecedor INT      = NULL,
    @data_inicio   DATETIME = NULL,
    @data_fim      DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT *
    FROM vw_HistoricoPrecos
    WHERE id_produto = @id_produto
      AND (@id_fornecedor IS NULL OR id_fornecedor = @id_fornecedor)
      AND (@data_inicio   IS NULL OR data_entrada >= @data_inicio)
      AND (@data_fim      IS NULL OR data_entrada <= @data_fim)
    ORDER BY fornecedor, data_entrada;
END;
GO


-- ============================================================
-- §6 SP DE AUDITORIA
-- ============================================================

CREATE PROCEDURE sp_Auditoria_Listar
    @tabela         VARCHAR(50)  = NULL,
    @operacao       VARCHAR(10)  = NULL,
    @id_registro    INT          = NULL,
    @usuario        VARCHAR(100) = NULL,
    @data_inicio    DATETIME     = NULL,
    @data_fim       DATETIME     = NULL,
    @pagina         INT          = 1,
    @tamanho_pagina INT          = 50
AS
BEGIN
    SET NOCOUNT ON;

    IF @pagina < 1 SET @pagina = 1;
    IF @tamanho_pagina < 1 OR @tamanho_pagina > 200 SET @tamanho_pagina = 50;

    SELECT
        id_log,
        tabela,
        operacao,
        id_registro,
        dados_anteriores,
        dados_novos,
        usuario,
        data_hora,
        COUNT(*) OVER() AS total_registros
    FROM LogAuditoria
    WHERE
        (@tabela      IS NULL OR tabela = @tabela)
        AND (@operacao    IS NULL OR operacao = @operacao)
        AND (@id_registro IS NULL OR id_registro = @id_registro)
        AND (@usuario     IS NULL OR usuario LIKE '%' + @usuario + '%')
        AND (@data_inicio IS NULL OR data_hora >= @data_inicio)
        AND (@data_fim    IS NULL OR data_hora <= @data_fim)
    ORDER BY data_hora DESC
    OFFSET (@pagina - 1) * @tamanho_pagina ROWS
    FETCH NEXT @tamanho_pagina ROWS ONLY;
END;
GO


-- ============================================================
-- RESUMO DA CAMADA v2.4
-- ============================================================
/*
LISTAGENS (9):
  sp_ListarFornecedores         sp_ListarProdutos
  sp_ListarGrupos               sp_ListarSetores
  sp_ListarPerfis               sp_ListarUsuarios
  sp_ListarFornecedoresProduto
  sp_ListarEntradas             sp_ListarSaidas

BUSCA POR ID (7):
  sp_BuscarFornecedorPorId      sp_BuscarProdutoPorId
  sp_BuscarGrupoPorId           sp_BuscarSetorPorId
  sp_BuscarUsuarioPorId
  sp_BuscarEntradaPorId         sp_BuscarSaidaPorId

EDIÇÃO (6):
  sp_EditarFornecedor           sp_EditarProduto
  sp_EditarGrupo                sp_EditarSetor
  sp_EditarUsuario              sp_AlterarSenhaUsuario

INATIVAÇÃO/REATIVAÇÃO (5):
  sp_DefinirAtivoFornecedor     sp_DefinirAtivoProduto
  sp_DefinirAtivoSetor          sp_DefinirAtivoUsuario
  sp_DefinirAtivoFornecedorProduto

WRAPPERS DE RELATÓRIO (8):
  sp_Relatorio_ConsumoPorSetor         (R1)
  sp_Relatorio_FichaProduto            (R2)
  sp_Relatorio_FornecedoresPorProduto  (R3)
  sp_Relatorio_ProdutosEmFalta         (R4)
  sp_Relatorio_MenorPrecoPorProduto    (R5)
  sp_Relatorio_ComparativoPrecos       (R7)
  sp_Relatorio_CurvaABC                (R8)
  sp_Relatorio_HistoricoPrecos         (R9)

  R6 (sp_ProdutosMaisDemandados) já está em v2.1

AUDITORIA (1):
  sp_Auditoria_Listar

TOTAL DESTE ARQUIVO: 36 SPs
*/
