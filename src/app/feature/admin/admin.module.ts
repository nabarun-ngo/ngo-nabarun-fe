import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminPipe } from './admin.pipe';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AdminServiceTabComponent } from './admin-dashboard/admin-service-tab/admin-service-tab.component';
import { AdminApikeyTabComponent } from './admin-dashboard/admin-apikey-tab/admin-apikey-tab.component';
import { AdminGlobalConfigTabComponent } from './admin-dashboard/admin-global-config-tab/admin-global-config-tab.component';


@NgModule({
  declarations: [
    AdminPipe,
    AdminDashboardComponent,
    AdminServiceTabComponent,
    AdminApikeyTabComponent,
    AdminGlobalConfigTabComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SharedModule,
  ]
})
export class AdminModule { }
