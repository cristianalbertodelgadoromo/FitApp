export enum Rol {
  SysAdmin = 'sysadmin',
  Coach    = 'coach',
  Cliente  = 'cliente'
}

export type RolType = `${Rol}`;

export const ROLES_STAFF     = [Rol.SysAdmin, Rol.Coach];
export const ROLES_TODOS     = [Rol.SysAdmin, Rol.Coach, Rol.Cliente];
export const ROLES_SOLO_ADMIN = [Rol.SysAdmin];
