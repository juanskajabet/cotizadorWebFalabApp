import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ConfiguracionDialogo } from './configuracion-dialogo/configuracion-dialogo';

declare var bootstrap: any;

export interface ConfiguracionItem {
  IdParametroCosto?: number;
  IdMaterial?: number;
  NombreMaterial?: string;
  CostoPorKg?: number | null;
  CostoPorGr?: number | null;
  AlquilerHora?: number | null;
  AlquilerMinuto?: number | null;
  CostoPorM2?: number | null;
  CostoUsoA4?: number | null;
  CostoFijo?: number | null;
  TiempoPostProc: string;
  CodigoMaquina?: string;
}

export interface TipoMaquina {
  IdTipoMaquina: number;
  CodigoMaquina: string;
  Nombre: string;
}

interface ConfiguracionApi {
  IdParametroCosto: number;
  IdMaterial: number;
  CostoPorKg: number | null;
  CostoPorGr: number | null;
  AlquilerHora: number | null;
  AlquilerMinuto: number | null;
  CostoPorM2: number | null;
  CostoUsoA4: number | null;
  CostoFijo: number | null;
  TiempoPostProc: string;
  material: {
    IdMaterial: number;
    IdTipoMaquina: number;
    CodigoMaterial: string;
    NombreMaterial: string;
    tipo_maquina: {
      IdTipoMaquina: number;
      CodigoMaquina: string;
      Nombre: string;
    };
  };
}

@Component({
  standalone: true,
  selector: 'app-configuracion',
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    ConfiguracionDialogo
  ],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css'
})
export class Configuracion {
  maquinas: TipoMaquina[] = [];
  selectedMachine: number | null = null;
  tipoMaquinaSeleccionada: string | undefined;

  searchTerm = '';
  data: ConfiguracionItem[] = [];
  paginatedData: ConfiguracionItem[] = [];

  currentPage = 1;
  pageSize = 5;
  totalRegistros = 0;
  totalPages = 1;
  pages: number[] = [];

  configuracionSeleccionada: ConfiguracionItem | null = null;
  esNuevaConfiguracion = false;

  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {
    this.cargarTiposMaquina();
  }

  cargarTiposMaquina() {
    this.http.get<TipoMaquina[]>(`${this.apiUrl}/tipos-maquina`)
      .subscribe({
        next: (response) => {
          this.maquinas = response;
        },
        error: (error) => {
          console.error('Error cargando tipos de máquina:', error);
        }
      });
  }

  consultarConfiguraciones() {
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

  // URL corregida según tu requerimiento
  this.http.get<any>(`${this.apiUrl}/parametros-costo/buscar/maquina/${this.selectedMachine}`, { params })
    .subscribe({
      next: (response) => {
        const configuracionesApi = response.data?.Parametros || [];
        this.totalRegistros = response.data?.totalRegistros || 0;

        this.data = configuracionesApi.map((c: ConfiguracionApi) => ({
          IdParametroCosto: c.IdParametroCosto,
          IdMaterial: c.IdMaterial,
          NombreMaterial: c.material?.NombreMaterial,
          CostoPorKg: c.CostoPorKg,
          CostoPorGr: c.CostoPorGr,
          AlquilerHora: c.AlquilerHora,
          AlquilerMinuto: c.AlquilerMinuto,
          CostoPorM2: c.CostoPorM2,
          CostoUsoA4: c.CostoUsoA4,
          CostoFijo: c.CostoFijo,
          TiempoPostProc: c.TiempoPostProc,
          CodigoMaquina: c.material?.tipo_maquina?.CodigoMaquina
        }));

        this.paginatedData = this.data;
        this.totalPages = Math.ceil(this.totalRegistros / this.pageSize);
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
      },
      error: (error) => {
        console.error('Error consultando configuraciones:', error);
      }
    });
}


  filterByMachine() {
    this.currentPage = 1;
    const maquina = this.maquinas.find(m => m.IdTipoMaquina === this.selectedMachine);
    this.tipoMaquinaSeleccionada = maquina ? maquina.CodigoMaquina : undefined;
    this.consultarConfiguraciones();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.consultarConfiguraciones();
  }

  onBuscar() {
    this.currentPage = 1;
    this.consultarConfiguraciones();
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.consultarConfiguraciones();
  }

  agregarConfiguracion() {
    if (this.selectedMachine == null) {
      return;
    }

    this.esNuevaConfiguracion = true;
    this.configuracionSeleccionada = {
      IdParametroCosto: 0,
      IdMaterial: undefined,
      NombreMaterial: '',
      CostoPorKg: null,
      CostoPorGr: null,
      AlquilerHora: null,
      AlquilerMinuto: null,
      CostoPorM2: null,
      CostoUsoA4: null,
      CostoFijo: null,
      TiempoPostProc: '00:00:00',
      CodigoMaquina: this.tipoMaquinaSeleccionada
    };

    const modal = new bootstrap.Modal(
      document.getElementById('modalAgregarProducto')!
    );
    modal.show();
  }

  seleccionarConfiguracion(config: ConfiguracionItem) {
    this.esNuevaConfiguracion = false;
    this.configuracionSeleccionada = { ...config };

    const modal = new bootstrap.Modal(
      document.getElementById('modalAgregarProducto')!
    );
    modal.show();
  }
}
