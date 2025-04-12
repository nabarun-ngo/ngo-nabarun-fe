import { AlertType } from "../../core/component/notification-modal/notification-modal.component";

export interface AlertData {
    alertType: AlertType;
    message: string;
    destroyAfter?:number;
}

