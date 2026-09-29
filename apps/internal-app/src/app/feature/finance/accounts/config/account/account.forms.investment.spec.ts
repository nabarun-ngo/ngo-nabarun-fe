import {
  resolveAccountCreateSteps,
  validateAccountCreateStep,
  validateAccountCreateValues,
} from './account.forms';

describe('account create investment lifecycle forms', () => {
  const baseSetup = {
    accountType: 'INVESTMENT',
    ownerType: 'ORG',
    description: 'FD note',
  };

  it('uses investment then maturity steps for INVESTMENT', () => {
    expect(resolveAccountCreateSteps({ accountType: 'INVESTMENT' })).toEqual([
      'setup',
      'investment',
      'maturity',
    ]);
  });

  it('requires funding on the investment step', () => {
    expect(
      validateAccountCreateStep('investment', {
        ...baseSetup,
        bankAccountNumber: 'FOLIO-1',
        bankName: 'Provider',
        bankAccountType: 'FD',
      }),
    ).toContain('Investment amount');

    expect(
      validateAccountCreateStep('investment', {
        ...baseSetup,
        bankAccountNumber: 'FOLIO-1',
        bankName: 'Provider',
        bankAccountType: 'FD',
        investmentAmount: 100000,
        sourceAccountId: 'bank-1',
      }),
    ).toBeUndefined();
  });

  it('allows optional maturity and rejects zero estimated amount', () => {
    expect(validateAccountCreateStep('maturity', {})).toBeUndefined();
    expect(
      validateAccountCreateStep('maturity', { maturityAmount: 0 }),
    ).toContain('Estimated maturity amount');
  });

  it('maps full create validation with funding and optional maturity', () => {
    expect(
      validateAccountCreateValues({
        ...baseSetup,
        bankAccountNumber: 'FOLIO-1',
        bankName: 'Provider',
        bankAccountType: 'FD',
        investmentAmount: 100000,
        sourceAccountId: 'bank-1',
        maturityDate: '2027-08-14',
        maturityAmount: 150000,
      }),
    ).toBeUndefined();
  });
});
