import { KeyValue } from "../../model/key-value.model";

export interface DocumentCategory {
    id?: string;
    name: string;
    description?: string;
    documents: KeyValue[];
    totalElements?: number;
    isLoading?: boolean;
    isExpanded?: boolean;
    actionName?: string;
    actionLink?: string | any[];
    actionQueryParams?: any;
}

export interface KebabMenuItem {
    /** Label shown in the dropdown */
    name: string;
    /** Called when this menu item is clicked */
    onClick: (doc: KeyValue, categoryName: string) => void;
}
