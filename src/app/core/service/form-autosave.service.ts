import { Injectable, inject } from '@angular/core';
import { IndexedDbService } from './indexed-db.service';
import { debounceTime, Subject, groupBy, mergeMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormAutosaveService {
  private dbService = inject(IndexedDbService);
  private saveRequests$ = new Subject<{ id: string; data: any }>();

  constructor() {
    // Process save requests with per-id debouncing to avoid cross-form interference.
    // Each autosaveId gets its own 1s debounce window.
    this.saveRequests$.pipe(
      groupBy(
        ({ id }) => id,
        undefined,
        group$ => group$.pipe(debounceTime(5000)) // Cleanup group after 5s of inactivity
      ),
      mergeMap(group$ => group$.pipe(debounceTime(1000)))
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
