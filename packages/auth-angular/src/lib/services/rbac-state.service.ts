import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RbacSnapshot } from '@nabarun-ngo/auth-core';

@Injectable({ providedIn: 'root' })
export class RbacStateService {
  private readonly snapshotSubject = new BehaviorSubject<RbacSnapshot | null>(null);
  private readonly loadedSubject = new BehaviorSubject<boolean>(false);

  readonly snapshot$ = this.snapshotSubject.asObservable();
  readonly loaded$ = this.loadedSubject.asObservable();

  get snapshot(): RbacSnapshot | null {
    return this.snapshotSubject.value;
  }

  get loaded(): boolean {
    return this.loadedSubject.value;
  }

  get idpSub(): string | undefined {
    return this.snapshotSubject.value?.idpSub;
  }

  setSnapshot(snapshot: RbacSnapshot): void {
    this.snapshotSubject.next(snapshot);
    this.loadedSubject.next(true);
  }

  clear(): void {
    this.snapshotSubject.next(null);
    this.loadedSubject.next(false);
  }
}
