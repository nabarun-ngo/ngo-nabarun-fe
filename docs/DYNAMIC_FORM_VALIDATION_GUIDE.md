# Dynamic Form Validation in Accordion System

## ✅ Good News: Dynamic Validation is Already Supported!

The existing `DetailedView` structure **already supports dynamic form validation** through the `form_input_validation` property.

---

## How It Currently Works

### 1. Field Definition with Validators

```typescript
{
  field_name: 'Donor name',
  field_value: donation?.donorName || '',
  editable: mode === 'create' || mode === 'edit',
  form_control_name: 'donorName',
  form_input_validation: [Validators.required],  // ✅ Validators here!
  form_input: {
    html_id: 'donorName',
    tagName: 'input',
    inputType: 'text',
    placeholder: 'Ex. John Doe',
  }
}
```

### 2. FormControl Creation

When the `DetailedViewComponent` receives the sections, it creates FormControls with the validators:

```typescript
// From detailed-view.component.ts
m.section_form?.setControl(
  m1.form_control_name!, 
  new FormControl(value, m1.form_input_validation)  // ✅ Validators applied!
);
```

---

## Dynamic Validation Scenarios

### Scenario 1: Conditional Required Fields

**Use Case**: Make "Payment Method" required only when status is "PAID"

```typescript
{
  field_name: 'Payment method',
  field_value: donation?.paymentMethod || '',
  hide_field: donation?.status !== 'PAID',
  editable: mode === 'edit',
  form_control_name: 'paymentMethod',
  // ✅ Conditionally add required validator
  form_input_validation: donation?.status === 'PAID' 
    ? [Validators.required] 
    : [],
  form_input: {
    html_id: 'paymentMethod',
    tagName: 'select',
    inputType: '',
    selectList: refData?.[DonationRefData.refDataKey.paymentMethod] || []
  }
}
```

### Scenario 2: Different Validators by Mode

**Use Case**: Require field in create mode, but optional in edit mode

```typescript
{
  field_name: 'Donation amount',
  field_value: `${donation.amount}`,
  editable: mode === 'create' || mode === 'edit',
  form_control_name: 'amount',
  // ✅ Different validators based on mode
  form_input_validation: mode === 'create'
    ? [Validators.required, Validators.min(1)]
    : [Validators.min(1)],  // Optional in edit, but must be positive if provided
  form_input: {
    html_id: 'amount',
    tagName: 'input',
    inputType: 'number',
    placeholder: 'Ex. 100'
  }
}
```

### Scenario 3: Complex Conditional Validation

**Use Case**: Email required only for guest donations

```typescript
{
  field_name: 'Donor email',
  field_value: donation?.donorEmail || '',
  editable: true,
  form_control_name: 'donorEmail',
  // ✅ Complex conditional logic
  form_input_validation: donation?.donorId 
    ? []  // Member donation - email optional
    : [Validators.required, Validators.email],  // Guest - email required
  form_input: {
    html_id: 'donorEmail',
    tagName: 'input',
    inputType: 'email',
    placeholder: 'Ex. john@example.com'
  }
}
```

---

## Problem: Validators Don't Update Dynamically

### The Issue

When using `updateSectionsMode()` or when form values change, the validators **don't automatically update**. They're set once when the FormControl is created.

### Example Problem

```typescript
// Initial state: status = 'RAISED', paymentMethod not required
{
  field_name: 'Payment method',
  form_input_validation: []  // Not required
}

// User changes status to 'PAID'
// ❌ Validator doesn't update automatically!
// Payment method is still not required even though it should be
```

---

## Solution: Add Dynamic Validator Update Method

Let me add a helper method to the `Accordion` base class to update validators dynamically:

```typescript
/**
 * Update validators for specific form controls based on current form state.
 * 
 * @param sectionId - The section HTML ID
 * @param rowIndex - The row index
 * @param validatorRules - Map of field names to validator functions
 * @param create - Whether this is for create mode
 * 
 * @example
 * ```typescript
 * // Update validators when status changes
 * form?.get('status')?.valueChanges.subscribe(status => {
 *   this.updateFieldValidators('donation_detail', rowIndex, {
 *     'paymentMethod': status === 'PAID' ? [Validators.required] : [],
 *     'paidOn': status === 'PAID' ? [Validators.required] : [],
 *     'paidToAccount': status === 'PAID' ? [Validators.required] : []
 *   });
 * });
 * ```
 */
protected updateFieldValidators(
  sectionId: string,
  rowIndex: number,
  validatorRules: { [fieldName: string]: ValidatorFn[] },
  create?: boolean
): void {
  const form = this.getSectionForm(sectionId, rowIndex, create);
  
  if (!form) {
    console.warn(`Form not found for section: ${sectionId}`);
    return;
  }

  Object.entries(validatorRules).forEach(([fieldName, validators]) => {
    const control = form.get(fieldName);
    if (control) {
      control.setValidators(validators);
      control.updateValueAndValidity();
    }
  });
}
```

