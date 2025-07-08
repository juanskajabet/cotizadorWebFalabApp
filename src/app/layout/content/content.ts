import { Component } from '@angular/core';
import { Auth } from '../../auth/auth';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-content',
  imports: [],
  templateUrl: './content.html',
  styleUrl: './content.css'
})
export class Content {
  constructor(private auth: Auth, private router: Router) { }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
