import { Component, EventEmitter, Input, Output } from '@angular/core';
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
export class ConfiguracionDialogo {
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

  @Input() esNuevaConfiguracion: boolean = true;

  @Output() configuracionGuardada = new EventEmitter<void>();

  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  guardarConfiguracion() {
    if (!this.configuracion || !this.configuracion.IdMaterial) {
      alert('Debe seleccionar un material.');
      return;
    }

    const payload: any = {
      IdMaterial: this.configuracion.IdMaterial,
      TiempoPostProc: this.configuracion.TiempoPostProc ?? '00:00:00'
    };

    // Filamento y Resina
    if (this.configuracion.CodigoMaquina === 'FDA' || this.configuracion.CodigoMaquina === 'SDA') {
      payload.CostoPorKg = this.configuracion.CostoPorKg ?? null;
      payload.CostoPorGr = this.configuracion.CostoPorGr ?? null;
      payload.AlquilerHora = this.configuracion.AlquilerHora ?? null;
    }

    // Laser
    if (this.configuracion.CodigoMaquina === 'LAS') {
      payload.AlquilerMinuto = this.configuracion.AlquilerMinuto ?? null;
      payload.CostoPorM2 = this.configuracion.CostoPorM2 ?? null;
    }

    // Sublimadora
    if (this.configuracion.CodigoMaquina === 'SUB') {
      payload.CostoUsoA4 = this.configuracion.CostoUsoA4 ?? null;
      payload.CostoFijo = this.configuracion.CostoFijo ?? null;
    }

    this.http.post(`${this.apiUrl}/parametros-costo/agregar`, payload)
      .subscribe({
        next: () => {
          // Mostrar alerta de éxito
          const alert = document.createElement('div');
          alert.className = 'alert alert-success';
          alert.textContent = 'Configuración guardada correctamente.';
          document.body.appendChild(alert);
          setTimeout(() => alert.remove(), 3000);

          // Cerrar modal
          const modalEl = document.querySelector('.modal.show');
          if (modalEl) {
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();
          }

          // Emitir evento
          this.configuracionGuardada.emit();
        },
        error: (error) => {
          console.error('Error guardando configuración:', error);
          alert('Ocurrió un error al guardar.');
        }
      });
  }

}
