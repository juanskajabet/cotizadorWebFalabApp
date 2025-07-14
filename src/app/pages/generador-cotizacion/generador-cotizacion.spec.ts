import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneradorCotizacion } from './generador-cotizacion';

describe('GeneradorCotizacion', () => {
  let component: GeneradorCotizacion;
  let fixture: ComponentFixture<GeneradorCotizacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneradorCotizacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneradorCotizacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
