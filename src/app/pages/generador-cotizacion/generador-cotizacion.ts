import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

declare var bootstrap: any;

@Component({
  standalone: true,
  selector: 'app-generador-cotizacion',
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './generador-cotizacion.html',
  styleUrl: './generador-cotizacion.css'
})
export class GeneradorCotizacion {
  paso = 1;

  cotizacion = {
    nombre: '',
    apellido: '',
    identificacion: '',
    correo: '',
    direccion: '',
    telefono: '',
    productos: [] as any[]
  };

  productosDisponibles: any[] = [];
  productoSeleccionado: any = null;
  cantidadSeleccionada: number = 1;

  camposTocados: { [key: string]: boolean } = {};

  numeroFactura = '';
  fechaActual = new Date().toLocaleDateString();
  idCotizacionGenerada: number | null = null;

  // Para controlar la notificación
  mostrarNotificacion = false;

  // Control de estado final
  cotizacionFinalizada = false;

  constructor(private http: HttpClient) {
    this.cargarProductos();
  }

  cargarProductos() {
    this.http.get<any>('http://127.0.0.1:8000/api/producto/precios').subscribe({
      next: (res) => {
        this.productosDisponibles = res.data || [];
      },
      error: (err) => {
        console.error('Error cargando productos:', err);
        alert('Error al cargar los productos.');
      }
    });
  }

  marcarTocado(campo: string) {
    this.camposTocados[campo] = true;
  }

  campoTocado(campo: string): boolean {
    return this.camposTocados[campo];
  }

  validarNombre(): boolean {
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(this.cotizacion.nombre);
  }

  validarApellido(): boolean {
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(this.cotizacion.apellido);
  }

  validarIdentificacion(): boolean {
    return /^\d{1,15}$/.test(this.cotizacion.identificacion);
  }

