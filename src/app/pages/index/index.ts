import { Component } from '@angular/core';
import { Auth } from '../../auth/auth';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from '../../layout/header/header';
import { Sidebar } from '../../layout/sidebar/sidebar';
import { Content } from '../../layout/content/content';

@Component({
  standalone: true,
  selector: 'app-index',
  imports: [CommonModule, Header, Sidebar, Content],
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
