# Bulk Edit Donation Component

## Overview
The `BulkEditDonationComponent` is a reusable, configurable component for bulk editing donations. It provides a dedicated page where users can update multiple donations at once with a single form submission.

## Features
- ✅ **Reusable**: Can be used for any donation type (member, guest, self)
- ✅ **Configurable**: Supports custom configuration through route data
- ✅ **Validation**: Built-in validation for same type and status
- ✅ **User-friendly**: Clear UI with loading states and info banners
- ✅ **Type-safe**: Full TypeScript support with proper interfaces

## Usage

### Basic Navigation

To navigate to the bulk edit page from any component:

```typescript
// 1. Select donations to edit
const selectedDonations: Donation[] = [...];

// 2. Validate donations have same type and status
const uniqueTypes = new Set(selectedDonations.map(d => d.type));
const uniqueStatus = new Set(selectedDonations.map(d => d.status));

if (uniqueTypes.size > 1 || uniqueStatus.size > 1) {
  // Show error
  return;
}

// 3. Navigate with donation data
const donIds = selectedDonations.map(d => d.id).join(',');
this.router.navigate(['/secured/finance/donations/bulk-edit'], {
  queryParams: { ids: donIds },
  state: { donations: selectedDonations }
});
```

### Configuration Options

You can configure the bulk edit page behavior through route data:

```typescript
{
  path: 'donations/bulk-edit',
  component: BulkEditDonationComponent,
  data: {
    title: 'Bulk Edit Donations',           // Custom title
    lockedFields: ['amount', 'type'],       // Fields to lock/disable
    showDocuments: true,                     // Show document upload section
    returnUrl: '/donations',                 // Return URL after completion
    customValidations: {                     // Additional field validators
      'customField': [Validators.required]
    }
  }
}
```

### Configuration Interface

```typescript
export interface BulkEditConfig {
  /** Title to display in the header */
  title?: string;
  
  /** Fields that should be locked/disabled during bulk edit */
  lockedFields?: string[];
  
  /** Whether to show document upload section */
  showDocuments?: boolean;
  
  /** Return URL after successful update */
  returnUrl?: string;
  
  /** Additional validation rules */
  customValidations?: { [fieldName: string]: any[] };
}
```

## Example: Member Donation Tab

```typescript
bulkUpdate(): void {
  const dons = this.selectedRows.map((m) => this.itemList[m.index]);
  
  // Validate: Same Type and same Status
  const uniqueTypes = new Set(dons.map(d => d.type));
  if (uniqueTypes.size > 1) {
    this.modalService.openNotificationModal(AppDialog.err_sel_don_nt_sm_typ, 'notification', 'error');
    return;
  }
  const uniqueStatus = new Set(dons.map(d => d.status));
  if (uniqueStatus.size > 1) {
    this.modalService.openNotificationModal(AppDialog.err_sel_don_nt_sm_sts, 'notification', 'error');
    return;
  }

  // Navigate to bulk edit page with donations data
  const donIds = dons.map(d => d.id).join(',');
  this.router.navigate(['/secured/finance/donations/bulk-edit'], {
    queryParams: { ids: donIds },
    state: { donations: dons }
  });
}
```

## Implementation Details

### How It Works

1. **Navigation**: Component receives donation IDs through query parameters and donation data through navigation state
2. **Validation**: Validates that all donations have the same type and status
3. **Form Setup**: Creates a form pre-filled with common values from the first donation
4. **Field Locking**: Locks configured fields (amount, type by default) to prevent changes
5. **Submission**: Updates all donations with the form values using `compareObjects` to send only changed fields
6. **Return**: Navigates back to the configured return URL or previous page

### Key Methods

- `ngOnInit()`: Initializes the component, checks permissions, loads data
- `loadDonations()`: Fetches accounts and ref data, retrieves donations from state
- `validateDonations()`: Ensures all donations have same type and status
- `prepareForm()`: Sets up the form with locked fields
- `setupFormLogic()`: Configures visibility rules and dynamic validations
- `onSubmit()`: Validates and updates all donations
- `onCancel()`: Returns to previous page

### Styling

The component uses modern, responsive styling with:
- Smooth animations and transitions
- Glassmorphism info banner
- Sticky action buttons
- Mobile-responsive design
- Loading states with spinner

## Extension Points

To extend the bulk edit functionality for different donation types:

1. **Custom Route Data**: Add specific configuration in routing module
2. **Override Validation**: Extend validation logic in route guards
3. **Custom Fields**: Configure lockedFields and customValidations
4. **Return Handling**: Set custom returnUrl for context-specific navigation

## Best Practices

1. ✅ Always validate donations before navigation
2. ✅ Pass full donation objects through navigation state
3. ✅ Configure appropriate locked fields for your use case
4. ✅ Provide clear error messages for validation failures
5. ✅ Test with different donation types and statuses
