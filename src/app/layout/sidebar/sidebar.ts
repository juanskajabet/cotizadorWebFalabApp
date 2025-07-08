import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {

  constructor(
    private router: Router,
  ) {
  }


  irReportes() {
    this.router.navigate(['reporte']);
  }

  irInicio() {
    this.router.navigate(['index']);
  }


}
