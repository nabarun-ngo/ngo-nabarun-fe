import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { UsersService } from 'src/app/core/api/api-client/services';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(
    private usersApi: UsersService
  ) { }

  getUserMetrics() {
    return this.usersApi.userControllerGetMyOverviewMetrics().pipe(
      map(response => response.responsePayload ?? {}),
    );
  }
}
