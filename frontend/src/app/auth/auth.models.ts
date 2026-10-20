export type UserRole = 'CITIZEN' | 'ADMIN';
export interface AuthUser { email: string; displayName: string; role: UserRole; }
export interface AuthResponse extends AuthUser { token: string; tokenType: string; }
