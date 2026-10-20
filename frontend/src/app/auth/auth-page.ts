import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { BrandLogoComponent } from '../shared/brand-logo';
import { friendlyError } from '../core/error-message';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, BrandLogoComponent],
  template: `<section class="auth-wrap"><div class="auth-intro"><app-brand-logo /><p class="eyebrow">WELCOME TO CIVICPULSE</p><h1>{{ registering ? 'Make your voice heard.' : 'Welcome back.' }}</h1><p>{{ registering ? 'Create a citizen account to report local issues and follow their resolution.' : 'Sign in to manage your civic reports.' }}</p><div class="auth-benefit"><span>✓</span> Your reports stay connected to your account</div><div class="auth-benefit"><span>✓</span> Follow every status update</div></div><div class="auth-card"><h2>{{ registering ? 'Create your account' : 'Sign in' }}</h2><p class="muted">{{ registering ? 'It only takes a minute.' : 'Enter your account details below.' }}</p>@if (error) {<div class="alert" role="alert">{{ error }}</div>}<form [formGroup]="form" (ngSubmit)="submit()" novalidate>@if (registering) {<label class="field">Full name <span>*</span><input formControlName="displayName" autocomplete="name" placeholder="Your name" maxlength="100"><small>{{ fieldError('displayName') }}</small></label>}<label class="field">Email address <span>*</span><input type="email" formControlName="email" autocomplete="email" placeholder="you@example.com"><small>{{ fieldError('email') }}</small></label><label class="field">Password <span>*</span><input type="password" formControlName="password" [attr.autocomplete]="registering ? 'new-password' : 'current-password'" placeholder="{{ registering ? 'At least 8 characters' : 'Your password' }}"><small>{{ fieldError('password') }}</small></label><button class="button primary wide" [disabled]="saving">{{ saving ? 'Please wait…' : registering ? 'Create citizen account' : 'Sign in' }}</button></form><p class="auth-switch">{{ registering ? 'Already have an account?' : 'New to CivicPulse?' }} <a [routerLink]="registering ? '/login' : '/register'">{{ registering ? 'Sign in' : 'Create an account' }}</a></p></div></section>`
})
export class AuthPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  registering = false;
  saving = false;
  error = '';
  readonly form = this.fb.nonNullable.group({ displayName: ['', [Validators.maxLength(100)]], email: ['', [Validators.required, Validators.email]], password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]] });
  ngOnInit(): void { this.registering = this.route.snapshot.data['mode'] === 'register'; if (this.registering) { this.form.controls.displayName.addValidators(Validators.required); this.form.controls.displayName.updateValueAndValidity(); } if (this.route.snapshot.queryParamMap.get('reason') === 'session-expired') this.error = 'Your session has expired. Please sign in again.'; }
  fieldError(field: 'displayName' | 'email' | 'password'): string { const c = this.form.controls[field]; if (!c.touched && !c.dirty) return ''; if (c.hasError('required')) return 'This field is required.'; if (c.hasError('email')) return 'Enter a valid email address.'; if (c.hasError('minlength')) return 'Use at least 8 characters.'; if (c.hasError('maxlength')) return 'The value is too long.'; return ''; }
  submit(): void {
    this.form.markAllAsTouched(); if (this.form.invalid || this.saving) return;
    this.saving = true; this.error = '';
    const { displayName, email, password } = this.form.getRawValue();
    const request = this.registering ? this.auth.register(displayName, email, password) : this.auth.login(email, password);
    request.subscribe({ next: result => this.router.navigateByUrl(result.role === 'ADMIN' ? '/admin' : '/citizen'), error: (err: HttpErrorResponse) => { this.error = friendlyError(err, 'Unable to sign in. Check your details and try again.'); this.saving = false; this.changeDetector.markForCheck(); } });
  }
}
