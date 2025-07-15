import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ProductoDialogo } from './producto-dialogo/producto-dialogo';
import { environment } from  '../../../environments/environments';

declare var bootstrap: any;

interface Producto {
  codigo: string;
  producto: string;
  altura: number;
  ancho: number;
  profundidad: number;
  horas: number;
  minutos: number;
  tiempoPostProceso: string;
  tiempoTotal: string;
  cantidadMaterial: number;
  costoMaterial: number;
  costoSublimacion: number | null;
  precio: number;
  idTipoMaquina?: number;
  idMaterial?: number;
  idProducto?: number;
  nombreMaterial?: string;
}

interface TipoMaquina {
  IdTipoMaquina: number;
  CodigoMaquina: string;
  Nombre: string;
}

interface ProductoApi {
  IdProducto: number;
  CodigoProducto: string;
  IdTipoMaquina: number;
  IdMaterial: number;
  NombreProducto: string;
  AlturaCm: number;
  AnchoCm: number;
  ProfundidadCm: number;
  Horas: number;
  Minutos: number;
  TiempoPostProceso: string;
  TiempoTotal: string;
  CantidadMaterialGr: number;
  CostoMaterial: number;
  CostoSublimacion: number | null;
  Precio: number;
  NombreMaterial?: string;
}

@Component({
  standalone: true,
  selector: 'app-productos',
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    ProductoDialogo
  ],
  templateUrl: './productos.html',
  styleUrl: './productos.css'
})
export class Productos {
  maquinas: TipoMaquina[] = [];
  selectedMachine: number | null = null;
  searchTerm = '';
  data: Producto[] = [];
  paginatedData: Producto[] = [];

  currentPage = 1;
  pageSize = 5;
  totalRegistros = 0;
  totalPages = 1;
  pages: number[] = [];
  productoSeleccionado: Producto | null = null;
  esNuevoProducto = false;
  tipoMaquinaSeleccionada: string | null = null;

  

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    this.cargarTiposMaquina();
  }

  cargarTiposMaquina() {
    this.http.get<TipoMaquina[]>(`${this.apiUrl}/tipos-maquina`)
      .subscribe({
        next: (response) => {
          this.maquinas = response;
          console.log('Tipos de máquina cargados:', response);
        },
        error: (error) => {
          console.error('Error cargando tipos de máquina:', error);
        }
      });
  }

  consultarProductos() {
    if (!this.selectedMachine) {
      this.data = [];
      this.paginatedData = [];
      this.totalRegistros = 0;
      this.totalPages = 1;
      this.pages = [];
      return;
    }

    const params: any = {
      paginaActual: this.currentPage.toString(),
      cantidadPagina: this.pageSize.toString()
    };

    if (this.searchTerm.trim() !== '') {
      params.search = this.searchTerm.trim();
    }

    this.http.get<any>(`${this.apiUrl}/producto/por-tipo-maquina/${this.selectedMachine}`, { params })
      .subscribe({
        next: (response) => {
          const productosApi = response.data?.Productos || [];
          this.totalRegistros = response.data?.totalRegistros || 0;

          this.data = productosApi.map((p: ProductoApi) => ({
            codigo: p.CodigoProducto,
            producto: p.NombreProducto,
            altura: p.AlturaCm,
            ancho: p.AnchoCm,
            profundidad: p.ProfundidadCm,
            horas: p.Horas,
            minutos: p.Minutos,
            tiempoPostProceso: p.TiempoPostProceso,
            tiempoTotal: p.TiempoTotal,
            cantidadMaterial: p.CantidadMaterialGr,
            costoMaterial: p.CostoMaterial,
            costoSublimacion: p.CostoSublimacion,
            precio: p.Precio,
            idTipoMaquina: p.IdTipoMaquina,
            idMaterial: p.IdMaterial,
            idProducto: p.IdProducto,
            nombreMaterial: p.NombreMaterial
          }));

          this.paginatedData = this.data;
          this.totalPages = Math.ceil(this.totalRegistros / this.pageSize);
          this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
        },
        error: (error) => {
          console.error('Error consultando productos:', error);
        }
      });
  }

 filterByMachine() {
  this.currentPage = 1;
  const maquina = this.maquinas.find(m => m.IdTipoMaquina === this.selectedMachine);
  this.tipoMaquinaSeleccionada = maquina ? maquina.CodigoMaquina : null;
  this.consultarProductos();
}


  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.consultarProductos();
  }

  onBuscar() {
    this.currentPage = 1;
    this.consultarProductos();
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.consultarProductos();
  }
private crearProductoVacio(): Producto {
  return {
    idProducto: 0,
    codigo: '',
    producto: '',
    altura: 0,
    ancho: 0,
    profundidad: 0,
    horas: 0,
    minutos: 0,
    tiempoPostProceso: '00:00:00',
    tiempoTotal: '0h 0m',
    cantidadMaterial: 0,
    costoMaterial: 0,
    costoSublimacion: null,
    precio: 0,
    idTipoMaquina: undefined,
    idMaterial: undefined,
    nombreMaterial: ''
  };
}

agregarProducto() {
  if (this.selectedMachine == null) {
    return;
  }

  this.esNuevoProducto = true;
  this.productoSeleccionado = {
    codigo: '',
    producto: '',
    altura: 0,
    ancho: 0,
    profundidad: 0,
    horas: 0,
    minutos: 0,
    tiempoPostProceso: '00:00:00',
    tiempoTotal: '0h 0m',
    cantidadMaterial: 0,
    costoMaterial: 0,
    costoSublimacion: null,
    precio: 0,
    idTipoMaquina: this.selectedMachine, // Preseleccionar
    idMaterial: undefined,
    idProducto: undefined,
    nombreMaterial: ''
  };

  // Mostrar modal programáticamente
  const modalElement = document.getElementById('modalAgregarProducto');
  const modalInstance = new bootstrap.Modal(modalElement!);
  modalInstance.show();
}


abrirNuevoProducto() {
  this.esNuevoProducto = true;
  this.productoSeleccionado = {
    codigo: '',
    producto: '',
    altura: 0,
    ancho: 0,
    profundidad: 0,
    horas: 0,
    minutos: 0,
    tiempoPostProceso: '00:30:00',
    tiempoTotal: '0h 0m',
    cantidadMaterial: 0,
    costoMaterial: 0,
    costoSublimacion: null,
    precio: 0,
    idTipoMaquina: undefined,
    idMaterial: undefined,
    idProducto: 0, 
    nombreMaterial: ''
  };

  const modal = new bootstrap.Modal(
    document.getElementById('modalAgregarProducto')!
  );
  modal.show();
}

seleccionarProducto(producto: Producto) {
  this.esNuevoProducto = false;
  this.productoSeleccionado = { ...producto };

  const modal = new bootstrap.Modal(
    document.getElementById('modalAgregarProducto')!
  );
  modal.show();
}
  
}


