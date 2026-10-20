import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { ComplaintService } from '../complaints/complaint.service';
import { Complaint, PublicStats } from '../complaints/complaint';
import { friendlyError } from '../core/error-message';
import { CivicWorkflowComponent } from '../shared/civic-workflow';
import { RoleHeroDiagramComponent } from '../shared/role-hero-diagram';

@Component({
  standalone: true,
  imports: [RouterLink, CivicWorkflowComponent, RoleHeroDiagramComponent],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class HomePage implements OnInit {
  private readonly complaintsApi = inject(ComplaintService);
  private readonly auth = inject(AuthService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  readonly user = this.auth.user;
  stats: PublicStats | null = null;
  complaints: Complaint[] = [];
  loading = true;
  error = '';

  get role(): string | null { return this.user()?.role ?? null; }
  get isAdmin(): boolean { return this.role === 'ADMIN'; }
  get isCitizen(): boolean { return this.role === 'CITIZEN'; }

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    if (this.isAdmin || this.isCitizen) {
      const request = this.isAdmin ? this.complaintsApi.getAll() : this.complaintsApi.getMine();
      request.subscribe({
        next: data => {
          this.complaints = Array.isArray(data) ? data : [];
          this.stats = this.toStats(this.complaints);
          this.loading = false;
          this.changeDetector.markForCheck();
        },
        error: error => {
          this.error = friendlyError(error, 'Unable to load your complaint summary. Please retry.');
          this.loading = false;
          this.changeDetector.markForCheck();
        }
      });
      return;
    }
    this.complaintsApi.getPublicStats().subscribe({
      next: data => { this.stats = data; this.loading = false; this.changeDetector.markForCheck(); },
      error: error => {
        this.error = friendlyError(error, 'Community statistics are temporarily unavailable.');
        this.loading = false;
        this.changeDetector.markForCheck();
      }
    });
  }

  count(status: string): number {
    return this.complaints.filter(item => item.status?.toUpperCase() === status).length;
  }

  private toStats(items: Complaint[]): PublicStats {
    return {
      total: items.length,
      pending: items.filter(item => item.status?.toUpperCase() === 'PENDING').length,
      inProgress: items.filter(item => item.status?.toUpperCase() === 'IN_PROGRESS').length,
      resolved: items.filter(item => item.status?.toUpperCase() === 'RESOLVED').length
    };
  }
}
