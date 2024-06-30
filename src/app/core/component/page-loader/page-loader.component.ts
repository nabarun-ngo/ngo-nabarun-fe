import { Component, OnInit } from '@angular/core';
import { UserIdentityService } from '../../service/user-identity.service';
import { SharedDataService } from '../../service/shared-data.service';

@Component({
  selector: 'app-loader',
  template: `
<div class="flex justify-center items-center">
    <p class="center blink-one">
        <img src="/assets/logo.png" alt="Logo" width="250" height="150">
    </p>
</div>
<div class="flex justify-center items-center text-center text-xl font-semibold text-white">Please wait, Things are getting ready...</div>

  `,
})
export class PageLoaderComponent implements OnInit {

  constructor() {}

  ngOnInit(): void {}

}
