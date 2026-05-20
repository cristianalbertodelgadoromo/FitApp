import { User } from './User';

export interface Client extends Omit<User, 'password_hash'> {
  coach_id: number;
  peso_kg?: number;
  altura_cm?: number;
  objetivo?: string;
}
