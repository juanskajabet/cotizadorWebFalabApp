import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

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

  touchedFields: { [key: string]: boolean } = {};

  productosDisponibles = [
    { nombre: 'Producto A' },
    { nombre: 'Producto B' },
    { nombre: 'Producto C' }
  ];

  productoSeleccionado: any = {
    nombre: '',
    cantidad: 1
  };

  // Marcar campo como tocado
  marcarTocado(campo: string) {
    this.touchedFields[campo] = true;
  }

  campoTocado(campo: string): boolean {
    return !!this.touchedFields[campo];
  }

  validarNombre(): boolean {
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(this.cotizacion.nombre.trim());
  }

  validarApellido(): boolean {
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(this.cotizacion.apellido.trim());
  }

  validarIdentificacion(): boolean {
    return /^\d{1,15}$/.test(this.cotizacion.identificacion.trim());
  }

  validarTelefono(): boolean {
    return /^\d{11}$/.test(this.cotizacion.telefono.trim());
  }

  validarCorreo(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.cotizacion.correo.trim());
  }

  validarDireccion(): boolean {
    return this.cotizacion.direccion.trim().length > 0 && this.cotizacion.direccion.trim().length <= 20;
  }

  formularioValido(): boolean {
    return (
      this.validarNombre() &&
      this.validarApellido() &&
      this.validarIdentificacion() &&
      this.validarTelefono() &&
      this.validarCorreo() &&
      this.validarDireccion()
    );
  }

  siguientePaso() {
    // Validar antes de avanzar al paso 2
    if (this.paso === 1 && !this.formularioValido()) {
      // No avanza si hay campos inválidos
      Object.keys(this.cotizacion).forEach(k => this.marcarTocado(k));
      return;
    }
    if (this.paso < 3) this.paso++;
  }

  anteriorPaso() {
    if (this.paso > 1) this.paso--;
  }

  cancelar() {
    this.paso = 1;
    this.touchedFields = {};
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
    this.productoSeleccionado = { nombre: '', cantidad: 1 };
    modal.show();
  }

  agregarProducto() {
    if (!this.productoSeleccionado.nombre) {
      return;
    }
    this.cotizacion.productos.push({
      codigo: 'PRD' + (this.cotizacion.productos.length + 1),
      maquina: '3D Filamento',
      nombre: this.productoSeleccionado.nombre,
      cantidad: this.productoSeleccionado.cantidad,
      tiempoUnitario: '4:39',
      tiempoTotal: '23:15',
      precioUnitario: 14.04,
      precioTotal: this.productoSeleccionado.cantidad * 14.04
    });
    const modalEl = document.getElementById('modalAgregarProducto');
    const modal = bootstrap.Modal.getInstance(modalEl!);
    modal.hide();
  }

  eliminarProducto(item: any) {
    this.cotizacion.productos = this.cotizacion.productos.filter(p => p !== item);
  }

  guardarCotizacion() {
    console.log('Cotización a guardar:', this.cotizacion);
    alert('Cotización generada correctamente.');
  }
  campoVacio(valor: string | undefined): boolean {
  return !valor || valor.trim() === '';
}
}