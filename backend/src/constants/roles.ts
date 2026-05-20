export const ROLES = {
  ADMIN:        { id: 1, nombre: 'admin' },
  COACH:        { id: 2, nombre: 'coach' },
  CLIENT:       { id: 3, nombre: 'client' },
  NUTRITIONIST: { id: 4, nombre: 'nutritionist' },
} as const;

export type RolNombre = typeof ROLES[keyof typeof ROLES]['nombre'];
