import { Type } from '@angular/core';
import { TabComponentInterface } from '../interfaces/tab-component.interface';

export interface TabConfig<TTab = string, TData = any> {
    id: TTab;
    label: string;
    component: Type<TabComponentInterface<TData>>;
    inputs?: Record<string, any>;
    disabled?: boolean;
}
