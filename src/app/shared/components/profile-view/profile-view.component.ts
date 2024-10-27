import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, RequiredValidator, Validators } from '@angular/forms';
import { parsePhoneNumber } from 'libphonenumber-js';
import { KeyValue, RefDataType, UserAddress, UserDetail, UserPhoneNumber, UserRole, UserSocialMedia } from 'src/app/core/api/models';
import { conditionalValidator, matchFieldsValidator } from 'src/app/core/service/form.service';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { OperationMode, UserConstant } from 'src/app/feature/member/member.const';
import { CommonService } from '../../services/common.service';
import { sanitizeBase64 } from 'src/app/core/service/utilities.service';

@Component({
  selector: 'app-profile-view',
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.scss']
})
export class ProfileViewComponent implements OnInit {


  profile!: UserDetail;
  @Input({ required: true, alias: 'profile' })
  set profileData(data: UserDetail){
    this.profile=data;
    //console.log(this.profile)
    this.initValues();
  }
  constant =UserConstant

  @Output()
  onUpdate: EventEmitter<{ actionName: 'SELF_UPDATE' | 'ADMIN_UPDATE' | 'CHANGE_MODE' | 'CHANGE_PASSWORD', profile?: UserDetail, mode?: OperationMode }> = new EventEmitter();
  @Input('mode') mode!: OperationMode;

  isInactiveUser: any;
  pictureBase64: string | undefined;
  editAdminForm!: FormGroup;
  editSelfForm!: FormGroup;
  editLoginInfoForm!: FormGroup;

  refData!: { [key: string]: KeyValue[]; };
  phoneNumber: {
    phoneNumberP?: UserPhoneNumber | undefined,
    phoneNumberS?: UserPhoneNumber | undefined;
  } = {}
  address: {
    presentAddress?: UserAddress | undefined,
    permanentAddress?: UserAddress | undefined,
    presentAddressStates?: KeyValue[],
    presentAddressDistricts?: KeyValue[],
    permanentAddressStates?: KeyValue[],
    permanentAddressDistricts?: KeyValue[]
  } = {}

  socialMedia: {
    facebookSM?: UserSocialMedia | undefined,
    instagramSM?: UserSocialMedia | undefined,
    linkedInSM?: UserSocialMedia | undefined,
    twitterSM?: UserSocialMedia | undefined
    whatsappSM?: UserSocialMedia | undefined

  } = {}



  constructor(
    private sharedDataService: SharedDataService,
    //private memberService: MemberService,
    private commonService: CommonService,

  ) { }


