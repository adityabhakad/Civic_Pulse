import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, AuthUser } from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/auth';
  readonly user = signal<AuthUser | null>(this.readSavedUser());
  get token(): string | null { return this.readToken(); }
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(tap(response => this.save(response)));
  }
  register(displayName: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { displayName, email, password }).pipe(tap(response => this.save(response)));
  }
  logout(): void { localStorage.removeItem('civicpulse.auth'); this.user.set(null); }
  private save(response: AuthResponse): void {
    const authUser: AuthUser = { email: response.email, displayName: response.displayName, role: response.role };
    localStorage.setItem('civicpulse.auth', JSON.stringify({ ...authUser, token: response.token }));
    this.user.set(authUser);
  }
  private readToken(): string | null {
    try { return JSON.parse(localStorage.getItem('civicpulse.auth') ?? 'null')?.token ?? null; } catch { return null; }
  }
  private readSavedUser(): AuthUser | null {
    try { const saved = JSON.parse(localStorage.getItem('civicpulse.auth') ?? 'null'); return saved?.token && saved?.role ? { email: saved.email, displayName: saved.displayName, role: saved.role } : null; } catch { return null; }
  }
}
