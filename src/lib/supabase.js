import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Catálogo Oficial DINO DOCES — Exatamente os 11 produtos solicitados
export const OFFICIAL_PRODUCTS = [
  // BOLOS NO POTE (R$ 12,00)
  {
    id: 'bolo-1',
    nome: 'Chocolate com Brigadeiro',
    descricao: 'Bolo fofinho de chocolate com camadas generosas de brigadeiro artesanal gourmet.',
    preco: 12.00,
    categoria: 'bolos',
    tamanho: null,
    imagem: '/bolo-chocolate-brigadeiro.jpg',
    disponivel: true
  },
  {
    id: 'bolo-2',
    nome: 'Chocolate com Maracujá',
    descricao: 'Combinação perfeita do doce de chocolate com o contraste refrescante de creme de maracujá.',
    preco: 12.00,
    categoria: 'bolos',
    tamanho: null,
    imagem: '/bolo-chocolate-maracuja.jpg',
    disponivel: true
  },
  {
    id: 'bolo-3',
    nome: 'Baunilha com Brigadeiro de Leite e Morango',
    descricao: 'Massa suave de baunilha, recheada com brigadeiro de leite cremoso e pedaços de morango.',
    preco: 12.00,
    categoria: 'bolos',
    tamanho: null,
    imagem: '/bolo-brigadeiro-leite-morango.jpg',
    disponivel: true
  },
  {
    id: 'bolo-4',
    nome: 'Brownie',
    descricao: 'Brownie artesanal macio e úmido por dentro com casquinha crocante. Opção com ou sem cobertura de avelã ou chocolate!',
    preco: 12.00,
    categoria: 'bolos',
    tamanho: null,
    opcoes: [
      { nome: 'Sem cobertura', preco: 12.00 },
      { nome: 'Cobertura de Avelã', preco: 12.00 },
      { nome: 'Cobertura de Chocolate', preco: 12.00 }
    ],
    imagem: '/brownie.jpg',
    disponivel: true
  },
  {
    id: 'bolo-5',
    nome: 'Baunilha com Chocolate',
    descricao: 'Clássico insuperável de bolo de baunilha leve com cobertura aveludada de chocolate.',
    preco: 12.00,
    categoria: 'bolos',
    tamanho: null,
    imagem: '/bolo-baunilha-chocolate.jpg',
    disponivel: true
  },

  // AÇAÍ (500 ml — R$ 20,00)
  {
    id: 'acai-1',
    nome: 'Açaí com Banana',
    descricao: 'Garrafa de 500 ml com açaí super cremoso batido com banana selecionada.',
    preco: 20.00,
    categoria: 'acai',
    tamanho: '500 ml',
    imagem: '/acai-dino.jpg',
    disponivel: true
  },
  {
    id: 'acai-2',
    nome: 'Açaí com Avelã',
    descricao: 'Garrafa de 500 ml de açaí geladinho com sabor marcante e cremosidade de avelã.',
    preco: 20.00,
    categoria: 'acai',
    tamanho: '500 ml',
    imagem: '/acai-dino.jpg',
    disponivel: true
  },
  {
    id: 'acai-3',
    nome: 'Açaí com Paçoca',
    descricao: 'Garrafa de 500 ml de açaí cremoso combinado com o sabor irresistível de paçoca.',
    preco: 20.00,
    categoria: 'acai',
    tamanho: '500 ml',
    imagem: '/acai-dino.jpg',
    disponivel: true
  },

  // VITAMINAS (300 ml — R$ 15,00 | 500 ml — R$ 20,00)
  {
    id: 'vitamina-1',
    nome: 'Vitamina de Morango',
    descricao: 'Batida cremosa e refrescante feita com morangos frescos e leite integral gelado.',
    preco: 15.00,
    categoria: 'vitaminas',
    tamanho: '300 ml',
    tamanhos: [
      { tamanho: '300 ml', preco: 15.00 },
      { tamanho: '500 ml', preco: 20.00 }
    ],
    imagem: '/batida-dino.jpg',
    disponivel: true
  },
  {
    id: 'vitamina-2',
    nome: 'Vitamina de Maracujá',
    descricao: 'Batida aveludada e levemente cítrica de maracujá natural.',
    preco: 15.00,
    categoria: 'vitaminas',
    tamanho: '300 ml',
    tamanhos: [
      { tamanho: '300 ml', preco: 15.00 },
      { tamanho: '500 ml', preco: 20.00 }
    ],
    imagem: '/batida-dino.jpg',
    disponivel: true
  },
  {
    id: 'vitamina-3',
    nome: 'Vitamina de Limão',
    descricao: 'Batida incrivelmente refrescante e equilibrada com toque suave de limão.',
    preco: 15.00,
    categoria: 'vitaminas',
    tamanho: '300 ml',
    tamanhos: [
      { tamanho: '300 ml', preco: 15.00 },
      { tamanho: '500 ml', preco: 20.00 }
    ],
    imagem: '/batida-dino.jpg',
    disponivel: true
  }
];

export async function fetchProdutos(category = null) {
  try {
    let query = supabase.from('produtos').select('*').eq('disponivel', true);
    if (category) {
      query = query.eq('categoria', category);
    }
    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      console.info('Utilizando catálogo DINO DOCES oficial via fallback.');
      if (category) {
        return OFFICIAL_PRODUCTS.filter(p => p.categoria === category);
      }
      return OFFICIAL_PRODUCTS;
    }
    return data;
  } catch (err) {
    console.warn('Erro ao conectar com Supabase, usando catálogo local:', err);
    if (category) {
      return OFFICIAL_PRODUCTS.filter(p => p.categoria === category);
    }
    return OFFICIAL_PRODUCTS;
  }
}
