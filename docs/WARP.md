# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is the frontend codebase for the Nabarun NGO platform, built with:
- **Angular 16** (TypeScript)
- **Ionic 8** (mobile-first UI framework)
- **Capacitor 6** (native mobile app wrapper)
- **Firebase** (authentication & messaging)
- **Auth0** (additional authentication)
- **Tailwind CSS** (utility-first styling)
- **Angular Material** (UI components)

## Development Commands

### Core Development
```bash
npm start                    # Start dev server on port 4201 (default)
npm run start:stage         # Start with staging config on port 5201
npm run build               # Build for production + sync Capacitor
npm run build:stage        # Build for staging + sync Capacitor
npm run watch               # Watch build for development
```

### API Integration
```bash
npm run sync:api            # Generate API client from OpenAPI spec at localhost:8082
```

### Testing
```bash
npm test                    # Run Playwright tests with @sanity tag only
npm run report:show         # Open Allure test report on port 4205
npm run report:bat          # Generate Allure report via batch file
```

### Mobile Development (Capacitor)
```bash
npm run build && npx cap sync        # Build and sync to mobile platforms
npx cap open android                 # Open Android project in Android Studio
npx cap run android                  # Run on Android device/emulator
```

## Architecture & Code Organization

### High-Level Structure
The application follows Angular's feature-based architecture with clear separation:

```
src/app/
├── core/           # Singleton services, guards, interceptors, layout components
├── shared/         # Reusable components, pipes, utilities
├── feature/        # Feature modules (lazy-loaded)
└── app.module.ts   # Root module with Firebase, PWA, Ionic integration
```

