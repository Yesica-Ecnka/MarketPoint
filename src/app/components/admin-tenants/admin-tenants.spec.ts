import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminTenants } from './admin-tenants';

describe('AdminTenants', () => {
  let component: AdminTenants;
  let fixture: ComponentFixture<AdminTenants>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTenants],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminTenants);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
