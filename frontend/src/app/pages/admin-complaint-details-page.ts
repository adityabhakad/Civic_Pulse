import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Complaint } from '../complaints/complaint';
import { ComplaintService } from '../complaints/complaint.service';
import { friendlyError } from '../core/error-message';

@Component({
  standalone: true,
  imports: [DatePipe, TitleCasePipe, RouterLink],
  templateUrl: './admin-complaint-details-page.html',
  styleUrl: './admin-complaint-details-page.css'
})
export class AdminComplaintDetailsPage implements OnInit {
  private readonly api = inject(ComplaintService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly changeDetector = inject(ChangeDetectorRef);
  item: Complaint | null = null;
  loading = true;
  busy = false;
  error = '';
  success = '';
  private id = 0;

  ngOnInit(): void {
    const raw = this.route.snapshot.paramMap.get('id');
    const id = Number(raw);
    if (!raw || !Number.isInteger(id) || id < 1) {
      this.loading = false;
      this.error = 'This complaint could not be found.';
      return;
    }
    this.id = id;
    this.load();
  }

  load(): void {
    if (!this.id) return;
    this.loading = true;
    this.error = '';
    this.api.getById(this.id).subscribe({
      next: item => { this.item = item; this.loading = false; this.changeDetector.markForCheck(); },
      error: error => { this.error = friendlyError(error, 'This complaint could not be loaded. Please retry.'); this.loading = false; this.changeDetector.markForCheck(); }
    });
  }

  changeStatus(status: string): void {
    if (!this.item || this.busy || this.item.status === status) return;
    this.busy = true;
    this.error = '';
    this.success = '';
    this.api.updateStatus(this.id, status).subscribe({
      next: item => { this.item = item; this.busy = false; this.success = 'Complaint status updated.'; this.changeDetector.markForCheck(); },
      error: error => { this.busy = false; this.error = friendlyError(error, 'The status could not be updated. Please retry.'); this.changeDetector.markForCheck(); }
    });
  }

  remove(): void {
    if (!this.item || this.busy || !confirm('Permanently delete this complaint?')) return;
    this.busy = true;
    this.error = '';
    this.api.delete(this.id).subscribe({
      next: () => { void this.router.navigateByUrl('/admin/complaints'); },
      error: error => { this.busy = false; this.error = friendlyError(error, 'The complaint could not be deleted. Please retry.'); this.changeDetector.markForCheck(); }
    });
  }
}
