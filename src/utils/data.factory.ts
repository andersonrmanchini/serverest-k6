// Tipos para dados de teste
export interface User {
  nome: string;
  email: string;
  password: string;
  administrador: string; // ServeRest expects "true" or "false" as strings, not booleans
}

export interface Product {
  nome: string;
  preco: number;
  descricao: string;
  quantidade: number;
}

// Funções auxiliares simples (sem dependências externas)
function randomIntBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Nomes para geração de dados
const firstNames = [
  'Ana', 'Bruno', 'Carlos', 'Diana', 'Eduardo', 'Fernanda', 'Gabriel', 'Helena',
  'Igor', 'Joana', 'Kevin', 'lucia', 'Marcos', 'Nicole', 'Oscar', 'Patricia'
];

const lastNames = [
  'Silva', 'Santos', 'Oliveira', 'Costa', 'Pereira', 'Carvalho', 'Sousa', 'Gomes',
  'Martins', 'Alves', 'Ferreira', 'Barbosa', 'Ribeiro', 'Rocha', 'Teixeira', 'Vieira'
];

const productNames = [
  'Notebook', 'Mouse', 'Teclado', 'Monitor', 'Webcam', 'Headphone', 'Mousepad', 
  'Hub USB', 'Cabo HDMI', 'Adaptador', 'Cooler', 'SSD', 'Memória RAM', 'Processador'
];

const descriptions = [
  'Produto de alta qualidade com excelente performance',
  'Ideal para profissionais e entusiastas de tecnologia',
  'Compatível com diversos sistemas operacionais',
  'Suporte técnico 24/7 disponível',
  'Garantia de 12 meses contra defeitos',
  'Certificado e testado em laboratório',
  'Eco-friendly e sustentável',
  'Melhor relação custo-benefício do mercado'
];

/**
 * Gera um usuário aleatório para testes
 * 
 * NOTA: ServeRest requer que o campo 'administrador' seja uma string
 * com valores "true" ou "false", não um booleano JavaScript.
 */
export function generateFakeUser(isAdmin: boolean = false): User {
  const firstName = firstNames[randomIntBetween(0, firstNames.length - 1)];
  const lastName = lastNames[randomIntBetween(0, lastNames.length - 1)];
  const timestamp = Date.now();
  
  return {
    nome: `${firstName} ${lastName}`,
    email: `user.${timestamp}${randomIntBetween(1000, 9999)}@test.com`,
    password: randomString(12),
    administrador: isAdmin ? 'true' : 'false' // Convert boolean to string as ServeRest expects
  };
}

/**
 * Gera múltiplos usuários
 */
export function generateFakeUsers(count: number, adminPercentage: number = 20): User[] {
  const users: User[] = [];
  
  for (let i = 0; i < count; i++) {
    const isAdmin = randomIntBetween(1, 100) <= adminPercentage;
    users.push(generateFakeUser(isAdmin));
  }
  
  return users;
}

/**
 * Gera um produto aleatório
 */
export function generateFakeProduct(): Product {
  const productName = productNames[randomIntBetween(0, productNames.length - 1)];
  const description = descriptions[randomIntBetween(0, descriptions.length - 1)];
  
  return {
    nome: `${productName} - ${randomString(5)}`,
    preco: randomIntBetween(10, 5000),
    descricao: description,
    quantidade: randomIntBetween(1, 100)
  };
}

/**
 * Gera múltiplos produtos
 */
export function generateFakeProducts(count: number): Product[] {
  const products: Product[] = [];
  
  for (let i = 0; i < count; i++) {
    products.push(generateFakeProduct());
  }
  
  return products;
}