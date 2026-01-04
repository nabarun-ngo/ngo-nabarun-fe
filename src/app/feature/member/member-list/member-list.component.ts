import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MemberService } from '../service/member.service';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { MemberDefaultValue } from '../member.const';
import { PageEvent } from '@angular/material/paginator';
import { Paginator } from 'src/app/shared/utils/paginator';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/model/search-and-advanced-search.model';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { PagedUser } from '../models/member.model';
import { KeyValue } from 'src/app/shared/model/key-value.model';
import { StandardDashboard } from 'src/app/shared/utils/standard-dashboard';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.scss']
})
export class MemberListComponent extends StandardDashboard<PagedUser> {

  searchValue!: string;
  protected app_route = AppRoute;

  searchInputData!: SearchAndAdvancedSearchModel;
  navigations!: NavigationButtonModel[];
  memberList?: PagedUser;

  constructor(
    private sharedDataService: SharedDataService,
    protected override route: ActivatedRoute,
    private memberService: MemberService
  ) {
    super(route);
  }

  protected override get paginationConfig(): { pageNumber: number; pageSize: number; pageSizeOptions: number[]; } {
    return {
      pageNumber: MemberDefaultValue.pageNumber,
      pageSize: MemberDefaultValue.pageSize,
      pageSizeOptions: MemberDefaultValue.pageSizeOptions
    }
  }



  protected override onInitHook(): void {
    this.sharedDataService.setPageName('Members');
    this.memberList = this.initialData;
    this.searchInputData = {
      normalSearchPlaceHolder: 'Search Member Name, Email, Mobile Number, Role',
      advancedSearch: {
        searchFormFields: [
          {
            formControlName: 'firstName',
            inputModel: {
              tagName: 'input',
              inputType: 'text',
              html_id: 'firstName',
              labelName: 'First Name',
              placeholder: 'Enter First Name',
              cssInputClass: 'bg-white'
            },
          },
          {
            formControlName: 'lastName',
            inputModel: {
              tagName: 'input',
              inputType: 'text',
              html_id: 'lastName',
              labelName: 'Last Name',
              placeholder: 'Enter Last Name',
            },
          },
          {
            formControlName: 'email',
            inputModel: {
              tagName: 'input',
              inputType: 'text',
              html_id: 'email',
              labelName: 'Email',
              placeholder: 'Enter Email',
            },
          },
          {
            formControlName: 'phoneNumber',
            inputModel: {
              tagName: 'input',
              inputType: 'number',
              html_id: 'phoneNumber',
              labelName: 'Phone Number',
              placeholder: 'Enter Phone Number',
            },
          },
          {
            formControlName: 'role',
            inputModel: {
              tagName: 'select',
              inputType: 'multiselect',
              html_id: 'role',
              labelName: 'Role',
              placeholder: 'Select Role',
              selectList: this.refData?.['availableRoles']
            },
          }
        ]
      }
    };

    this.navigations = [
      {
        displayName: 'Back to Dashboard',
        routerLink: this.app_route.secured_dashboard_page.url
      }
    ]
  }

  override handlePageEvent($event: PageEvent) {
    this.pageEvent = $event;
    this.memberService.fetchMembers(this.pageNumber, this.pageSize).subscribe(data => {
      this.memberList = data!;
      if (data?.totalSize) {
        this.totalItemLength = data.totalSize;
      }
    });

  }


  onSearch($event: { advancedSearch: boolean; reset: boolean; value: any; }) {
    if ($event.advancedSearch && !$event.reset) {
      ////console.log($event.value)
      this.memberService.advancedSearch({
        email: $event.value.email,
        firstName: $event.value.firstName,
        lastName: $event.value.lastName,
        phoneNumber: $event.value.phoneNumber,
        role: $event.value.role as string[]
      }).subscribe(data => {
        this.memberList = data!
        ////console.log(this.memberList)
        if (data?.totalSize) {
          this.totalItemLength = data.totalSize;
        }
      })
    }
    else if ($event.advancedSearch && $event.reset) {
      ////console.log($event.value)
      this.memberService.fetchMembers(this.pageNumber, this.pageSize).subscribe(data => {
        this.memberList = data!;
        if (data?.totalSize) {
          this.totalItemLength = data.totalSize;
        }
      })
    }
    else {
      this.searchValue = $event.value as string;
    }
  }

}
