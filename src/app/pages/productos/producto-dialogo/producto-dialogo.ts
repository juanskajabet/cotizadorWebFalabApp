import { Component,Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';


interface TipoMaquina {
  IdTipoMaquina: number;
  CodigoMaquina: string;
  Nombre: string;
}

@Component({
  standalone: true,
  selector: 'app-producto-dialogo',
  imports: [FormsModule,HttpClientModule,CommonModule],
  templateUrl: './producto-dialogo.html',
  styleUrl: './producto-dialogo.css'
})
export class ProductoDialogo {
 @Input() producto: any;
  maquinas: TipoMaquina[] = [];
  private apiUrl = 'http://127.0.0.1:8000/api';


 constructor(private http: HttpClient) {
    this.cargarTiposMaquina();
  }
 actualizarTiempoTotal() {
  const horas = this.producto?.horas ?? 0;
  const minutos = this.producto?.minutos ?? 0;

  // Suma tiempos
  const totalMinutos = horas * 60 + minutos;

  // Extrae minutos del post-procesamiento
  const [ppH, ppM, _] = this.producto?.tiempoPostProceso?.split(':') ?? ['0', '0', '0'];
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
          console.log('Tipos de máquina cargados dialogo:', response);
        },
        error: (error) => {
          console.error('Error cargando tipos de máquina:', error);
        }
      });
  }

}