  validarCorreo(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.cotizacion.correo);
  }

  validarDireccion(): boolean {
    return this.cotizacion.direccion.length > 0 && this.cotizacion.direccion.length <= 20;
  }

  validarTelefono(): boolean {
    return /^\d{10}$/.test(this.cotizacion.telefono);
  }

  formularioValido(): boolean {
    return (
      this.validarNombre() &&
      this.validarApellido() &&
      this.validarIdentificacion() &&
      this.validarCorreo() &&
      this.validarDireccion() &&
      this.validarTelefono()
    );
  }

  siguientePaso() {
    if (this.paso === 1 && !this.formularioValido()) return;
    if (this.paso < 3) {
      this.paso++;
      if (this.paso === 3) {
        this.obtenerNumeroFactura();
      }
    }
  }

  anteriorPaso() {
    if (this.paso > 1) this.paso--;
  }

  cancelar() {
    this.paso = 1;
    this.idCotizacionGenerada = null;
    this.cotizacionFinalizada = false;
    this.cotizacion = {
      nombre: '',
      apellido: '',
      identificacion: '',
      correo: '',
      direccion: '',
      telefono: '',
      productos: []
    };
  }

  abrirAgregarProducto() {
    const modal = new bootstrap.Modal(
      document.getElementById('modalAgregarProducto')!
    );
    this.productoSeleccionado = null;
    this.cantidadSeleccionada = 1;
    modal.show();
  }

  agregarProducto() {
    if (!this.productoSeleccionado) {
      alert('Seleccione un producto.');
      return;
    }

    const producto = this.productoSeleccionado;

    this.cotizacion.productos.push({
      codigo: producto.CodigoProducto,
      maquina: producto.Maquina,
      nombre: producto.NombreProducto,
      cantidad: this.cantidadSeleccionada,
      tiempoUnitario: producto.TiempoTotal,
      tiempoTotal: this.multiplicarTiempo(producto.TiempoTotal, this.cantidadSeleccionada),
      precioUnitario: producto.Precio,
      precioTotal: this.cantidadSeleccionada * producto.Precio
    });

    const modalEl = document.getElementById('modalAgregarProducto');
    const modal = bootstrap.Modal.getInstance(modalEl!);
    modal.hide();
  }

  multiplicarTiempo(tiempo: string, cantidad: number): string {
    if (!tiempo.includes(':')) return tiempo;

    const partes = tiempo.split(':').map(p => parseInt(p, 10));
    let horas = partes.length === 3 ? partes[0] : 0;
    let minutos = partes.length === 3 ? partes[1] : partes[0];
    let segundos = partes.length === 3 ? partes[2] : partes[1];

    let totalSegundos = (horas * 3600 + minutos * 60 + segundos) * cantidad;

    const horasFinal = Math.floor(totalSegundos / 3600);
    totalSegundos %= 3600;
    const minutosFinal = Math.floor(totalSegundos / 60);
    const segundosFinal = totalSegundos % 60;

    return `${horasFinal.toString().padStart(2, '0')}:${minutosFinal.toString().padStart(2, '0')}:${segundosFinal.toString().padStart(2, '0')}`;
  }

  eliminarProducto(item: any) {
    this.cotizacion.productos = this.cotizacion.productos.filter(p => p !== item);
  }

  obtenerNumeroFactura() {
    this.http.get<any>('http://127.0.0.1:8000/api/cotizaciones/ultima')
      .subscribe({
        next: (res) => {
          if (res.data?.CodigoCotizacion) {
            const codigo = res.data.CodigoCotizacion;
            const partes = codigo.split('-');
            const numeroActual = parseInt(partes[1], 10);
            const nuevoNumero = numeroActual + 1;
            const nuevoCodigo = `COT-${nuevoNumero.toString().padStart(4, '0')}`;
            this.numeroFactura = nuevoCodigo;
          } else {
            this.numeroFactura = 'COT-0001';
          }
        },
        error: (err) => {
          console.error('Error obteniendo número de factura:', err);
          this.numeroFactura = 'COT-0001';
        }
      });
  }

  guardarCotizacion() {
    const cabecera = {
      Nombre: this.cotizacion.nombre,
      Apellido: this.cotizacion.apellido,
      Identificacion: this.cotizacion.identificacion,
      CorreoElectronico: this.cotizacion.correo,
      Direccion: this.cotizacion.direccion,
      Telefono: this.cotizacion.telefono
    };

    this.http.post<any>('http://127.0.0.1:8000/api/cotizaciones', cabecera)
      .subscribe({
        next: (res) => {
          this.idCotizacionGenerada = res.data?.IdCotizacion;

          if (!this.idCotizacionGenerada) {
            alert('No se obtuvo el ID de la cotización generada.');
            return;
          }

          const detalleRequests = this.cotizacion.productos.map(p =>
            this.http.post(`http://127.0.0.1:8000/api/cotizaciones/${this.idCotizacionGenerada}/detalle`, {
              CodigoProducto: p.codigo,
              Cantidad: p.cantidad
            })
          );

          Promise.all(detalleRequests.map(r => r.toPromise()))
            .then(() => {
              this.mostrarNotificacion = true;
              this.cotizacionFinalizada = true;

              // Ocultar notificación luego de 3 segundos
              setTimeout(() => {
                this.mostrarNotificacion = false;
              }, 3000);
            })
            .catch(err => {
              console.error('Error generando detalle:', err);
              alert('Error generando el detalle.');
            });
        },
        error: (err) => {
          console.error('Error generando cotización:', err);
          alert('Error generando cotización.');
        }
      });
  }

  calcularSubtotal(): number {
    return this.cotizacion.productos.reduce((sum, p) => sum + (p.precioTotal || 0), 0);
  }

  calcularIva(): number {
    return this.calcularSubtotal() * 0.15;
  }

  calcularTotal(): number {
    return this.calcularSubtotal() + this.calcularIva();
  }

  calcularTiempoTotal(): string {
    let totalSegundos = 0;
    for (const p of this.cotizacion.productos) {
      const partes = p.tiempoTotal.split(':').map(Number);
      if (partes.length === 3) {
        totalSegundos += partes[0] * 3600 + partes[1] * 60 + partes[2];
      } else if (partes.length === 2) {
        totalSegundos += partes[0] * 60 + partes[1];
      }
    }
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
  }
}