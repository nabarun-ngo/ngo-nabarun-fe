import {
  buildEarningCreateForm,
  earningCreateEntity,
} from './earning.forms';

describe('earning create forms', () => {
  const refData = {
    earningCategories: [
      { key: 'INTEREST', displayValue: 'Interest' },
      { key: 'GRANT', displayValue: 'Grant' },
    ],
  };
  const accounts = [
    { key: 'BANK1', label: 'Bank: Operating account' },
    { key: 'INV1', label: 'Investment: Fixed deposit' },
  ];

  it('shows a mandatory bank or investment account for interest earnings', () => {
    const form = buildEarningCreateForm(refData, accounts);
    const accountField = form.fields.find(field => field.key === 'accountId');

    expect(accountField?.mandatory).toBeTrue();
    expect(accountField?.fieldType).toBe('select');
    expect(accountField?.fieldOptions).toEqual(accounts);
    expect(accountField?.condition).toEqual({
      dependsOnKey: 'category',
      operator: 'equals',
      value: 'INTEREST',
    });
  });

  it('includes the selected account in the create request', () => {
    const entity = earningCreateEntity({
      source: 'Quarterly interest',
      category: 'INTEREST',
      amount: 500,
      description: 'Savings interest',
      accountId: 'BANK1',
    });

    expect(entity.category).toBe('INTEREST');
    expect(entity.accountId).toBe('BANK1');
  });

  it('drops a stale account when category changes away from interest', () => {
    const entity = earningCreateEntity({
      source: 'Community grant',
      category: 'GRANT',
      amount: 500,
      accountId: 'BANK1',
    });

    expect(entity.accountId).toBeUndefined();
  });
});
