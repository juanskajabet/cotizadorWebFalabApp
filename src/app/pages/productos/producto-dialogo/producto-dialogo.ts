import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { EventEmitter, Output } from '@angular/core';

declare var bootstrap: any;

interface TipoMaquina {
  IdTipoMaquina: number;
  CodigoMaquina: string;
  Nombre: string;
}
interface Material {
  IdMaterial: number;
  IdTipoMaquina: number;
  CodigoMaterial: string;
  NombreMaterial: string;
  Maquina?: {
    IdTipoMaquina: number;
    CodigoMaquina: string;
    Nombre: string;
  } | null;
}

@Component({
  standalone: true,
  selector: 'app-producto-dialogo',
  imports: [FormsModule, HttpClientModule, CommonModule],
  templateUrl: './producto-dialogo.html',
  styleUrl: './producto-dialogo.css'
})
export class ProductoDialogo {
  @Input() producto: any;
  @Input() key?: string | number;
  @Output() productoGuardado = new EventEmitter<void>();



  maquinas: TipoMaquina[] = [];
  materiales: Material[] = [];
  materialesFiltrados: Material[] = [];
  esNuevoProducto = true;

  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {
    this.cargarTiposMaquina();
    this.cargarMateriales();
  }

  actualizarTiempoTotal() {
    const horas = this.producto?.horas ?? 0;
    const minutos = this.producto?.minutos ?? 0;
    const totalMinutos = horas * 60 + minutos;
    const [ppH, ppM] = this.producto?.tiempoPostProceso?.split(':') ?? ['0', '0'];
    const postProcesoMin = (+ppH) * 60 + (+ppM);
    const total = totalMinutos + postProcesoMin;
    const totalHoras = Math.floor(total / 60);
    const totalRestMin = total % 60;
    this.producto.tiempoTotal = `${totalHoras}h ${totalRestMin}m`;
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

  cargarMateriales() {
    this.http.get<any>(`${this.apiUrl}/tipomaterial/obtener-todos`)
      .subscribe({
        next: (response) => {
          this.materiales = (response.data || []).map((m: any) => ({
            IdMaterial: m.IdMaterial,
            IdTipoMaquina: m.IdTipoMaquina,
            CodigoMaterial: m.CodigoMaterial,
            NombreMaterial: m.NombreMaterial,
            Maquina: m.Maquina ? {
              IdTipoMaquina: m.Maquina.IdTipoMaquina,
              CodigoMaquina: m.Maquina.CodigoMaquina,
              Nombre: m.Maquina.Nombre
            } : null
          }));
          this.materialesFiltrados = this.materiales;
        },
        error: (error) => {
          console.error('Error cargando materiales:', error);
        }
      });
  }

  onMaquinaChange() {
    this.materialesFiltrados = this.materiales.filter(
      m => m.IdTipoMaquina === this.producto.idTipoMaquina
    );
    const materialActual = this.materialesFiltrados.find(
      m => m.IdMaterial === this.producto.idMaterial
    );
    if (!materialActual) {
      this.producto.idMaterial = undefined;
    }
  }

  onMaterialChange() {
    const material = this.materiales.find(
      m => m.IdMaterial === this.producto.idMaterial
    );
    if (material) {
      this.producto.idTipoMaquina = material.IdTipoMaquina;
      this.onMaquinaChange();
    }
  }
get esFDA(): boolean { return this.producto?.idTipoMaquina === 1; }
get esSDA(): boolean { return this.producto?.idTipoMaquina === 2; }
get esLAS(): boolean { return this.producto?.idTipoMaquina === 3; }
get esSUB(): boolean { return this.producto?.idTipoMaquina === 5; }

guardarProducto() {
  if (!this.producto?.idTipoMaquina || !this.producto?.idMaterial || !this.producto?.producto) {
    alert('Por favor, seleccione máquina, material y descripción.');
    return;
  }

  const tipo = this.producto.idTipoMaquina;

  const payload = {
    IdMaterial: this.producto.idMaterial,
    NombreProducto: this.producto.producto,
    AlturaCm: (tipo !== 5 ? this.producto.altura : null),
    AnchoCm: (tipo !== 5 ? this.producto.ancho : null),
    ProfundidadCm: (tipo === 1 || tipo === 2) ? this.producto.profundidad : null,
    Horas: (tipo === 5 ? null : this.producto.horas),
    Minutos: this.producto.minutos,
    TiempoPostProceso: this.producto.tiempoPostProceso,
    TiempoTotal: this.convertirTiempoTotal(this.producto.tiempoTotal),
    CantidadMaterialGr: (tipo !== 5 ? this.producto.cantidadMaterial : null),
    CostoMaterial: this.producto.costoMaterial,
    CostoSublimacion: (tipo === 5 ? this.producto.costoSublimacion : null),
    Precio: 20
  };

  this.http.post(`${this.apiUrl}/producto/agregar`, payload).subscribe({
    next: () => {
      this.mostrarAlertaExito();
      // Cerrar modal
      const modalElement = document.getElementById('modalAgregarProducto');
      if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal?.hide();
         this.productoGuardado.emit();
      }
    },
    error: (err) => {
      console.error('Error al guardar:', err);
      alert('Ocurrió un error al guardar el producto.');
    }
  });
}

private mostrarAlertaExito() {
  const alert = document.createElement('div');
  alert.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 end-0 m-3';
  alert.role = 'alert';
  alert.innerHTML = `
    <strong>¡Éxito!</strong> Registro ingresado correctamente.
  `;
  document.body.appendChild(alert);

  setTimeout(() => {
    alert.classList.remove('show');
    alert.classList.add('hide');
    setTimeout(() => alert.remove(), 300);
  }, 3000);
}

private convertirTiempoTotal(texto: string): string {
  if (!texto) return '00:00:00';

  const partes = texto.match(/(\d+)h\s+(\d+)m/);
  if (!partes) return '00:00:00';

  const horas = partes[1].padStart(2, '0');
  const minutos = partes[2].padStart(2, '0');
  return `${horas}:${minutos}:00`;
}



}
