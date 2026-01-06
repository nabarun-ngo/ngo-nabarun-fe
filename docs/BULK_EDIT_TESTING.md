# Bulk Edit Donation - Testing Checklist

## Pre-Testing Setup
- [ ] Ensure Angular dev server is running
- [ ] Login with appropriate permissions (update:donation)
- [ ] Navigate to donation dashboard
- [ ] Select member donations tab

## Basic Functionality Tests

### 1. Navigation to Bulk Edit
- [ ] Select multiple donations (same type, same status)
- [ ] Click "Bulk Update" button
- [ ] Verify navigation to `/secured/finance/donations/bulk-edit`
- [ ] Check URL contains `ids` query parameter with comma-separated IDs
- [ ] Confirm page loads without errors

### 2. Page Display
- [ ] Header shows correct title: "Bulk Edit Donations"
- [ ] Subtitle shows correct count: "Editing X donation(s)"
- [ ] Info banner displays with explanation
- [ ] Form displays with pre-filled values from first donation
- [ ] Locked fields (amount, type) are disabled
- [ ] Editable fields are enabled
- [ ] Action buttons visible at bottom

### 3. Validation Tests
- [ ] Try selecting donations with different types → Error message shown
- [ ] Try selecting donations with different statuses → Error message shown
- [ ] Try navigating without selections → Error message shown
- [ ] Required field validation works
- [ ] Status-based field visibility works (e.g., PAID shows payment fields)

### 4. Form Interactions
- [ ] Change status → Verify dependent fields show/hide correctly
- [ ] Change payment method → Verify UPI field shows/hides
- [ ] Upload document → Verify document appears in list
- [ ] Try to edit locked field → Confirm it's disabled

### 5. Submission Tests
- [ ] Fill all required fields correctly
- [ ] Click "Update X Donation(s)" button
- [ ] Verify loading state appears
- [ ] Check all donations are updated in database
- [ ] Confirm success notification appears
- [ ] Verify navigation back to previous page

### 6. Error Handling
- [ ] Submit form with invalid data → Error notification shown
- [ ] Submit PAID status without document (non-cash) → Error shown
- [ ] Test network error scenario → Error handled gracefully

### 7. Cancel/Back Navigation
- [ ] Click Cancel button → Navigate back to donation list
- [ ] Use browser back button → Return to donation list
- [ ] Verify no changes were saved

## Edge Cases

### Data Edge Cases
- [ ] Test with 1 donation selected
- [ ] Test with 10+ donations selected
- [ ] Test with donations of different periods
- [ ] Test with donations in different currencies (if applicable)

### UI Edge Cases
- [ ] Test on mobile view → Buttons stack vertically
- [ ] Test with long donation IDs → UI remains readable
- [ ] Test with many form fields → Scroll works correctly
- [ ] Test info banner on small screens

### Permission Edge Cases
- [ ] Access without update:donation permission → Access denied
- [ ] Access with expired session → Redirect to login

## Configuration Tests

### 1. Custom Title
- [ ] Change route data `title` → Verify new title displays

### 2. Custom Locked Fields
- [ ] Add different fields to `lockedFields` → Verify they're disabled
- [ ] Remove locked fields → Verify they become editable

### 3. Show/Hide Documents
- [ ] Set `showDocuments: false` → Document section hidden
- [ ] Set `showDocuments: true` → Document section visible

### 4. Custom Return URL
- [ ] Set `returnUrl` → Verify navigation goes to custom URL
- [ ] Remove `returnUrl` → Verify uses browser back

### 5. Custom Validations
- [ ] Add custom validators → Verify they're enforced
- [ ] Test error messages display correctly

## Performance Tests
- [ ] Bulk edit 5 donations → Completes in reasonable time
- [ ] Bulk edit 20 donations → Completes in reasonable time
- [ ] Check network requests → Only necessary calls made
- [ ] Loading states appear when needed

## Browser Compatibility
- [ ] Chrome/Edge → All features work
- [ ] Firefox → All features work
- [ ] Safari → All features work
- [ ] Mobile browsers → Responsive design works

## Accessibility Tests
- [ ] Tab navigation works through all fields
- [ ] Screen reader announces form labels
- [ ] Error messages are accessible
- [ ] Focus management is logical

## Integration Tests

### With Member Donation Tab
- [ ] Select donations → Navigate → Edit → Return
- [ ] Verify list updates with new values
- [ ] Check selection is cleared after return

### With Donation Service
- [ ] Verify correct API calls are made
- [ ] Check only changed fields are sent
- [ ] Confirm documents are uploaded correctly

### With Modal Service
- [ ] Error notifications display correctly
- [ ] Success notifications display correctly
- [ ] Validation errors are clear

## Regression Tests
- [ ] Single donation edit still works
- [ ] Create donation still works
- [ ] Other donation tabs work correctly
- [ ] Navigation breadcrumbs work
- [ ] Page refresh doesn't break state

## Code Quality Checks
- [ ] No console errors in browser
- [ ] No TypeScript compilation errors
- [ ] No lint warnings
- [ ] Code follows project conventions
- [ ] Comments are clear and helpful

## Documentation Verification
- [ ] README.md is accurate
- [ ] Usage examples work as documented
- [ ] Configuration options are correct
- [ ] API is properly documented

## Final Checklist
- [ ] Feature works end-to-end
- [ ] No breaking changes to existing code
- [ ] Performance is acceptable
- [ ] UI is polished and professional
- [ ] Error handling is comprehensive
- [ ] Documentation is complete

## Notes/Issues Found
```
(Document any issues or observations here)
```

---

## Test Results Summary

| Category | Tests Passed | Tests Failed | Notes |
|----------|--------------|--------------|-------|
| Basic Functionality | _ / _ | _ | |
| Validation | _ / _ | _ | |
| Form Interactions | _ / _ | _ | |
| Submission | _ / _ | _ | |
| Error Handling | _ / _ | _ | |
| Edge Cases | _ / _ | _ | |
| Configuration | _ / _ | _ | |
| Performance | _ / _ | _ | |
| Browser Compatibility | _ / _ | _ | |
| Accessibility | _ / _ | _ | |
| Integration | _ / _ | _ | |
| Regression | _ / _ | _ | |

**Overall Status**: [ ] Passed | [ ] Failed

**Tester**: ________________
**Date**: ________________
**Build Version**: ________________
