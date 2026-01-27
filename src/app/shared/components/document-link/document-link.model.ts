import { KeyValue } from "../../model/key-value.model";

export interface DocumentCategory {
    name: string;
    description?: string;
    documents: KeyValue[];
}
