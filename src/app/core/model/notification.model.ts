export class AppNotification{
    id!:string;
    title!:string;
    summary!: string;
    read!:boolean;
    sender!:string;
    action!:string;
    type!:'FYA'| 'FYI';
    actionLink!:string;
    senderImage!:string;
    refItemId!:string;
    open!:'Y'|'N';
    date!:Date;

    constructor(notification:{[key:string]:string}){
       this.id= notification['id'];
       this.title=notification ['title'];
       this.summary=notification ['summary'];
       this.read= notification['read'] == 'true';
       this.sender=notification['sender'];
       this.action=notification['action'];
       this.type=notification['action'] as 'FYA'| 'FYI';
       this.actionLink=notification['actionLink'];
       this.refItemId=notification['refItemId'];
       this.date=new Date(notification['date']);

    }

}