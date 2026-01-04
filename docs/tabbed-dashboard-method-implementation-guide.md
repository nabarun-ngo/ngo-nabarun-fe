# Tabbed Dashboard Implementation: Method-by-Method Guide

This guide provides specific implementation details for each method required in the tabbed dashboard pattern, with exact code snippets and explanations.

## Core Interfaces and Base Classes

### 1. `TabComponentInterface` Interface

The foundation interface that all tab components must implement:

```typescript
// src/app/shared/interfaces/tab-component.interface.ts
export interface TabComponentInterface {
  /**
   * Load initial data provided by a resolver or parent component
   * @param data The data to initialize the component with
   * @param refData Optional reference data (lookup values, etc.)
   */
  loadInitialData(data: any[], refData?: any): void;
  
  /**
   * Trigger data loading from the backend
   * This is called when a tab is activated for the first time
   */
  triggerDataLoad(): void;
  
  /**
   * Handle search requests from the parent component
   * @param searchTerm The search term to filter by
   * @param context Optional additional context
   */
  handleSearch(searchTerm: string, context?: any): void;
}
```

### 2. `StandardTabbedDashboard` Base Class

The base class that all dashboard components should extend:

```typescript
// src/app/shared/base/standard-tabbed-dashboard.ts
import { MatTabChangeEvent } from '@angular/material/tabs';

export class StandardTabbedDashboard {
  /**
   * Current active tab index
   */
  currentTabIndex = 0;
  
  /**
   * Set of tabs that have been visited
   * Used for lazy loading data
   */
  visitedTabs = new Set<number>();
  
  /**
   * Data passed from resolver for initial tab
   */
  workItemList: any[] = [];
  
  /**
   * Reference data passed from resolver
   */
  refData: any = {};
  
  /**
   * Search input configuration
   */
  searchInput = {
    value: '',
    placeholder: 'Search...'
  };
  
  /**
   * Handle tab change events
   * @param event The tab change event
   */
  onTabChanged(event: MatTabChangeEvent): void {
    const newTabIndex = event.index;
    this.currentTabIndex = newTabIndex;
    
    // Call the hook that can be overridden by child classes
    this.onTabChangedHook(newTabIndex);
  }
  
  /**
   * Hook for child classes to override tab change behavior
   * @param newTabIndex The new tab index
   */
  protected onTabChangedHook(newTabIndex: number): void {
    // Default implementation does nothing
    // Child classes should override this
  }
  
  /**
   * Determine if a tab's data should be loaded
   * Used for lazy loading optimizations
   * @param tabIndex The tab index to check
   */
  protected shouldLoadTab(tabIndex: number): boolean {
    return !this.visitedTabs.has(tabIndex);
  }
  
  /**
   * Get initial data for a specific tab
   * Only provides data for the initial tab (index 0)
   * @param tabIndex The tab index
   */
  getInitialDataForTab(tabIndex: number): any[] {
    if (tabIndex === 0 && this.workItemList?.length > 0) {
      return this.workItemList;
    }
    return [];
  }
}
```

## Parent Dashboard Component Implementation

### Required Methods in Parent Component

Here's what you need to implement in your parent dashboard component:

