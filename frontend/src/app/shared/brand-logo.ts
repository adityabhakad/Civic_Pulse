import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-brand-logo',
  standalone: true,
  imports: [RouterLink],
  template: `<a class="brand" [routerLink]="link" aria-label="CivicPulse home">
    <span class="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 40 40" focusable="false">
        <path d="M20 4.5c-7 0-12.7 5.7-12.7 12.7 0 9.2 12.7 19 12.7 19s12.7-9.8 12.7-19C32.7 10.2 27 4.5 20 4.5Z" fill="currentColor"/>
        <circle cx="20" cy="17" r="6.2" fill="#fff"/>
        <path d="m16.7 17 2.2 2.2 4.5-4.6" fill="none" stroke="#16a579" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4"/>
      </svg>
    </span>
    <span class="brand-copy"><strong>CivicPulse</strong><small>Community issue tracker</small></span>
  </a>`
})
export class BrandLogoComponent {
  @Input() link = '/';
}
