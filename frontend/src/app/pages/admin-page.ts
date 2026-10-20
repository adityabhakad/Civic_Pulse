import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COMPLAINT_CATEGORIES, Complaint } from '../complaints/complaint';
import { ComplaintService } from '../complaints/complaint.service';
import { friendlyError } from '../core/error-message';

interface MonthlyReportCount { key: string; label: string; count: number; }

@Component({
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.css'
})
export class AdminPage implements OnInit {
  private readonly api = inject(ComplaintService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  readonly categories = COMPLAINT_CATEGORIES;
  readonly statusSummary = [
    { key: 'PENDING', label: 'Pending' },
    { key: 'IN_PROGRESS', label: 'In progress' },
    { key: 'RESOLVED', label: 'Resolved' }
  ];
  complaints: Complaint[] = [];
  loading = true;
  error = '';

  get monthlyTrend(): MonthlyReportCount[] {
    const now = new Date();
    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
      const key = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
      const count = this.complaints.filter(item => {
        if (!item.submittedAt) return false;
        const submitted = new Date(item.submittedAt);
        return !Number.isNaN(submitted.getTime())
          && submitted.getFullYear() === date.getFullYear()
          && submitted.getMonth() === date.getMonth();
      }).length;
      return { key, label: date.toLocaleString('en', { month: 'short' }), count };
    });
  }

  get hasSubmissionDates(): boolean {
    return this.complaints.some(item => item.submittedAt && !Number.isNaN(new Date(item.submittedAt).getTime()));
  }

  get monthlyMax(): number { return Math.max(1, ...this.monthlyTrend.map(month => month.count)); }
  get monthlyTrendTotal(): number { return this.monthlyTrend.reduce((total, month) => total + month.count, 0); }
  get monthlyTrendDescription(): string { return this.monthlyTrend.map(month => month.label + ': ' + month.count).join(', '); }

  get topCategory(): string {
    const counts = new Map<string, number>();
    for (const item of this.complaints) counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
  }

  get resolutionRate(): number {
    return this.complaints.length ? Math.round(this.count('RESOLVED') / this.complaints.length * 100) : 0;
  }

  get openCount(): number { return this.count('PENDING') + this.count('IN_PROGRESS'); }

  get statusChartBackground(): string {
    const total = this.complaints.length;
    if (!total) return 'conic-gradient(#e7edf5 0 100%)';
    const pendingEnd = this.count('PENDING') / total * 100;
    const progressEnd = pendingEnd + this.count('IN_PROGRESS') / total * 100;
    return 'conic-gradient(#f2a900 0% ' + pendingEnd + '%, #845ef7 ' + pendingEnd + '% ' + progressEnd + '%, #18a579 ' + progressEnd + '% 100%)';
  }

  ngOnInit(): void { this.load(); }

  count(status: string): number {
    return this.complaints.filter(item => item.status?.toUpperCase() === status).length;
  }

  categoryCount(category: string): number {
    return this.complaints.filter(item => item.category === category).length;
  }

  categoryWidth(category: string): number {
    const max = Math.max(1, ...this.categories.map(item => this.categoryCount(item)));
    return this.categoryCount(category) ? this.categoryCount(category) / max * 100 : 0;
  }

  trendHeight(value: number): number {
    return value ? Math.max(8, value / this.monthlyMax * 100) : 0;
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.api.getAll().subscribe({
      next: data => {
        this.complaints = Array.isArray(data) ? data : [];
        this.loading = false;
        this.changeDetector.markForCheck();
      },
      error: error => {
        this.error = friendlyError(error, 'Unable to load complaint analytics. Please retry.');
        this.loading = false;
        this.changeDetector.markForCheck();
      }
    });
  }
}
