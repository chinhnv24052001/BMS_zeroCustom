import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[addonWidth]',
})
export class AddonWidthDirective implements OnInit {
  @Input() addonWidth;

  constructor(private elem: ElementRef) {

  }

  ngOnInit() {
    this.elem.nativeElement.style.minWidth = this.addonWidth;
  }
}
