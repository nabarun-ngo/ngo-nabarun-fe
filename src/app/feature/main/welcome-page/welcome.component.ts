import { Component, HostListener, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class WelcomeComponent implements OnInit {
  ngOnInit(): void {
  }

  protected classNames: string = '';
  protected showTop: boolean = true;
  @HostListener('window:scroll', [])
  onScroll() {
    if (window.innerWidth < 992) {
      this.classNames = window.scrollY > 45 ? 'bg-dark shadow' : '';
    } else {
      this.classNames = window.scrollY > 45 ? 'bg-dark shadow top45' : 'top0';
    }
    this.showTop = window.scrollY < 45;

  }

}
