import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { COMPLAINT_CATEGORIES, Complaint, ApiError } from '../complaints/complaint';
import { ComplaintService } from '../complaints/complaint.service';
import { friendlyError } from '../core/error-message';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, TitleCasePipe, RouterLink],
  template: `<a class="back-link" routerLink="/citizen/complaints">← Back to my complaints</a><section class="form-panel"><div class="form-heading"><p class="eyebrow">{{ id ? 'COMPLAINT DETAILS' : 'NEW REPORT' }}</p><h1>{{ id ? (item?.title ?? 'Complaint details') : 'Report a civic issue' }}</h1><p>{{ id ? 'Review the information and current status of your report.' : 'Share a few details so the right team can address it.' }}</p></div>@if (error) {<div class="alert" role="alert">{{ error }}</div>}@if (loading) {<div class="state"><span class="spinner"></span><p>Loading complaint…</p></div>} @else if ((id || invalidId) && !item) {<div class="state empty"><h3>Complaint unavailable</h3><p>{{ error || 'This complaint could not be loaded.' }}</p>@if (!invalidId) { <button class="button secondary" type="button" (click)="load()">Retry</button> }</div>} @else if (id && item && !editing) {<div class="detail-grid"><div><span>Category</span><strong>{{ item.category }}</strong></div><div><span>Status</span><strong><span class="status" [class]="'status ' + item.status.toLowerCase().replace('_','-')">{{ item.status.replace('_',' ') | titlecase }}</span></strong></div><div><span>Location</span><strong>{{ item.location }}</strong></div><div><span>Submitted</span><strong>{{ item.submittedAt ? (item.submittedAt | date:'medium') : 'Date unavailable' }}</strong></div><div class="detail-description"><span>Description</span><p>{{ item.description }}</p></div></div><div class="form-actions">@if (item.status === 'PENDING') {<button class="button secondary" (click)="editing=true">Edit report</button>}<button class="button primary" routerLink="/citizen/complaints">Done</button></div>} @else {<form [formGroup]="form" (ngSubmit)="submit()" novalidate><label class="field">Issue title <span>*</span><input formControlName="title" placeholder="e.g. Damaged road near the library" maxlength="100"><small>{{ hint('title','Add a short, clear title.') }}</small></label><label class="field">Description <span>*</span><textarea formControlName="description" placeholder="Describe the issue and how it affects the area…" rows="4" maxlength="500"></textarea><small>{{ hint('description','Describe the issue in a few sentences.') }}</small></label><div class="field-row"><label class="field">Category <span>*</span><select formControlName="category"><option value="" disabled>Select a category</option>@if (editing && item && !categories.includes(item.category)) {<option [value]="item.category">{{ item.category }} (existing)</option>}@for (category of categories; track category) {<option [value]="category">{{ category }}</option>}</select><small>{{ hint('category','Choose the closest match.') }}</small></label><label class="field">Location <span>*</span><input formControlName="location" placeholder="Street, neighborhood, or landmark" maxlength="150"><small>{{ hint('location','Add a location people can recognize.') }}</small></label></div><div class="form-actions"><button type="button" class="button secondary" (click)="id ? editing=false : router.navigateByUrl('/citizen/complaints')">Cancel</button><button class="button primary" [disabled]="saving">{{ saving ? 'Saving…' : id ? 'Save changes' : 'Submit report' }}</button></div></form>}</section>`
})
export class CitizenComplaintPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ComplaintService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly categories = COMPLAINT_CATEGORIES;
  readonly form = this.fb.nonNullable.group({ title: ['', [Validators.required, Validators.maxLength(100)]], description: ['', [Validators.required, Validators.maxLength(500)]], category: ['', Validators.required], location: ['', [Validators.required, Validators.maxLength(150)]] });
  item: Complaint | null = null;
  id?: number;
  invalidId = false;
  editing = false;
  loading = false;
  saving = false;
  error = '';
  ngOnInit(): void {
    const raw = this.route.snapshot.paramMap.get('id');
    if (!raw) return;
    const id = Number(raw);
    if (!Number.isInteger(id) || id < 1) {
      this.invalidId = true;
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
      next: item => { this.item = item; this.form.patchValue(item); this.loading = false; this.changeDetector.markForCheck(); },
      error: err => { this.error = friendlyError(err, 'Could not load this complaint.'); this.loading = false; this.changeDetector.markForCheck(); }
    });
  }  hint(name: 'title'|'description'|'category'|'location', fallback: string): string { const c = this.form.controls[name]; if (c.invalid && (c.touched || c.dirty)) return c.hasError('required') ? 'This field is required.' : 'Please check the field length.'; return fallback; }
  submit(): void {
    this.form.markAllAsTouched(); if (this.form.invalid || this.saving) return;
    this.saving = true; this.error = '';
    const values = this.form.getRawValue();
    const payload: Complaint = { ...values, status: this.item?.status ?? 'PENDING' };
    const request = this.id ? this.api.update(this.id, payload) : this.api.create(payload);
    request.subscribe({ next: () => this.router.navigate(['/citizen/complaints'], { queryParams: { saved: this.id ? 'updated' : 'created' } }), error: err => { const apiError = err.error as ApiError; this.error = Object.values(apiError?.validationErrors ?? {}).join(' ') || friendlyError(err, 'The complaint could not be saved.'); this.saving = false; this.changeDetector.markForCheck(); } });
  }
}
