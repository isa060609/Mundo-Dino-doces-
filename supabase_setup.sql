-- ============================================================================
-- SCRIPT DE CONFIGURAÇÃO DO BANCO DE DADOS — DINO DOCES 🍰
-- Copie e cole este script no Editor SQL do seu Painel do Supabase
-- ============================================================================

-- 1. TABELA DE CLIENTES
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para 'clientes'
CREATE POLICY "Clientes podem visualizar o próprio perfil"
ON public.clientes FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Clientes podem inserir o próprio perfil"
ON public.clientes FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Clientes podem atualizar o próprio perfil"
ON public.clientes FOR UPDATE
USING (auth.uid() = id);

-- 2. TABELA DE PRODUTOS
CREATE TABLE IF NOT EXISTS public.produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT,
    preco NUMERIC(10, 2) NOT NULL,
    imagem TEXT,
    categoria TEXT NOT NULL, -- 'bolos', 'acai', 'vitaminas'
    tamanho TEXT, -- '500 ml', '200 ml', etc.
    disponivel BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública para produtos disponíveis
CREATE POLICY "Qualquer pessoa pode visualizar produtos disponíveis"
ON public.produtos FOR SELECT
USING (disponivel = TRUE);

-- 3. TABELA DE PEDIDOS
CREATE TABLE IF NOT EXISTS public.pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    produtos JSONB NOT NULL,
    valor_total NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'pendente', -- 'pendente', 'em_preparo', 'entregue'
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para 'pedidos'
CREATE POLICY "Clientes podem visualizar somente seus próprios pedidos"
ON public.pedidos FOR SELECT
USING (auth.uid() = cliente_id);

CREATE POLICY "Clientes autenticados podem criar pedidos"
ON public.pedidos FOR INSERT
WITH CHECK (auth.uid() = cliente_id);

-- 4. TABELA DE ENCOMENDAS PERSONALIZADAS
CREATE TABLE IF NOT EXISTS public.encomendas_personalizadas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    nome_cliente TEXT NOT NULL,
    tipo_produto TEXT NOT NULL,
    descricao TEXT NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 1,
    observacoes TEXT,
    status TEXT DEFAULT 'aguardando análise', -- 'aguardando análise', 'em análise', 'aprovado', 'concluído'
    data_solicitacao TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.encomendas_personalizadas ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para 'encomendas_personalizadas'
CREATE POLICY "Clientes podem visualizar suas próprias encomendas"
ON public.encomendas_personalizadas FOR SELECT
USING (auth.uid() = cliente_id);

CREATE POLICY "Clientes autenticados podem solicitar encomendas"
ON public.encomendas_personalizadas FOR INSERT
WITH CHECK (auth.uid() = cliente_id);


-- ============================================================================
-- POPULAÇÃO INICIAL DOS PRODUTOS OFICIAIS DINO DOCES (11 itens)
-- ============================================================================

INSERT INTO public.produtos (nome, descricao, preco, categoria, tamanho, imagem, disponivel) VALUES
-- BOLOS NO POTE & BROWNIES (R$ 12,00)
('Chocolate com Brigadeiro', 'Bolo fofinho de chocolate com camadas generosas de brigadeiro artesanal gourmet.', 12.00, 'bolos', NULL, '/bolo-chocolate-brigadeiro.jpg', TRUE),
('Chocolate com Maracujá', 'Combinação perfeita do doce de chocolate com o contraste refrescante de creme de maracujá.', 12.00, 'bolos', NULL, '/bolo-chocolate-maracuja.jpg', TRUE),
('Baunilha com Brigadeiro de Leite e Morango', 'Massa suave de baunilha, recheada com brigadeiro de leite cremoso e pedaços de morango.', 12.00, 'bolos', NULL, '/bolo-brigadeiro-leite-morango.jpg', TRUE),
('Brownie', 'Brownie artesanal macio e úmido por dentro com casquinha crocante. Opção com ou sem cobertura de avelã ou chocolate!', 12.00, 'bolos', NULL, '/brownie.jpg', TRUE),
('Baunilha com Chocolate', 'Clássico insuperável de bolo de baunilha leve com cobertura aveludada de chocolate.', 12.00, 'bolos', NULL, '/bolo-baunilha-chocolate.jpg', TRUE),
('Prestígio', 'Bolo fofinho de chocolate com recheio cremoso de coco artesanal e cobertura irresistível de chocolate.', 12.00, 'bolos', NULL, '/bolos-dino.jpg', TRUE),

