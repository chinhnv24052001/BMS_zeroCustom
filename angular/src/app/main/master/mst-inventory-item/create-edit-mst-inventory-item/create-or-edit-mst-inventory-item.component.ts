import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    MstInventoryGroupServiceProxy,
    MstInventoryItemsDto,
    MstInventoryItemsServiceProxy,
    MstPurchasePurposeServiceProxy,
} from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { elementAt, finalize } from 'rxjs/operators';

@Component({
    selector: 'create-or-edit-mst-inventory-item',
    templateUrl: './create-or-edit-mst-inventory-item.component.html',
    styleUrls: ['./create-or-edit-mst-inventory-item.component.less'],
})
export class CreateOrEditMstInventoryItemComponent extends AppComponentBase implements OnInit {
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
        private _mstInventoryItemsServiceProxy: MstInventoryItemsServiceProxy,
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
            partCode: [undefined],
            partNameSupplier: [undefined],
            unitPrice: [undefined],
            supplierName: [undefined],
            currencyCode: [undefined],
            taxPrice: [undefined],
            color: [undefined],
            itemType: [undefined],
            effectiveFrom: [undefined],
            effectiveTo: [undefined],
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

            this.isEditForm = true;
            // add selectedRow to form
            this.createOrEditForm = this.formBuilder.group({
                id: this.selectedRow.id,
                inventoryItemId: this.selectedRow.inventoryItemId,
                partName: this.selectedRow.partName,
                organizationId: this.selectedRow.organizationId,
                inventoryGroupId: this.selectedRow.inventoryGroupId,
                primaryUomCode: this.selectedRow.primaryUomCode,
                primaryUnitOfMeasure: this.selectedRow.primaryUnitOfMeasure,
                partNo: this.selectedRow.partNo,
                partCode: this.selectedRow.partCode,
                color: this.selectedRow.color,
                partNameSupplier: this.selectedRow.partNameSupplier,
                unitPrice: this.selectedRow.unitPrice,
                supplierName: this.selectedRow.supplierName,
                currencyCode: this.selectedRow.currencyCode,
                taxPrice: this.selectedRow.taxPrice,
                itemType: this.selectedRow.itemType,
                effectiveFrom: this.selectedRow.effectiveFrom,
                effectiveTo: this.selectedRow.effectiveTo,
            });
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

        this._mstInventoryItemsServiceProxy
            .createOrEditInventoryItem(this.createOrEditForm.getRawValue())
            .subscribe((val) => {
                this.notify.success('Saved Successfully');
                this.modal.hide();
                this.close.emit();
                this.spinnerService.hide();
                this.updateAfterEdit.emit();
            });
    }
}
