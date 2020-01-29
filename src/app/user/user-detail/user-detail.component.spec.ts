import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatCardModule, MatListModule, MatProgressSpinnerModule } from '@angular/material';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { UserDetailComponent } from './user-detail.component';

describe('UserDetailComponent', () => {
  let component: UserDetailComponent;
  let fixture: ComponentFixture<UserDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule, MatCardModule, MatListModule, MatProgressSpinnerModule],
      declarations: [ UserDetailComponent ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: ''
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