-- AÇAÍ (500 ml — R$ 20,00)
('Açaí com Banana', 'Garrafa de 500 ml com açaí super cremoso batido com banana selecionada.', 20.00, 'acai', '500 ml', '/acai-dino.jpg', TRUE),
('Açaí com Avelã', 'Garrafa de 500 ml de açaí geladinho com sabor marcante e cremosidade de avelã.', 20.00, 'acai', '500 ml', '/acai-dino.jpg', TRUE),
('Açaí com Paçoca', 'Garrafa de 500 ml de açaí cremoso combinado com o sabor irresistível de paçoca.', 20.00, 'acai', '500 ml', '/acai-dino.jpg', TRUE),

-- VITAMINAS (200 ml — R$ 15,00)
('Vitamina de Morango', 'Porção de 200 ml refrescante feita com morangos frescos e leite integral gelado.', 15.00, 'vitaminas', '200 ml', 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80', TRUE),
('Vitamina de Maracujá', 'Porção de 200 ml aveludada e levemente cítrica de maracujá natural.', 15.00, 'vitaminas', '200 ml', 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?auto=format&fit=crop&w=600&q=80', TRUE),
('Vitamina de Limão', 'Porção de 200 ml incrivelmente refrescante e equilibrada com toque suave de limão.', 15.00, 'vitaminas', '200 ml', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80', TRUE)
ON CONFLICT DO NOTHING;


-- ============================================================================
-- 5. SISTEMA DE CARTÃO FIDELIDADE DINO DOCES 🦖
-- ============================================================================

-- Tabela do Cartão Fidelidade do Cliente
CREATE TABLE IF NOT EXISTS public.cartao_fidelidade (
    cliente_id UUID PRIMARY KEY REFERENCES public.clientes(id) ON DELETE CASCADE,
    pontos INTEGER NOT NULL DEFAULT 0 CHECK (pontos >= 0 AND pontos <= 10),
    itens_acumulados INTEGER NOT NULL DEFAULT 0 CHECK (itens_acumulados >= 0 AND itens_acumulados <= 1),
    total_resgates INTEGER NOT NULL DEFAULT 0,
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cartao_fidelidade ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clientes podem visualizar o próprio cartão fidelidade"
ON public.cartao_fidelidade FOR SELECT
USING (auth.uid() = cliente_id);

CREATE POLICY "Clientes podem inserir seu próprio cartão fidelidade inicial"
ON public.cartao_fidelidade FOR INSERT
WITH CHECK (auth.uid() = cliente_id);

-- Tabela de Histórico de Lançamentos de Pontos e Compras
CREATE TABLE IF NOT EXISTS public.historico_fidelidade (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL, -- 'compra_itens', 'resgate_recompensa', 'ajuste_admin'
    itens_comprados INTEGER DEFAULT 0,
    pontos_alterados INTEGER NOT NULL,
    descricao TEXT NOT NULL,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.historico_fidelidade ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clientes podem visualizar o próprio histórico de fidelidade"
ON public.historico_fidelidade FOR SELECT
USING (auth.uid() = cliente_id);

-- Tabela de Recompensas Resgatadas
CREATE TABLE IF NOT EXISTS public.recompensas_resgatadas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
    recompensa_id TEXT NOT NULL, -- 'r5_off', 'adicional_r2_off'
    titulo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    codigo_voucher TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'disponivel', -- 'disponivel', 'utilizado'
    resgatado_em TIMESTAMPTZ DEFAULT NOW(),
    utilizado_em TIMESTAMPTZ
);

ALTER TABLE public.recompensas_resgatadas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clientes podem visualizar suas próprias recompensas resgatadas"
ON public.recompensas_resgatadas FOR SELECT
USING (auth.uid() = cliente_id);

CREATE POLICY "Clientes podem registrar resgate de recompensa"
ON public.recompensas_resgatadas FOR INSERT
WITH CHECK (auth.uid() = cliente_id);

