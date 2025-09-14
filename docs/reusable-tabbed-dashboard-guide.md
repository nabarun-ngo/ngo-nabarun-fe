# Reusable Tabbed Dashboard Implementation Guide

This guide provides step-by-step instructions for implementing the standardized tabbed dashboard pattern used across the application. This pattern supports lazy loading, resolver data integration, and consistent user experience.

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Step-by-Step Implementation](#step-by-step-implementation)
- [Integration with Routing](#integration-with-routing)
- [Advanced Features](#advanced-features)
- [Testing Guide](#testing-guide)
- [Common Pitfalls](#common-pitfalls)
- [Examples](#examples)

## Architecture Overview

The reusable tabbed dashboard pattern consists of:

1. **StandardTabbedDashboard**: Base class providing common functionality
2. **TabComponentInterface**: Interface that all tab components must implement
3. **Parent Dashboard Component**: Extends StandardTabbedDashboard
4. **Tab Components**: Individual components for each tab implementing TabComponentInterface
5. **Resolver Integration**: Optional data pre-loading for initial tab
6. **Lazy Loading**: Data loading only when tabs are activated

### Key Benefits
- Consistent user experience across dashboards
- Optimized performance with lazy loading
- Reusable code patterns
- Standardized search and filtering
- Resolver data integration support

## Prerequisites

Before implementing a new tabbed dashboard, ensure you have:

1. Angular Material installed and configured
2. Base interfaces and classes available:
   - `StandardTabbedDashboard` class
   - `TabComponentInterface` interface
3. Service layer for data fetching
4. Optional: Route resolver for initial data loading

## Step-by-Step Implementation

### Step 1: Create the Parent Dashboard Component

Create your main dashboard component that will host the tabs.

```bash
ng generate component dashboards/my-new-dashboard
```

#### 1.1 Component Class

```typescript path=null start=null
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTabGroup } from '@angular/material/tabs';
import { StandardTabbedDashboard } from '../base/standard-tabbed-dashboard';
import { TabComponentInterface } from '../base/tab-component.interface';
import { MyDataService } from '../../services/my-data.service';

@Component({
  selector: 'app-my-new-dashboard',
  templateUrl: './my-new-dashboard.component.html',
  styleUrls: ['./my-new-dashboard.component.scss']
})
export class MyNewDashboardComponent extends StandardTabbedDashboard implements OnInit {
  @ViewChild('tabGroup', { static: true }) tabGroup!: MatTabGroup;

  // Define your tabs configuration
  tabsConfig = [
    {
      name: 'Active Items',
      component: 'active-items-tab',
      searchPlaceholder: 'Search active items...'
    },
    {
      name: 'Archived Items',
      component: 'archived-items-tab',
      searchPlaceholder: 'Search archived items...'
    }
  ];

  constructor(
    protected route: ActivatedRoute,
    private myDataService: MyDataService
  ) {
    super();
  }

  ngOnInit(): void {
    this.handleRouteData();
    this.setupSearch();
    this.loadInitialTabData();
  }

  private handleRouteData(): void {
    const routeData = this.route.snapshot.data['data'];
    const refData = this.route.snapshot.data['ref_data'];
    
    if (routeData) {
      this.workItemList = routeData;
    }
    if (refData) {
      this.refData = refData;
    }
  }

  private setupSearch(): void {
    const currentTab = this.tabsConfig[this.currentTabIndex];
    this.searchInput.placeholder = currentTab.searchPlaceholder;
  }

  private loadInitialTabData(): void {
    // Load data for the initially active tab
    this.loadTabData(this.currentTabIndex);
  }

  // Override the tab change hook
  protected onTabChangedHook(newTabIndex: number): void {
    const currentTab = this.tabsConfig[newTabIndex];
    this.searchInput.placeholder = currentTab.searchPlaceholder;
    
    // Load data for the newly active tab
    this.loadTabData(newTabIndex);
  }

  private loadTabData(tabIndex: number): void {
    // Get reference to the tab component
    const tabComponent = this.getTabComponent(tabIndex);
    if (!tabComponent) return;

    // If this is the first load and we have resolver data, use it
    if (tabIndex === 0 && this.workItemList && !this.visitedTabs.has(tabIndex)) {
      tabComponent.loadInitialData(this.workItemList, this.refData);
    } else if (!this.visitedTabs.has(tabIndex)) {
      // Load data for tabs that haven't been visited
      tabComponent.triggerDataLoad();
    }

    // Mark tab as visited
    this.visitedTabs.add(tabIndex);
  }

  private getTabComponent(tabIndex: number): TabComponentInterface | null {
    // Implementation depends on how you access tab components
    // This is a simplified example
    const tabComponents = [
      this.activeItemsTabComponent,
      this.archivedItemsTabComponent
    ];
    return tabComponents[tabIndex] || null;
  }

  // Handle search forwarding to active tab
  onSearch(): void {
    const activeTabComponent = this.getTabComponent(this.currentTabIndex);
    if (activeTabComponent) {
      activeTabComponent.handleSearch(this.searchInput.value);
    }
  }
}
```

#### 1.2 Component Template

```html path=null start=null
<div class="dashboard-container">
  <!-- Header Section -->
  <div class="dashboard-header">
    <h2 class="dashboard-title">My New Dashboard</h2>
    
    <!-- Search Input -->
    <div class="search-container">
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>{{ searchInput.placeholder }}</mat-label>
        <input matInput 
               [(ngModel)]="searchInput.value"
               (keyup.enter)="onSearch()"
               placeholder="{{ searchInput.placeholder }}">
        <button mat-icon-button matSuffix (click)="onSearch()">
          <mat-icon>search</mat-icon>
        </button>
      </mat-form-field>
    </div>
  </div>

  <!-- Tabs Section -->
  <mat-tab-group #tabGroup 
                 [(selectedIndex)]="currentTabIndex"
                 (selectedTabChange)="onTabChanged($event)"
                 class="dashboard-tabs">
    
    <!-- Active Items Tab -->
    <mat-tab label="Active Items">
      <div class="tab-content">
        <app-active-items-tab #activeItemsTab
                              [initialData]="getInitialDataForTab(0)"
                              [refData]="refData">
        </app-active-items-tab>
      </div>
    </mat-tab>

    <!-- Archived Items Tab -->
    <mat-tab label="Archived Items">
      <div class="tab-content">
        <app-archived-items-tab #archivedItemsTab
                                [initialData]="getInitialDataForTab(1)"
                                [refData]="refData">
        </app-archived-items-tab>
      </div>
    </mat-tab>

  </mat-tab-group>
</div>
```

#### 1.3 Component Styles

```scss path=null start=null
.dashboard-container {
  padding: 20px;
  height: 100%;
  
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .dashboard-title {
      margin: 0;
      color: #333;
    }
    
    .search-container {
      .search-field {
        width: 300px;
      }
    }
  }
  
  .dashboard-tabs {
    height: calc(100% - 80px);
    
    ::ng-deep .mat-tab-body-content {
      height: 100%;
      overflow: hidden;
    }
    
    .tab-content {
      height: 100%;
      padding: 16px 0;
    }
  }
}
```

### Step 2: Create Tab Components

For each tab in your dashboard, create a separate component.

```bash
ng generate component dashboards/my-new-dashboard/tabs/active-items-tab
ng generate component dashboards/my-new-dashboard/tabs/archived-items-tab
```

#### 2.1 Tab Component Implementation

```typescript path=null start=null
import { Component, Input, OnInit } from '@angular/core';
import { TabComponentInterface } from '../../../base/tab-component.interface';
import { MyDataService } from '../../../../services/my-data.service';

@Component({
  selector: 'app-active-items-tab',
  templateUrl: './active-items-tab.component.html',
  styleUrls: ['./active-items-tab.component.scss']
})
export class ActiveItemsTabComponent implements TabComponentInterface, OnInit {
  @Input() initialData: any[] = [];
  @Input() refData: any = {};

  // Component state
  items: any[] = [];
  loading = false;
  error: string | null = null;

  constructor(private myDataService: MyDataService) {}

  ngOnInit(): void {
    // Don't auto-load data here - wait for parent to trigger
  }

  // Required by TabComponentInterface
  loadInitialData(data: any[], refData?: any): void {
    this.initialData = data;
    this.refData = refData || {};
    this.items = [...data];
    this.loading = false;
  }

  // Required by TabComponentInterface
  triggerDataLoad(): void {
    this.loadData();
  }

  // Required by TabComponentInterface
  handleSearch(searchTerm: string): void {
    if (!searchTerm?.trim()) {
      this.loadData();
      return;
    }
    
    this.loading = true;
    this.myDataService.searchActiveItems(searchTerm).subscribe({
      next: (results) => {
        this.items = results;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to search items';
        this.loading = false;
      }
    });
  }

  private loadData(): void {
    this.loading = true;
    this.error = null;
    
    this.myDataService.getActiveItems().subscribe({
      next: (data) => {
        this.items = data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load active items';
        this.loading = false;
      }
    });
  }

  // Additional methods specific to this tab
  onItemAction(item: any, action: string): void {
    // Handle item-specific actions
    switch (action) {
      case 'view':
        this.viewItem(item);
        break;
      case 'edit':
        this.editItem(item);
        break;
      case 'archive':
        this.archiveItem(item);
        break;
    }
  }

  private viewItem(item: any): void {
    // Implementation for viewing item
  }

  private editItem(item: any): void {
    // Implementation for editing item
  }

  private archiveItem(item: any): void {
    // Implementation for archiving item
  }
}
```

#### 2.2 Tab Component Template

```html path=null start=null
<div class="tab-container">
  <!-- Loading State -->
  <div *ngIf="loading" class="loading-container">
    <mat-spinner diameter="40"></mat-spinner>
    <p>Loading active items...</p>
  </div>

  <!-- Error State -->
  <div *ngIf="error && !loading" class="error-container">
    <mat-icon color="warn">error</mat-icon>
    <p>{{ error }}</p>
    <button mat-raised-button color="primary" (click)="triggerDataLoad()">
      Retry
    </button>
  </div>

  <!-- Content State -->
  <div *ngIf="!loading && !error" class="content-container">
    <!-- Empty State -->
    <div *ngIf="items.length === 0" class="empty-state">
      <mat-icon>inbox</mat-icon>
      <p>No active items found</p>
    </div>

    <!-- Items List -->
    <div *ngIf="items.length > 0" class="items-container">
      <mat-card *ngFor="let item of items" class="item-card">
        <mat-card-header>
          <mat-card-title>{{ item.title }}</mat-card-title>
          <mat-card-subtitle>{{ item.subtitle }}</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <p>{{ item.description }}</p>
        </mat-card-content>
        
        <mat-card-actions align="end">
          <button mat-button (click)="onItemAction(item, 'view')">
            View
          </button>
          <button mat-button (click)="onItemAction(item, 'edit')">
            Edit
          </button>
          <button mat-button color="warn" (click)="onItemAction(item, 'archive')">
            Archive
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  </div>
</div>
```

#### 2.3 Tab Component Styles

```scss path=null start=null
.tab-container {
  height: 100%;
  padding: 16px;
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    
    p {
      margin-top: 16px;
      color: #666;
    }
  }
  
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    
    mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }
    
    p {
      margin: 16px 0;
      color: #d32f2f;
    }
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #666;
    
    mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }
  }
  
  .items-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
    
    .item-card {
      transition: transform 0.2s ease-in-out;
      
      &:hover {
        transform: translateY(-2px);
      }
    }
  }
}
```

### Step 3: Integration with Routing

#### 3.1 Create Route Resolver (Optional)

If you want to pre-load data for the initial tab:

```bash
ng generate resolver resolvers/my-dashboard-resolver
```

```typescript path=null start=null
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { MyDataService } from '../services/my-data.service';

@Injectable({
  providedIn: 'root'
})
export class MyDashboardResolver implements Resolve<any> {
  constructor(private myDataService: MyDataService) {}

  resolve(): Observable<any> {
    return forkJoin({
      data: this.myDataService.getActiveItems(), // Initial tab data
      ref_data: this.myDataService.getReferenceData() // Reference data
    });
  }
}
```

#### 3.2 Update Routing Module

```typescript path=null start=null
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyNewDashboardComponent } from './dashboards/my-new-dashboard/my-new-dashboard.component';
import { MyDashboardResolver } from './resolvers/my-dashboard-resolver.resolver';

const routes: Routes = [
  {
    path: 'my-dashboard',
    component: MyNewDashboardComponent,
    resolve: {
      data: MyDashboardResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyDashboardRoutingModule { }
```

### Step 4: Module Declaration

Update your module to include all components:

```typescript path=null start=null
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MyDashboardRoutingModule } from './my-dashboard-routing.module';
import { MyNewDashboardComponent } from './my-new-dashboard.component';
import { ActiveItemsTabComponent } from './tabs/active-items-tab/active-items-tab.component';
import { ArchivedItemsTabComponent } from './tabs/archived-items-tab/archived-items-tab.component';

@NgModule({
  declarations: [
    MyNewDashboardComponent,
    ActiveItemsTabComponent,
    ArchivedItemsTabComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MyDashboardRoutingModule,
    
    // Angular Material modules
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule
  ]
})
export class MyDashboardModule { }
```

## Advanced Features

### Tab Component Access Pattern

To properly access tab components from the parent, use ViewChild:

```typescript path=null start=null
export class MyNewDashboardComponent extends StandardTabbedDashboard {
  @ViewChild('activeItemsTab', { static: false }) activeItemsTabComponent!: ActiveItemsTabComponent;
  @ViewChild('archivedItemsTab', { static: false }) archivedItemsTabComponent!: ArchivedItemsTabComponent;

  private getTabComponent(tabIndex: number): TabComponentInterface | null {
    switch (tabIndex) {
      case 0: return this.activeItemsTabComponent;
      case 1: return this.archivedItemsTabComponent;
      default: return null;
    }
  }
}
```

### Custom Search Implementation

For more complex search scenarios:

```typescript path=null start=null
// In parent component
onSearch(): void {
  const searchTerm = this.searchInput.value?.trim();
  const activeTabComponent = this.getTabComponent(this.currentTabIndex);
  
  if (activeTabComponent) {
    // Pass additional context if needed
    activeTabComponent.handleSearch(searchTerm, {
      tabIndex: this.currentTabIndex,
      filters: this.currentFilters,
      refData: this.refData
    });
  }
}

// In tab component
handleSearch(searchTerm: string, context?: any): void {
  const filters = context?.filters || {};
  const refData = context?.refData || {};
  
  // Implement custom search logic
}
```

### Dynamic Tab Configuration

For dynamically generated tabs:

```typescript path=null start=null
// In parent component
ngOnInit(): void {
  this.loadTabConfiguration().then(config => {
    this.tabsConfig = config;
    this.setupDynamicTabs();
  });
}

private async loadTabConfiguration(): Promise<any[]> {
  const userPermissions = await this.authService.getUserPermissions();
  
  return [
    { name: 'Active Items', visible: true },
    { name: 'Archived Items', visible: userPermissions.canViewArchived },
    { name: 'Admin Panel', visible: userPermissions.isAdmin }
  ].filter(tab => tab.visible);
}
```

## Testing Guide

### Unit Testing Parent Component

```typescript path=null start=null
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { MyNewDashboardComponent } from './my-new-dashboard.component';

describe('MyNewDashboardComponent', () => {
  let component: MyNewDashboardComponent;
  let fixture: ComponentFixture<MyNewDashboardComponent>;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;

  beforeEach(async () => {
    const routeSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: {
        data: {
          data: [{ id: 1, title: 'Test Item' }],
          ref_data: { categories: ['A', 'B'] }
        }
      }
    });

    await TestBed.configureTestingModule({
      declarations: [MyNewDashboardComponent],
      providers: [
        { provide: ActivatedRoute, useValue: routeSpy }
      ]
    }).compileComponents();

    mockActivatedRoute = TestBed.inject(ActivatedRoute) as jasmine.SpyObj<ActivatedRoute>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyNewDashboardComponent);
    component = fixture.componentInstance;
  });

  it('should initialize with resolver data', () => {
    component.ngOnInit();
    
    expect(component.workItemList).toEqual([{ id: 1, title: 'Test Item' }]);
    expect(component.refData).toEqual({ categories: ['A', 'B'] });
  });

  it('should handle tab changes correctly', () => {
    spyOn(component, 'loadTabData');
    
    component.onTabChanged({ index: 1 });
    
    expect(component.currentTabIndex).toBe(1);
    expect(component.loadTabData).toHaveBeenCalledWith(1);
  });
});
```

### Unit Testing Tab Components

```typescript path=null start=null
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActiveItemsTabComponent } from './active-items-tab.component';
import { MyDataService } from '../../../../services/my-data.service';

describe('ActiveItemsTabComponent', () => {
  let component: ActiveItemsTabComponent;
  let fixture: ComponentFixture<ActiveItemsTabComponent>;
  let mockDataService: jasmine.SpyObj<MyDataService>;

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('MyDataService', [
      'getActiveItems',
      'searchActiveItems'
    ]);

    await TestBed.configureTestingModule({
      declarations: [ActiveItemsTabComponent],
      providers: [
        { provide: MyDataService, useValue: serviceSpy }
      ]
    }).compileComponents();

    mockDataService = TestBed.inject(MyDataService) as jasmine.SpyObj<MyDataService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveItemsTabComponent);
    component = fixture.componentInstance;
  });

  it('should load initial data correctly', () => {
    const testData = [{ id: 1, title: 'Test' }];
    const refData = { categories: ['A'] };
    
    component.loadInitialData(testData, refData);
    
    expect(component.items).toEqual(testData);
    expect(component.refData).toEqual(refData);
    expect(component.loading).toBeFalse();
  });

  it('should handle data loading', () => {
    const testData = [{ id: 1, title: 'Test' }];
    mockDataService.getActiveItems.and.returnValue(of(testData));
    
    component.triggerDataLoad();
    
    expect(component.loading).toBeFalse();
    expect(component.items).toEqual(testData);
  });

  it('should handle search', () => {
    const searchResults = [{ id: 2, title: 'Search Result' }];
    mockDataService.searchActiveItems.and.returnValue(of(searchResults));
    
    component.handleSearch('test');
    
    expect(mockDataService.searchActiveItems).toHaveBeenCalledWith('test');
    expect(component.items).toEqual(searchResults);
  });

  it('should handle errors gracefully', () => {
    mockDataService.getActiveItems.and.returnValue(
      throwError(() => new Error('Network error'))
    );
    
    component.triggerDataLoad();
    
    expect(component.error).toBeTruthy();
    expect(component.loading).toBeFalse();
  });
});
```

### Integration Testing

```typescript path=null start=null
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('Dashboard Integration', () => {
  let fixture: ComponentFixture<MyNewDashboardComponent>;
  let component: MyNewDashboardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MyNewDashboardComponent,
        ActiveItemsTabComponent,
        ArchivedItemsTabComponent
      ],
      imports: [
        MatTabsModule,
        BrowserAnimationsModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyNewDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display all tabs', () => {
    const tabLabels = fixture.debugElement.queryAll(By.css('.mat-tab-label'));
    expect(tabLabels.length).toBe(2);
    expect(tabLabels[0].nativeElement.textContent.trim()).toBe('Active Items');
    expect(tabLabels[1].nativeElement.textContent.trim()).toBe('Archived Items');
  });

  it('should switch tabs and load data', async () => {
    spyOn(component, 'loadTabData');
    
    const secondTab = fixture.debugElement.queryAll(By.css('.mat-tab-label'))[1];
    secondTab.nativeElement.click();
    fixture.detectChanges();
    await fixture.whenStable();
    
    expect(component.currentTabIndex).toBe(1);
    expect(component.loadTabData).toHaveBeenCalledWith(1);
  });
});
```

## Common Pitfalls

### 1. ViewChild Timing Issues

❌ **Wrong:**
```typescript path=null start=null
@ViewChild('tabComponent', { static: true }) tabComponent!: TabComponent;
// static: true won't work for tab content
```

✅ **Correct:**
```typescript path=null start=null
@ViewChild('tabComponent', { static: false }) tabComponent!: TabComponent;
// static: false allows for dynamic content loading
```

### 2. Memory Leaks

❌ **Wrong:**
```typescript path=null start=null
// Not unsubscribing from observables
ngOnInit() {
  this.dataService.getData().subscribe(data => {
    this.items = data;
  });
}
```

✅ **Correct:**
```typescript path=null start=null
private destroy$ = new Subject<void>();

ngOnInit() {
  this.dataService.getData()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => {
      this.items = data;
    });
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

### 3. Incorrect Tab Component Access

❌ **Wrong:**
```typescript path=null start=null
// Trying to access components before they're initialized
ngOnInit() {
  this.activeTabComponent.triggerDataLoad(); // Will fail
}
```

✅ **Correct:**
```typescript path=null start=null
ngAfterViewInit() {
  // Access components after view is initialized
  if (this.activeTabComponent) {
    this.activeTabComponent.triggerDataLoad();
  }
}
```

### 4. Missing Interface Implementation

❌ **Wrong:**
```typescript path=null start=null
export class MyTabComponent {
  // Missing required interface methods
}
```

✅ **Correct:**
```typescript path=null start=null
export class MyTabComponent implements TabComponentInterface {
  loadInitialData(data: any[], refData?: any): void { /* implementation */ }
  triggerDataLoad(): void { /* implementation */ }
  handleSearch(searchTerm: string): void { /* implementation */ }
}
```

## Examples

### Simple Two-Tab Dashboard

This is the most basic implementation with two tabs and minimal functionality:

```typescript path=null start=null
// dashboard.component.ts
export class SimpleDashboardComponent extends StandardTabbedDashboard {
  @ViewChild('listTab') listTabComponent!: ItemListTabComponent;
  @ViewChild('gridTab') gridTabComponent!: ItemGridTabComponent;

  private getTabComponent(tabIndex: number): TabComponentInterface | null {
    return tabIndex === 0 ? this.listTabComponent : this.gridTabComponent;
  }
}
```

### Complex Multi-Tab Dashboard with Permissions

```typescript path=null start=null
// complex-dashboard.component.ts
export class ComplexDashboardComponent extends StandardTabbedDashboard {
  availableTabs: TabConfig[] = [];
  
  async ngOnInit() {
    await this.loadAvailableTabs();
    this.handleRouteData();
    this.setupSearch();
    this.loadInitialTabData();
  }
  
  private async loadAvailableTabs() {
    const permissions = await this.authService.getPermissions();
    
    this.availableTabs = [
      { name: 'Overview', component: 'overview', visible: true },
      { name: 'Analytics', component: 'analytics', visible: permissions.analytics },
      { name: 'Reports', component: 'reports', visible: permissions.reports },
      { name: 'Admin', component: 'admin', visible: permissions.admin }
    ].filter(tab => tab.visible);
  }
}
```

### Dashboard with Custom Search and Filtering

```typescript path=null start=null
// filtered-dashboard.component.ts
export class FilteredDashboardComponent extends StandardTabbedDashboard {
  currentFilters: FilterState = {};
  
  onFilterChange(filters: FilterState) {
    this.currentFilters = filters;
    const activeTab = this.getTabComponent(this.currentTabIndex);
    if (activeTab && 'applyFilters' in activeTab) {
      (activeTab as any).applyFilters(filters);
    }
  }
  
  onSearch() {
    const activeTab = this.getTabComponent(this.currentTabIndex);
    if (activeTab) {
      activeTab.handleSearch(this.searchInput.value, {
        filters: this.currentFilters,
        tabIndex: this.currentTabIndex
      });
    }
  }
}
```

## Conclusion

This reusable tabbed dashboard pattern provides:

- **Consistency**: Standardized behavior across all dashboards
- **Performance**: Lazy loading prevents unnecessary data fetching
- **Flexibility**: Easy to extend and customize for specific needs
- **Maintainability**: Clear separation of concerns and reusable components
- **User Experience**: Smooth transitions and responsive design

By following this guide, you can implement robust, performant, and user-friendly tabbed dashboards throughout your Angular application.

For additional support or questions about implementation, refer to the existing dashboard implementations in the codebase:
- `TaskDashboardComponent`
- `AccountDashboardComponent`
- `RequestDashboardComponent`
- `ExpenseDashboardComponent`

These serve as working examples of the pattern in action.
