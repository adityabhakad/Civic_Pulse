import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-role-hero-diagram',
  standalone: true,
  templateUrl: './role-hero-diagram.html',
  styleUrl: './role-hero-diagram.css'
})
export class RoleHeroDiagramComponent {
  @Input() audience: 'admin' | 'citizen' = 'citizen';
}
