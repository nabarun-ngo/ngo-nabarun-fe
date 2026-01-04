import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { parsePhoneNumber } from 'libphonenumber-js';
import { conditionalValidator, matchFieldsValidator } from 'src/app/core/service/form.service';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { OperationMode, UserConstant } from 'src/app/feature/member/member.const';
import { sanitizeBase64 } from 'src/app/core/service/utilities.service';
import { MemberService } from 'src/app/feature/member/service/member.service';
import { UserDto } from 'src/app/core/api-client/models/user-dto';
import { LinkDto, UserUpdateAdminDto, UserUpdateDto } from 'src/app/core/api-client/models';
import { KeyValue } from '../../model/key-value.model';

@Component({
  selector: 'app-profile-view',
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.scss']
})
export class ProfileViewComponent implements OnInit {


  profile!: UserDto;
  applicableLM!: KeyValue[];
  @Input({ required: true, alias: 'profile' })
  set profileData(data: UserDto) {
    this.profile = data;
    //////console.log(this.profile)
    this.initValues();
  }
  constant = UserConstant

  @Output()
  onUpdate: EventEmitter<{ actionName: 'SELF_UPDATE' | 'ADMIN_UPDATE' | 'CHANGE_MODE' | 'CHANGE_PASSWORD', id?: string; profile?: UserUpdateAdminDto | UserUpdateDto, mode?: OperationMode }> = new EventEmitter();
  @Input('mode') mode!: OperationMode;

  isInactiveUser: any;
  pictureBase64: string | undefined;
  editAdminForm!: FormGroup;
  editSelfForm!: FormGroup;
  editLoginInfoForm!: FormGroup;

  refData!: { [key: string]: KeyValue[]; };

  protected address: {
    presentAddressStates?: KeyValue[],
    presentAddressDistricts?: KeyValue[],
    permanentAddressStates?: KeyValue[],
    permanentAddressDistricts?: KeyValue[]
  } = {};

  protected socialMedia: {
    facebookSM?: LinkDto,
    instagramSM?: LinkDto,
    linkedInSM?: LinkDto,
    twitterSM?: LinkDto
    whatsappSM?: LinkDto

  } = {}



  constructor(
    private sharedDataService: SharedDataService,
    private memberService: MemberService,
    //private commonService: CommonService,

  ) { }


