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
  tieneVariantes?: boolean;
  precioPorVariante?: boolean;
  variantes?: ProductVariante[];
  precioMinimo?: number;
  precioMaximo?: number;
  descripcionCorta?: string;
  descripcionTecnica?: string;
  unidadVenta?: string;
  minQuantity?: number;
}

export const products: Product[] = [
  {
    id: 'asus-aio-v241',
    name: 'Asus ExpertCenter All-in-One',
    price: 928990,
    description: 'Sistema All-in-One de alto rendimiento con pantalla NanoEdge. La solución definitiva para espacios de trabajo modernos que exigen potencia y estética limpia.',
    image: 'https://res.cloudinary.com/dvqpmttci/image/upload/v1771687759/Asus-P440Vak-Bpc557X-All-In-One-Intel-Core-Ultra-7-240H-5.2-Ghz-Ddr5-_SKl1YEV-510x510-1-400x400_iqqmlx.webp',
    unit: 'unidad',
    stock: 1, // Confirmado por Jefa
    category: 'Computación Pro',
    minQuantity: 1,
  },
  {
    id: 'hp-elitebook-840-g5',
    name: 'HP EliteBook 840 G5 Pro',
    price: 499990,
    description: 'Línea corporativa de alta gama. Equipado con seguridad de grado militar y chasis de aluminio. Rendimiento superior para tareas de ingeniería y gestión de datos.',
    image: 'https://res.cloudinary.com/dvqpmttci/image/upload/v1771596273/hp-elitebook-20gb-ram-256gb-ssd-touchscreen-radeon-vega-graphics-1-1_x6ig15.webp',
    unit: 'unidad',
    stock: 1, // Confirmado por Jefa
    category: 'Computación Pro',
    minQuantity: 1,
  },
  {
    id: 'macbook-air-2017',
    name: 'MacBook Air 13" (2017)',
    price: 450000, 
    description: 'El equilibrio perfecto entre portabilidad y autonomía. Ideal para profesionales en constante movimiento que buscan la estabilidad del ecosistema Apple.',
    image: 'https://res.cloudinary.com/dvqpmttci/image/upload/v1771688557/Apple4zu3_kmmivw.png',
    stock: 2, // Único con 2 unidades
    unit: 'unidad',
    category: 'Computación Pro',
    minQuantity: 1,
  }
];