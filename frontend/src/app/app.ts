import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { BrandLogoComponent } from './shared/brand-logo';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, BrandLogoComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  navDisplayName(user: { displayName: string; role: string }): string {
    if (user.role !== 'ADMIN') return user.displayName;
    return user.displayName.replace(/\s+admin\s*$/i, '').trim() || 'CivicPulse';
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/');
  }
}
