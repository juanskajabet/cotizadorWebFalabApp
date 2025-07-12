import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

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
}
