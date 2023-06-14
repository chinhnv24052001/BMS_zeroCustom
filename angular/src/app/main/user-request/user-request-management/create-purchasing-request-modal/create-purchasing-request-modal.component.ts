import { CustomColDef } from '@app/shared/models/base.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Component, Injector, ViewChild } from '@angular/core';

@Component({
    selector: 'create-purchasing-request-modal',
    templateUrl: './create-purchasing-request-modal.component.html',
    styleUrls: ['./create-purchasing-request-modal.component.less']
})
export class CreatePurchasingRequestModalComponent extends AppComponentBase {
    @ViewChild('createPurchasingRequestModal') modal!: ModalDirective;

    createPRForm: FormGroup;

    prDetailsColDef: CustomColDef[] = [];
    defaultColDef: CustomColDef;

    constructor(
        injector: Injector,
        private _formBuilder: FormBuilder
    ) {
        super(injector);
        this.prDetailsColDef = [
            {
                // STT
                headerName: this.l('No.'),
                headerTooltip: this.l('No.'),
                width: 50,
            },
            {
                headerName: this.l('Type'),
                headerTooltip: this.l('Type'),
                field: '',
                cellClass: ['cell-border', 'custom-grid-text', 'custom-grid-cbb-text', 'cell-clickable'],
                width: 100,
                validators: ['required'],
                //   cellRenderer: 'agDropdownRendererComponent',
                //   list: () => { return this.listLineTypes.map(e => Object.assign({}, { key: e.value, value: e.label })) },
            },
            {
                headerName: this.l('PartNo'),
                headerTooltip: this.l('PartNo'),
                field: '',
                cellClass: (params) => (params.data?.lineTypeId === 1) ? ['cell-clickable', 'cell-border'] : ['cell-border'],
                editable: (params) => params.data?.lineTypeId === 1,
                width: 100,
            },
            {
                headerName: this.l('PartName'),
                headerTooltip: this.l('PartName'),
                field: '',
                cellClass: ['cell-clickable', 'cell-border'],
                editable: true,
                validators: ['required'],
                width: 200,
            },
            {
                headerName: this.l('Category'),
                headerTooltip: this.l('Category'),
                field: '',
                cellClass: ['cell-clickable', 'cell-border'],
                editable: true,
                validators: ['required'],
                width: 70,
            },
            {
                headerName: this.l('ItemDescription'),
                headerTooltip: this.l('ItemDescription'),
                field: '',
                cellClass: ['cell-clickable', 'cell-border'],
                editable: true,
                width: 200,
            },
            {
                headerName: this.l('UOM'),
                headerTooltip: this.l('UOM'),
                field: '',
                cellClass: (params) => (params.data?.lineTypeId === 1) ? ['cell-clickable', 'cell-border'] : ['cell-border'],
                editable: (params) => params.data?.lineTypeId === 1,
                width: 80,
                validators: ['required'],
            },
            {
                headerName: this.l('Quantity'),
                headerTooltip: this.l('Quantity'),
                field: '',
                editable: true,
                cellClass: ['cell-clickable', 'cell-border', 'text-right'],
                width: 80,
                validators: ['required', 'floatNumber'],
            },
            {
                headerName: this.l('Price'),
                headerTooltip: this.l('Price'),
                field: '',
                editable: true,
                validators: ['floatNumber'],
                cellClass: ['cell-clickable', 'cell-border', 'text-right'],
                width: 70,
            },
            {
                headerName: this.l('Amount'),
                headerTooltip: this.l('Amount'),
                field: '',
                cellClass: ['cell-border', 'text-right'],
                width: 70,
            },
            {
                headerName: this.l('NeedByDate'),
                headerTooltip: this.l('NeedByDate'),
                field: 'needByDate',
                // valueGetter: params => this.dataFormatService.dateFormat(params.data.needByDate),
                cellClass: ['cell-clickable', 'cell-border'],
                editable: true,
                width: 150,
                cellRenderer: 'agDatepickerRendererComponent'
            },
            {
                headerName: this.l('Remark'),
                headerTooltip: this.l('Remark'),
                field: 'attribute10',
                cellClass: ['cell-border'],
                editable: true,
                width: 200,
            },
            {
                headerName: this.l('ForeCast'),
                headerTooltip: this.l('ForeCast'),
                children: [
                    {
                        headerName: this.l('ForecastN'),
                        headerTooltip: this.l('ForecastN'),
                        field: 'attribute9',
                        cellClass: ['cell-border'],
                        width: 70,
                        editable: true,
                    },
                    {
                        headerName: this.l('ForecastN1'),
                        headerTooltip: this.l('ForecastN1'),
                        field: 'attribute12',
                        cellClass: ['cell-border'],
                        width: 70,
                        editable: true,
                    },
                    {
                        headerName: this.l('ForecastN2'),
                        headerTooltip: this.l('ForecastN2'),
                        field: 'attribute14',
                        cellClass: ['cell-border'],
                        width: 70,
                        editable: true,
                    },
                    {
                        headerName: this.l('ForecastN3'),
                        headerTooltip: this.l('ForecastN3'),
                        field: 'attribute15',
                        cellClass: ['cell-border'],
                        width: 70,
                        editable: true,
                    },
                ]
            }
        ];
    }

    ngOnInit() {
    }

    show() {
        this.buildForm();
        this.modal.show();
    }

    close() {
        this.modal.hide();
    }

    reset() {
        this.createPRForm = undefined;
    }

    buildForm() {
        this.createPRForm = this._formBuilder.group({
            prNumber: [''],
            preparer: [''],
            division: [''],
            status: [''],
            email: [''],
            department: [''],
            inventoryGroup: [''],
            description: ['']
        })
    }

}
