import { User } from './User';

export interface Coach extends Omit<User, 'password_hash'> {
  especialidad?: string;
  biografia?: string;
}
