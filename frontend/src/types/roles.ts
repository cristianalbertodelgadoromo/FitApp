export enum Rol {
  SysAdmin = 'admin',
  Coach    = 'coach',
  Cliente  = 'client',
  Nutritionist = 'nutritionist'
}

export type RolType = `${Rol}`;
