import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { Component, ElementRef, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AgCheckboxRendererComponent } from '@app/shared/common/grid-input-types/ag-checkbox-renderer/ag-checkbox-renderer.component';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GetPrepaymentDto, InvoiceHeadersDto, InvoiceLinesDto, InvoicesServiceProxy, PaymentHeadersServiceProxy, SearchInvoiceOutputDto } from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { ceil } from 'lodash-es';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'apply-prepayment',
    templateUrl: './apply-prepayment.component.html',
    styleUrls: ['./apply-prepayment.component.less']
})
export class ApplyPrepaymentComponent extends AppComponentBase implements OnInit {
    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
    @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
    @Output() close = new EventEmitter<any>();
    gridParams: GridParams | undefined;
    paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };

    createOrEditForm: FormGroup;
    isEdit = true;
    inputText2Value = "";
    inputText2 = "";
    isSubmit = false;
    selectedInvoice: SearchInvoiceOutputDto = new SearchInvoiceOutputDto();
    selectedRow: GetPrepaymentDto;
    listItem: GetPrepaymentDto[];
    gridColDef: CustomColDef[];
    frameworkComponents;

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private dataFormatService : DataFormatService,
        private _service: PaymentHeadersServiceProxy,
    ) {
        super(injector);
        this.frameworkComponents = {
            agCheckboxRendererComponent: AgCheckboxRendererComponent,
          };
    }

    ngOnInit(): void {
        this.gridColDef = [
            {
                headerName: this.l(''),
                headerTooltip: this.l(''),
                field: 'checked',
                cellRenderer: 'agCheckboxRendererComponent',
                data: [true, false],
                cellClass: ['cell-border', 'text-center'],
                width: 50,
            },
            {
                // STT
                headerName: this.l('STT'),
                headerTooltip: this.l('STT'),
                cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
                width: 50,
            },
            {
                headerName: this.l('PoNo'),
                headerTooltip: this.l('PoNo'),
                field: 'poNo',
                width: 100,
            },
            {
                headerName: this.l('Amount'),
                headerTooltip: this.l('Amount'),
                field: 'amount',
                valueFormatter: param => param.data ? this.dataFormatService.moneyFormat(param.data.amount) : "",
                width: 150,

            },
            {
                headerName: this.l('AdvancedDate'),
                headerTooltip: this.l('AdvancedDate'),
                field: 'advancedDate',
                valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.advancedDate) : "",
                width: 150,
            },
            {
                headerName: this.l('SupplierName'),
                headerTooltip: this.l('SupplierName'),
                field: 'supplierName',
                width: 300,
            },

        ];

    }

    buildForm() {
        this.createOrEditForm = this.formBuilder.group({
            id: [0],
            unitOfMeasure: [undefined, GlobalValidator.required],
            uomCode: [undefined, GlobalValidator.required],
            uomClass: [undefined, GlobalValidator.required],
            description: [undefined],
        });
    }

    show(data: SearchInvoiceOutputDto) {
        this.buildForm();
        if (data && data.id > 0) {
            console.log(11122);

            this.selectedInvoice = data;
            this.spinnerService.show();
            this.isEdit = true;
            this._service.getAllPrepaymentForInvoices(
                "",
                this.selectedInvoice.vendorId,
                this.selectedInvoice.vendorSiteId,
                this.selectedInvoice.id,
                (this.paginationParams ? this.paginationParams.sorting : ''),
                (this.paginationParams ? this.paginationParams.pageSize : 100),
                (this.paginationParams ? this.paginationParams.skipCount : 1)
            ).subscribe(val => {
                this.listItem = val.items;
                this.paginationParams.totalCount = val.totalCount;
                this.paginationParams.totalPage = ceil(this.paginationParams.totalCount / this.paginationParams.pageSize);
                //this.createOrEditForm.patchValue(val);
                this.spinnerService.hide();
            });
        }
        else {
            this.isEdit = false;
        }
        this.modal.show();
    }

    closeModel() {
        this.modal.hide();
    }

    reset() {
        this.createOrEditForm = undefined;
    }
    changePaginationParams(paginationParams: PaginationParamsModel) {
        if (!this.listItem) {
            return;
        }
        this.paginationParams = paginationParams;
        this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
        this.paginationParams.pageSize = paginationParams.pageSize;
    }
    callBackGrid(params: GridParams) {
        this.gridParams = params;
        params.api.setRowData([]);
    }
    onChangeSelection(params) {
        this.selectedRow =  params.api.getSelectedRows()[0] ?? new GetPrepaymentDto();
        this.selectedRow = Object.assign({}, this.selectedRow);
    }


    save() {
        this.spinnerService.show();
        this._service.applyPrepaymentForInvoices(this.selectedInvoice.id, this.listItem)
        .pipe(finalize(() => {
            this.spinnerService.hide();
            this.modal.hide();
        }))
        .subscribe(val => {
          this.notify.success(this.l(AppConsts.CPS_KEYS.Saved_Successfully));
          this.close.emit();
        });
    }
}
