import { Directive, Input, EventEmitter, Output,
  OnDestroy, OnChanges, SimpleChanges, Self } from '@angular/core';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import compare from 'just-compare';
import { Calendar } from 'primeng/calendar';

@Directive({
  selector: '[pCalendarMomentModifier]'
})
export class PCalendarMomentModifierDirective implements OnDestroy, OnChanges  {
  @Input() date = new EventEmitter();
  @Output() dateChange = new EventEmitter();

  subscribe: Subscription;
  subscribeOnBlur: Subscription;
  lastDate: Date = null;

  constructor(@Self() private pcalendar: Calendar) {
    this.subscribe = pcalendar.onSelect
      .subscribe((date: Date) => {
        if (!date) {
            this.lastDate = null;
            this.dateChange.emit(null);
        } else if ((date instanceof Date && !compare(this.lastDate, date) && date.toString() !== 'Invalid Date')) {
            this.lastDate = date;
            this.dateChange.emit(date); // Auto convert from Date to Moment?
        }
    });

    // Error: Input dd/mm/yy. But Edit DD/MM/YYYY HH:mm ....
    // this.subscribeOnBlur = pcalendar.onBlur
    //   .subscribe((fe: FocusEvent) => {
    //     // debugger;
    //     if (!fe) {
    //       this.lastDate = null;
    //       this.dateChange.emit(null);
    //     } else if (moment(fe.currentTarget.value, pcalendar.dateFormat.toUpperCase(), true).isValid()) {
    //       // debugger;
    //       let date = moment(fe.currentTarget.value, pcalendar.dateFormat.toUpperCase(), true).toDate();
    //       if ((date instanceof Date && !compare(this.lastDate, date) && date.toString() !== 'Invalid Date')) {
    //         this.lastDate = date;
    //         this.dateChange.emit(date);
    //       }
    //     }
    //   });

    // TODO: Add for others events: onInput, ....
  }

  ngOnDestroy(): void {
    this.subscribe.unsubscribe();
  }

  ngOnChanges({ date }: SimpleChanges): void {
    if (date && date.currentValue && !compare(date.currentValue, date.previousValue)) {
      setTimeout(() => {
        this.pcalendar.writeValue(moment(date.currentValue).toDate());
      }, 0);
    }
  }
}