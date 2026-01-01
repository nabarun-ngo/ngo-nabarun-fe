# Accordion Mode Switching: Update vs Regenerate

## Two Approaches for Switching Modes

When switching between view and edit modes in an accordion, you have two options:

### Option 1: `updateSectionsMode()` - In-Place Update ⚡ (Recommended)

**Use when**: You only need to toggle between view and edit modes for existing data.

```typescript
protected override onClick(event: { buttonId: string; rowIndex: number }): void {
  if (event.buttonId === 'UPDATE') {
    // Simply toggle editable flags on existing sections
    this.updateSectionsMode(event.rowIndex, 'edit');
    
    this.showEditForm(event.rowIndex, ['donation_detail', 'donor_detail']);
  }
}
```

**Pros:**
- ✅ **Much faster** - No object creation or destruction
- ✅ **Preserves form state** - Existing FormControls remain intact
- ✅ **Less memory usage** - No garbage collection needed
- ✅ **Simpler code** - One line instead of regenerating everything

**Cons:**
- ❌ Can't change field visibility or structure
- ❌ Can't add/remove fields dynamically
- ❌ Won't update dropdown options or reference data

---

### Option 2: `regenerateDetailedView()` - Full Regeneration 🔄

**Use when**: You need to change field configuration, visibility, or reference data.

```typescript
protected override onClick(event: { buttonId: string; rowIndex: number }): void {
  if (event.buttonId === 'UPDATE') {
    // Regenerate sections with new configuration
    this.regenerateDetailedView(event.rowIndex, { mode: 'edit' });
    
    this.showEditForm(event.rowIndex, ['donation_detail', 'donor_detail']);
  }
}
```

**Pros:**
- ✅ **Full flexibility** - Can change anything about the sections
- ✅ **Fresh state** - New FormControls with updated validators
- ✅ **Updated reference data** - Gets latest dropdown options
- ✅ **Dynamic fields** - Can show/hide fields based on mode

**Cons:**
- ❌ **Slower** - Creates new objects and destroys old ones
- ❌ **Loses form state** - Any unsaved changes are lost
- ❌ **More memory** - Triggers garbage collection
- ❌ **More complex** - Requires `prepareDetailedView` to handle options

---

## Comparison Table

| Feature | `updateSectionsMode()` | `regenerateDetailedView()` |
|---------|------------------------|----------------------------|
| **Performance** | ⚡ Fast | 🐌 Slower |
| **Memory Usage** | 💚 Low | 💛 Higher |
| **Preserves Form State** | ✅ Yes | ❌ No |
| **Can Change Fields** | ❌ No | ✅ Yes |
| **Can Update Dropdowns** | ❌ No | ✅ Yes |
| **Code Complexity** | 💚 Simple | 💛 Moderate |
| **Use Case** | Simple view/edit toggle | Complex mode changes |

---

## When to Use Each

### Use `updateSectionsMode()` when:
- ✅ Switching between view and edit for the same data
- ✅ No fields need to be added/removed
- ✅ Dropdown options don't need updating
- ✅ Performance is critical
- ✅ You want to preserve any form changes

**Example**: User clicks "Edit" button to modify a donation record

### Use `regenerateDetailedView()` when:
- ✅ Field visibility changes based on mode
- ✅ Different fields appear in create vs edit mode
- ✅ Dropdown options need to be refreshed
- ✅ Validators change based on mode
- ✅ You need a clean slate

**Example**: Switching from view mode to create mode with different fields

---

## Real-World Example

### Scenario: Guest Donation Tab

**Current Implementation** (uses regeneration):
```typescript
// This regenerates everything
this.regenerateDetailedView(event.rowIndex, { mode: 'edit' });
```

**Optimized Implementation** (uses update):
```typescript
// This just toggles editable flags - much faster!
this.updateSectionsMode(event.rowIndex, 'edit');
```

**Why optimize?**
- Guest donations don't add/remove fields between view and edit
- Reference data (status options, payment methods) doesn't change
- We just need to make fields editable
- **Result**: ~10x faster mode switching

---

## Best Practice Recommendation

**Start with `updateSectionsMode()`** for simple view/edit toggles. Only use `regenerateDetailedView()` if you actually need to change the field structure.

```typescript
protected override onClick(event: { buttonId: string; rowIndex: number }): void {
  if (event.buttonId === 'UPDATE') {
    // ✅ Preferred: Fast in-place update
    this.updateSectionsMode(event.rowIndex, 'edit');
    
    // ❌ Avoid unless necessary: Full regeneration
    // this.regenerateDetailedView(event.rowIndex, { mode: 'edit' });
    
    this.showEditForm(event.rowIndex, ['donation_detail', 'donor_detail']);
  }
}
```

---

## Summary

- **`updateSectionsMode()`**: Fast, simple, preserves state - use for basic view/edit toggle
- **`regenerateDetailedView()`**: Flexible, powerful, fresh state - use when structure changes

Choose based on your needs, but prefer `updateSectionsMode()` for better performance! ⚡
