import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    MstInventoryGroupServiceProxy,
    MstInventoryItemsDto,
    MstInventoryItemPriceServiceProxy,
    MstPurchasePurposeServiceProxy,
} from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { elementAt } from 'rxjs/operators';

@Component({
    selector: 'create-edit-mst-inventory-item-prices',
    templateUrl: './create-edit-mst-inventory-item-prices.component.html',
    styleUrls: ['./create-edit-mst-inventory-item-prices.component.less'],
})
export class CreateOrEditMstInventoryItemPricesComponent extends AppComponentBase implements OnInit {
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('submitBtn', { static: false }) submitBtn: ElementRef;
    @Input() selectedRow: MstInventoryItemsDto = new MstInventoryItemsDto();
    @Output() close = new EventEmitter<any>();
    @Output() updateAfterEdit = new EventEmitter<any>();
    createOrEditForm: FormGroup;
    isEditForm: boolean = false;
    isSubmit = false;
    listInventoryGroup: { label: string; value: number | undefined }[] = [];

    constructor(
        injector: Injector,
        private _mstInventoryItemPriceServiceProxy: MstInventoryItemPriceServiceProxy,
        private _mstInventoryGroupServiceProxy: MstInventoryGroupServiceProxy,
        private formBuilder: FormBuilder
    ) {
        super(injector);
    }

    ngOnInit(): void {
        // get list inventory group
        this._mstInventoryGroupServiceProxy.getAllInventoryGroup().subscribe((res) => {
            var labeladd = { label: '', value: undefined };
            this.listInventoryGroup.push(labeladd);
            res.forEach((element) => {
                this.listInventoryGroup.push({ label: element.productGroupCode, value: element.id });
            });
        });
    }

    buildForm() {
        this.createOrEditForm = this.formBuilder.group({
            id: [0],
            inventoryItemId: [undefined],
            partName: [undefined],
            organizationId: [undefined],
            inventoryGroupId: [undefined, GlobalValidator.required],
            isActive: 1,
            primaryUomCode: [undefined],
            primaryUnitOfMeasure: [undefined],
            partNo: [undefined],
            color: [undefined],
            itemType: [undefined],
        });
    }

    show(isEdit) {
        //if selectedRow is not null then it is edit mode
        if (isEdit) {
            if (!this.selectedRow) {
                this.notify.error('Please select a row to edit');
                return;
            }
            // get data by Id
        } else {
            console.log(this.isEditForm);
            this.isEditForm = false;
            this.buildForm();
        }
        this.modal.show();
    }

    closeModel() {
        this.selectedRow = null;
        this.modal.hide();
    }

    reset() {
        this.createOrEditForm = undefined;
    }

    save() {
        this.isSubmit = true;
        if (this.submitBtn) {
            this.submitBtn.nativeElement.click();
        }
        if (this.createOrEditForm.invalid) {
            return;
        }
        this.spinnerService.show();
        console.log(this.createOrEditForm.getRawValue());

        // this._mstInventoryItemsServiceProxy
        //     .createOrEditInventoryItem(this.createOrEditForm.getRawValue())
        //     .subscribe((val) => {
        //         this.notify.success('Saved Successfully');
        //         this.modal.hide();
        //         this.close.emit();
        //         this.spinnerService.hide();
        //         this.updateAfterEdit.emit();
        //     });
    }
}
