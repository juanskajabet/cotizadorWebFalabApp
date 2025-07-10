import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoDialogo } from './producto-dialogo/producto-dialogo';

interface Producto {
  codigo: string;
  maquina: string;
  producto: string;
  cantidad: number;
  tiempoUnitario: string;
  tiempoTotal: string;
  precioUnitario: number;
  precioTotal: number;
}

@Component({
  standalone: true,
  selector: 'app-productos',
  imports: [
    CommonModule,
    FormsModule,
    ProductoDialogo
  ],
  templateUrl: './productos.html',
  styleUrl: './productos.css'
})
export class Productos {

 maquinas = ['Laser', 'Sublimadora'];
  selectedMachine = '';
  searchTerm = '';
  data: Producto[] = [];
  filteredData: Producto[] = [];
  paginatedData: Producto[] = [];

  currentPage = 1;
  pageSize = 5;
  totalPages = 1;
  pages: number[] = [];

  constructor() {
    // Datos simulados
    for (let i = 1; i <= 20; i++) {
      this.data.push({
        codigo: `COD-${i}`,
        maquina: i % 2 === 0 ? 'Laser' : 'Sublimadora',
        producto: `Producto ${i}`,
        cantidad: Math.floor(Math.random() * 50 + 1),
        tiempoUnitario: '5 min',
        tiempoTotal: '1 hr',
        precioUnitario: 10 + i,
        precioTotal: (10 + i) * 5,
      });
    }
    this.applyFilters();
  }

  filterByMachine() {
    this.currentPage = 1;
    this.applyFilters();
  }

  filterBySearch() {
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredData = this.data.filter(item => {
      const matchesMachine = this.selectedMachine ? item.maquina === this.selectedMachine : true;
      const matchesSearch = this.searchTerm
        ? item.producto.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          item.codigo.toLowerCase().includes(this.searchTerm.toLowerCase())
        : true;
      return matchesMachine && matchesSearch;
    });
    this.totalPages = Math.ceil(this.filteredData.length / this.pageSize);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.updatePage();
  }

  updatePage() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedData = this.filteredData.slice(start, end);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePage();
  }

  agregarProducto() {
    alert('Funcionalidad de agregar producto pendiente.');
  }


}
