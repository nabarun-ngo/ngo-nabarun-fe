import { provideZoneChangeDetection } from "@angular/core";
import { platformBrowser } from '@angular/platform-browser';

import { AppModule } from './app/app.module';
import { hideAppSplash } from './app/splash-screen';


platformBrowser().bootstrapModule(AppModule, { applicationProviders: [provideZoneChangeDetection()], })
  .then(() => hideAppSplash())
  .catch(err => {
    hideAppSplash();
    console.error(err);
  });
