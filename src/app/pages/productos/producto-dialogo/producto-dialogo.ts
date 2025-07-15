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

  cargarTiposMaquina() {
    this.http.get<TipoMaquina[]>(`${this.apiUrl}/tipos-maquina`)
      .subscribe({
        next: (response) => this.maquinas = response,
        error: (error) => console.error('Error cargando tipos de máquina:', error)
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
        error: (error) => console.error('Error cargando materiales:', error)
      });
  }

  onMaquinaChange() {
    this.materialesFiltrados = this.materiales.filter(
      m => m.IdTipoMaquina === this.producto.idTipoMaquina
    );

    this.producto.idMaterial = undefined;
    this.producto.cantidadMaterial = 0;
    this.producto.costoMaterial = 0;
    this.producto.tiempoPostProceso = '00:00:00';
    this.actualizarTiempoTotal();
  }

  onMaterialChange() {
    const material = this.materiales.find(
      m => m.IdMaterial === this.producto.idMaterial
    );

    if (material) {
      this.producto.idTipoMaquina = material.IdTipoMaquina;
      this.materialesFiltrados = this.materiales.filter(
        m => m.IdTipoMaquina === this.producto.idTipoMaquina
      );

      this.http.get<any>(`${this.apiUrl}/parametros-costo/buscar/material/${material.IdMaterial}`)
        .subscribe({
          next: (res) => {
            if (res.data && res.data.length > 0) {
              const registro = res.data[0];
              this.producto.tiempoPostProceso = registro.TiempoPostProc ?? '00:00:00';
              this.actualizarTiempoTotal();
            }
          }
        });

      this.producto.cantidadMaterial = 0;
      this.producto.costoMaterial = 0;
    }
  }

  onCantidadChange() {
    if (this.esLAS) return; // En láser no hay cantidad
    this.calcularCostoYPrecio();
  }

  onDimensionChange() {
    if (this.esLAS) this.calcularCostoYPrecio();
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
    this.calcularCostoYPrecio();
  }

  calcularCostoYPrecio() {
    if (!this.producto?.idMaterial) {
      this.producto.costoMaterial = 0;
      this.producto.precio = 0;
      return;
    }

    const material = this.materiales.find(m => m.IdMaterial === this.producto.idMaterial);
    if (!material) {
      this.producto.costoMaterial = 0;
      this.producto.precio = 0;
      return;
    }

    const maquina = this.maquinas.find(m => m.IdTipoMaquina === material.IdTipoMaquina);
    const codigoMaquina = maquina?.CodigoMaquina;

    if (codigoMaquina === 'FDA' || codigoMaquina === 'SDA') {
      // Filamento y Resina
      this.http.get<any>(`${this.apiUrl}/parametros-costo/buscar/material/${material.IdMaterial}`)
        .subscribe({
          next: (res) => {
            if (res.data && res.data.length > 0) {
              const r = res.data[0];
              const costoPorGr = r.CostoPorGr ?? 0;
              const alquilerHora = r.AlquilerHora ?? 0;

              const calculado = this.producto.cantidadMaterial * costoPorGr;
              const redondeado = Math.round(calculado * 1000) / 1000;
              this.producto.costoMaterial = redondeado;

              const horasTotales = this.obtenerHorasTotales();
              const parcial = (horasTotales * alquilerHora) + (redondeado * 1.2);
              this.producto.precio = +(parcial * 1.24).toFixed(3);
            }
          }
        });
    } else if (codigoMaquina === 'LAS') {
      // Láser
      this.http.get<any>(`${this.apiUrl}/parametros-costo/buscar/material/${material.IdMaterial}`)
        .subscribe({
          next: (res) => {
            if (res.data && res.data.length > 0) {
              const r = res.data[0];
              const costoPorM2 = r.CostoPorM2 ?? 0;
              const alquilerHora = r.AlquilerHora ?? 0;

              const ancho = this.producto.ancho ?? 0;
              const alto = this.producto.altura ?? 0;
              const areaCm2 = ancho * alto;

              const calculado = (areaCm2 * costoPorM2) / 10000;
              const redondeado = Math.round(calculado * 1000) / 1000;
              this.producto.costoMaterial = redondeado;

              const horasTotales = this.obtenerHorasTotales();
              const parcial = (horasTotales * alquilerHora) + (redondeado * 1.2);
              this.producto.precio = +(parcial * 1.24).toFixed(3);
            }
          }
        });
    } else {
      this.producto.costoMaterial = 0;
      this.producto.precio = 0;
    }
  }

  private obtenerHorasTotales(): number {
    let horasTotales = 0;
    if (this.producto.tiempoTotal) {
      const partes = this.producto.tiempoTotal.match(/(\d+)h\s+(\d+)m/);
      if (partes) {
        const h = parseInt(partes[1], 10);
        const m = parseInt(partes[2], 10);
        horasTotales = h + m / 60;
      }
    }
    return horasTotales;
  }

  get esFDA() {
    const m = this.maquinas.find(x => x.IdTipoMaquina === this.producto?.idTipoMaquina);
    return m?.CodigoMaquina === 'FDA';
  }
  get esSDA() {
    const m = this.maquinas.find(x => x.IdTipoMaquina === this.producto?.idTipoMaquina);
    return m?.CodigoMaquina === 'SDA';
  }
  get esLAS() {
    const m = this.maquinas.find(x => x.IdTipoMaquina === this.producto?.idTipoMaquina);
    return m?.CodigoMaquina === 'LAS';
  }
  get esSUB() {
    const m = this.maquinas.find(x => x.IdTipoMaquina === this.producto?.idTipoMaquina);
    return m?.CodigoMaquina === 'SUB';
  }

  guardarProducto() {
    if (!this.producto?.idTipoMaquina || !this.producto?.idMaterial || !this.producto?.producto) {
      alert('Por favor, seleccione máquina, material y descripción.');
      return;
    }

    const payload = {
      IdMaterial: this.producto.idMaterial,
      NombreProducto: this.producto.producto,
      AlturaCm: this.producto.altura,
      AnchoCm: this.producto.ancho,
      ProfundidadCm: this.producto.profundidad,
      Horas: this.producto.horas,
      Minutos: this.producto.minutos,
      TiempoPostProceso: this.producto.tiempoPostProceso,
      TiempoTotal: this.convertirTiempoTotal(this.producto.tiempoTotal),
      CantidadMaterialGr: this.producto.cantidadMaterial,
      CostoMaterial: this.producto.costoMaterial,
      CostoSublimacion: this.producto.costoSublimacion,
      Precio: this.producto.precio
    };

    const esEdicion = !!this.producto?.idProducto;
    const peticion = esEdicion
      ? this.http.put(`${this.apiUrl}/producto/actualizar/${this.producto.idProducto}`, payload)
      : this.http.post(`${this.apiUrl}/producto/agregar`, payload);

    peticion.subscribe({
      next: () => {
        this.mostrarAlertaExito(esEdicion ? 'editado' : 'creado');
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

  private mostrarAlertaExito(accion: 'creado' | 'editado') {
    const alert = document.createElement('div');
    alert.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 end-0 m-3';
    alert.role = 'alert';
    alert.innerHTML = `<strong>¡Éxito!</strong> Producto ${accion} correctamente.`;
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