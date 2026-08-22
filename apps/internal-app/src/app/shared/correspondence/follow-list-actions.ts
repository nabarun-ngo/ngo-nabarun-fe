import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type { ListActionDef } from '@nabarun-ngo/list-dashboard-core';
import type { ModalService } from 'src/app/core/shell/service/modal.service';
import { notifyFeatureError } from 'src/app/shared/utils/http-error.util';
import {
  CorrespondenceFollowService,
  type FollowableResourceType,
} from './correspondence-follow.service';

const PERMS = {
  read: 'read:subscriptions',
  create: 'create:subscriptions',
  remove: 'delete:subscriptions',
} as const;

export type FollowListOperations = {
  followResource(entity: { id: string }): void;
  unfollowResource(entity: { id: string }): void;
};

export function createFollowMenuActions(options: {
  resourceType: FollowableResourceType;
  follow: CorrespondenceFollowService;
  authorization: AuthorizationService;
}): ListActionDef[] {
  const { resourceType, follow, authorization } = options;
  const can = (key: string) => authorization.effectivePermissions().includes(key);

  const entityId = (ctx: { entity?: unknown }): string | undefined => {
    const entity = ctx.entity as { id?: string } | undefined;
    return entity?.id;
  };

  return [
    {
      id: 'follow',
      label: 'Follow',
      icon: 'notifications',
      when: ctx => {
        const id = entityId(ctx);
        if (!id || !can(PERMS.create) || !can(PERMS.read)) return false;
        follow.ensureLoaded(resourceType, id);
        return !follow.isFollowing(resourceType, id);
      },
      run: 'followResource',
    },
    {
      id: 'unfollow',
      label: 'Unfollow',
      icon: 'notifications_off',
      when: ctx => {
        const id = entityId(ctx);
        if (!id || !can(PERMS.remove) || !can(PERMS.read)) return false;
        follow.ensureLoaded(resourceType, id);
        return follow.isFollowing(resourceType, id);
      },
      run: 'unfollowResource',
    },
  ];
}

export function createFollowOperations(options: {
  resourceType: FollowableResourceType;
  follow: CorrespondenceFollowService;
  modal: ModalService;
  label?: string;
}): FollowListOperations {
  const { resourceType, follow, modal } = options;
  const noun = options.label ?? resourceType;

  return {
    followResource: (entity: { id: string }) => {
      if (!entity?.id) return;
      void follow.follow(resourceType, entity.id).then(
        () => {
          modal.openNotificationModal(
            { title: 'Following', description: `You will be notified about this ${noun}.` },
            'notification',
            'success',
          );
        },
        (err: unknown) => notifyFeatureError(modal, err, {
          title: 'Follow failed',
          description: `Unable to follow this ${noun}.`,
        }),
      );
    },
    unfollowResource: (entity: { id: string }) => {
      if (!entity?.id) return;
      void follow.unfollow(resourceType, entity.id).then(
        () => {
          modal.openNotificationModal(
            { title: 'Unfollowed', description: `You will no longer be notified about this ${noun}.` },
            'notification',
            'success',
          );
        },
        (err: unknown) => notifyFeatureError(modal, err, {
          title: 'Unfollow failed',
          description: `Unable to unfollow this ${noun}.`,
        }),
      );
    },
  };
}
