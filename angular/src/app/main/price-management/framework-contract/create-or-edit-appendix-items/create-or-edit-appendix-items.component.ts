import { map } from 'rxjs/operators';
import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef } from '@app/shared/models/base.model';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { AppComponentBase } from '@shared/common/app-component-base';
import { PrcAppendixContractDto, PrcAppendixContractItemsDto, PrcContractTemplateServiceProxy } from '@shared/service-proxies/service-proxies';
import { forEach } from 'lodash';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
    selector: 'app-create-or-edit-appendix-items',
    templateUrl: './create-or-edit-appendix-items.component.html',
    styleUrls: ['./create-or-edit-appendix-items.component.less']
})
export class CreateOrEditAppendixItemsComponent extends AppComponentBase implements OnInit {
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('submitBtn', { static: false }) submitBtn: ElementRef;
    @Input() selectedRow: PrcAppendixContractDto = new PrcAppendixContractDto();
    @Input() listData: PrcAppendixContractDto [];
    @Output() close = new EventEmitter<any>();
    @Output() updateAfterEdit = new EventEmitter<any>();
    createOrEditForm: FormGroup;
    isEditForm: boolean = false;
    isSubmit = false;
    listVendor;
    listAppen;
    itemsColdef: CustomColDef[];
    defaultColDef = {
        floatingFilter: true,
        filter: "agTextColumnFilter",
        resizable: true,
        sortable: true,
        isViewSideBar: false,
        floatingFilterComponentParams: { suppressFilterButton: true },
        textFormatter: function (r) {
            if (r == null) return null;
            return r.toLowerCase();
        },
    };
    constructor(
        injector: Injector,
        private _serviceProxy: PrcContractTemplateServiceProxy,
        private formBuilder: FormBuilder,
        private dataFormatService: DataFormatService
    ) {
        super(injector);
        this.itemsColdef = [
            {
                headerName: this.l('PartNo'),
                headerTooltip: this.l('PartNo'),
                field: 'partNo',
                cellClass: ['text-center'],
                width: 95,
            },
            {
                headerName: this.l('PartName'),
                headerTooltip: this.l('PartName'),
                field: 'partName',
                cellClass: ['text-left'],
                width: 135,
            },
            {
                headerName: this.l('Color'),
                headerTooltip: this.l('Color'),
                field: 'color',
                cellClass: ['text-left'],
                width: 65,
            },
            {
                headerName: this.l('PartNameSupplier'),
                headerTooltip: this.l('PartNameSupplier'),
                field: 'partNameSupplier',
                cellClass: ['text-left'],
                width: 135,
            },
            {
                headerName: this.l('UnitPrice'),
                headerTooltip: this.l('UnitPrice'),
                field: 'unitPrice',
                cellClass: ['text-right'],
                width: 80,
                valueFormatter: params => params.data ? this.dataFormatService.floatMoneyFormat(params.value) : "",

            },
            {
                headerName: this.l('TaxPrice'),
                headerTooltip: this.l('TaxPrice'),
                field: 'taxPrice',
                cellClass: ['text-right'],
                width: 80,
                valueFormatter: params => params.data ? this.dataFormatService.floatMoneyFormat(params.value) : "",

            },
            {
                headerName: this.l('CurrencyCode'),
                headerTooltip: this.l('CurrencyCode'),
                field: 'currencyCode',
                cellClass: ['text-center'],
                width: 80,
            },

        ]
    }

    ngOnInit(): void {

    }

    buildForm(contractNo,contractDate,effectiveFrom) {
        this.createOrEditForm = this.formBuilder.group({
            id: [0],
            appendixNo: [undefined],
            appendixDate: contractDate,
            effectiveFrom: effectiveFrom,
            effectiveTo: [undefined],
            description: [undefined],
            contractId: [undefined],
            supplierId: [undefined],
            contractNo: contractNo,
            signer_By : [undefined],

        });
    }

    create(contractNo,contractDate,effectiveFrom) {
        this.listAppen = this.listData;
        this.isEditForm = false;
        this.getCache();
        this.buildForm(contractNo,contractDate,effectiveFrom);
        this.modal.show();
    }

    closeModel() {
        if (!this.isEditForm) {
            this.selectedRow = null;
        }
        this.modal.hide();
    }

    reset() {
        this.createOrEditForm = undefined;
    }

    save() {
        if(this.validate()){
            this.updateAfterEdit.emit(this.createOrEditForm.getRawValue());
            this.modal.hide();
        }
    }
    validate() {
        if(this.createOrEditForm.get('appendixNo').value == undefined || this.createOrEditForm.get('appendixNo').value == null || this.createOrEditForm.get('appendixNo').value == ''){
            this.notify.warn(this.l('RequiredField',this.l('AppendixNo')));
            return false;
        }
        if(this.listAppen.map(x => x.appendixNo).includes(this.createOrEditForm.get('appendixNo').value)){
            this.notify.warn(this.l('IsAlreadyExisted',this.l('AppendixNo')));
            return false;
        }
        if(this.createOrEditForm.get('appendixDate').value == undefined || this.createOrEditForm.get('appendixDate').value == null || this.createOrEditForm.get('appendixDate').value == ''){
            this.notify.warn(this.l('RequiredField',this.l('AppendixDate')));
            return false;
        }
        if(this.createOrEditForm.get('effectiveFrom').value == undefined || this.createOrEditForm.get('effectiveFrom').value == null || this.createOrEditForm.get('effectiveFrom').value == ''){
            this.notify.warn(this.l('RequiredField',this.l('EffectiveFrom')));
            return false;
        }
        if(this.createOrEditForm.get('effectiveTo').value != null && this.createOrEditForm.get('effectiveTo').value < this.createOrEditForm.get('effectiveFrom').value){
            this.notify.warn(this.l('DateInvalid',this.l('EffectiveTo'),this.l('EffectiveFrom')));
            return false;
        }
        return true;
    }
    getCache() {
        this.listVendor = [];
        this._serviceProxy.getAllVendor().subscribe(res => {
            forEach(res, (item) => {
                this.listVendor.push({ label: item.supplierName, value: item.id });
            });
        })
    }

}
