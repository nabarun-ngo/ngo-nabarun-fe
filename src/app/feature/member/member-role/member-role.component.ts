import { Component, OnInit } from '@angular/core';
import { MemberService } from '../service/member.service';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { KeyValue } from 'src/app/shared/model/key-value.model';
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
import { Role, User } from '../models/member.model';
import { SearchSelectModalService } from 'src/app/shared/components/search-select-modal/search-select-modal.service';
import { SearchSelectModalConfig } from 'src/app/shared/components/search-select-modal/search-select-modal.component';

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
  private userSearch = (kv: KeyValue[]): SearchSelectModalConfig => {
    return {

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
          selectList: kv
        },
        validations: [Validators.required]
      }]
    }
  };

  rolesToEdit!: KeyValue[];
  navigations!: NavigationButtonModel[];
  allMembers!: User[];
  rolesVsMinUser: {
    [roleCode: string]: number
  } = {};
  rolesVsMaxUser: {
    [roleCode: string]: number
  } = {};

  constructor(
    private sharedDataService: SharedDataService,
    private route: ActivatedRoute,
    private router: Router,
    private memberService: MemberService,
    private modalService: ModalService,
    private searchService: SearchSelectModalService,

  ) { }

  async ngOnInit(): Promise<any> {
    this.sharedDataService.setPageName('ALLOCATE ROLES');
    if (this.route.snapshot.data['ref_data']) {
      this.refData = this.route.snapshot.data['ref_data'];
    }

    this.rolesToEdit = this.refData['availableRoles'].filter(f => f.active && f.key != 'MEMBER');
    this.refData['minUserPerRole']?.filter(f => f.active).map(m => this.rolesVsMinUser[m.key!] = m.value);
    this.refData['maxUserPerRole']?.filter(f => f.active).map(m => this.rolesVsMaxUser[m.key!] = m.value);


    for (const f of this.rolesToEdit) {
      const data = await lastValueFrom(this.memberService.fetchMembersByRole([f.key!]));

      this.roleUserMaping[f.key!] = {
        currentUsers: data?.content!,
        previousUsersId: data?.content!.map(m => m.id) as string[],
      }

    }
    this.allMembers = (await lastValueFrom(this.memberService.fetchAllMembers()))?.content!;

    this.navigations = [
      {
        displayName: 'Back to Members',
        routerLink: this.app_route.secured_member_members_page.url
      }
    ]
    this.validate()
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
    this.validate()
  }

  clone(key: string, profile: User) {
    this.roleUserMaping[key].currentUsers.push(profile)
    this.validate()
  }

  private validate() {
    this.checkDuplicate()
    this.checkUserCount();
  }
  private checkUserCount() {
    this.rolesToEdit.forEach(f => {
      if (this.roleUserMaping[f.key!]?.currentUsers.length < this.rolesVsMinUser[f.key!]) {
        this.roleUserMaping[f.key!].errors = {
          hasError: true,
          message: `At least ${this.rolesVsMinUser[f.key!]} user should be assigned to this role.`,
          duplicates: []
        }
      }

      if (this.roleUserMaping[f.key!]?.currentUsers.length > this.rolesVsMaxUser[f.key!]) {
        this.roleUserMaping[f.key!].errors = {
          hasError: true,
          message: `At most ${this.rolesVsMaxUser[f.key!]} user should be assigned to this role.`,
          duplicates: []
        }
      }
    })
  }



  private checkDuplicate() {
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
    this.validate()
  }

  addUserToRole(roleId: string) {
    const users = this.allMembers?.map(m2 => {
      return { key: m2.id, displayValue: m2.fullName } as KeyValue
    })
    const searchModel = this.userSearch(users)

    let modal = this.searchService.open(searchModel, { width: 700 });
    modal.subscribe(data => {
      let profile = this.allMembers.find(f => f.id == data.value.users);
      if (profile) {
        this.roleUserMaping[roleId].currentUsers.push(profile!);
        this.validate()
      }
    })

  }

  async saveRoles() {
    this.validate();
    let noError = Object.keys(this.roleUserMaping).every(f => {
      return !this.roleUserMaping[f].errors?.hasError
    });
    if (noError) {
      let isChanged: boolean = false;
      const rolesInGrid = this.rolesToEdit.map(r => r.key!);
      const usersToRole: Record<string, string[]> = {};
      const previousUsersToRole: Record<string, string[]> = {};

      // 1. Aggregate current state: user -> roles
      for (const roleCode of rolesInGrid) {
        this.roleUserMaping[roleCode].currentUsers.forEach(user => {
          if (!usersToRole[user.id]) {
            usersToRole[user.id] = [];
          }
          if (!usersToRole[user.id].includes(roleCode)) {
            usersToRole[user.id].push(roleCode);
          }
        });

        // 2. Aggregate previous state for comparison
        this.roleUserMaping[roleCode].previousUsersId.forEach(userId => {
          if (!previousUsersToRole[userId]) {
            previousUsersToRole[userId] = [];
          }
          if (!previousUsersToRole[userId].includes(roleCode)) {
            previousUsersToRole[userId].push(roleCode);
          }
        });
      }

      // 3. Identify all users who were either previously or are currently in the grid
      const allUserIds = new Set([...Object.keys(usersToRole), ...Object.keys(previousUsersToRole)]);

      // 4. Update roles for users with changes
      for (const userId of allUserIds) {
        const currentGridRoles = (usersToRole[userId] || []).sort();
        const previousGridRoles = (previousUsersToRole[userId] || []).sort();

        if (!arraysEqual(currentGridRoles, previousGridRoles)) {
          isChanged = true;
          // Preserve roles not managed by this grid (e.g., MEMBER)
          const user = this.allMembers.find(m => m.id === userId);
          const otherRoles = user ? user.roleCodes.filter(rc => !rolesInGrid.includes(rc)) : [];
          const finalRoles = [...otherRoles, ...currentGridRoles];

          await lastValueFrom(this.memberService.saveUserRoleWise(userId, finalRoles));
        }
      }

      if (isChanged) {
        this.router.navigateByUrl(this.app_route.secured_member_members_page.url)
      } else {
        this.modalService.openNotificationModal(AppDialog.err_no_change_made, 'notification', 'error');
      }

    } else {
      this.modalService.openNotificationModal(AppDialog.err_incorrect_role, 'notification', 'error');
    }
  }

}
