import { SCOPE } from './auth-scope.const';
import {
  QUICK_CREATE_ACTIONS,
  QUICK_ENTITY_ROUTES,
  buildQuickEntityRoute,
  canQuickEditEntity,
  resolveQuickCreateActions,
} from './quick-action.const';

describe('quick actions', () => {
  describe('resolveQuickCreateActions', () => {
    it('returns nothing without permissions', () => {
      expect(resolveQuickCreateActions([])).toEqual([]);
    });

    it('returns only the actions the permissions grant', () => {
      const actions = resolveQuickCreateActions([SCOPE.create.meeting]);

      expect(actions.map(action => action.id)).toEqual(['meetingCreate']);
      expect(actions[0].label).toBe('Schedule meeting');
    });

    it('grants an action when any one of its permissions is held', () => {
      const guestOnly = resolveQuickCreateActions([SCOPE.create.donation_guest]);

      expect(guestOnly.map(action => action.id)).toEqual(['donationCreate']);
    });

    it('opens donation create on the outstanding list', () => {
      const [donation] = resolveQuickCreateActions([SCOPE.create.donation]);

      expect(donation.url).toBe('/secured/finance/donations');
      expect(donation.queryParams).toEqual({
        chip: 'all_outstanding',
        donationCreate: 'true',
      });
    });

    it('has a unique id per action', () => {
      const ids = QUICK_CREATE_ACTIONS.map(action => action.id);

      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('canQuickEditEntity', () => {
    it('requires the update permission', () => {
      expect(canQuickEditEntity('project', [SCOPE.create.project])).toBe(false);
      expect(canQuickEditEntity('project', [SCOPE.update.project])).toBe(true);
    });

    it('denies entities that have no update flow', () => {
      expect(canQuickEditEntity('report', [SCOPE.create.reports])).toBe(false);
    });
  });

  describe('buildQuickEntityRoute', () => {
    it('routes to the list page with the entity id param only', () => {
      const route = buildQuickEntityRoute('project', 'p-1');

      expect(route.url).toBe('/secured/project/projects');
      expect(route.queryParams).toEqual({ projectId: 'p-1' });
    });

    it('adds the edit flag for url driven update flows', () => {
      const route = buildQuickEntityRoute('goal', 'g-1', { edit: true });

      expect(route.queryParams).toEqual({ goalId: 'g-1', edit: 'true' });
    });

    it('keeps the context the list page needs to allow editing', () => {
      const route = buildQuickEntityRoute('donation', 'd-1', { edit: true });

      expect(route.queryParams).toEqual({
        chip: 'all_outstanding',
        donationId: 'd-1',
        edit: 'true',
      });
    });

    it('omits the edit flag when the update flow opens from the record', () => {
      const route = buildQuickEntityRoute('expense', 'e-1', { edit: true });

      expect(route.queryParams).toEqual({ chip: 'mine', expenseId: 'e-1' });
    });

    it('never emits a generic id alias', () => {
      const entities = Object.keys(QUICK_ENTITY_ROUTES) as Array<
        keyof typeof QUICK_ENTITY_ROUTES
      >;

      for (const entity of entities) {
        const route = buildQuickEntityRoute(entity, 'x-1', { edit: true });

        expect(route.queryParams['id']).toBeUndefined();
        expect(route.queryParams[QUICK_ENTITY_ROUTES[entity].idParam]).toBe('x-1');
      }
    });
  });
});
