import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAuth0 } from '@auth0/auth0-angular';
import { provideNgxStripe } from 'ngx-stripe';

import { routes } from './app.routes';
import { ProductService } from './services/product.service';
import { AuthInterceptorService } from './services/auth-interceptor.service';
import myAppConfig from './config/my-app-config';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),

    provideAuth0({
      domain: myAppConfig.auth.domain,
      clientId: myAppConfig.auth.clientId,
      authorizationParams: {
        redirect_uri: window.location.origin,
        audience: myAppConfig.auth.authorizationParams,
      },
    }),
    provideNgxStripe(environment.stripePublicKey),
    ProductService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true,
    },
  ],
};