### Core Directory Structure
- **api/**: Auto-generated OpenAPI client (regenerated via `npm run sync:api`)
- **guards/**: Route protection (`AuthGuardService`, `NoAuthGuardService`, `UserGuardService`)
- **intercepter/**: HTTP interceptors
- **layout/**: `CommonLayoutComponent` (public) and `SecuredLayoutComponent` (authenticated)
- **service/**: Core business logic services
- **model/**: TypeScript interfaces and data models

### Feature Modules (Lazy-Loaded)
- **main**: Welcome/landing pages (public access)
- **dashboard**: Main dashboard (authenticated users)
- **donation**: Donation management
- **member**: Member management
- **request**: Request handling
- **account**: Account/expense management  
- **notice**: Notice board
- **admin**: Admin functionality
- **social-event**: Event management

### Route Architecture
Two main layouts with different access patterns:
- `CommonLayoutComponent`: Public routes with `NoAuthGuardService`
- `SecuredLayoutComponent`: Protected routes with `AuthGuardService` + `UserGuardService`

## Key Integrations

### Authentication
Dual authentication setup:
- **Auth0** (`@auth0/auth0-angular`) for primary authentication
- **Firebase Authentication** for additional services
- Route guards enforce authentication state

### Mobile Features
- **PWA** capabilities with service worker
- **Firebase messaging** for push notifications
- **Capacitor plugins**: App, Browser, Haptics, Keyboard, Status Bar
- **Ionic components** for mobile-optimized UI

### API Communication
- Auto-generated API client from OpenAPI specification
- Base URL configurable per environment (`environment.ts`, `environment.stage.ts`, `environment.prod.ts`)
- HTTP interceptors in `core/intercepter/`

## Testing Strategy

### E2E Testing (Playwright)
- Tests located in `tests/` directory
- Configuration in `playwright.config.ts`
- Allure reporting integration
- Chrome-specific setup for Windows development
- Sanity tests run by default (`@sanity` tag)
- Environment-based test execution with `.env` file

### Test Execution Patterns
- Tests run in parallel by default
- Retry logic on CI environments
- Screenshots and video capture on failures
- Trace collection enabled for debugging

## Build Configurations

### Angular Build Targets
- **Development**: Unoptimized, no vendor chunk splitting
- **Staging**: Optimized build with staging environment
- **Production**: Full optimization, output hashing, budget limits

### Bundle Size Limits
- Initial bundle: 500KB warning, 1.5MB error
- Component styles: 2KB warning, 6KB error

## Development Notes

### Environment Management
Three environment configurations with file replacement:
- `environment.ts` (development)
- `environment.stage.ts` (staging) 
- `environment.prod.ts` (production)

### Styling Approach
- **Tailwind CSS** for utility classes with custom plugin for `capitalize-first`
- **Angular Material** with Deep Purple-Amber theme
- **SCSS** as the style preprocessor
- **Ionic CSS variables** for mobile theming

### Code Generation
- Angular CLI schematics configured for SCSS by default
- OpenAPI generator creates typed API clients
- Component prefix: `app`

### Mobile Development Workflow
1. Develop in browser with `npm start`
2. Build with `npm run build` 
3. Sync native code with `npx cap sync`
4. Test in native environment with `npx cap open android`

## Coding Patterns and Conventions

### Component Architecture

#### Component Structure Pattern
```typescript
@Component({
  selector: 'app-feature-name', // Always prefixed with 'app-'
  templateUrl: './component-name.component.html',
  styleUrls: ['./component-name.component.scss']
})
export class ComponentNameComponent implements OnInit {
  // Input/Output properties first
  @Input({ required: true }) requiredInput!: Type;
  @Input({ required: false, alias: 'alias' }) optionalInput?: Type;
  @Output() eventEmitter: EventEmitter<Type> = new EventEmitter();
  
  // Protected/private properties
  protected formGroup!: FormGroup;
  
  // Constructor with dependency injection
  constructor(
    private serviceA: ServiceA,
    private serviceB: ServiceB
  ) {}
  
  ngOnInit(): void {
    // Initialization logic
  }
}
```

#### Modal/Dialog Patterns
- **Base Modal**: Generic `BaseModalComponent<T>` for dynamic component injection
- **Template Modal**: `ModalComponent` using Angular templates with context
- **Notification Modal**: Standardized `NotificationModalComponent` for alerts/confirmations

### Service Layer Patterns

#### Service Structure
```typescript
@Injectable({
  providedIn: 'root' // Singleton services
})
export class FeatureService {
  constructor(
    private apiController: ApiControllerService,
    private commonController: CommonControllerService
  ) {}
  
  // API methods always return Observable and map responsePayload
  fetchData(params?: FilterType) {
    return this.apiController.getData(params)
      .pipe(map(response => response.responsePayload));
  }
}
```

#### API Communication Pattern
- **Auto-generated API clients** from OpenAPI specifications
- **Response wrapper**: All API responses wrapped in `SuccessResponse<T>` with `responsePayload`
- **Error handling**: Global HTTP interceptor handles errors with correlation IDs
- **Caching**: Shared observables with `shareReplay(1)` for reference data

### Routing and Module Patterns

#### Route Configuration Pattern
```typescript
// Centralized route constants in app-routing.const.ts
export const AppRoute = {
  feature_page: {
    id: 'unique_id',
    url: '/full/path',      // Complete URL path
    parent: 'parent',     // Parent route segment
    feature: 'feature',   // Feature module name
    path: 'child/path'    // Child path within feature
  }
};

// Feature routing module
const routes: Routes = [
  {
    path: route_data.feature_page.path,
    component: FeatureComponent,
    resolve: {
      data: dataResolver,
      ref_data: referenceDataResolver
    }
  }
];
```

#### Lazy Loading Pattern
- All feature modules are lazy-loaded
- Route-level resolvers for data pre-loading
- Guards applied at parent route level with `runGuardsAndResolvers: 'always'`

### Authentication & Security Patterns

#### Guard Chain Pattern
```typescript
// Multiple guards in sequence
canActivate: [
  AuthGuardService,    // Check if user is authenticated
  UserGuardService     // Check if profile is complete
]
```

#### Permission-based Authorization
```typescript
// Scope-based permissions from JWT token
isAccrediatedTo(access: string): boolean {
  return this.grantedScopes.includes(access);
}

isAccrediatedToAny(...access: string[]): boolean {
  return access.some(scope => this.isAccrediatedTo(scope));
}
```

#### HTTP Interceptor Pattern
- **Correlation IDs**: Every API request gets unique correlation ID
- **Error Display**: Automatic error modal display with context
- **Success Messages**: Automatic info modal for success responses
- **Header Control**: `hideError` header to suppress error display

### State Management Patterns

#### Observable Data Flow
```typescript
// Service-based state with RxJS
private dataSubject = new Subject<DataType>();
public data$ = this.dataSubject.asObservable();

// Component subscription pattern
ngOnInit(): void {
  this.service.data$.subscribe(data => {
    // Handle data updates
  });
}
```

#### Form Management Pattern
```typescript
// Reactive forms with validation
this.memberForm = new FormGroup({
  field: new FormControl(initialValue, [Validators.required])
});

// Form state monitoring
this.memberForm.valueChanges.subscribe(() => {
  this.outputEvent.emit({ 
    valid: this.memberForm.valid, 
    data: this.memberForm.value 
  });
});
```

### Data Modeling Patterns

#### Auto-generated Models
- **OpenAPI Generated**: All models auto-generated from backend OpenAPI spec
- **Type Safety**: Strict TypeScript interfaces for all data structures
- **Response Wrappers**: Consistent `SuccessResponse<T>` pattern

#### Custom Model Extensions
```typescript
// Local model extensions for computed properties
export interface UserDetailExtended extends UserDetail {
  fullName?: string;
  roleString?: string;
}
```

### Utility and Pipe Patterns

#### Search Pipe Pattern
```typescript
@Pipe({ name: 'featureSearch' })
export class FeatureSearchPipe implements PipeTransform {
  transform(items: ItemType[], searchValue: string): ItemType[] {
    if (!items || !searchValue) return items || [];
    
    const searchTerm = searchValue.toLowerCase();
    return items.filter(item => 
      // Multiple field search logic
      item.field1?.toLowerCase().includes(searchTerm) ||
      item.field2?.toLowerCase().includes(searchTerm)
    );
  }
}
```

#### Shared Utilities
- **Utility Services**: `isEmpty()`, `isEmptyObject()` for data validation
- **Date Utilities**: Custom `DateDiffPipe` for relative time display
- **Dynamic Injection**: `DynamicInjectPipe` for runtime pipe injection

### Styling Patterns

#### CSS Class Conventions
- **Tailwind CSS**: Utility-first approach with custom plugins
- **Angular Material**: Consistent theme application
- **Ionic Variables**: Mobile-optimized styling variables
- **Component SCSS**: Scoped styles in component files

#### Responsive Design Pattern
```html
<!-- Tailwind responsive classes -->
<div class="flex justify-center items-center text-center text-xl font-semibold">
  <!-- Content -->
</div>
```

### Error Handling Patterns

#### Global Error Handling
- **HTTP Interceptor**: Catches and displays all HTTP errors
- **Correlation IDs**: Unique request tracking for debugging
- **User-friendly Messages**: Contextual error messages with fallbacks
- **Permission Errors**: Specific handling for 403 Forbidden responses

### Development Workflow Patterns

#### Code Generation
- **API Client**: `npm run sync:api` regenerates from OpenAPI spec
- **Angular Schematics**: Configured for SCSS by default
- **Component Prefix**: All components use 'app' prefix

#### Testing Patterns
- **E2E Testing**: Playwright with Allure reporting
- **Sanity Tests**: Tagged with `@sanity` for critical path testing
- **Environment-based**: Different test configurations per environment

These patterns ensure consistency, maintainability, and scalability across the entire codebase while leveraging Angular, Ionic, and the broader ecosystem effectively.
