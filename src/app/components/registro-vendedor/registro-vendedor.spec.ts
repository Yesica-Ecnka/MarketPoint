import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistroVendedor } from './registro-vendedor';

describe('RegistroVendedor', () => {
  let component: RegistroVendedor;
  let fixture: ComponentFixture<RegistroVendedor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroVendedor],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroVendedor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
