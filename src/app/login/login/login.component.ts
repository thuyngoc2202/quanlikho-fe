import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { first } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { LoginServiceService } from 'src/app/service/login-service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  constructor(
    public LoginService: LoginServiceService,
    private router: Router,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private auth: AuthService,
    private toastr: ToastrService
  ) {
    this.createForm();
  }
  form!: FormGroup;
  public loginForm: any;
  error = false;
  loading = false;
  submitted = false;

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }
  createForm() {
    this.loginForm = this.formBuilder.group({
      email: '',
      password: '',
    });
  }

  Login() {

    if (this.form.valid) {

      if (this.loading) return;
      this.loading = true;

      this.LoginService.login(this.form.value).subscribe({
        next: (response) => {
          if (response.result_msg === 'SUCCESS') {
            this.router.navigate(['../home'], { relativeTo: this.route });
            this.loading = false;
          }
          if (response.result_msg === 'FAILURE') {
            this.toastr.error('Tài khoản mật khẩu không chính xác', 'Thất bại');
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Registration failed', error);
          this.loading = false;
          this.toastr.error('Tài khoản mật khẩu không chính xác', 'Thất bại');
        }
      });
    } else {
    }
  }
}
