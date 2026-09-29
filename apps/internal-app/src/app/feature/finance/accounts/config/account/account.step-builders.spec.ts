import {
  resolveAccountBankingSteps,
  resolveAccountCreateSteps,
  validateBankingFormValues,
} from './account.forms';
import type { Account } from '../../domain';

describe('account form step builders', () => {
  describe('resolveAccountCreateSteps', () => {
    it('includes type-specific detail steps for BANK and INVESTMENT accounts', () => {
      expect(resolveAccountCreateSteps({ accountType: 'BANK' })).toEqual(['setup', 'bank', 'upi']);
      expect(resolveAccountCreateSteps({ accountType: 'INVESTMENT' })).toEqual([
        'setup',
        'investment',
        'maturity',
      ]);
      expect(resolveAccountCreateSteps({ accountType: 'WALLET' })).toEqual(['setup', 'bank', 'upi']);
    });
  });

  describe('resolveAccountBankingSteps', () => {
    it('includes upi step for BANK accounts', () => {
      expect(resolveAccountBankingSteps({ accountType: 'BANK' } as Account)).toEqual(['details', 'upi']);
    });

    it('includes upi step for WALLET accounts', () => {
      expect(resolveAccountBankingSteps({ accountType: 'WALLET' } as Account)).toEqual(['details', 'upi']);
    });

    it('returns only details for INVESTMENT accounts', () => {
      expect(resolveAccountBankingSteps({ accountType: 'INVESTMENT' } as Account)).toEqual(['details']);
    });
  });

  describe('validateBankingFormValues', () => {
    it('allows empty bank details for WALLET', () => {
      expect(validateBankingFormValues({ accountType: 'WALLET' }, {})).toBeUndefined();
    });

    it('requires full bank set when WALLET has partial bank values', () => {
      expect(
        validateBankingFormValues(
          { accountType: 'WALLET' },
          { bankAccountNumber: '123' },
        ),
      ).toBe('Bank account holder name is required.');
    });

    it('requires bank fields for BANK', () => {
      expect(validateBankingFormValues({ accountType: 'BANK' }, {})).toBe(
        'Bank account number is required.',
      );
    });
  });
});
