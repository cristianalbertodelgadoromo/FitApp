import { Rol } from '../types/roles';

export const PERMISSIONS = {
  coaches: {
    list: [Rol.SysAdmin],
    create: [Rol.SysAdmin],
    delete: [Rol.SysAdmin]
  },
  clients: {
    listAll: [Rol.SysAdmin],
    listOwn: [Rol.SysAdmin, Rol.Coach],
    viewOwn: [Rol.SysAdmin, Rol.Coach, Rol.Cliente],
    create: [Rol.SysAdmin, Rol.Coach],
    update: [Rol.SysAdmin, Rol.Coach],
    delete: [Rol.SysAdmin]
  },
  foods: {
    list: [Rol.SysAdmin, Rol.Coach, Rol.Cliente],
    create: [Rol.SysAdmin, Rol.Coach],
    delete: [Rol.SysAdmin]
  },
  exercises: {
    list: [Rol.SysAdmin, Rol.Coach, Rol.Cliente],
    create: [Rol.SysAdmin, Rol.Coach],
    delete: [Rol.SysAdmin]
  },
  routines: {
    listAll: [Rol.SysAdmin],
    listOwn: [Rol.SysAdmin, Rol.Coach],
    viewMine: [Rol.Cliente],
    create: [Rol.SysAdmin, Rol.Coach],
    delete: [Rol.SysAdmin]
  },
  foodLogs: {
    read: [Rol.SysAdmin, Rol.Coach, Rol.Cliente],
    create: [Rol.SysAdmin, Rol.Coach, Rol.Cliente],
    delete: [Rol.SysAdmin, Rol.Coach, Rol.Cliente]
  },
  routineExercises: {
    read: [Rol.SysAdmin, Rol.Coach, Rol.Cliente],
    write: [Rol.SysAdmin, Rol.Coach]
  },
  progress: {
    read: [Rol.SysAdmin, Rol.Coach, Rol.Cliente],
    write: [Rol.SysAdmin, Rol.Coach],
    delete: [Rol.SysAdmin, Rol.Coach]
  },
  pagos: {
    list: [Rol.SysAdmin],
    create: [Rol.SysAdmin, Rol.Coach],
    view: [Rol.SysAdmin, Rol.Coach, Rol.Cliente]
  }
};
