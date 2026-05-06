import { KeyValue } from "../../model/key-value.model";

export interface DocumentCategory {
    id?: string;
    name: string;
    description?: string;
    documents: KeyValue[];
    totalElements?: number;
    isLoading?: boolean;
    isExpanded?: boolean;
}
