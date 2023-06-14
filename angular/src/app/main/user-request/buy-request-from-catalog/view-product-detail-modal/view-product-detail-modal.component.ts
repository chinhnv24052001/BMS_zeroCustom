import { DataFormatService } from '@app/shared/services/data-format.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Component, EventEmitter, Injector, Output, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GetAllCatalogProductForViewDto } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'view-product-detail-modal',
    templateUrl: './view-product-detail-modal.component.html',
    styleUrls: ['./view-product-detail-modal.component.less']
})
export class ViewProductDetailModalComponent extends AppComponentBase {
    @ViewChild('viewProductDetailModal', { static: true }) modal!: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    product: GetAllCatalogProductForViewDto = new GetAllCatalogProductForViewDto();

    qty: number | undefined;

    constructor(
        injector: Injector,
        private _dataFormatService: DataFormatService
    ) {
        super(injector);
    }

    ngOnInit() {
    }

    show(product) {
        this.product = product;
        this.qty = 1;
        this.modal!.show();
    }

    close() {
        this.modal!.hide();
    }


    addToCart() {
        this.modalSave.emit(Object.assign(this.product, { qty: Number(this.qty) }));
        this.modal!.hide();
    }

    // validate() {
    //     if (!Number(this.qty) || Number(this.qty) < 0) {
    //         this.notify.warn('Warning!');
    //         return true;
    //     }
    //     return false;
    // }

    moneyFormart(params: number) {
        return this._dataFormatService.moneyFormat(params);
    }
}
