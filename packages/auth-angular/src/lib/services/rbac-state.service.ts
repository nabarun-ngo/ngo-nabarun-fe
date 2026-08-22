import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { RbacUserAccessSnapshot } from '@nabarun-ngo/auth-core';

@Injectable({ providedIn: 'root' })
export class RbacStateService<T extends RbacUserAccessSnapshot = RbacUserAccessSnapshot> {
  private readonly snapshotSubject = new BehaviorSubject<T | null>(null);
  private readonly loadedSubject = new BehaviorSubject<boolean>(false);

  readonly snapshot$: Observable<T | null> = this.snapshotSubject.asObservable();
  readonly loaded$ = this.loadedSubject.asObservable();

  get snapshot(): T | null {
    return this.snapshotSubject.value;
  }

  get loaded(): boolean {
    return this.loadedSubject.value;
  }

  get idpSub(): string | undefined {
    return this.snapshotSubject.value?.idpSub;
  }

  setSnapshot(snapshot: T): void {
    this.snapshotSubject.next(snapshot);
    this.loadedSubject.next(true);
  }

  clear(): void {
    this.snapshotSubject.next(null);
    this.loadedSubject.next(false);
  }
}
