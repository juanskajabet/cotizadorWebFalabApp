import { Component } from '@angular/core';
import { Auth } from '../../auth/auth';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-index',
  imports: [CommonModule],
  templateUrl: './index.html',
  styleUrl: './index.css'
})
export class Index {
  constructor(private auth: Auth, private router: Router) { }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