  ngOnInit(): void {
    this.refData = this.sharedDataService.getRefData(UserConstant.refDataName)!;
    this.editAdminForm = new FormGroup({
      status: new FormControl(this.profile.status, [Validators.required]),
      roles: new FormControl(this.profile.roles?.map(m => m.roleCode), []),
      loginMethod: new FormControl(this.profile.loginMethod, [Validators.required]),
    });
    this.initValues();

    this.editSelfForm = new FormGroup({
      title: new FormControl(this.profile.title, [Validators.required]),
      firstName: new FormControl(this.profile.firstName, [Validators.required]),
      middleName: new FormControl(this.profile.middleName, []),
      lastName: new FormControl(this.profile.lastName, [Validators.required]),
      gender: new FormControl(this.profile.gender, [Validators.required]),
      dateOfBirth: new FormControl(this.profile.dateOfBirth ? new Date(this.profile.dateOfBirth) : '', [Validators.required]),
      email: new FormControl(this.profile.email, [Validators.required, Validators.email]),
      phoneNumber_p: new FormControl(this.profile.primaryNumber ?
        `+${this.profile.primaryNumber.code.trim()}-${this.profile.primaryNumber.number.trim()}`
        : null, [Validators.required]),
      phoneNumber_s: new FormControl(this.profile.secondaryNumber ?
        `+${this.profile.secondaryNumber.code.trim()}-${this.profile.secondaryNumber.number.trim()}`
        : null, []),
      addressLine1_p: new FormControl(this.profile.presentAddress?.addressLine1, [Validators.required]),
      addressLine2_p: new FormControl(this.profile.presentAddress?.addressLine2, []),
      addressLine3_p: new FormControl(this.profile.presentAddress?.addressLine3, []),
      hometown_p: new FormControl(this.profile.presentAddress?.hometown, [Validators.required]),
      zipCode_p: new FormControl(this.profile.presentAddress?.zipCode, [Validators.required]),
      district_p: new FormControl(this.profile.presentAddress?.district, [conditionalValidator(() =>
        (this.editSelfForm.get('country_p')?.value === 'IN'),
        Validators.required
      )]),
      state_p: new FormControl(this.profile.presentAddress?.state, [conditionalValidator(() =>
        (this.editSelfForm.get('country_p')?.value === 'IN'),
        Validators.required
      )]),
      country_p: new FormControl(this.profile.presentAddress?.country, [Validators.required]),
      presentParmanentSame: new FormControl(this.profile.addressSame ? true : false, [Validators.required]),
      addressLine1_s: new FormControl(this.profile.permanentAddress?.addressLine1, [conditionalValidator(() =>
        (this.editSelfForm.get('presentParmanentSame')?.value === false),
        Validators.required
      )]),
      addressLine2_s: new FormControl(this.profile.permanentAddress?.addressLine2, []),
      addressLine3_s: new FormControl(this.profile.permanentAddress?.addressLine3, []),
      hometown_s: new FormControl(this.profile.permanentAddress?.hometown, [conditionalValidator(() =>
        (this.editSelfForm.get('presentParmanentSame')?.value === false),
        Validators.required
      )]),
      zipCode_s: new FormControl(this.profile.presentAddress?.zipCode, [conditionalValidator(() =>
        (this.editSelfForm.get('presentParmanentSame')?.value === false),
        Validators.required
      )]),
      district_s: new FormControl(this.profile.permanentAddress?.district, [conditionalValidator(() =>
      (this.editSelfForm.get('presentParmanentSame')?.value === false ||
        this.editSelfForm.get('country_s')?.value === 'IN'),
        Validators.required
      )]),
      state_s: new FormControl(this.profile.permanentAddress?.state, [conditionalValidator(() =>
      (this.editSelfForm.get('presentParmanentSame')?.value === false ||
        this.editSelfForm.get('country_s')?.value === 'IN'),
        Validators.required
      )]),
      country_s: new FormControl(this.profile.permanentAddress?.country, [conditionalValidator(() =>
        (this.editSelfForm.get('presentParmanentSame')?.value === false),
        Validators.required
      )]),
      facebookLink: new FormControl(this.socialMedia.facebookSM?.linkValue, []),
      instagramLink: new FormControl(this.socialMedia.instagramSM?.linkValue, []),
      linkedInLink: new FormControl(this.socialMedia.linkedInSM?.linkValue, []),
      twitterLink: new FormControl(this.socialMedia.twitterSM?.linkValue, []),
      //whatsappLink: new FormControl(this.socialMedia.whatsappSM?.mediaLink, []),
      about: new FormControl(this.profile.about, [Validators.required]),
      picture: new FormControl('', []),

    });

    this.editSelfForm.controls['country_p'].valueChanges.subscribe(s => {
      if (s == 'IN') {
        this.memberService.fetchRefData(s).subscribe(data => this.address.presentAddressStates = data!['states'])
      }
    })

    this.editSelfForm.controls['country_s'].valueChanges.subscribe(s => {
      if (s == 'IN') {
        this.memberService.fetchRefData(s).subscribe(data => this.address.permanentAddressStates = data!['states'])
      }
    })
    this.editSelfForm.controls['state_p'].valueChanges.subscribe(s => {
      this.memberService.fetchRefData(this.editSelfForm.value['country_p'], s)
        .subscribe(data => this.address.presentAddressDistricts = data!['districts'])
    })
    this.editSelfForm.controls['state_s'].valueChanges.subscribe(s => {
      this.memberService.fetchRefData(this.editSelfForm.value['country_s'], s)
        .subscribe(data => this.address.permanentAddressDistricts = data!['districts'])
    })

    this.editSelfForm.controls['presentParmanentSame'].valueChanges.subscribe(s => {
      this.editSelfForm.controls['addressLine1_s'].updateValueAndValidity();
      this.editSelfForm.controls['addressLine2_s'].updateValueAndValidity();
      this.editSelfForm.controls['addressLine3_s'].updateValueAndValidity();
      this.editSelfForm.controls['hometown_s'].updateValueAndValidity();
      this.editSelfForm.controls['district_s'].updateValueAndValidity();
      this.editSelfForm.controls['zipCode_s'].updateValueAndValidity();
      this.editSelfForm.controls['state_s'].updateValueAndValidity();
      this.editSelfForm.controls['country_s'].updateValueAndValidity();
    })



    this.editLoginInfoForm = new FormGroup({
      oldPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [Validators.required]),
      confirmNewPassword: new FormControl('', [Validators.required,]),

    }, { validators: matchFieldsValidator('newPassword', 'confirmNewPassword') })


  }


  initValues() {

    this.socialMedia.facebookSM = this.profile.socialMediaLinks?.find(f => f.linkType == 'facebook');
    this.socialMedia.instagramSM = this.profile.socialMediaLinks?.find(f => f.linkType == 'instagram');
    this.socialMedia.linkedInSM = this.profile.socialMediaLinks?.find(f => f.linkType == 'linkedin');
    this.socialMedia.twitterSM = this.profile.socialMediaLinks?.find(f => f.linkType == 'twitter');
    this.socialMedia.whatsappSM = this.profile.socialMediaLinks?.find(f => f.linkType == 'whatsapp');


  }


  onSelectFile($event: any) {
    let files = $event.target.files as FileList;
    let reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = () => {
      this.pictureBase64 = reader.result as string
      //////console.log()
    }
  }

  editSelf() {
    if (this.profile.presentAddress) {
      this.memberService.fetchRefData(this.profile.presentAddress.country, this.profile.presentAddress.state)
        .subscribe(data => {
          this.address.presentAddressStates = data!['states']
          this.address.presentAddressDistricts = data!['districts']
        })
    }
    if (this.profile.permanentAddress) {
      this.memberService.fetchRefData(this.profile.permanentAddress.country, this.profile.permanentAddress.state)
        .subscribe(data => {
          this.address.permanentAddressStates = data!['states']
          this.address.permanentAddressDistricts = data!['districts']
        })
    }
    this.onUpdate.emit({ actionName: 'CHANGE_MODE', mode: 'edit_self', id: this.profile.id! })

  }

  editAdmin() {
    this.applicableLM = this.refData[this.constant.refDataKey.loginMethods].filter(f =>
      !this.profile.loginMethod.includes(f.key!)
    )
    this.onUpdate.emit({ actionName: 'CHANGE_MODE', mode: 'edit_admin' })
  }

  updateDetailAdmin() {
    if (this.editAdminForm.valid) {
      let userDetail: UserUpdateAdminDto = {};
      if (this.profile.status != this.editAdminForm.value.status) {
        userDetail.status = this.editAdminForm.value.status;
      }
      ////console.log(this.editAdminForm.value.roles, this.profile.roles?.map(m => m.roleCode))

      userDetail.roleCodes = [];
      let roles = this.editAdminForm.value.roles as string[]
      roles.forEach(f => {
        userDetail.roleCodes?.push(f)
      })
      if (this.editAdminForm.value.loginMethod) {
        let lm = this.editAdminForm.value.loginMethod as string[];
        userDetail.loginMethods = lm.filter(f => !this.profile.loginMethod?.includes(f as any)) as any;
      }
      this.onUpdate.emit({ actionName: 'ADMIN_UPDATE', profile: userDetail, id: this.profile.id! })

    } else {
      this.editAdminForm.markAllAsTouched();
    }
  }

  updateSelfProfile() {
    //////console.log(this.editSelfForm)
    if (this.editSelfForm.valid) {
      let userDetail: UserUpdateDto = {
        title: this.editSelfForm.value.title,
        firstName: this.editSelfForm.value.firstName,
        middleName: this.editSelfForm.value.middleName,
        lastName: this.editSelfForm.value.lastName,
        gender: this.editSelfForm.value.gender,
        dateOfBirth: this.editSelfForm.value.dateOfBirth,
        about: this.editSelfForm.value.about,



      };

      if (this.editSelfForm.value.phoneNumber_p) {
        ////console.log(this.editSelfForm.value.phoneNumber_p)
        let pPhNo = parsePhoneNumber(this.editSelfForm.value.phoneNumber_p);
        userDetail.primaryNumber = {
          code: pPhNo.countryCallingCode,
          number: pPhNo.nationalNumber
        }
      }
      if (this.editSelfForm.value.phoneNumber_s) {
        let sPhNo = parsePhoneNumber(this.editSelfForm.value.phoneNumber_s);
        userDetail.secondaryNumber = {
          code: sPhNo.countryCallingCode,
          number: sPhNo.nationalNumber
        }

      }
      userDetail.isAddressSame = this.editSelfForm.value.presentParmanentSame;
      userDetail.presentAddress = {
        addressLine1: this.editSelfForm.value.addressLine1_p,
        addressLine2: this.editSelfForm.value.addressLine2_p,
        addressLine3: this.editSelfForm.value.addressLine3_p,
        hometown: this.editSelfForm.value.hometown_p,
        district: this.editSelfForm.value.district_p,
        state: this.editSelfForm.value.state_p,
        country: this.editSelfForm.value.country_p,
        zipCode: this.editSelfForm.value.zipCode_p,
      };

      if (this.editSelfForm.value.presentParmanentSame) {
        userDetail.permanentAddress = {
          addressLine1: this.editSelfForm.value.addressLine1_p,
          addressLine2: this.editSelfForm.value.addressLine2_p,
          addressLine3: this.editSelfForm.value.addressLine3_p,
          hometown: this.editSelfForm.value.hometown_p,
          district: this.editSelfForm.value.district_p,
          state: this.editSelfForm.value.state_p,
          country: this.editSelfForm.value.country_p,
          zipCode: this.editSelfForm.value.zipCode_p,
        };

      } else {
        userDetail.permanentAddress = {
          addressLine1: this.editSelfForm.value.addressLine1_s,
          addressLine2: this.editSelfForm.value.addressLine2_s,
          addressLine3: this.editSelfForm.value.addressLine3_s,
          hometown: this.editSelfForm.value.hometown_s,
          district: this.editSelfForm.value.district_s,
          state: this.editSelfForm.value.state_s,
          country: this.editSelfForm.value.country_s,
          zipCode: this.editSelfForm.value.zipCode_s,

        }
      }
      userDetail.socialMediaLinks = []
      if (this.editSelfForm.value.facebookLink) {
        userDetail.socialMediaLinks.push({ linkType: 'facebook', linkName: 'Facebook', linkValue: this.editSelfForm.value.facebookLink })
      }
      if (this.editSelfForm.value.instagramLink) {
        userDetail.socialMediaLinks.push({ linkType: 'instagram', linkName: 'Instagram', linkValue: this.editSelfForm.value.instagramLink })
      }
      if (this.editSelfForm.value.linkedInLink) {
        userDetail.socialMediaLinks.push({ linkType: 'linkedin', linkName: 'LinkedIn', linkValue: this.editSelfForm.value.linkedInLink })

      }
      if (this.editSelfForm.value.twitterLink) {
        userDetail.socialMediaLinks.push({ linkType: 'twitter', linkName: 'Twitter', linkValue: this.editSelfForm.value.twitterLink })
      }
      userDetail.socialMediaLinks.push({ linkType: 'whatsapp', linkName: 'Whatsapp', linkValue: 'https://wa.me/' + this.editSelfForm.value.phoneNumber_p })


      ////console.log(this.editSelfForm.value)
      if (this.pictureBase64) {
        userDetail.picture = sanitizeBase64(this.pictureBase64);
      }
      this.onUpdate.emit({ actionName: 'SELF_UPDATE', profile: userDetail, id: this.profile.id! })
    } else {
      this.editSelfForm.markAllAsTouched();
    }
  }

  changePassword() {
    //////console.log(this.editLoginInfoForm)
    if (this.editLoginInfoForm.valid) {
      // let userDetail = {} as UserDetail;
      // userDetail.attributes = {};
      // userDetail.attributes['old_password'] = btoa(this.editLoginInfoForm.value.oldPassword);
      // userDetail.attributes['new_password'] = btoa(this.editLoginInfoForm.value.newPassword);
      // this.onUpdate.emit({ actionName: 'CHANGE_PASSWORD', profile: userDetail })
    } else {
      this.editLoginInfoForm.markAllAsTouched();
    }

  }

  protected displayRefData = (name: string, code: string) => {
    if (this.refData == undefined || code == undefined) {
      return code;
    }
    return this.refData[name].find(f => f.key == code)?.displayValue;
  }

}
