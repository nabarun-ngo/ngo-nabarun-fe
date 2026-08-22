import { NgModule } from '@angular/core';
import { ApiModule as ApiClientModule } from './api-client/api.module';
import { environment } from '../../../environments/environment';

@NgModule({
  imports: [
    ApiClientModule.forRoot({
      rootUrl: environment.api_base_url,
    }),
  ],
})
export class CoreApiModule {}
