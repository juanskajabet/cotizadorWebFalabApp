import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-sidebar',
  imports: [CommonModule,RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  
  sidebarOpen = true;
  constructor(
    private router: Router,
  ) {
  }
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
  cerrarSesion() {
    this.router.navigate(['/login']);
  }

}
