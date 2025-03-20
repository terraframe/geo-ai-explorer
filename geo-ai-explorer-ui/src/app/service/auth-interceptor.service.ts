import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  if (token != null) {

    // Add CSRF header
    const authReq = req.clone({
      setHeaders: {
        'X-CSRF-TOKEN': token
      }
    });

    return next(authReq);
  }

  return next(req);
};