```typescript
// Example: src/app/dashboards/my-dashboard/my-dashboard.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTabGroup } from '@angular/material/tabs';
import { StandardTabbedDashboard } from '../../shared/base/standard-tabbed-dashboard';
import { TabComponentInterface } from '../../shared/interfaces/tab-component.interface';
import { MyDataService } from '../../services/my-data.service';
import { FirstTabComponent } from './tabs/first-tab/first-tab.component';
import { SecondTabComponent } from './tabs/second-tab/second-tab.component';

@Component({
  selector: 'app-my-dashboard',
  templateUrl: './my-dashboard.component.html',
  styleUrls: ['./my-dashboard.component.scss']
})
export class MyDashboardComponent extends StandardTabbedDashboard implements OnInit {
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;
  @ViewChild('firstTab') firstTabComponent!: FirstTabComponent;
  @ViewChild('secondTab') secondTabComponent!: SecondTabComponent;
  
  constructor(
    private route: ActivatedRoute,
    private dataService: MyDataService
  ) {
    super();
  }
  
  ngOnInit(): void {
    this.handleRouteData();
    this.setupSearch();
  }
  
  /**
   * Extract data from route resolver
   * This should be called in ngOnInit
   */
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
  
  /**
   * Configure search based on active tab
   * This should be called in ngOnInit
   */
  private setupSearch(): void {
    // Set initial placeholder based on first tab
    this.searchInput.placeholder = 'Search first tab...';
    
    // You can customize this per tab if needed
    if (this.currentTabIndex === 1) {
      this.searchInput.placeholder = 'Search second tab...';
    }
  }
  
  /**
   * IMPORTANT: Override the tab change hook
   * This is where you handle tab switching and data loading
   */
  protected override onTabChangedHook(newTabIndex: number): void {
    // Update search placeholder based on tab
    if (newTabIndex === 0) {
      this.searchInput.placeholder = 'Search first tab...';
    } else if (newTabIndex === 1) {
      this.searchInput.placeholder = 'Search second tab...';
    }
    
    // Load data for the newly active tab if not already loaded
    this.loadTabData(newTabIndex);
  }
  
  /**
   * Load data for a specific tab
   * This is called when a tab is activated
   */
  private loadTabData(tabIndex: number): void {
    const tabComponent = this.getTabComponent(tabIndex);
    if (!tabComponent) return;
    
    // If this is the first load and we have resolver data, use it
    if (tabIndex === 0 && this.workItemList?.length > 0 && !this.visitedTabs.has(tabIndex)) {
      tabComponent.loadInitialData(this.workItemList, this.refData);
    } else if (!this.visitedTabs.has(tabIndex)) {
      // Load data for tabs that haven't been visited
      tabComponent.triggerDataLoad();
    }
    
    // Mark tab as visited
    this.visitedTabs.add(tabIndex);
  }
  
  /**
   * Get the component instance for a tab
   * This is used to interact with tab components
   */
  private getTabComponent(tabIndex: number): TabComponentInterface | null {
    switch (tabIndex) {
      case 0: return this.firstTabComponent;
      case 1: return this.secondTabComponent;
      default: return null;
    }
  }
  
  /**
   * Handle search button click or enter key
   * This forwards the search to the active tab
   */
  onSearch(): void {
    const activeTabComponent = this.getTabComponent(this.currentTabIndex);
    if (activeTabComponent) {
      activeTabComponent.handleSearch(this.searchInput.value);
    }
  }
}
```

## Tab Component Implementation

### Required Methods in Tab Components

Here's what you need to implement in each tab component:

```typescript
// Example: src/app/dashboards/my-dashboard/tabs/first-tab/first-tab.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { TabComponentInterface } from '../../../../shared/interfaces/tab-component.interface';
import { MyDataService } from '../../../../services/my-data.service';

@Component({
  selector: 'app-first-tab',
  templateUrl: './first-tab.component.html',
  styleUrls: ['./first-tab.component.scss']
})
export class FirstTabComponent implements TabComponentInterface, OnInit {
  @Input() initialData: any[] = [];
  @Input() refData: any = {};
  
  items: any[] = [];
  loading = false;
  error: string | null = null;
  
  constructor(private dataService: MyDataService) {}
  
  ngOnInit(): void {
    // IMPORTANT: Do NOT auto-load data here
    // Wait for parent to trigger loading via loadInitialData or triggerDataLoad
  }
  
  /**
   * REQUIRED BY INTERFACE: Load data provided by resolver
   * This is called by parent when tab is first displayed and resolver data exists
   */
  loadInitialData(data: any[], refData?: any): void {
    this.initialData = data;
    if (refData) {
      this.refData = refData;
    }
    
    // Process data as needed for this specific tab
    this.items = [...data];
    this.loading = false;
  }
  
  /**
   * REQUIRED BY INTERFACE: Trigger data loading from backend
   * This is called by parent when tab is activated and needs fresh data
   */
  triggerDataLoad(): void {
    this.loading = true;
    this.error = null;
    
    // Fetch data specific to this tab
    this.dataService.getFirstTabData().subscribe({
      next: (data) => {
        this.items = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load data', err);
        this.error = 'Failed to load data. Please try again.';
        this.loading = false;
      }
    });
  }
  
  /**
   * REQUIRED BY INTERFACE: Handle search from parent
   * This is called when user performs search from parent component
   */
  handleSearch(searchTerm: string, context?: any): void {
    if (!searchTerm?.trim()) {
      // If search is cleared, reload original data
      this.triggerDataLoad();
      return;
    }
    
    this.loading = true;
    this.dataService.searchFirstTabData(searchTerm).subscribe({
      next: (results) => {
        this.items = results;
        this.loading = false;
      },
      error: (err) => {
        console.error('Search failed', err);
        this.error = 'Search failed. Please try again.';
        this.loading = false;
      }
    });
  }
  
  /**
   * Tab-specific methods below
   * These are not required by the interface but are specific to this tab
   */
  
  onItemAction(item: any, action: string): void {
    // Handle item-specific actions
    switch (action) {
      case 'view':
        this.viewItem(item);
        break;
      case 'edit':
        this.editItem(item);
        break;
      // Add more actions as needed
    }
  }
  
  private viewItem(item: any): void {
    // Implementation specific to this tab
    ////console.log('Viewing item', item);
  }
  
  private editItem(item: any): void {
    // Implementation specific to this tab
    ////console.log('Editing item', item);
  }
}
```

