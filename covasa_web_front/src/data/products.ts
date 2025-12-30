export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  images: string[];
  image: string;
  unit: string;
  category: string;
}

export const products: Product[] = [
  {
    id: 1,
    name: 'Cemento Portland 25 kg',
    price: 7800,
    description: 'Resistencia confiable para fundaciones, radieres y losas.',
    images: ['/img/products/cement.svg', '/img/products/cement-stack.svg'],
    image: '/img/products/cement.svg',
    unit: 'bolsa 25 kg',
    category: 'Obra gruesa',
  },
  {
    id: 2,
    name: 'Ladrillo Fiscal',
    price: 300,
    description: 'Ladrillo de arcilla cocida para muros y cierres perimetrales.',
    images: ['/img/products/brick.svg', '/img/products/brick-wall.svg'],
    image: '/img/products/brick.svg',
    unit: 'unidad',
    category: 'Obra gruesa',
  },
  {
    id: 3,
    name: 'Arena Gruesa',
    price: 25000,
    description: 'Carga de 1 m3 para mezclas de hormigon y mortero.',
    images: ['/img/products/sand.svg', '/img/products/sand-bucket.svg'],
    image: '/img/products/sand.svg',
    unit: 'm3',
    category: 'Aridos',
  },
  {
    id: 4,
    name: 'Gravilla',
    price: 28000,
    description: 'Granulometria controlada para hormigones de alta resistencia.',
    images: ['/img/products/gravel.svg', '/img/products/gravel-bucket.svg'],
    image: '/img/products/gravel.svg',
    unit: 'm3',
    category: 'Aridos',
  },
  {
    id: 5,
    name: 'Malla ACMA',
    price: 35000,
    description: 'Malla electrosoldada para refuerzo de losas y radieres.',
    images: ['/img/products/mesh.svg', '/img/products/mesh-roll.svg'],
    image: '/img/products/mesh.svg',
    unit: 'unidad',
    category: 'Fierro y mallas',
  },
  {
    id: 6,
    name: 'Yeso-carton 10 mm',
    price: 8900,
    description: 'Plancha para tabiques interiores y cielos con terminacion lisa.',
    images: ['/img/products/drywall.svg', '/img/products/drywall-stack.svg'],
    image: '/img/products/drywall.svg',
    unit: 'plancha',
    category: 'Tabiqueria',
  },
];
