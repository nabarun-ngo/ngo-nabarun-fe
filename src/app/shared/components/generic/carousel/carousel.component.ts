import { Component, ContentChild, Input, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent {
  @Input() items: any[] = [];
  @Input() showControls: boolean = true;
  @Input() autoPlay: boolean = false;
  @Input() interval: number = 5000;

  @ContentChild(TemplateRef) templateRef!: TemplateRef<any>;

  currentIndex: number = 0;

  next() {
    if (this.currentIndex < this.items.length - 1) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0;
    }
  }

  previous() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = this.items.length - 1;
    }
  }

  goTo(index: number) {
    this.currentIndex = index;
  }
}
