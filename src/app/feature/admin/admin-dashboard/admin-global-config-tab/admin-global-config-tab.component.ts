import { Component, Input } from '@angular/core';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { KeyValue } from 'src/app/shared/model/key-value.model';

@Component({
  selector: 'app-admin-global-config-tab',
  templateUrl: './admin-global-config-tab.component.html',
  styleUrls: ['./admin-global-config-tab.component.scss']
})
export class AdminGlobalConfigTabComponent implements TabComponentInterface<string> {
  @Input() initialData?: string | undefined;
  @Input() refData?: { [key: string]: KeyValue[]; } | undefined;
  onSearch(event: SearchEvent): void {
  }
  loadData(): void {
  }


}
