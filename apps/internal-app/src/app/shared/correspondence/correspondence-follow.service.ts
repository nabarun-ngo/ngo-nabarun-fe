import { Injectable, inject } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';
import { CorrespondenceSubscriptionsService } from 'src/app/core/api/api-client/services/correspondence-subscriptions.service';
import type { SubscriptionResponseDto } from 'src/app/core/api/api-client/models/subscription-response-dto';

export type FollowableResourceType = 'project' | 'request';

export interface FollowState {
  subscriptionId: string;
  isActive: boolean;
}

/**
 * Thin facade over correspondence resource subscriptions (Follow / Unfollow).
 * Caches per-resource follow state so list-dashboard kebab `when` guards stay sync.
 */
@Injectable({ providedIn: 'root' })
export class CorrespondenceFollowService {
  private readonly api = inject(CorrespondenceSubscriptionsService);
  private readonly cache = new Map<string, FollowState | null>();
  private readonly inflight = new Map<string, Promise<FollowState | null>>();

  private key(resourceType: string, resourceId: string): string {
    return `${resourceType}:${resourceId}`;
  }

  /** Sync read of cached state. `undefined` = not loaded yet; `null` = not following. */
  peek(resourceType: string, resourceId: string): FollowState | null | undefined {
    const key = this.key(resourceType, resourceId);
    if (!this.cache.has(key)) return undefined;
    return this.cache.get(key) ?? null;
  }

  isFollowing(resourceType: string, resourceId: string): boolean {
    return this.peek(resourceType, resourceId)?.isActive === true;
  }

  /**
   * Ensures follow state is loaded. Safe to call from sync `when` guards —
   * kicks off a background fetch when missing; Zone CD refreshes the menu.
   */
  ensureLoaded(resourceType: string, resourceId: string): void {
    if (!resourceId) return;
    const key = this.key(resourceType, resourceId);
    if (this.cache.has(key) || this.inflight.has(key)) return;
    void this.load(resourceType, resourceId);
  }

  async load(resourceType: string, resourceId: string): Promise<FollowState | null> {
    const key = this.key(resourceType, resourceId);
    const pending = this.inflight.get(key);
    if (pending) return pending;

    const run = firstValueFrom(
      this.api.subscriptionControllerListMine({ resourceType, resourceId }).pipe(
        map((res) => {
          const active = (res.responsePayload ?? []).find(
            (s: SubscriptionResponseDto) => s.isActive,
          );
          const state: FollowState | null = active
            ? { subscriptionId: active.id, isActive: true }
            : null;
          this.cache.set(key, state);
          return state;
        }),
      ),
    ).catch(() => {
      // Leave cache unset so a later attempt can retry.
      return null;
    }).finally(() => {
      this.inflight.delete(key);
    });

    this.inflight.set(key, run);
    return run;
  }

  async follow(resourceType: string, resourceId: string): Promise<void> {
    await firstValueFrom(
      this.api.subscriptionControllerSubscribe({
        body: { resourceType, resourceId, via: 'MANUAL' },
      }),
    );
    // Re-fetch so we have the subscription id for unfollow.
    this.cache.delete(this.key(resourceType, resourceId));
    await this.load(resourceType, resourceId);
  }

  async unfollow(resourceType: string, resourceId: string): Promise<void> {
    let state = this.peek(resourceType, resourceId);
    if (state === undefined) {
      state = await this.load(resourceType, resourceId);
    }
    if (!state?.subscriptionId) return;

    await firstValueFrom(
      this.api.subscriptionControllerUnsubscribe({ id: state.subscriptionId }),
    );
    this.cache.set(this.key(resourceType, resourceId), null);
  }
}
