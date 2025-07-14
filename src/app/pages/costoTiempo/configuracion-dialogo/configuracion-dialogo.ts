import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

declare var bootstrap: any;

interface Configuracion {
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

interface Material {
  IdMaterial: number;
  IdTipoMaquina: number;
  CodigoMaterial: string;
  NombreMaterial: string;
}

@Component({
  standalone: true,
  selector: 'app-configuracion-dialogo',
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  templateUrl: './configuracion-dialogo.html',
  styleUrl: './configuracion-dialogo.css'
})
export class ConfiguracionDialogo implements OnChanges {
  @Input() configuracion: Configuracion = {
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
    CodigoMaquina: ''
  };

  @Input() esNuevaConfiguracion = true;

  @Output() configuracionGuardada = new EventEmitter<void>();

  materiales: Material[] = [];

  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  // Cada vez que cambian los inputs
  ngOnChanges(changes: SimpleChanges) {
    if (changes['configuracion']) {
      this.cargarMateriales();
    }
  }

  cargarMateriales() {
    if (!this.configuracion?.CodigoMaquina) {
      console.warn('No hay CodigoMaquina definido.');
      this.materiales = [];
      return;
    }

    const tipoMaquinaMap: Record<string, number> = {
      'FDA': 1,
      'SDA': 2,
      'LAS': 3,
      'SUB': 5
    };

    const idTipoMaquina = tipoMaquinaMap[this.configuracion.CodigoMaquina];
    if (!idTipoMaquina) {
      console.error('Tipo de máquina inválido.');
      this.materiales = [];
      return;
    }

    this.http.get<any>(`${this.apiUrl}/tipomaterial/por-maquina/${idTipoMaquina}`)
      .subscribe({
        next: (response) => {
          this.materiales = response.data || [];
        },
        error: (error) => {
          console.error('Error cargando materiales:', error);
          this.materiales = [];
        }
      });
  }

  guardarConfiguracion() {
    if (!this.configuracion || !this.configuracion.IdMaterial) {
      alert('Debe seleccionar un material.');
      return;
    }

    const payload: any = {
      IdMaterial: this.configuracion.IdMaterial,
      CostoPorKg: null,
      CostoPorGr: null,
      AlquilerHora: null,
      AlquilerMinuto: null,
      CostoPorM2: null,
      CostoUsoA4: null,
      CostoFijo: null,
      TiempoPostProc: this.configuracion.TiempoPostProc ?? '00:00:00'
    };

    switch (this.configuracion.CodigoMaquina) {
      case 'FDA':
      case 'SDA':
        payload.CostoPorKg = this.configuracion.CostoPorKg ?? null;
        payload.CostoPorGr = this.configuracion.CostoPorGr ?? null;
        payload.AlquilerHora = this.configuracion.AlquilerHora ?? null;
        break;
      case 'LAS':
        payload.AlquilerMinuto = this.configuracion.AlquilerMinuto ?? null;
        payload.CostoPorM2 = this.configuracion.CostoPorM2 ?? null;
        break;
      case 'SUB':
        payload.CostoUsoA4 = this.configuracion.CostoUsoA4 ?? null;
        payload.CostoFijo = this.configuracion.CostoFijo ?? null;
        break;
    }

    this.http.post(`${this.apiUrl}/parametros-costo/agregar`, payload)
      .subscribe({
        next: () => {
          const alert = document.createElement('div');
          alert.className = 'alert alert-success';
          alert.textContent = 'Configuración guardada correctamente.';
          document.body.appendChild(alert);
          setTimeout(() => alert.remove(), 3000);

          const modalEl = document.querySelector('.modal.show');
          if (modalEl) {
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();
          }

          this.configuracionGuardada.emit();
        },
        error: (error) => {
          console.error('Error guardando configuración:', error);
          alert('Ocurrió un error al guardar.');
        }
      });
  }
}
