import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Complaint } from '../complaints/complaint';
import { ComplaintService } from '../complaints/complaint.service';
import { friendlyError } from '../core/error-message';

@Component({
  standalone: true,
  imports: [DatePipe, TitleCasePipe, RouterLink],
  templateUrl: './citizen-page.html',
  styleUrl: './citizen-page.css'
})
export class CitizenPage implements OnInit {
  private readonly api = inject(ComplaintService);
  private readonly auth = inject(AuthService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  complaints: Complaint[] = [];
  loading = true;
  error = '';

  get displayName(): string { return this.auth.user()?.displayName ?? 'Citizen'; }

  ngOnInit(): void { this.load(); }

  count(status: string): number {
    return this.complaints.filter(item => item.status?.toUpperCase() === status).length;
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.api.getMine().subscribe({
      next: data => { this.complaints = Array.isArray(data) ? data : []; this.loading = false; this.changeDetector.markForCheck(); },
      error: error => { this.error = friendlyError(error, 'Unable to load your complaint summary. Please retry.'); this.loading = false; this.changeDetector.markForCheck(); }
    });
  }
}
