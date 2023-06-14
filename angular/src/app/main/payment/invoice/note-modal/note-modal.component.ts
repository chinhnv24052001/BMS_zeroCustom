import { finalize } from 'rxjs/operators';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Component, Injector, Output, ViewChild, EventEmitter } from '@angular/core';
import { InvoiceServiceProxy } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'note-modal',
    templateUrl: './note-modal.component.html',
    styleUrls: ['./note-modal.component.less']
})
export class NoteModalComponent extends AppComponentBase {
    @ViewChild('noteModal', { static: true }) modal!: ModalDirective;

    @Output() modalClose: EventEmitter<any> = new EventEmitter();
    @Output() modalSave: EventEmitter<any> = new EventEmitter();

    reason: string = '';
    cancelReasons: { label: string, value: string }[] = [];

    constructor(
        injector: Injector,
        private _serviceProxy: InvoiceServiceProxy
    ) {
        super(injector);
    }

    ngOnInit() {
        this.getAllCancelReason();
    }

    show() {
        this.reason = '';
        this.modal.show();
    }

    close() {
        this.modal.hide();
        this.modalClose.emit(null);
    }

    confirm() {
        this.modalSave.emit(this.reason);
        this.modal.hide();
    }

    getAllCancelReason() {
        this.cancelReasons = [];
        this.spinnerService.show();
        this._serviceProxy.getAllCancelReasonForInvoice()
        .pipe(finalize(() => this.spinnerService.hide()))
        .subscribe(res => {
            res.map(r => this.cancelReasons.push({
                label: r.name,
                value: r.name
            }))
        })
    }
}
