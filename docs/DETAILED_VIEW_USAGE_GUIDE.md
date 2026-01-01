# Detailed View System - Usage Guide

## Overview

The **DetailedView** system provides a declarative way to create accordion-based detail views with automatic form handling. This guide explains how to configure different modes and handle dynamic form-dependent fields.

---

## Table of Contents

1. [Basic Concepts](#basic-concepts)
2. [Mode Configuration](#mode-configuration)
3. [Dynamic Form-Dependent Fields](#dynamic-form-dependent-fields)
4. [Complete Examples](#complete-examples)

---

## Basic Concepts

### How It Works

```typescript
// 1. Component extends Accordion base class
export class MyTabComponent extends Accordion<MyDataType> {
  
  // 2. Define how to prepare the detailed view
  protected override prepareDetailedView(data: MyDataType): DetailedView[] {
    return [
      getMySection(data, {
        mode: 'view',  // or 'edit' or 'create'
        refData: this.getRefData({ isActive: true })
      })
    ];
  }
  
  // 3. When user clicks "Update" button
  protected override onClick(event: { buttonId: string; rowIndex: number }): void {
    if (event.buttonId === 'UPDATE') {
      // This toggles the section to show form inputs
      this.showEditForm(event.rowIndex, ['my_section_id']);
    }
  }
}
```

### Field Properties

Each field in a `DetailedView` section has these key properties:

```typescript
{
  field_name: 'Field Label',
  field_value: 'actual_value',           // Raw value
  field_display_value: 'Formatted Value', // Optional formatted display
  
  // Visibility control
  hide_field: boolean,                    // Hide entire field
  
  // Edit control
  editable: boolean,                      // Show input when in edit mode
  form_control_name: 'fieldName',         // FormControl name
  form_input: { /* input config */ }      // Input field configuration
}
```

---

## Mode Configuration

### Three Modes

The system supports three modes:

| Mode | Purpose | When Used | Editable Fields |
|------|---------|-----------|----------------|
| **`view`** | Display data only | Default accordion view | None (read-only) |
| **`edit`** | Modify existing data | After clicking "Update" button | Fields with `editable: true` |
| **`create`** | Create new data | When adding new item | Fields with `editable: true` |

### Example: Configuring Different Modes

```typescript
// VIEW MODE (default)
protected override prepareDetailedView(data: Donation): DetailedView[] {
  return [
    getDonationSection(data, {
      mode: 'view',
      refData: this.getRefData({ isActive: true })
    })
  ];
}

// EDIT MODE (when user clicks "Update")
protected override onClick(event: { buttonId: string; rowIndex: number }): void {
  if (event.buttonId === 'UPDATE') {
    // Regenerate the section with edit mode
    const donation = this.itemList[event.rowIndex];
    const editSection = getDonationSection(donation, {
      mode: 'edit',
      refData: this.getRefData({ isActive: true }),
      payableAccounts: this.payableAccounts.map(acc => ({
        key: acc.id,
        displayValue: acc.accountHolderName || ''
      }))
    });
    
    // Replace the section
    this.accordionList.contents[event.rowIndex].detailed[0] = editSection;
    
    // Show the form
    this.showEditForm(event.rowIndex, ['donation_detail']);
  }
}

// CREATE MODE (when adding new item)
showCreateForm() {
  const emptyDonation = {} as Donation;
  return super.showCreateForm(emptyDonation, { create: true });
}
```

---

## Dynamic Form-Dependent Fields

### The Challenge

Some fields should only appear based on **form input values** (not just the original data). For example:

- "Payment Method" should only show when status is changed to "PAID"
- "Start Date" should only show when type is "REGULAR"

### The Problem

In the field definition, we use **static donation data**:

```typescript
{
  field_name: 'Payment method',
  // ❌ This uses original data, not current form value!
  hide_field: !(donation?.status === 'PAID'),
  editable: mode === 'edit'
}
```

When user changes status to "PAID" in the form, the field doesn't appear because `donation?.status` is still the old value.

### Solution Approach

There are **three ways** to handle this:

#### Option 1: Use setupFieldVisibilityRules (Recommended - NEW!)

The Accordion base class now provides a generic `setupFieldVisibilityRules()` method that makes this super easy:

```typescript
protected override onClick(event: { buttonId: string; rowIndex: number }): void {
  if (event.buttonId === 'UPDATE') {
    this.showEditForm(event.rowIndex, ['donation_detail']);
    
    // Setup dynamic field visibility using the generic method
    // Defer to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.formSubscription = this.setupFieldVisibilityRules('donation_detail', event.rowIndex, [
        {
          fieldName: 'paidOn',
          condition: (formValue) => formValue.status === 'PAID'
        },
        {
          fieldName: 'paidUsingUPI',
          condition: (formValue) => formValue.status === 'PAID' && formValue.paymentMethod === 'UPI'
        },
        {
          fieldName: 'startDate',
          condition: (formValue) => formValue.type === 'REGULAR'
        }
      ]);
    }, 0);
  }
}
```

**Benefits:**
- Clean, declarative syntax
- Reusable across all components
- Automatically handles subscription and initial update
- Type-safe with `FieldVisibilityRule` type
- **Prevents `ExpressionChangedAfterItHasBeenCheckedError`** by deferring initial update

> **Important**: When calling `setupFieldVisibilityRules()` after `showEditForm()`, wrap it in `setTimeout(0)` to avoid `ExpressionChangedAfterItHasBeenCheckedError`. This is because `showEditForm()` modifies the view, and calling `setupFieldVisibilityRules()` immediately would cause additional view modifications in the same change detection cycle.

> **Note**: The method internally uses `setTimeout(0)` for the initial visibility update, but you still need to wrap the method call itself when used after `showEditForm()`.

#### Option 2: Use Helper Methods

For simpler cases, use the batch update method:

```typescript
protected override onClick(event: { buttonId: string; rowIndex: number }): void {
  if (event.buttonId === 'UPDATE') {
    this.showEditForm(event.rowIndex, ['donation_detail']);
    
    const form = this.getSectionForm('donation_detail', event.rowIndex);
    
    form?.valueChanges.subscribe(formValue => {
      // Batch update multiple fields at once
      this.updateFieldsVisibility('donation_detail', event.rowIndex, {
        'paidOn': formValue.status === 'PAID',
        'paidToAccount': formValue.status === 'PAID',
        'paymentMethod': formValue.status === 'PAID',
        'paidUsingUPI': formValue.status === 'PAID' && formValue.paymentMethod === 'UPI'
      });
    });
  }
}
```

Or update a single field:

```typescript
this.updateFieldVisibility('donation_detail', 'paidOn', rowIndex, status === 'PAID');
```

#### Option 3: Manual Implementation (Legacy)

Subscribe to form changes and manually toggle field visibility:

```typescript
protected override onClick(event: { buttonId: string; rowIndex: number }): void {
  if (event.buttonId === 'UPDATE') {
    this.showEditForm(event.rowIndex, ['donation_detail']);
    
    // Get the form
    const form = this.getSectionForm('donation_detail', event.rowIndex);
    
    // Subscribe to status changes
    form?.get('status')?.valueChanges.subscribe(status => {
      // Get the payment method field
      const section = this.getSectionInAccordion('donation_detail', event.rowIndex);
      const paymentMethodField = section?.content?.find(f => f.form_control_name === 'paymentMethod');
      
      if (paymentMethodField) {
        // Toggle visibility based on form value
        paymentMethodField.hide_field = status !== 'PAID';
      }
    });
  }
}
```

### Available Generic Methods

The `Accordion` base class provides these methods:

| Method | Purpose | Returns |
|--------|---------|---------|
| `setupFieldVisibilityRules()` | Setup rules for multiple fields | `Subscription \| undefined` |
| `updateFieldVisibility()` | Update a single field's visibility | `void` |
| `updateFieldsVisibility()` | Batch update multiple fields | `void` |
| `regenerateDetailedView()` | Regenerate sections with new options (e.g., mode change) | `void` |
| `replaceSectionWithMode()` | Replace a specific section with different mode | `void` |

---

## Complete Examples

### Example 1: Self Donation Tab (View Only)

```typescript
export class SelfDonationTabComponent extends Accordion<Donation> {
  @Input() payableAccounts: Account[] = [];

  protected override prepareDetailedView(data: Donation): DetailedView[] {
    return [
      getDonationSection(data, {
        mode: 'view',  // Read-only mode
        refData: this.getRefData({ isActive: true }),
        payableAccounts: this.payableAccounts.map(acc => ({
          key: acc.id,
          displayValue: acc.accountHolderName || ''
        }))
      })
    ];
  }

  protected override prepareDefaultButtons(data: Donation): AccordionButton[] {
    // Only show "Notify Payment" for raised/pending donations
    return data.status === 'RAISED' || data.status === 'PENDING' 
      ? [{ button_id: 'NOTIFY', button_name: 'Notify Payment' }]
      : [];
  }

  protected override onClick(event: { buttonId: string; rowIndex: number }): void {
    if (event.buttonId === 'NOTIFY') {
      const donation = this.itemList[event.rowIndex];
      this.donationService.updatePaymentInfo(donation.id, 'NOTIFY', donation)
        ?.subscribe(data => {
          if (data) {
            this.itemList[event.rowIndex] = data;
            this.updateContentRow(data, event.rowIndex);
          }
        });
    }
  }
}
```

### Example 2: Guest Donation Tab (With Edit Mode)

```typescript
export class GuestDonationTabComponent extends Accordion<Donation> {
  private formSubscription?: Subscription;

  protected override prepareDetailedView(data: Donation): DetailedView[] {
    return [
      getDonorSection(data, {
        mode: 'view',
        refData: this.getRefData({ isActive: true })
      }),
      getDonationSection(data, {
        mode: 'view',
        refData: this.getRefData({ isActive: true })
      })
    ];
  }

  protected override prepareDefaultButtons(data: Donation): AccordionButton[] {
    return [
      { button_id: 'UPDATE', button_name: 'Update' }
    ];
  }

  protected override onClick(event: { buttonId: string; rowIndex: number }): void {
    if (event.buttonId === 'UPDATE') {
      this.activeButtonId = event.buttonId;
      
      // Regenerate sections in edit mode
      const donation = this.itemList[event.rowIndex];
      const donorSection = getDonorSection(donation, {
        mode: 'edit',
        refData: this.getRefData({ isActive: true })
      });
      const donationSection = getDonationSection(donation, {
        mode: 'edit',
        refData: this.getRefData({ isActive: true })
      });
      
      // Replace sections
      this.accordionList.contents[event.rowIndex].detailed = [
        donorSection,
        donationSection
      ];
      
      // Show edit form
      this.showEditForm(event.rowIndex, ['donor_detail', 'donation_detail']);
      
      // Handle dynamic field visibility
      this.setupDynamicFieldVisibility(event.rowIndex);
    }
    else if (event.buttonId === 'CANCEL' && this.activeButtonId === 'UPDATE') {
      this.formSubscription?.unsubscribe();
      this.hideForm(event.rowIndex);
    }
    else if (event.buttonId === 'CONFIRM' && this.activeButtonId === 'UPDATE') {
      const donorForm = this.getSectionForm('donor_detail', event.rowIndex);
      const donationForm = this.getSectionForm('donation_detail', event.rowIndex);
      
      if (donorForm?.valid && donationForm?.valid) {
        const updatedDonation = {
          ...this.itemList[event.rowIndex],
          ...donorForm.value,
          ...donationForm.value
        };
        
        this.donationService.updateDonation(updatedDonation.id, updatedDonation)
          .subscribe(data => {
            this.itemList[event.rowIndex] = data;
            this.updateContentRow(data, event.rowIndex);
            this.formSubscription?.unsubscribe();
            this.hideForm(event.rowIndex);
          });
      }
    }
  }

  private setupDynamicFieldVisibility(rowIndex: number): void {
    const form = this.getSectionForm('donation_detail', rowIndex);
    
    // Clean up previous subscription
    this.formSubscription?.unsubscribe();
    
    // Subscribe to form changes
    this.formSubscription = form?.valueChanges.subscribe(formValue => {
      const section = this.getSectionInAccordion('donation_detail', rowIndex);
      
      if (!section?.content) return;
      
      // Toggle payment-related fields based on status
      const status = formValue.status;
      const paymentMethod = formValue.paymentMethod;
      
      section.content.forEach(field => {
        switch (field.form_control_name) {
          case 'paidOn':
          case 'paidToAccount':
          case 'paymentMethod':
          case 'remarks':
            field.hide_field = status !== 'PAID';
            break;
            
          case 'paidUsingUPI':
            field.hide_field = !(status === 'PAID' && paymentMethod === 'UPI');
            break;
            
          case 'cancellationReason':
            field.hide_field = status !== 'CANCELLED';
            break;
            
          case 'laterPaymentReason':
            field.hide_field = status !== 'PAY_LATER';
            break;
            
          case 'paymentFailureDetail':
            field.hide_field = status !== 'PAYMENT_FAILED';
            break;
        }
      });
    });
    
    // Trigger initial visibility update
    form?.updateValueAndValidity();
  }

  ngOnDestroy(): void {
    this.formSubscription?.unsubscribe();
  }
}
```

### Example 3: Create Mode

```typescript
export class DonationCreateComponent extends Accordion<Donation> {
  
  showCreateForm(): void {
    const emptyDonation: Partial<Donation> = {
      type: 'ONETIME',
      amount: 0
    };
    
    const sections = super.showCreateForm(emptyDonation as Donation, { create: true });
    
    // Setup dynamic visibility for create mode
    const form = this.getSectionForm('donation_detail', 0, true);
    
    form?.get('type')?.valueChanges.subscribe(type => {
      const section = this.getSectionInAccordion('donation_detail', 0, true);
      
      section?.content?.forEach(field => {
        if (field.form_control_name === 'startDate' || field.form_control_name === 'endDate') {
          field.hide_field = type !== 'REGULAR';
        }
        if (field.form_control_name === 'isForEvent' || field.form_control_name === 'eventId') {
          field.hide_field = type !== 'ONETIME';
        }
      });
    });
  }
}
```

---

## Best Practices

1. **Always specify mode explicitly** - Don't rely on defaults
2. **Use `mode: 'view'` for read-only accordions** - This is the most common case
3. **Regenerate sections when switching to edit mode** - This ensures all fields are properly configured
4. **Handle form subscriptions carefully** - Always unsubscribe to prevent memory leaks
5. **Use field-level visibility** for simple cases, **regenerate sections** for complex cases
6. **Test all mode transitions** - View → Edit → Save/Cancel

---

## Common Pitfalls

### ❌ Don't: Mix modes in the same section

```typescript
// Bad: Using isCreate flag
getDonationSection(data, { isCreate: true })
```

### ✅ Do: Use explicit mode

```typescript
// Good: Clear mode specification
getDonationSection(data, { mode: 'create' })
```

### ❌ Don't: Forget to pass required data for edit mode

```typescript
// Bad: Missing payableAccounts
getDonationSection(data, { mode: 'edit' })
```

### ✅ Do: Pass all necessary data

```typescript
// Good: All data provided
getDonationSection(data, {
  mode: 'edit',
  refData: this.getRefData({ isActive: true }),
  payableAccounts: this.payableAccounts.map(acc => ({
    key: acc.id,
    displayValue: acc.accountHolderName || ''
  })),
  events: this.events
})
```

---

## Summary

- **View Mode**: Default, read-only display
- **Edit Mode**: Triggered by `showEditForm()`, shows inputs for editable fields
- **Create Mode**: Triggered by `showCreateForm()`, all fields start empty
- **Dynamic Fields**: Use `form.valueChanges` to toggle visibility based on user input
- **Always clean up**: Unsubscribe from form subscriptions when done

