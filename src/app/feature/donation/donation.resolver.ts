import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from "@angular/router";
import { DonationDefaultValue, donationTab } from "./donation.const";
import { DonationService } from "./donation.service";
import { CommonService } from "src/app/shared/services/common.service";
import { RefDataType } from "src/app/core/api/models";
import { of } from "rxjs";
import { DonationNewService } from "./donation-new.service";

const defaultValue = DonationDefaultValue;

export const donationDashboardResolver: ResolveFn<any> =
    async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
        //return of(true);
        const donation = inject(DonationService);
        let tab = (route.data['tab'] || defaultValue.tabName) as donationTab;
        //console.log(route)
        if (tab == 'member_donation') {
            return donation.fetchMembers(defaultValue.pageNumber, defaultValue.pageSize);
        }
        else if (tab == 'guest_donation') {
            return donation.fetchGuestDonations(defaultValue.pageNumber, defaultValue.pageSize);

        } else {
            return await donation.fetchMyDonations(defaultValue.pageNumber, defaultValue.pageSize);
        }
    };

export const donationRefDataResolver: ResolveFn<any> =
    (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
        return inject(CommonService).getRefData([RefDataType.Donation, RefDataType.User]);
    };


export const donationDashboardResolverNew: ResolveFn<any> =
    async (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
        //return of(true);
        let tab = (route.data['tab'] || defaultValue.tabName) as donationTab;
        //console.log(route)
        if (tab == 'member_donation') {
            return inject(DonationNewService).fetchMembers(defaultValue.pageNumber, defaultValue.pageSize);
        }
        else if (tab == 'guest_donation') {
            return inject(DonationNewService).fetchGuestDonations(defaultValue.pageNumber, defaultValue.pageSize);

        } else {
            console.log("fetching my donations");
            return await inject(DonationNewService).fetchMyDonations(defaultValue.pageNumber, defaultValue.pageSize);
        }
    };

export const donationRefDataResolverNew: ResolveFn<any> =
    (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
        return inject(DonationNewService).fetchRefData();
    };