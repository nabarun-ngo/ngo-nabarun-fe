import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NoticeDetail } from 'src/app/core/api/models';
import { conditionalValidator } from 'src/app/core/service/form.service';

@Component({
  selector: 'app-notice-card',
  templateUrl: './notice-card.component.html',
  styleUrls: ['./notice-card.component.scss']
})
export class NoticeCardComponent implements OnInit{

  
  @Input({ required: true }) notice!: NoticeDetail;
  @Input() isEdit:boolean=false;
  noticeForm!: FormGroup;

  copyToClipboard(arg0: string | undefined) {
  }

  ngOnInit(): void {
    this.noticeForm= new FormGroup({
      title: new FormControl(this.notice ? this.notice.title : '',[Validators.required]),
      description: new FormControl(this.notice ? this.notice.description : '',[Validators.required]),
      //noticeDate: new FormControl(new Date()),
      //creatorRoleCode: new FormControl(''),
      hasMeeting: new FormControl(this.notice ? (this.notice.hasMeeting ? 'YES':'NO') : 'NO',[Validators.required]),
      meetingSummary:new FormControl(this.notice.meeting ? this.notice.meeting?.meetingSummary : '',[conditionalValidator(() =>
        (this.noticeForm.get('hasMeeting')?.value === 'YES'),
        Validators.required
      )]),
      meetingAgenda:new FormControl('',[conditionalValidator(() =>
        (this.noticeForm.get('hasMeeting')?.value === 'YES'),
        Validators.required
      )]),
      meetingType:new FormControl(this.notice.meeting ? this.notice.meeting?.meetingType : 'ONLINE_VIDEO',[conditionalValidator(() =>
        (this.noticeForm.get('hasMeeting')?.value === 'YES'),
        Validators.required
      )]),
      meetingLocation:new FormControl(this.notice.meeting ? this.notice.meeting?.meetingLocation : '',[conditionalValidator(() =>
        (this.noticeForm.get('hasMeeting')?.value === 'YES'),
        Validators.required
      )]),
      meetingDate:new FormControl(new Date()),
      meetingStartTime:new FormControl('',[conditionalValidator(() =>
        (this.noticeForm.get('hasMeeting')?.value === 'YES'),
        Validators.required
      )]),
      meetingEndTime:new FormControl('',[conditionalValidator(() =>
        (this.noticeForm.get('hasMeeting')?.value === 'YES'),
        Validators.required
      )])
    });
  }


  submitForm() {
    if(this.noticeForm.valid){
      console.log(this.noticeForm.value)
    }else{
      this.noticeForm.markAllAsTouched()
    }
  }
}
