import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfiguracionDialogo } from './configuracion-dialogo';

describe('ConfiguracionDialogo', () => {
  let component: ConfiguracionDialogo;
  let fixture: ComponentFixture<ConfiguracionDialogo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfiguracionDialogo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfiguracionDialogo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
