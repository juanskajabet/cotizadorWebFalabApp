import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Sidebar } from './layout/sidebar/sidebar';
import { Header } from './layout/header/header';
import { Auth } from './auth/auth';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, Header, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(private auth: Auth, public router: Router) { }

  isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }
  protected title = 'proyecto-cotizador';
}
