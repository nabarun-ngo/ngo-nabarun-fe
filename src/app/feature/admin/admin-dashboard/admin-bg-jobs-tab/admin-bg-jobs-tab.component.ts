import { Component } from '@angular/core';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';

@Component({
  selector: 'app-admin-bg-jobs-tab',
  templateUrl: './admin-bg-jobs-tab.component.html',
  styleUrls: ['./admin-bg-jobs-tab.component.scss']
})
export class AdminBgJobsTabComponent implements TabComponentInterface<string> {
  onSearch($event: SearchEvent): void {
    throw new Error('Method not implemented.');
  }
  loadData(): void {
    throw new Error('Method not implemented.');
  }

}
