export interface ProductVariante {
  id: string;
  atributo: string;
  valor: string;
  precio: number | null;
  stock: number;
  stockMinimo: number;
  skuVariante: string | null;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images?: string[];
  image?: string;
  unit: string;
  category: string;
  sku?: string;
  stock: number;
  // Nuevos campos para variantes
  tieneVariantes?: boolean;
  precioPorVariante?: boolean;
  variantes?: ProductVariante[];
  precioMinimo?: number;
  precioMaximo?: number;
  descripcionCorta?: string;
  descripcionTecnica?: string;
  unidadVenta?: string;
  // Cantidad mínima de compra
  minQuantity?: number;
}

export const products: Product[] = [
  {
    id: 'asus-p1',
    name: 'Asus ExpertBook P1',
    price: 928990,
    description: 'Rendimiento excepcional para profesionales exigentes.',
    image: 'https://res.cloudinary.com/dvqpmttci/image/upload/v1771596327/hp-elitebook-20gb-ram-256gb-ssd-touchscreen-radeon-vega-graphics-280x280_c2sinr.webp',
    unit: 'unidad',
     stock: 1,
    category: 'Computación Pro',
    minQuantity: 1,
  },
  {
    id: 'macbook-2017',
    name: 'MacBook Air 2017 Reacondicionada',
    price: 450000, 
    description: 'Elegancia y portabilidad con la garantía Econnet.',
    image: 'https://res.cloudinary.com/dvqpmttci/image/upload/v1771596124/10245000018001_2-768x768_qwfobw.jpg',
    stock: 1,
    unit: 'unidad',
    category: 'Computación Pro',
    minQuantity: 1,
  },
  {
    id: 'hp-elitebook-32gb',
    name: 'HP EliteBook Touchscreen',
    price: 850000,
    description: 'Pantalla táctil de alta precisión, 32GB de RAM y gráficos Radeon Vega.',
    image: 'https://res.cloudinary.com/dvqpmttci/image/upload/v1771596097/hp-elitebook-20gb-ram-256gb-ssd-touchscreen-radeon-vega-graphics-1-1-247x296_f9otoq.webp',
    unit: 'unidad',
     stock: 1,
    category: 'Computación Pro',
    minQuantity: 1,
  },
];
