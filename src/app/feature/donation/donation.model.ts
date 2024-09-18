import { FormGroup } from "@angular/forms";
import { Subject } from "rxjs";
import { DocumentDetail, DocumentDetailUpload, DonationDetail, DonationSummary, UserDetail } from "src/app/core/api/models";
import { FileUpload } from "src/app/shared/components/generic/file-upload/file-upload.component";


export interface DonationList {
    donation?: DonationDetail;
    documents?: DocumentDetail[];
    action: 'view' | 'edit' | 'create';
    update?: {valid:boolean;donation:DonationDetail};
    upload?:FileUpload[];
    eventSubject:Subject<any>
}

export interface MemberList {
    showcreateDonation?: boolean;
    total?: number;
    index?: number;
    size?: number;
    member?: UserDetail;
    donations?: DonationList[];
    donationSummary?: DonationSummary;
    searchValue?:string;
    advancedSearch?:boolean
}

