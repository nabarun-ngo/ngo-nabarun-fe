import { FormGroup } from "@angular/forms";
import { Subject } from "rxjs";
import { DocumentDetail, DocumentDetailUpload, DonationDetail, DonationSummary, HistoryDetail, UserDetail } from "src/app/core/api-client/models";
import { FileUpload } from "src/app/shared/components/generic/file-upload/file-upload.component";


export interface DonationList {
    donation?: DonationDetail;
    documents?: DocumentDetail[];
    action: 'view' | 'edit' | 'create';
    update?: { valid: boolean; donation: DonationDetail };
    upload?: FileUpload[];
    eventSubject: Subject<any>
    histories?: HistoryDetail[];
    selected?: boolean;
}

export interface MemberList {
    showcreateDonation?: boolean;
    total?: number;
    index?: number;
    size?: number;
    member?: UserDetail;
    donations?: DonationList[];
    donationSummary?: DonationSummary;
    searchValue?: string;
    advancedSearch?: boolean
}

