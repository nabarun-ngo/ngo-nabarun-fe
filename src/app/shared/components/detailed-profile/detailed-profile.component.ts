import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { UserDetail } from 'src/app/core/api/models';
import { OperationMode } from 'src/app/feature/donation/donation.const';

@Component({
  selector: 'app-detailed-profile',
  templateUrl: './detailed-profile.component.html',
  styleUrls: ['./detailed-profile.component.scss']
})
export class DetailedProfileComponent implements OnInit {

  @Input({ required: false, alias: 'member' }) profile!: UserDetail;
  @Output() profileChange: EventEmitter<{ valid?: boolean, member?: UserDetail }> = new EventEmitter();
  @Input('triggerEvent') triggerEvent: Observable<any> | undefined;

  @Input({ required: true, alias: 'mode' }) mode!: OperationMode;
  protected memberForm!: FormGroup;

  ngOnInit(): void {
    this.memberForm = new FormGroup({
      fullName: new FormControl(this.profile?.fullName, [Validators.required]),
      email: new FormControl(this.profile?.email, []),
      primaryNumber: new FormControl(this.profile?.primaryNumber, []),
    });
    this.triggerEvent?.subscribe(data => {
      //console.log(data)
      this.memberForm.markAllAsTouched();
    });
    this.memberForm.valueChanges.subscribe(() => {
      let user = this.memberForm.value as UserDetail;
      this.profileChange.emit({ valid: this.memberForm.valid, member: user })
    })
  }
}