## Template Implementation

### Parent Dashboard Template

```html
<!-- src/app/dashboards/my-dashboard/my-dashboard.component.html -->
<div class="dashboard-container">
  <!-- Header Section with Search -->
  <div class="dashboard-header">
    <h2>My Dashboard</h2>
    
    <div class="search-container">
      <mat-form-field appearance="outline">
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
  
  <!-- Tab Group -->
  <mat-tab-group #tabGroup 
                 [(selectedIndex)]="currentTabIndex" 
                 (selectedTabChange)="onTabChanged($event)" 
                 animationDuration="200ms">
    
    <!-- First Tab -->
    <mat-tab label="First Tab">
      <app-first-tab #firstTab
                    [initialData]="getInitialDataForTab(0)"
                    [refData]="refData">
      </app-first-tab>
    </mat-tab>
    
    <!-- Second Tab -->
    <mat-tab label="Second Tab">
      <app-second-tab #secondTab
                     [initialData]="getInitialDataForTab(1)"
                     [refData]="refData">
      </app-second-tab>
    </mat-tab>
  </mat-tab-group>
</div>
```

### Tab Component Template

```html
<!-- src/app/dashboards/my-dashboard/tabs/first-tab/first-tab.component.html -->
<div class="tab-container">
  <!-- Loading State -->
  <div *ngIf="loading" class="loading-container">
    <mat-spinner diameter="40"></mat-spinner>
    <p>Loading data...</p>
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
      <p>No items found</p>
    </div>
    
    <!-- Items List -->
    <div *ngIf="items.length > 0" class="items-list">
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
        </mat-card-actions>
      </mat-card>
    </div>
  </div>
</div>
```

## Resolver Implementation

```typescript
// src/app/resolvers/my-dashboard.resolver.ts
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MyDataService } from '../services/my-data.service';

@Injectable({
  providedIn: 'root'
})
export class MyDashboardResolver implements Resolve<any> {
  constructor(private dataService: MyDataService) {}
  
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    // ForkJoin combines multiple observables into one
    return forkJoin({
      // Load data for the first tab (initial active tab)
      data: this.dataService.getFirstTabData().pipe(
        catchError(error => {
          console.error('Error in resolver', error);
          return of([]);  // Return empty array on error
        })
      ),
      
      // Load reference data needed by all tabs
      ref_data: this.dataService.getReferenceData().pipe(
        catchError(error => {
          console.error('Error loading reference data', error);
          return of({});  // Return empty object on error
        })
      )
    });
  }
}
```

## Method-by-Method Breakdown

### Parent Dashboard Component

