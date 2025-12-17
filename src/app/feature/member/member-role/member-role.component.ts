import { Component, OnInit } from '@angular/core';
import { MemberService } from '../service/member.service';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { KeyValue } from 'src/app/core/api-client/models';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { lastValueFrom } from 'rxjs';
import { ModalService } from 'src/app/core/service/modal.service';
import { AppDialog } from 'src/app/core/constant/app-dialog.const';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { arraysEqual } from 'src/app/core/service/utilities.service';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { AdminService } from '../../admin/admin.service';
import { FormGroup, Validators } from '@angular/forms';
import { SearchAndAdvancedSearchFormComponent } from 'src/app/shared/components/search-and-advanced-search-form/search-and-advanced-search-form.component';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/model/search-and-advanced-search.model';
import { User } from '../models/member.model';

@Component({
  selector: 'app-member-role',
  templateUrl: './member-role.component.html',
  styleUrls: ['./member-role.component.scss']
})
export class MemberRoleComponent implements OnInit {

  protected app_route = AppRoute;
  refData!: { [key: string]: KeyValue[]; };

  roleUserMaping: {
    [roleCode: string]: {
      previousUsersId: string[];
      currentUsers: User[];
      errors?: { hasError: boolean, message: string, duplicates: string[] };
    }
  } = {};
  userSearch: SearchAndAdvancedSearchModel = {
    normalSearchPlaceHolder: '',
    showOnlyAdvancedSearch: true,
    advancedSearch: {
      buttonText: { search: 'Add', close: 'Close' },
      title: 'Search Members',
      searchFormFields: [{
        formControlName: 'users',
        inputModel: {
          html_id: 'user_search',
          inputType: 'text',
          tagName: 'input',
          autocomplete: true,
          placeholder: 'Search members here',
          selectList: []
        },
        validations: [Validators.required]
      }]
    }
  };

  rolesToEdit!: KeyValue[];
  navigations!: NavigationButtonModel[];
  allMembers!: User[];

  constructor(
    private sharedDataService: SharedDataService,
    private route: ActivatedRoute,
    private router: Router,
    private memberService: MemberService,
    private modalService: ModalService,
    private adminService: AdminService,

  ) { }

  async ngOnInit(): Promise<any> {
    this.sharedDataService.setPageName('ALLOCATE ROLES');
    if (this.route.snapshot.data['ref_data']) {
      this.refData = this.route.snapshot.data['ref_data'];
    }

    this.rolesToEdit = this.refData['availableRoles'].filter(f => f.key != 'MEMBER');

    for (const f of this.rolesToEdit) {
      const data = await lastValueFrom(this.memberService.fetchMembersByRole([f.key!]));

      this.roleUserMaping[f.key!] = {
        currentUsers: data?.content!,
        previousUsersId: data?.content!.map(m => m.userId) as string[],
      }

    }
    this.allMembers = (await lastValueFrom(this.memberService.fetchAllMembers()))?.content!;

    this.navigations = [
      {
        displayName: 'Back to Members',
        routerLink: this.app_route.secured_member_members_page.url
      }
    ]
  }



  drop(event: CdkDragDrop<User[]>) {
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
    this.checkDuplicate()
  }

  clone(key: string, profile: User) {
    this.roleUserMaping[key].currentUsers.push(profile)
    this.checkDuplicate()
  }

  checkDuplicate() {
    this.rolesToEdit.forEach(f => {
      const duplicates = this.roleUserMaping[f.key!]?.currentUsers.map(m => m.userId).filter((item, index) => this.roleUserMaping[f.key!]?.currentUsers.map(m => m.userId).indexOf(item) !== index) as string[];

      this.roleUserMaping[f.key!].errors = duplicates.length > 0 ?
        {
          hasError: true,
          message: 'Duplicate item exist.',
          duplicates: duplicates
        } :
        {
          hasError: false as boolean,
          message: '',
          duplicates: duplicates
        };
    })

  }

  remove(key: string, profile: User) {
    let index = this.roleUserMaping[key].currentUsers.indexOf(profile);
    this.roleUserMaping[key].currentUsers.splice(index, 1)
    this.checkDuplicate()
  }

  addUserToRole(roleId: string) {
    this.userSearch.advancedSearch?.searchFormFields.filter(f => f.inputModel.html_id == 'user_search').map(m => {
      m.inputModel.selectList = this.allMembers?.map(m2 => {
        return { key: m2.id, displayValue: m2.fullName } as KeyValue
      })
    })
    let modal = this.modalService.openComponentDialog(SearchAndAdvancedSearchFormComponent,
      this.userSearch
      , {
        height: 290,
        width: 700
      });
    modal.componentInstance.onSearch.subscribe(data => {
      if (data.reset) {
        modal.close();
      }
      else {
        let profile = this.allMembers.find(f => f.id == data.value.users);
        if (profile) {
          this.roleUserMaping[roleId].currentUsers.push(profile!);
          modal.close();
          this.checkDuplicate()
        }
      }
    })

  }

  async saveRoles() {
    let noError = Object.keys(this.roleUserMaping).every(f => {
      return !this.roleUserMaping[f].errors?.hasError
    });
    if (noError) {
      let isChanged: boolean = false;
      for (const f of this.rolesToEdit) {
        let currentUsers = this.roleUserMaping[f.key!].currentUsers.map(m => m.userId) as string[];
        let pastUsers = this.roleUserMaping[f.key!].previousUsersId;
        //console.log(f.key!, currentUsers, pastUsers)

        if (!arraysEqual(currentUsers, pastUsers)) {
          isChanged = true;
          await lastValueFrom(this.memberService.saveRoleUserWise(f.key!, this.roleUserMaping[f.key!].currentUsers))
        }
      }
      if (isChanged) {
        // this.adminService.clearCache(['auth0_role_users']).subscribe(data => {
        this.router.navigateByUrl(this.app_route.secured_member_members_page.url)
        // })
      } else {
        this.modalService.openNotificationModal(AppDialog.err_no_change_made, 'notification', 'error');
      }

    } else {
      this.modalService.openNotificationModal(AppDialog.err_incorrect_role, 'notification', 'error');
    }

    //console.log(noError)
  }

}
