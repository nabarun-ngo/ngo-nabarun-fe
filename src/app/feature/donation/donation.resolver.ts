import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from "@angular/router";
import { DonationDefaultValue, donationTab } from "./donation.const";
import { DonationService } from "./donation.service";

const defaultValue = DonationDefaultValue;

export const donationDashboardResolver: ResolveFn<any> =
    (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
        //return of(true);
        let tab = (route.data['tab'] || defaultValue.tabName) as donationTab;
        //console.log(route)
        if (tab == 'member_donation') {
            return inject(DonationService).fetchMembers(defaultValue.pageNumber, defaultValue.pageSize);
        }
        else if (tab == 'guest_donation') {
            return inject(DonationService).fetchGuestDonations(defaultValue.pageNumber, defaultValue.pageSize);

        } else {
            return inject(DonationService).fetchMyDonations(defaultValue.pageNumber, defaultValue.pageSize);
        }
    };

export const donationRefDataResolver: ResolveFn<any> =
    (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
        return inject(DonationService).fetchRefData();
    };