| Method | Purpose | Implementation Details |
|--------|---------|------------------------|
| `constructor` | Initialize the component | - Inject required services<br>- Call super() to initialize base class |
| `ngOnInit` | Setup initial state | - Call handleRouteData()<br>- Call setupSearch()<br>- DO NOT directly access tab components here |
| `handleRouteData` | Extract resolver data | - Get data from this.route.snapshot.data['data']<br>- Get refData from this.route.snapshot.data['ref_data']<br>- Store in workItemList and refData properties |
| `setupSearch` | Configure search input | - Set searchInput.placeholder based on active tab<br>- Can be customized for each tab |
| `onTabChangedHook` | Handle tab changes | - Update search placeholder for new tab<br>- Call loadTabData(newTabIndex) to load data if needed |
| `loadTabData` | Load data for a tab | - Get tab component using getTabComponent()<br>- If first tab and resolver data exists, call loadInitialData()<br>- Otherwise call triggerDataLoad() if tab not visited<br>- Mark tab as visited |
| `getTabComponent` | Access tab components | - Return the appropriate component based on tab index<br>- Use ViewChild references (declared at top) |
| `onSearch` | Handle search | - Get active tab component<br>- Call handleSearch() on that component |

### Tab Component

| Method | Purpose | Implementation Details |
|--------|---------|------------------------|
| `ngOnInit` | Initialize component | - DO NOT load data here<br>- Only set up component state if needed |
| `loadInitialData` | Load resolver data | - Store provided data and refData<br>- Process data as needed for this tab<br>- Set loading = false |
| `triggerDataLoad` | Fetch fresh data | - Set loading = true and error = null<br>- Call service to get data<br>- Handle success: store data, set loading = false<br>- Handle error: set error message, set loading = false |
| `handleSearch` | Process search | - If search is empty, reload original data<br>- Otherwise, call service with search term<br>- Handle results same as triggerDataLoad |
| Tab-specific methods | Handle tab logic | - Implement any methods needed for tab functionality<br>- Examples: viewing items, editing, deleting, etc. |

## Step-by-Step Implementation Process

1. **Create the base interface and class**
   - Implement TabComponentInterface
   - Implement StandardTabbedDashboard

2. **Create the parent dashboard component**
   - Generate component: `ng generate component dashboards/my-dashboard`
   - Extend StandardTabbedDashboard
   - Implement required methods

3. **Create tab components**
   - Generate components: `ng generate component dashboards/my-dashboard/tabs/first-tab`
   - Implement TabComponentInterface
   - Add required methods

4. **Create the resolver (optional)**
   - Generate resolver: `ng generate resolver resolvers/my-dashboard`
   - Implement resolve method to fetch initial data

5. **Configure routing**
   - Add route with resolver in app-routing.module.ts
   - Connect resolver to component

6. **Update module declarations**
   - Add all components to declarations array
   - Import required Angular Material modules

## Key Points to Remember

1. **Never load data automatically in tab components**
   - Wait for parent to call either loadInitialData or triggerDataLoad

2. **Use ViewChild with static: false for tab components**
   - This ensures they're available after view initialization

3. **Only pass resolver data to the initial tab**
   - Use getInitialDataForTab(index) in template

4. **Track visited tabs to enable lazy loading**
   - Use visitedTabs Set in StandardTabbedDashboard
   - Only load data when a tab is first visited

5. **Forward search requests to the active tab**
   - Parent component handles search UI
   - Active tab component processes the search

6. **Handle loading and error states in each tab**
   - Show loading indicators
   - Display meaningful error messages
   - Provide retry functionality

## Example Implementation Walkthrough

Here's the exact sequence for implementing a new dashboard:

1. **Create the parent dashboard component**
   ```bash
   ng generate component features/product-dashboard
   ```

2. **Extend the base class and implement methods**
   ```typescript
   export class ProductDashboardComponent extends StandardTabbedDashboard implements OnInit {
     @ViewChild('availableProductsTab') availableTab!: AvailableProductsTabComponent;
     @ViewChild('outOfStockTab') outOfStockTab!: OutOfStockProductsTabComponent;

     constructor(private route: ActivatedRoute, private productService: ProductService) {
       super();
     }

     ngOnInit(): void {
       this.handleRouteData();
       this.setupSearch();
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
       this.searchInput.placeholder = 'Search products...';
     }

     protected override onTabChangedHook(newTabIndex: number): void {
       if (newTabIndex === 0) {
         this.searchInput.placeholder = 'Search available products...';
       } else {
         this.searchInput.placeholder = 'Search out of stock products...';
       }
       
       this.loadTabData(newTabIndex);
     }

     private loadTabData(tabIndex: number): void {
       const tabComponent = this.getTabComponent(tabIndex);
       if (!tabComponent) return;
       
       if (tabIndex === 0 && this.workItemList?.length > 0 && !this.visitedTabs.has(tabIndex)) {
         tabComponent.loadInitialData(this.workItemList, this.refData);
       } else if (!this.visitedTabs.has(tabIndex)) {
         tabComponent.triggerDataLoad();
       }
       
       this.visitedTabs.add(tabIndex);
     }

     private getTabComponent(tabIndex: number): TabComponentInterface | null {
       return tabIndex === 0 ? this.availableTab : this.outOfStockTab;
     }

     onSearch(): void {
       const activeTabComponent = this.getTabComponent(this.currentTabIndex);
       if (activeTabComponent) {
         activeTabComponent.handleSearch(this.searchInput.value);
       }
     }
   }
   ```

