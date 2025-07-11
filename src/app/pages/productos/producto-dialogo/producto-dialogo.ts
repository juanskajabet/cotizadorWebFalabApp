import { Component,Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-producto-dialogo',
  imports: [FormsModule],
  templateUrl: './producto-dialogo.html',
  styleUrl: './producto-dialogo.css'
})
export class ProductoDialogo {
 @Input() producto: any;


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

}
