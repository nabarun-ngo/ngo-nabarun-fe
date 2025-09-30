import { Component, Input } from '@angular/core';
import { KeyValue } from 'src/app/core/api/models';
import { SearchEvent, TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';

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