3. **Create tab components**
   ```bash
   ng generate component features/product-dashboard/tabs/available-products-tab
   ng generate component features/product-dashboard/tabs/out-of-stock-products-tab
   ```

4. **Implement the tab components**
   ```typescript
   export class AvailableProductsTabComponent implements TabComponentInterface, OnInit {
     @Input() initialData: any[] = [];
     @Input() refData: any = {};
     
     products: any[] = [];
     loading = false;
     error: string | null = null;
     
     constructor(private productService: ProductService) {}
     
     ngOnInit(): void {
       // Wait for parent to trigger loading
     }
     
     loadInitialData(data: any[], refData?: any): void {
       this.initialData = data;
       this.refData = refData || {};
       this.products = data.filter(p => p.inStock);
       this.loading = false;
     }
     
     triggerDataLoad(): void {
       this.loading = true;
       this.error = null;
       
       this.productService.getAvailableProducts().subscribe({
         next: (data) => {
           this.products = data;
           this.loading = false;
         },
         error: (err) => {
           this.error = 'Failed to load products';
           this.loading = false;
         }
       });
     }
     
     handleSearch(searchTerm: string): void {
       if (!searchTerm?.trim()) {
         this.triggerDataLoad();
         return;
       }
       
       this.loading = true;
       this.productService.searchAvailableProducts(searchTerm).subscribe({
         next: (results) => {
           this.products = results;
           this.loading = false;
         },
         error: (err) => {
           this.error = 'Search failed';
           this.loading = false;
         }
       });
     }
     
     // Additional methods specific to this tab
     viewProductDetails(product: any): void {
       // Implementation
     }
   }
   ```

5. **Set up the parent template**
   ```html
   <div class="dashboard-container">
     <div class="dashboard-header">
       <h2>Product Dashboard</h2>
       
       <div class="search-container">
         <mat-form-field appearance="outline">
           <mat-label>{{ searchInput.placeholder }}</mat-label>
           <input matInput [(ngModel)]="searchInput.value" (keyup.enter)="onSearch()">
           <button mat-icon-button matSuffix (click)="onSearch()">
             <mat-icon>search</mat-icon>
           </button>
         </mat-form-field>
       </div>
     </div>
     
     <mat-tab-group #tabGroup [(selectedIndex)]="currentTabIndex" (selectedTabChange)="onTabChanged($event)">
       <mat-tab label="Available Products">
         <app-available-products-tab #availableProductsTab
                                     [initialData]="getInitialDataForTab(0)"
                                     [refData]="refData">
         </app-available-products-tab>
       </mat-tab>
       
       <mat-tab label="Out of Stock">
         <app-out-of-stock-products-tab #outOfStockTab
                                         [initialData]="getInitialDataForTab(1)"
                                         [refData]="refData">
         </app-out-of-stock-products-tab>
       </mat-tab>
     </mat-tab-group>
   </div>
   ```

6. **Create a resolver**
   ```typescript
   @Injectable({
     providedIn: 'root'
   })
   export class ProductDashboardResolver implements Resolve<any> {
     constructor(private productService: ProductService) {}
     
     resolve(): Observable<any> {
       return forkJoin({
         data: this.productService.getAvailableProducts(),
         ref_data: this.productService.getProductCategories()
       });
     }
   }
   ```

7. **Configure routing**
   ```typescript
   const routes: Routes = [
     {
       path: 'products',
       component: ProductDashboardComponent,
       resolve: {
         data: ProductDashboardResolver
       }
     }
   ];
   ```

This method-specific implementation guide should provide clear direction on exactly what code to write in each required method for the tabbed dashboard pattern.
