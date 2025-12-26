export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
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
    image: '/img/products/cement.svg',
    unit: 'bolsa 25 kg',
    category: 'Obra gruesa',
  },
  {
    id: 2,
    name: 'Ladrillo Fiscal',
    price: 300,
    description: 'Ladrillo de arcilla cocida para muros y cierres perimetrales.',
    image: '/img/products/brick.svg',
    unit: 'unidad',
    category: 'Obra gruesa',
  },
  {
    id: 3,
    name: 'Arena Gruesa',
    price: 25000,
    description: 'Carga de 1 m3 para mezclas de hormigón y mortero.',
    image: '/img/products/sand.svg',
    unit: 'm3',
    category: 'Áridos',
  },
  {
    id: 4,
    name: 'Gravilla',
    price: 28000,
    description: 'Granulometría controlada para hormigones de alta resistencia.',
    image: '/img/products/gravel.svg',
    unit: 'm3',
    category: 'Áridos',
  },
  {
    id: 5,
    name: 'Malla ACMA',
    price: 35000,
    description: 'Malla electrosoldada para refuerzo de losas y radieres.',
    image: '/img/products/mesh.svg',
    unit: 'unidad',
    category: 'Fierro y mallas',
  },
  {
    id: 6,
    name: 'Yeso-cartón 10 mm',
    price: 8900,
    description: 'Plancha para tabiques interiores y cielos con terminación lisa.',
    image: '/img/products/drywall.svg',
    unit: 'plancha',
    category: 'Tabiquería',
  },
];
