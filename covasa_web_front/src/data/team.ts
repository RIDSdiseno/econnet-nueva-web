export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  photoUrl?: string;
  email?: string;
  linkedin?: string;
};

export const teamMembers: TeamMember[] = [
  {
    id: 'tm-01',
    name: 'Camila Rojas',
    role: 'Directora Comercial',
    bio: 'Coordina cuentas clave y alianzas para asegurar abastecimiento confiable.',
    email: 'camila.rojas@covasa.cl',
    linkedin: 'https://www.linkedin.com',
  },
  {
    id: 'tm-02',
    name: 'Sebastian Lara',
    role: 'Jefe de Operaciones',
    bio: 'Supervisa logistica, rutas de despacho y control de stock en bodega.',
    email: 'sebastian.lara@covasa.cl',
  },
  {
    id: 'tm-03',
    name: 'Daniela Ponce',
    role: 'Asesora Tecnica',
    bio: 'Acompana proyectos de obra con especificaciones y soporte en terreno.',
    email: 'daniela.ponce@covasa.cl',
  },
  {
    id: 'tm-04',
    name: 'Matias Fuentes',
    role: 'Lider de Compras',
    bio: 'Gestiona proveedores y condiciones para mantener precios competitivos.',
    linkedin: 'https://www.linkedin.com',
  },
  {
    id: 'tm-05',
    name: 'Valeria Guzman',
    role: 'Customer Success',
    bio: 'Asegura seguimiento postventa y coordinacion con clientes B2B.',
    email: 'valeria.guzman@covasa.cl',
  },
  {
    id: 'tm-06',
    name: 'Ricardo Vega',
    role: 'Coordinador de Proyectos',
    bio: 'Planifica entregas por etapa y mantiene el cronograma de obra.',
    email: 'ricardo.vega@covasa.cl',
  },
];
