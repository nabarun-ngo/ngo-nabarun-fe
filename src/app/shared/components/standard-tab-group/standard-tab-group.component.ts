import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TabConfig } from '../../model/tab-config.model';

@Component({
    selector: 'app-standard-tab-group',
    templateUrl: './standard-tab-group.component.html',
    styleUrls: ['./standard-tab-group.component.scss']
})
export class StandardTabGroupComponent {

    @Input() tabs: TabConfig[] = [];
    @Input() selectedIndex: number = 0;

    /**
     * Common inputs to pass to all dynamically rendered tab components.
     * Merged with specific tab inputs.
     */
    @Input() commonInputs: Record<string, any> = {};

    @Output() selectedIndexChange = new EventEmitter<number>();
    @Output() tabActivated = new EventEmitter<{ id: string | number, instance: any }>();

    getInputs(tab: TabConfig): Record<string, any> {
        return { ...this.commonInputs, ...tab.inputs };
    }

    onActivate(tabId: string | number, instance: any): void {
        this.tabActivated.emit({ id: tabId, instance });
    }

    onTabChange(index: number): void {
        this.selectedIndexChange.emit(index);
    }
}
