/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { mergeApplicationConfig } from '@angular/core';
import { provideAuth0 } from '@auth0/auth0-angular';

import myAppConfig from './app/config/my-app-config';

const auth0Config = mergeApplicationConfig(appConfig, {
  providers: [
    provideAuth0({
      domain: myAppConfig.auth.domain,
      clientId: myAppConfig.auth.clientId,
      authorizationParams: {
        redirect_uri: window.location.origin,
        audience: myAppConfig.auth.authorizationParams.audience,
      },
    }),
  ],
});

bootstrapApplication(App, auth0Config).catch((err) => console.error(err));
