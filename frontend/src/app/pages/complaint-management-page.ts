import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { COMPLAINT_CATEGORIES, Complaint } from '../complaints/complaint';
import { ComplaintService } from '../complaints/complaint.service';
import { friendlyError } from '../core/error-message';

@Component({
  standalone: true,
  imports: [DatePipe, TitleCasePipe, RouterLink],
  templateUrl: './complaint-management-page.html',
  styleUrl: './complaint-management-page.css'
})
export class ComplaintManagementPage implements OnInit {
  private readonly api = inject(ComplaintService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly changeDetector = inject(ChangeDetectorRef);
  readonly categories = COMPLAINT_CATEGORIES;
  readonly isAdmin = this.auth.user()?.role === 'ADMIN';
  complaints: Complaint[] = [];
  search = '';
  categoryFilter = 'ALL';
  statusFilter = 'ALL';
  loading = true;
  error = '';
  success = '';
  busyId: number | null = null;

  get filtered(): Complaint[] {
    const query = this.search.trim().toLowerCase();
    return this.complaints.filter(item =>
      (!query || [item.title, item.category, item.location, item.citizenName ?? ''].some(value => value.toLowerCase().includes(query)))
      && (this.categoryFilter === 'ALL' || item.category === this.categoryFilter)
      && (this.statusFilter === 'ALL' || item.status === this.statusFilter)
    );
  }

  ngOnInit(): void {
    const saved = this.route.snapshot.queryParamMap.get('saved');
    if (saved === 'created') this.success = 'Your complaint was submitted.';
    if (saved === 'updated') this.success = 'Your complaint was updated.';
    this.load();
  }

  detailLink(item: Complaint): (string | number)[] {
    return this.isAdmin ? ['/admin/complaints', item.id ?? ''] : ['/citizen/complaints', item.id ?? ''];
  }

  load(): void {
    this.loading = true;
    this.error = '';
    const request = this.isAdmin ? this.api.getAll() : this.api.getMine();
    request.subscribe({
      next: data => { this.complaints = Array.isArray(data) ? data : []; this.loading = false; this.changeDetector.markForCheck(); },
      error: error => { this.error = friendlyError(error, 'Unable to load complaints. Please retry.'); this.loading = false; this.changeDetector.markForCheck(); }
    });
  }

  changeStatus(item: Complaint, status: string): void {
    if (!this.isAdmin || !item.id || item.status === status || this.busyId !== null) return;
    const previous = item.status;
    this.busyId = item.id;
    this.error = '';
    this.success = '';
    this.api.updateStatus(item.id, status).subscribe({
      next: updated => {
        this.complaints = this.complaints.map(row => row.id === item.id ? updated : row);
        this.busyId = null;
        this.success = `Status updated for “${item.title}”.`;
        this.changeDetector.markForCheck();
      },
      error: error => {
        this.complaints = this.complaints.map(row => row.id === item.id ? { ...row, status: previous } : row);
        this.busyId = null;
        this.error = friendlyError(error, 'The status could not be updated. Please retry.');
        this.changeDetector.markForCheck();
      }
    });
  }

  remove(item: Complaint): void {
    if (!item.id || this.busyId !== null || (!this.isAdmin && item.status !== 'PENDING')) return;
    const message = this.isAdmin ? `Permanently delete “${item.title}”?` : `Delete your pending report “${item.title}”?`;
    if (!confirm(message)) return;
    this.busyId = item.id;
    this.error = '';
    this.success = '';
    this.api.delete(item.id).subscribe({
      next: () => {
        this.complaints = this.complaints.filter(row => row.id !== item.id);
        this.busyId = null;
        this.success = 'Complaint deleted.';
        this.changeDetector.markForCheck();
      },
      error: error => {
        this.busyId = null;
        this.error = friendlyError(error, 'The complaint could not be deleted. Please retry.');
        this.changeDetector.markForCheck();
      }
    });
  }

  canEdit(item: Complaint): boolean { return !this.isAdmin && item.status === 'PENDING'; }
  citizenName(item: Complaint): string { return item.citizenName || 'Name unavailable'; }
}
