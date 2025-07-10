import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductoDialogo } from './producto-dialogo';

describe('ProductoDialogo', () => {
  let component: ProductoDialogo;
  let fixture: ComponentFixture<ProductoDialogo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductoDialogo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductoDialogo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
