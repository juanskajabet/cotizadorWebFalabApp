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
    IdParametroCosto: undefined,
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes['configuracion']) {
      this.cargarMateriales();
    }
  }

  cargarMateriales() {
    if (!this.configuracion?.CodigoMaquina) {
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
      this.materiales = [];
      return;
    }

    this.http.get<any>(`${this.apiUrl}/tipomaterial/por-maquina/${idTipoMaquina}`)
      .subscribe({
        next: (res) => {
          this.materiales = res.data || [];
        },
        error: (err) => {
          console.error('Error cargando materiales:', err);
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

    if (this.esNuevaConfiguracion) {
      // Crear nuevo registro
      this.http.post(`${this.apiUrl}/parametros-costo/agregar`, payload)
        .subscribe({
          next: () => {
            this.mostrarNotificacion('Configuración agregada correctamente.');
            this.cerrarModal();
            this.configuracionGuardada.emit();
          },
          error: (err) => {
            console.error('Error al agregar:', err);
            alert('Ocurrió un error al agregar.');
          }
        });
    } else {
      // Actualizar registro existente
      if (!this.configuracion.IdParametroCosto) {
        alert('ID de configuración no definido para actualizar.');
        return;
      }

      this.http.put(`${this.apiUrl}/parametros-costo/actualizar/${this.configuracion.IdParametroCosto}`, payload)
        .subscribe({
          next: () => {
            this.mostrarNotificacion('Configuración actualizada correctamente.');
            this.cerrarModal();
            this.configuracionGuardada.emit();
          },
          error: (err) => {
            console.error('Error al actualizar:', err);
            alert('Ocurrió un error al actualizar.');
          }
        });
    }
  }

  private mostrarNotificacion(mensaje: string) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3';
    alertDiv.style.zIndex = '9999';
    alertDiv.textContent = mensaje;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
  }

  private cerrarModal() {
    const modalEl = document.querySelector('.modal.show');
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal.hide();
    }
  }
}