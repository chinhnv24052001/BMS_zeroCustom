import { Component, EventEmitter, forwardRef, Injector, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AppComponentBase } from '@shared/common/app-component-base';
import { extend, result } from 'lodash';

@Component({
  selector: 'tmss-multiSelect',
  templateUrl: './tmss-multiselect.component.html',
  styleUrls: ['./tmss-multiselect.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TmssMultiselectComponent),
      multi: true
    }]
})
export class TmssMultiselectComponent extends AppComponentBase implements ControlValueAccessor {
  @Input() options: [];
  @Input() text;
  @Input() selectedItems = [];
  @Input() isRequire: boolean = false;
  @Input() isDisabled: boolean = false;
  @Input() textClass: string = "col-md-4";
  @Input() labelClass: string = "col-md-8";
  @Input() defaultLabel: string = "Choose";
  @Output() onChangeValue = new EventEmitter();
  private onChange: Function = new Function();
  constructor(
    injector: Injector
  ) {
    super(injector)
  }

  writeValue(val: any): void {
    this.selectedItems = val ?? ""
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void { }

  changeValue(e: any) {
    if (typeof this.onChange === 'function') {
      this.onChange(this.selectedItems);
    }
    this.onChangeValue.emit(this.selectedItems);
  }
}