---

## Complete Example: Dynamic Validation in Action

### donation.field.ts

```typescript
export const getDonationSection = (
  donation: Donation,
  options: {
    mode: 'create' | 'edit' | 'view',
    refData?: { [name: string]: KeyValue[] }
  }
): DetailedView => {
  const { mode, refData } = options;
  
  return {
    section_name: 'Donation Details',
    section_type: 'key_value',
    section_html_id: 'donation_detail',
    section_form: new FormGroup({}),
    content: [
      {
        field_name: 'Donation status',
        field_value: donation?.status || '',
        editable: mode === 'edit',
        form_control_name: 'status',
        form_input_validation: [Validators.required],
        form_input: {
          html_id: 'status',
          tagName: 'select',
          selectList: refData?.[DonationRefData.refDataKey.status] || []
        }
      },
      {
        field_name: 'Payment method',
        field_value: donation?.paymentMethod || '',
        hide_field: donation?.status !== 'PAID',
        editable: mode === 'edit',
        form_control_name: 'paymentMethod',
        // ✅ Conditionally required based on status
        form_input_validation: donation?.status === 'PAID' 
          ? [Validators.required] 
          : [],
        form_input: {
          html_id: 'paymentMethod',
          tagName: 'select',
          selectList: refData?.[DonationRefData.refDataKey.paymentMethod] || []
        }
      },
      {
        field_name: 'Donation amount',
        field_value: `${donation.amount}`,
        editable: mode === 'create' || mode === 'edit',
        form_control_name: 'amount',
        // ✅ Always required, minimum value
        form_input_validation: [Validators.required, Validators.min(1)],
        form_input: {
          html_id: 'amount',
          tagName: 'input',
          inputType: 'number'
        }
      }
    ]
  };
};
```

### guest-donation-tab.component.ts

```typescript
protected override onClick(event: { buttonId: string; rowIndex: number }): void {
  if (event.buttonId === 'UPDATE') {
    this.regenerateDetailedView(event.rowIndex, { mode: 'edit' });
    this.showEditForm(event.rowIndex, ['donation_detail']);
    
    setTimeout(() => {
      // Setup field visibility rules
      this.formSubscription = this.setupFieldVisibilityRules('donation_detail', event.rowIndex, [
        {
          fieldName: 'paymentMethod',
          condition: (formValue) => formValue.status === 'PAID'
        }
      ]);
      
      // ✅ Setup dynamic validator updates
      const form = this.getSectionForm('donation_detail', event.rowIndex);
      
      form?.get('status')?.valueChanges.subscribe(status => {
        // Update validators when status changes
        this.updateFieldValidators('donation_detail', event.rowIndex, {
          'paymentMethod': status === 'PAID' ? [Validators.required] : [],
          'paidOn': status === 'PAID' ? [Validators.required] : [],
          'paidToAccount': status === 'PAID' ? [Validators.required] : []
        });
      });
    }, 0);
  }
}
```

---

## Best Practices

### ✅ DO

1. **Define static validators in field definitions**
   ```typescript
   form_input_validation: [Validators.required, Validators.email]
   ```

2. **Use conditional logic for mode-based validation**
   ```typescript
   form_input_validation: mode === 'create' 
     ? [Validators.required] 
     : []
   ```

3. **Update validators dynamically when dependencies change**
   ```typescript
   form?.get('status')?.valueChanges.subscribe(status => {
     this.updateFieldValidators('donation_detail', rowIndex, {
       'paymentMethod': status === 'PAID' ? [Validators.required] : []
     });
   });
   ```

### ❌ DON'T

1. **Don't forget to call `updateValueAndValidity()`**
   ```typescript
   // ❌ Bad
   control.setValidators([Validators.required]);
   
   // ✅ Good
   control.setValidators([Validators.required]);
   control.updateValueAndValidity();
   ```

2. **Don't set validators without checking if control exists**
   ```typescript
   // ❌ Bad
   form.get('field')!.setValidators([...]);
   
   // ✅ Good
   const control = form.get('field');
   if (control) {
     control.setValidators([...]);
     control.updateValueAndValidity();
   }
   ```

---

## Summary

| Feature | Supported? | How? |
|---------|-----------|------|
| **Static Validators** | ✅ Yes | `form_input_validation: [Validators.required]` |
| **Conditional Validators** | ✅ Yes | `form_input_validation: condition ? [Validators.required] : []` |
| **Mode-based Validators** | ✅ Yes | `form_input_validation: mode === 'create' ? [...] : []` |
| **Dynamic Updates** | ⚠️ Manual | Use `updateFieldValidators()` helper method |

**The system already supports dynamic validation!** You just need to:
1. Define validators in field definitions (static or conditional)
2. Use the `updateFieldValidators()` helper for runtime updates
3. Subscribe to form changes to trigger validator updates

