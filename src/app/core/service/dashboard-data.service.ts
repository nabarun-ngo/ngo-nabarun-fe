import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardDataService {
  constructor(private db: AngularFireDatabase) {}

  // Example: Get count of items under a path (e.g., 'users', 'donations')
  // Fetches the count value directly from a given path (e.g., '/counts/donations')
  getCount(path: string): Observable<number | null> {
    return this.db.object<number>(path).valueChanges();
  }
}
