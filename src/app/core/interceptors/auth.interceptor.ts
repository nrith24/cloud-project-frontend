import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Attaches the mock bearer token to outgoing requests.
 * ---------------------------------------------------------------------
 * BACKEND INTEGRATION POINT: once real endpoints exist, this interceptor
 * needs no changes — it already reads whatever token AuthService stores.
 * ---------------------------------------------------------------------
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  if (!token) return next(req);

  const cloned = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
  return next(cloned);
};
