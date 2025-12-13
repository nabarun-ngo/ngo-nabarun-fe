import { Platform } from '@angular/cdk/platform';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NoticeDetail } from 'src/app/core/api-client/models';
import { conditionalValidator } from 'src/app/core/service/form.service';
import { date } from 'src/app/core/service/utilities.service';

@Component({
  selector: 'app-notice-card',
  templateUrl: './notice-card.component.html',
  styleUrls: ['./notice-card.component.scss']
})
export class NoticeCardComponent implements OnInit {

  constructor(protected platform: Platform) { }


  @Input() notice: NoticeDetail | undefined;
  @Input() isEdit: boolean = false;
  @Output() onSubmit: EventEmitter<{ id?: string, formValue?: any, cancel?: boolean }> = new EventEmitter();
  noticeForm!: FormGroup;



  ngOnInit(): void {
    this.noticeForm = new FormGroup({
      title: new FormControl(this.notice ? this.notice.title : '', [Validators.required]),
      description: new FormControl(this.notice ? this.notice.description : '', [Validators.required]),
      noticeDate: new FormControl(new Date()),
      //creatorRoleCode: new FormControl(''),
      hasMeeting: new FormControl(this.notice ? (this.notice.hasMeeting ? 'YES' : 'NO') : 'NO', [Validators.required]),
      meetingSummary: new FormControl(this.notice?.meeting ? this.notice.meeting?.meetingSummary : '', [conditionalValidator(() =>
        (this.noticeForm.get('hasMeeting')?.value === 'YES'),
        Validators.required
      )]),
      meetingAgenda: new FormControl('', [conditionalValidator(() =>
        (this.noticeForm.get('hasMeeting')?.value === 'YES'),
        Validators.required
      )]),
      meetingType: new FormControl(this.notice?.meeting ? this.notice.meeting?.meetingType : 'ONLINE_VIDEO', [conditionalValidator(() =>
        (this.noticeForm.get('hasMeeting')?.value === 'YES'),
        Validators.required
      )]),
      meetingLocation: new FormControl(this.notice?.meeting ? this.notice.meeting?.meetingLocation : '', [conditionalValidator(() =>
        (this.noticeForm.get('hasMeeting')?.value === 'YES'),
        Validators.required
      )]),
      meetingDate: new FormControl('', [conditionalValidator(() =>
        (this.noticeForm.get('hasMeeting')?.value === 'YES'),
        Validators.required
      )]),
      meetingStartTime: new FormControl('', [conditionalValidator(() =>
        (this.noticeForm.get('hasMeeting')?.value === 'YES'),
        Validators.required
      )]),
      meetingEndTime: new FormControl('', [conditionalValidator(() =>
        (this.noticeForm.get('hasMeeting')?.value === 'YES'),
        Validators.required
      )])
    });
  }


  submitForm(notice: NoticeDetail) {
    if (this.noticeForm.valid) {
      //console.log(this.noticeForm.value)
      this.onSubmit.emit({ id: notice?.id!, formValue: this.noticeForm.value, cancel: false })
    } else {
      this.noticeForm.markAllAsTouched()
    }
  }

  getWhatsAppMessage(notice: NoticeDetail) {
    let meetingD = `\n*Meeting Details*\n*Summary* : ${notice.meeting?.meetingSummary}\n*Agenda* : ${notice.meeting?.meetingDescription}\n*Date* : ${date(notice.meeting?.meetingDate)}\n*Time* : ${notice.meeting?.meetingStartTime} - ${notice.meeting?.meetingEndTime}\n*Venue* : ${notice.meeting?.meetingLocation}\n*Meeting Link* : ${notice.meeting?.extVideoConferenceLink}\n`;
    let text = `*NOTICE*\n\n${notice.title}\n\n*Notice No* : ${notice.id}\n*Dated* : ${date(notice.noticeDate)}\n\n${notice.description}\n\n${notice.hasMeeting ? meetingD : ''}\n\n*${notice.creator?.fullName}*\n${notice.creatorRoleCode}\n`
    return 'whatsapp://send?text=' + encodeURIComponent(text)
  }

  cancelForm() {
    this.isEdit = false
    this.onSubmit.emit({ cancel: true })
  }
}
