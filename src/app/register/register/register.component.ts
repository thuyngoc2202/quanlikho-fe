import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs';
import { LoginServiceService } from 'src/app/service/login-service.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  submitted = false;
  public RegisterForm: any;

  constructor(
    public LoginService: LoginServiceService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.createForm();
  }
  ngOnInit(): void {
    this.form = this.formBuilder.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      password: ['', Validators.required],
      email: ['', Validators.required],
    });
  }


  get f() {
    return this.form.controls;
  }

  createForm() {
    this.RegisterForm = this.formBuilder.group({
      email: '',
      password: '',
      first_name: '',
      last_name: ''
    });
  }

  register() {
    if (this.form.valid) {
      const userData = {
        ...this.form.value,
        role_id: "2"
      };
      // Thêm cờ để tránh gọi nhiều lần
      if (this.loading) return;
      this.loading = true;
      
      this.LoginService.register(userData).subscribe({
        next: (response) => {
          this.router.navigate(['../login'], { relativeTo: this.route });
          this.loading = false;
        },
        error: (error) => {
          console.error('Registration failed', error);
          this.loading = false;
        }
      });
    } else {
    }
  }
}
