import { resolveExpenseCreateSteps } from './expense.forms';

describe('expense form step builders', () => {
  describe('resolveExpenseCreateSteps', () => {
    it('always returns details then items', () => {
      expect(resolveExpenseCreateSteps({})).toEqual(['details', 'items']);
      expect(resolveExpenseCreateSteps({ name: 'Lunch' })).toEqual(['details', 'items']);
    });
  });
});
