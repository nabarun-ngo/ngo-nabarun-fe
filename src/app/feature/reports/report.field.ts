import { FormGroup } from "@angular/forms";
import { Doc } from "src/app/shared/model/document.model";
import { DetailedView } from "src/app/shared/model/detailed-view.model";

export const reportDocumentSection = (
    docs: Doc[]
): DetailedView => {
    return {
        section_name: 'Documents',
        section_type: 'doc_list',
        section_html_id: 'report_documents',
        section_form: new FormGroup({}),
        documents: docs,
    };
};
