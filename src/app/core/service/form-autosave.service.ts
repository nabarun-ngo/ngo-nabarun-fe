import { Injectable, inject } from '@angular/core';
import { IndexedDbService } from './indexed-db.service';
import { debounceTime, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormAutosaveService {
  private dbService = inject(IndexedDbService);
  private saveRequests$ = new Subject<{ id: string; data: any }>();

  constructor() {
    // Process save requests with debounce to avoid excessive DB writes
    this.saveRequests$.pipe(
      debounceTime(1000) // Wait for 1 second of inactivity before saving
    ).subscribe(({ id, data }) => {
      this.dbService.set(id, data).catch(err => {
        console.warn('FormAutosaveService: Failed to save form data', id, err);
      });
    });
  }

  /**
   * Save form data to IndexedDB
   * @param id Unique identifier for the form
   * @param data Form values
   */
  saveForm(id: string, data: any): void {
    if (!id) return;
    this.saveRequests$.next({ id, data });
  }

  /**
   * Retrieve saved form data from IndexedDB
   * @param id Unique identifier for the form
   */
  async getSavedForm(id: string): Promise<any | undefined> {
    if (!id) return undefined;
    return this.dbService.get(id);
  }

  /**
   * Clear saved form data from IndexedDB
   * @param id Unique identifier for the form
   */
  async clearSavedForm(id: string): Promise<void> {
    if (!id) return;
    return this.dbService.delete(id);
  }
}
