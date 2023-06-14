import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class EventBusService {
    private event = new Subject<any>();

    emit(data: any) {
        this.event.next(data);
    }

    on(eventType: (any)): Observable<any> {
        return this.event.pipe(filter(t => t.type === eventType));
    }

    clearObservers() {
        this.event.observers = [];
    }
}