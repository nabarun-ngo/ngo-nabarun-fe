import { inject } from "@angular/core";
import { ResolveFn } from "@angular/router";
import { CommonService } from "src/app/shared/services/common.service";

export const helpResolver: ResolveFn<any> = (route, state) => {
  return inject(CommonService).getUsefulLink();
};