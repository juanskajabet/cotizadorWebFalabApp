import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Sidebar } from './layout/sidebar/sidebar';
import { Auth } from './auth/auth';


@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(public auth: Auth, public router: Router) { }

  isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }
  protected title = 'proyecto-cotizador';
}
