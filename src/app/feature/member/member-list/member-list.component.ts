import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MemberService } from '../member.service';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { KeyValue, PaginateUserDetail } from 'src/app/core/api/models';
import { MemberDefaultValue } from '../member.const';
import { PageEvent } from '@angular/material/paginator';
import { BehaviorSubject, Observable } from 'rxjs';
import { Paginator } from 'src/app/shared/utils/paginator';
import { FormGroup } from '@angular/forms';
import { UniversalInputModel } from 'src/app/shared/model/universal-input.model';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/model/search-and-advanced-search.model';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { MemberSearchPipe } from '../member.pipe';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.scss']
})
export class MemberListComponent extends Paginator implements OnInit {

  memberList!: PaginateUserDetail;
  searchValue!: string;
  refData!: { [key: string]: KeyValue[]; };
  protected app_route = AppRoute;

  searchInputData!: SearchAndAdvancedSearchModel;
  navigations!: NavigationButtonModel[];

  constructor(
    private sharedDataService: SharedDataService,
    private route: ActivatedRoute,
    private memberService: MemberService
  ) {
    super();
    super.init(MemberDefaultValue.pageNumber, MemberDefaultValue.pageSize, MemberDefaultValue.pageSizeOptions)
  }



  ngOnInit(): void {

    this.sharedDataService.setPageName('MEMBERS');

    if (this.route.snapshot.data['ref_data']) {
      this.refData = this.route.snapshot.data['ref_data'];
      this.sharedDataService.setRefData('USER', this.refData);
      // console.log(refData)
    }

    if (this.route.snapshot.data['data']) {
      this.memberList = this.route.snapshot.data['data'] as PaginateUserDetail;
      this.itemLengthSubs.next(this.memberList?.totalSize!);
      //console.log(this.memberList)
    }

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
              selectList: this.refData['availableRoles']
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

  handlePageEvent($event: PageEvent) {
    this.pageNumber = $event.pageIndex;
    this.pageSize = $event.pageSize;
    this.memberService.fetchMembers(this.pageNumber, this.pageSize).subscribe(data => {
      this.memberList = data!;
      this.itemLengthSubs.next(data?.totalSize!);
    });

  }


  onSearch($event: { advancedSearch: boolean; reset: boolean; value: any; }) {
    if ($event.advancedSearch && !$event.reset) {
      console.log($event.value)
      this.memberService.advancedSearch({
        email: $event.value.email,
        firstName: $event.value.firstName,
        lastName: $event.value.lastName,
        phoneNumber: $event.value.phoneNumber,
        role: $event.value.role
      }).subscribe(data => this.memberList = data!)
    }
    else if ($event.advancedSearch && $event.reset) {
      console.log($event.value)
      this.memberService.fetchMembers(this.pageNumber, this.pageSize).subscribe(data => this.memberList = data!)
    }
    else {
      this.searchValue = $event.value as string;
    }
  }

}
