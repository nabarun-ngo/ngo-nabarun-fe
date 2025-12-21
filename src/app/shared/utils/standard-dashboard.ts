import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Paginator } from './paginator';
import { PageEvent } from '@angular/material/paginator';
import { PagedResult } from '../model/paged-result.model';
import { KeyValue } from '../model/key-value.model';


/**
 * Standardized base class for all dashboard components.
 * Provides consistent patterns for:
 * - Resolver data consumption
 * - Search forwarding
 * - Data distribution
 */
@Component({
  template: ''
})
export abstract class StandardDashboard<TData> extends Paginator
  implements AfterViewInit, OnInit {
  /**
   * Initial data from resolver (if available)
   */
  #initialData?: TData;
  get initialData(): TData | undefined {
    return this.#initialData;
  }

  /**
   * Reference data from resolver (if available)
   */
  #refData?: { [key: string]: KeyValue[] };
  get refData(): { [key: string]: KeyValue[] } | undefined {
    return this.#refData;
  }

  constructor(protected route: ActivatedRoute) {
    super();
  }

  protected override get paginationConfig(): { pageNumber: number; pageSize: number; pageSizeOptions: number[]; } {
    return {
      pageNumber: 0,
      pageSize: 100,
      pageSizeOptions: [10, 20, 50, 100]
    }
  }

  override handlePageEvent($event: PageEvent): void { }

  ngAfterViewInit(): void {
    // Allow child components to perform additional initialization
    this.onAfterViewInitHook();
  }

  ngOnInit(): void {
    this.handleRouteData();
    this.onInitHook();
  }


  /**
   * Handle resolver data in a standardized way
   */
  private handleRouteData(): void {
    // Extract data from resolver
    if (this.route.snapshot.data['data']) {
      this.#initialData = this.route.snapshot.data['data'] as TData;
      const pagedData = this.#initialData && this.#initialData as PagedResult<any>
      if (pagedData && pagedData.totalSize !== undefined) {
        this.pageEvent = {
          pageIndex: pagedData.pageIndex || 0,
          pageSize: pagedData.pageSize || 100,
          length: pagedData.totalSize
        };
      }
    }
    if (this.route.snapshot.data['ref_data']) {
      this.#refData = this.route.snapshot.data['ref_data'];
    }
    // Allow child classes to perform additional route data handling
    this.onHandleRouteDataHook();
  }

  // Hooks for child classes to implement

  /**
   * Hook called after view initialization
   * Override in child classes for additional setup
   */
  protected onAfterViewInitHook(): void {
    // Default implementation - no action needed
  }

  /**
   * Hook called during route data handling
   * Override in child classes for additional route data processing
   */
  protected onHandleRouteDataHook(): void {
    // Mark initial tab as visited for lazy loading
    // Default implementation - no action needed
  }

  /**
   * Hook called during component initialization
   * Override in child classes for additional setup
   */
  protected abstract onInitHook(): void;
}
