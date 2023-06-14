import { BsDatepickerDirective } from 'ngx-bootstrap/datepicker';
import { Directive, Self, Output, EventEmitter, Input, SimpleChanges, OnDestroy, OnChanges, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import compare from 'just-compare';
import { OnInit } from '@angular/core';

///this directive ensures that the date value will always be the moment.
@Directive({
    selector: '[timePickerMomentModifier]'
})
export class TimePickerMomentModifierDirective implements OnInit, OnDestroy, OnChanges, AfterViewInit {
    @Input() date = new EventEmitter();
    @Output() dateChange = new EventEmitter();

    subscribe: Subscription;
    lastTime: string = null;

    constructor(@Self() private bsTimePicker: BsDatepickerDirective) {
        this.subscribe = this.bsTimePicker.bsValueChange
            .subscribe((date: Date) => {
                if (!date) {
                    this.lastTime = null;
                    this.dateChange.emit(null);
                } else if ((date instanceof Date && !compare(this.lastTime, date) && date.toString() !== 'Invalid Date')) {
                    this.lastTime = `${date.getHours()}:${date.getMinutes()}`,
                    this.dateChange.emit(this.lastTime);
                }
            });
    }
    ngAfterViewInit(): void {
    }
    ngOnInit(): void {

    }

    ngOnDestroy() {
        this.subscribe.unsubscribe();
    }

    ngOnChanges({ date }: SimpleChanges) {
        if (date && date.currentValue && !compare(date.currentValue, date.previousValue)) {
            setTimeout(() => {
               //this.bsTimePicker.bsValue = `${moment(date.currentValue).toDate().getHours()}:${moment(date.currentValue).toDate().getMinutes()}`
            }, 0);
        }
    }
}
