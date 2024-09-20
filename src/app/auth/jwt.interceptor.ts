import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs/observable';
import 'rxjs/add/operator/do';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
export class JwtInterceptor implements HttpInterceptor {
  private router!: Router;
  constructor(public auth: AuthService) {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(request).pipe(tap((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        // do stuff with response if you want
      }
    }, (err: any) => {
      if (err instanceof HttpErrorResponse) {
        if (err.status === 401) {
          this.router.navigateByUrl('/login');
          this.auth.collectFailedRequest(request);
        }
      }
    }));
  }
}