  ngOnInit(): void {
    this.refData = this.sharedDataService.getRefData(UserConstant.refDataName)!;
    this.editAdminForm = new FormGroup({
      status: new FormControl(this.profile.status, [Validators.required]),
      roles: new FormControl(this.profile.roles?.map(m => m.roleCode), [Validators.required]),
      loginMethod: new FormControl(this.profile.loginMethod, [Validators.required]),
    });
    this.initValues();

    this.editSelfForm = new FormGroup({
      title: new FormControl(this.profile.title, [Validators.required]),
      firstName: new FormControl(this.profile.firstName, [Validators.required]),
      middleName: new FormControl(this.profile.middleName, []),
      lastName: new FormControl(this.profile.lastName, [Validators.required]),
      gender: new FormControl(this.profile.gender, [Validators.required]),
      dateOfBirth: new FormControl(this.profile.dateOfBirth ?new Date(this.profile.dateOfBirth):'', [Validators.required]),
      email: new FormControl(this.profile.email, [Validators.required, Validators.email]),
      phoneNumber_p: new FormControl(this.phoneNumber.phoneNumberP ? (this.phoneNumber.phoneNumberP.phoneCode! + this.phoneNumber.phoneNumberP.phoneNumber) : null, [Validators.required]),
      phoneNumber_s: new FormControl(this.phoneNumber.phoneNumberS ? (this.phoneNumber.phoneNumberS.phoneCode! + this.phoneNumber.phoneNumberS.phoneNumber) : null, []),
      addressLine1_p: new FormControl(this.address.presentAddress?.addressLine1, [Validators.required]),
      addressLine2_p: new FormControl(this.address.presentAddress?.addressLine2, []),
      addressLine3_p: new FormControl(this.address.presentAddress?.addressLine3, []),
      hometown_p: new FormControl(this.address.presentAddress?.hometown, [Validators.required]),
      district_p: new FormControl(this.address.presentAddress?.district, [conditionalValidator(() =>
        (this.editSelfForm.get('country_p')?.value === 'IN'),
        Validators.required
      )]),
      state_p: new FormControl(this.address.presentAddress?.state, [conditionalValidator(() =>
        (this.editSelfForm.get('country_p')?.value === 'IN'),
        Validators.required
      )]),
      country_p: new FormControl(this.address.presentAddress?.country, [Validators.required]),
      presentParmanentSame: new FormControl(this.profile.presentAndPermanentAddressSame ? true : false, [Validators.required]),
      addressLine1_s: new FormControl(this.address.permanentAddress?.addressLine1, [conditionalValidator(() =>
        (this.editSelfForm.get('presentParmanentSame')?.value === false),
        Validators.required
      )]),
      addressLine2_s: new FormControl(this.address.permanentAddress?.addressLine2, []),
      addressLine3_s: new FormControl(this.address.permanentAddress?.addressLine3, []),
      hometown_s: new FormControl(this.address.permanentAddress?.hometown, [conditionalValidator(() =>
        (this.editSelfForm.get('presentParmanentSame')?.value === false),
        Validators.required
      )]),
      district_s: new FormControl(this.address.permanentAddress?.district, [conditionalValidator(() =>
      (this.editSelfForm.get('presentParmanentSame')?.value === false ||
        this.editSelfForm.get('country_s')?.value === 'IN'),
        Validators.required
      )]),
      state_s: new FormControl(this.address.permanentAddress?.state, [conditionalValidator(() =>
      (this.editSelfForm.get('presentParmanentSame')?.value === false ||
        this.editSelfForm.get('country_s')?.value === 'IN'),
        Validators.required
      )]),
      country_s: new FormControl(this.address.permanentAddress?.country, [conditionalValidator(() =>
        (this.editSelfForm.get('presentParmanentSame')?.value === false),
        Validators.required
      )]),
      facebookLink: new FormControl(this.socialMedia.facebookSM?.mediaLink, []),
      instagramLink: new FormControl(this.socialMedia.instagramSM?.mediaLink, []),
      linkedInLink: new FormControl(this.socialMedia.linkedInSM?.mediaLink, []),
      twitterLink: new FormControl(this.socialMedia.twitterSM?.mediaLink, []),
      //whatsappLink: new FormControl(this.socialMedia.whatsappSM?.mediaLink, []),
      about: new FormControl(this.profile.about, [Validators.required]),
      picture: new FormControl('', []),

    });

    this.editSelfForm.controls['country_p'].valueChanges.subscribe(s => {
      if (s == 'IN') {
        this.commonService.getRefData([RefDataType.User],{countryCode:s}).subscribe(data => this.address.presentAddressStates = data!['states'])
      }
    })

    this.editSelfForm.controls['country_s'].valueChanges.subscribe(s => {
      if (s == 'IN') {
        this.commonService.getRefData([RefDataType.User],{
          countryCode:s
        }).subscribe(data => this.address.permanentAddressStates = data!['states'])
      }
    })
    this.editSelfForm.controls['state_p'].valueChanges.subscribe(s => {
      this.commonService.getRefData([RefDataType.User],{
        countryCode:this.editSelfForm.value['country_p'],
        stateCode:s
      }).subscribe(data => this.address.presentAddressDistricts = data!['districts'])
    })
    this.editSelfForm.controls['state_s'].valueChanges.subscribe(s => {
      this.commonService.getRefData([RefDataType.User],{
        countryCode:this.editSelfForm.value['country_s'],
        stateCode:s
      }).subscribe(data => this.address.permanentAddressDistricts = data!['districts'])
    })

    this.editSelfForm.controls['presentParmanentSame'].valueChanges.subscribe(s => {
      this.editSelfForm.controls['addressLine1_s'].updateValueAndValidity();
      this.editSelfForm.controls['addressLine2_s'].updateValueAndValidity();
      this.editSelfForm.controls['addressLine3_s'].updateValueAndValidity();
      this.editSelfForm.controls['hometown_s'].updateValueAndValidity();
      this.editSelfForm.controls['district_s'].updateValueAndValidity();
      this.editSelfForm.controls['state_s'].updateValueAndValidity();
      this.editSelfForm.controls['country_s'].updateValueAndValidity();
    })



    this.editLoginInfoForm=new FormGroup({
      oldPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [Validators.required]),
      confirmNewPassword: new FormControl('', [Validators.required,]),

    },{validators : matchFieldsValidator('newPassword','confirmNewPassword')})

   
  }


  initValues() {
    
    this.phoneNumber.phoneNumberP = this.profile.phones?.find(f => f.phoneType == 'PRIMARY');
    this.phoneNumber.phoneNumberS = this.profile.phones?.find(f => f.phoneType == 'ALTERNATIVE');
    this.address.presentAddress = this.profile.addresses?.find(f => f.addressType == 'PRESENT');
    this.address.permanentAddress = this.profile.addresses?.find(f => f.addressType == 'PERMANENT');
    this.socialMedia.facebookSM = this.profile.socialMediaLinks?.find(f => f.mediaType == 'FACEBOOK');
    this.socialMedia.instagramSM = this.profile.socialMediaLinks?.find(f => f.mediaType == 'INSTAGRAM');
    this.socialMedia.linkedInSM = this.profile.socialMediaLinks?.find(f => f.mediaType == 'LINKEDIN');
    this.socialMedia.twitterSM = this.profile.socialMediaLinks?.find(f => f.mediaType == 'TWITTER');
    this.socialMedia.whatsappSM = this.profile.socialMediaLinks?.find(f => f.mediaType == 'WHATSAPP');
  }


  onSelectFile($event: any) {
    let files = $event.target.files as FileList;
    let reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = () => {
      this.pictureBase64=reader.result as string
      //console.log()
    }
  }

  editSelf() {
    if (this.address.presentAddress) {
      this.commonService.getRefData([RefDataType.User],{
        countryCode:this.address.presentAddress.country,
        stateCode:this.address.presentAddress.state
      }).subscribe(data => {
        this.address.presentAddressStates = data!['states']
        this.address.presentAddressDistricts = data!['districts']
      })
    }
    if (this.address.permanentAddress) {
      this.commonService.getRefData([RefDataType.User],{
        countryCode:this.address.permanentAddress.country,
        stateCode:this.address.permanentAddress.state
      }).subscribe(data => {
        this.address.permanentAddressStates = data!['states']
        this.address.permanentAddressDistricts = data!['districts']
      })
    }
    this.onUpdate.emit({ actionName: 'CHANGE_MODE', mode: 'edit_self' })

  }

  updateDetailAdmin() {
    if (this.editAdminForm.valid) {
      let userDetail: UserDetail = {};
      if (this.profile.status != this.editAdminForm.value.status) {
        userDetail.status = this.editAdminForm.value.status;
      }
      console.log(this.editAdminForm.value.roles, this.profile.roles?.map(m => m.roleCode))

      userDetail.roles = [];
      let roles = this.editAdminForm.value.roles as string[]
      roles.forEach(f => {
        userDetail.roles?.push({ roleCode: f as any })
      })
      if(this.editAdminForm.value.loginMethod){
        let lm=this.editAdminForm.value.loginMethod as string[];
        userDetail.loginMethod=lm.filter(f=>!this.profile.loginMethod?.includes(f as any)) as any;
      }
      userDetail.id = this.profile.id!;
      this.onUpdate.emit({ actionName: 'ADMIN_UPDATE', profile: userDetail })

    } else {
      this.editAdminForm.markAllAsTouched();
    }
  }

  updateSelfProfile() {
    //console.log(this.editSelfForm)
    if (this.editSelfForm.valid) {
      let userDetail: UserDetail = {};
      userDetail.title = this.editSelfForm.value.title;
      userDetail.firstName = this.editSelfForm.value.firstName;
      userDetail.middleName = this.editSelfForm.value.middleName;
      userDetail.lastName = this.editSelfForm.value.lastName;
      userDetail.gender = this.editSelfForm.value.gender;
      userDetail.dateOfBirth = this.editSelfForm.value.dateOfBirth;
      userDetail.about = this.editSelfForm.value.about;
      userDetail.email = this.editSelfForm.value.email;
      userDetail.phones = []
      if (this.editSelfForm.value.phoneNumber_p) {
        let pPhNo = parsePhoneNumber(this.editSelfForm.value.phoneNumber_p);
        userDetail.phones.push({ phoneType: 'PRIMARY', phoneCode: '+' + pPhNo.countryCallingCode, phoneNumber: pPhNo.nationalNumber })
      }
      if (this.editSelfForm.value.phoneNumber_s) {
        let sPhNo = parsePhoneNumber(this.editSelfForm.value.phoneNumber_s);
        userDetail.phones.push({ phoneType: 'ALTERNATIVE', phoneCode: '+' + sPhNo.countryCallingCode, phoneNumber: sPhNo.nationalNumber })
      }
      userDetail.addresses = []
      userDetail.presentAndPermanentAddressSame = this.editSelfForm.value.presentParmanentSame;
      userDetail.addresses.push({
        addressType: 'PRESENT',
        addressLine1: this.editSelfForm.value.addressLine1_p,
        addressLine2: this.editSelfForm.value.addressLine2_p,
        addressLine3: this.editSelfForm.value.addressLine3_p,
        hometown: this.editSelfForm.value.hometown_p,
        district: this.editSelfForm.value.district_p,
        state: this.editSelfForm.value.state_p,
        country: this.editSelfForm.value.country_p
      })

      if (this.editSelfForm.value.presentParmanentSame) {
        userDetail.addresses.push({
          addressType: 'PERMANENT',
          addressLine1: this.editSelfForm.value.addressLine1_p,
          addressLine2: this.editSelfForm.value.addressLine2_p,
          addressLine3: this.editSelfForm.value.addressLine3_p,
          hometown: this.editSelfForm.value.hometown_p,
          district: this.editSelfForm.value.district_p,
          state: this.editSelfForm.value.state_p,
          country: this.editSelfForm.value.country_p
        })
      }else {
        userDetail.addresses.push({
          addressType: 'PERMANENT',
          addressLine1: this.editSelfForm.value.addressLine1_s,
          addressLine2: this.editSelfForm.value.addressLine2_s,
          addressLine3: this.editSelfForm.value.addressLine3_s,
          hometown: this.editSelfForm.value.hometown_s,
          district: this.editSelfForm.value.district_s,
          state: this.editSelfForm.value.state_s,
          country: this.editSelfForm.value.country_s
        })
      }
      userDetail.socialMediaLinks = []
      if (this.editSelfForm.value.facebookLink) {
        userDetail.socialMediaLinks.push({ mediaType: 'FACEBOOK', mediaName: 'Facebook', mediaLink: this.editSelfForm.value.facebookLink })
      }
      if (this.editSelfForm.value.instagramLink) {
        userDetail.socialMediaLinks.push({ mediaType: 'INSTAGRAM', mediaName: 'Instagram', mediaLink: this.editSelfForm.value.instagramLink })
      }
      if (this.editSelfForm.value.linkedInLink) {
        userDetail.socialMediaLinks.push({ mediaType: 'LINKEDIN', mediaName: 'LinkedIn', mediaLink: this.editSelfForm.value.linkedInLink })

      }
      if (this.editSelfForm.value.twitterLink) {
        userDetail.socialMediaLinks.push({ mediaType: 'TWITTER', mediaName: 'Twitter', mediaLink: this.editSelfForm.value.twitterLink })
      }
      userDetail.socialMediaLinks.push({ mediaType: 'WHATSAPP', mediaName: 'Whatsapp', mediaLink: 'https://wa.me/' + this.editSelfForm.value.phoneNumber_p })
      
      
      console.log(this.editSelfForm.value)
      if(this.pictureBase64){
        userDetail.pictureBase64=sanitizeBase64(this.pictureBase64);
      }
      this.onUpdate.emit({ actionName: 'SELF_UPDATE', profile: userDetail })
    } else {
      this.editSelfForm.markAllAsTouched();
    }
  }

  changePassword() {
    //console.log(this.editLoginInfoForm)
    if (this.editLoginInfoForm.valid) {
      let userDetail = {} as UserDetail;
      userDetail.attributes={};
      userDetail.attributes['old_password']=btoa(this.editLoginInfoForm.value.oldPassword);
      userDetail.attributes['new_password']=btoa(this.editLoginInfoForm.value.newPassword);
      this.onUpdate.emit({ actionName: 'CHANGE_PASSWORD', profile: userDetail })
    }else{
      this.editLoginInfoForm.markAllAsTouched();
    }
    
  }

  protected displayRefData = (name:string,code: string) => {
    if (this.refData == undefined || code == undefined) {
      return code;
    }
    return this.refData[name].find(f=>f.key == code)?.displayValue;
  }

}
