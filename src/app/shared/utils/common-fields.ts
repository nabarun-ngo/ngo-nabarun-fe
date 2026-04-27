import { FormGroup } from "@angular/forms";
import { DetailedView } from "../model/detailed-view.model";
import { Subject } from "rxjs";

export const getCommentSection = (
    id: string | undefined,
    type: string,
    isCreate: boolean = false
): DetailedView => {
    return {
        section_name: 'Comments',
        section_type: 'comment',
        section_html_id: 'comments',
        hide_section: isCreate && !id,
        section_form: new FormGroup({}),
        comments: {
            entityType: type,
            entityId: id!,
            onOpen: new Subject<void>()
        }
    };
}
