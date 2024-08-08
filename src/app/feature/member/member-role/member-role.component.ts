import { Component, OnInit } from '@angular/core';
import { MemberService } from '../member.service';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { KeyValue, UserDetail } from 'src/app/core/api/models';
import { CdkDragDrop, copyArrayItem, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { bufferCount, concat, concatAll, concatMap, firstValueFrom, forkJoin, lastValueFrom, map, merge, of, toArray } from 'rxjs';
import { ModalService } from 'src/app/core/service/modal.service';
import { AppDialog } from 'src/app/core/constant/app-dialog.const';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { CommonService } from 'src/app/shared/services/common.service';
import { arraysEqual, objectsEqual } from 'src/app/core/service/utilities.service';

@Component({
  selector: 'app-member-role',
  templateUrl: './member-role.component.html',
  styleUrls: ['./member-role.component.scss']
})
export class MemberRoleComponent implements OnInit {

  protected app_route=AppRoute;
  refData!: { [key: string]: KeyValue[]; };
  roleUserMap: { [roleCode: string]: UserDetail[] } = {};
  roleErrorMap: { [roleCode: string]: { hasError: boolean, message: string, duplicates: string[] } } = {};
  roleUserMapCache: { [roleCode: string]: UserDetail[] } = {};

  rolesToEdit!: KeyValue[];
  constructor(
    private sharedDataService: SharedDataService,
    private route: ActivatedRoute,
    private router:Router,
    private memberService: MemberService,
    private modalService: ModalService,
    private commonService: CommonService,

  ) { }

  async ngOnInit(): Promise<any> {
    this.sharedDataService.setPageName('MEMBERS ROLES');
    if (this.route.snapshot.data['ref_data']) {
      this.refData = this.route.snapshot.data['ref_data'];
    }

    this.rolesToEdit = this.refData['availableRoles'];

    for (const f of this.rolesToEdit) {
     // console.log('before', new Date())
      const data = await lastValueFrom(this.memberService.fetchMembersByRole(f.key!));
      this.roleUserMap[f.key!] = data?.content!;
      this.roleUserMapCache[f.key!] = Array.from(this.roleUserMap[f.key!]);
    
    
    }
    console.log(this.roleUserMap, this.roleUserMapCache);
    //this.roleUserMapCache= Object.create(this.roleUserMap);
   // console.log(this.roleUserMap, this.roleUserMapCache);
  }



  drop(event: CdkDragDrop<UserDetail[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
    console.log(this.roleUserMap,this.roleUserMapCache)
    this.checkDuplicate()
  }

  clone(key: string, profile: UserDetail) {
    this.roleUserMap[key].push(profile)
    this.checkDuplicate()
  }

  checkDuplicate() {
    this.rolesToEdit.forEach(f => {
      //let hasError=this.roleUserMap[f.key!]?.some((val,i)=> this.roleUserMap[f.key!].indexOf(val) !== i);
      const duplicates = this.roleUserMap[f.key!]?.map(m=>m.userId).filter((item, index) => this.roleUserMap[f.key!]?.map(m=>m.userId).indexOf(item) !== index) as string[];

      // console.log( hasError)
      this.roleErrorMap[f.key!] = duplicates.length > 0 ?
        {
          hasError: true ,
          message: 'Duplicate item exist.',
          duplicates: duplicates
        } :
        {
          hasError: false as boolean,
          message: '',
          duplicates: duplicates
        };
      //console.log( this.roleErrorMap)
    })

  }

  remove(key: string, profile: UserDetail) {
    let index = this.roleUserMap[key].indexOf(profile);
    this.roleUserMap[key].splice(index, 1)
    this.checkDuplicate()
  }

  async saveRoles() {
    let noError = Object.keys(this.roleErrorMap).every(f => {
      return !this.roleErrorMap[f].hasError
    });
    if (noError) {
      let isChanged:boolean=false;
      for (const f of this.rolesToEdit) {  
        //console.log(f.key!,this.roleUserMap[f.key!].map(m=>m.userId),this.roleUserMapCache[f.key!].map(m=>m.userId))      
        if(!arraysEqual(this.roleUserMap[f.key!].map(m=>m.userId),this.roleUserMapCache[f.key!].map(m=>m.userId))){
          isChanged=true;
          await lastValueFrom(this.memberService.saveRoleUserWise(f.key!, this.roleUserMap[f.key!]))
        }
      }
      if(isChanged){
        this.commonService.clearCache(['auth0_role_users']).subscribe(data=>{
          this.router.navigateByUrl(this.app_route.secured_member_members_page.url)
        })
      }else{
        this.modalService.openNotificationModal(AppDialog.err_no_change_made, 'notification', 'error');
      }
      
    } else {
      this.modalService.openNotificationModal(AppDialog.err_incorrect_role, 'notification', 'error');
    }

    console.log(noError)
  }

}
