import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GridParams } from '@app/shared/models/base.model';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { InvoiceServiceProxy } from '@shared/service-proxies/service-proxies';
import { forEach } from 'lodash-es';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-import-po-items',
  templateUrl: './import-po-items.component.html',
  styleUrls: ['./import-po-items.component.less']
})
export class ImportPoItemsComponent extends AppComponentBase implements OnInit {
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('submitBtn', { static: false }) submitBtn: ElementRef;
    @Output() close = new EventEmitter<any>();
    @Output() updateAfterEdit = new EventEmitter<any>();
    createOrEditForm: FormGroup;
    isEditForm: boolean = false;
    paginationParams = { pageNum: 1, pageSize: 5000, totalCount: 0 };
    isSubmit = false;
    listHeader//: SearchInvoiceOutputDto[] = [];
    defaultColDef = {
        flex: false,
        floatingFilter: false,
        filter: 'agTextColumnFilter',
        resizable: true,
        sortable: true,
        floatingFilterComponentParams: { suppressFilterButton: true },
        textFormatter: function (r) {
            if (r == null) return null;
            return r.toLowerCase();
        },
    };
    listError;
    columnDef;
    poColDef;
    fileName;
    uploadDataParams: GridParams;
    isSave = false;
    constructor(
        injector: Injector,
        private _serviceProxy: InvoiceServiceProxy,
        private formBuilder: FormBuilder,
        private _http: HttpClient,
        private dataFormatService: DataFormatService

    ) {
        super(injector);
        this.poColDef = [
            {
                headerName: this.l("No."),
                headerTooltip: "No.",
                cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
                field: "stt",
                pinned: true,
                width: 60,
            },
            {
                headerName: this.l("Error"),
                headerTooltip: this.l("Error"),
                field: "errDescription",
                width: 120,
                cellClass: ['text-center'],
                cellStyle: (params) => {
                    if (params.value != null) {
                        return { 'background-color': '#f77878' };
                    } else {
                        return '';
                    }
                }
            },
            {
                headerName: this.l('PoNumber'),
                field: 'poNumber',
                sortable: true,
                width: 130,
            },
            {
                headerName: this.l('PartNo'),
                field: 'partNo',
                sortable: true,
                width: 130,
            },
            {
                headerName: this.l('SupplierName'),
                field: 'supplierName',
                sortable: true,
                width: 220,
            },
            {
                headerName: this.l('UnitPrice'),
                field: 'unitPrice',
                cellClass: ['text-center'],
                valueFormatter: params => params.data ? this.dataFormatService.moneyFormat(params.value) : "",
                sortable: true,
                width: 100,
            },
            {
                headerName: this.l('Quantity'),
                field: 'quantity',
                valueFormatter: params => params.data ? this.dataFormatService.moneyFormat(params.value) : "",
                sortable: true,
                cellClass: ['text-center'],
                width: 120,
            },
            {
                headerName: this.l('QtyRemain'),
                field: 'qtyRemain',
                sortable: true,
                valueFormatter: params => params.data ? this.dataFormatService.moneyFormat(params.value) : "",
                width: 160,
            },
            {
                headerName: this.l('InvoicePrice'),
                field: 'invoicePrice',
                sortable: true,
                valueFormatter: params => params.data ? this.dataFormatService.moneyFormat(params.value) : "",
                width: 100,
            },
        ];
    }

    ngOnInit(): void {

    }

    buildForm() {
        this.createOrEditForm = this.formBuilder.group({
            fileName: [undefined],
        });
    }

    show() {
        this.isEditForm = false;
        this.refresh();
        this.buildForm();
        this.modal.show();
    }

    closeModel() {
        this.listHeader = [];
        this.modal.hide();
    }

    reset() {
        this.createOrEditForm = undefined;
    }

    save() {
        if(this.isSave){
            this.isSubmit = true;
            if (this.submitBtn) {
                this.submitBtn.nativeElement.click();
            }
            if (this.createOrEditForm.invalid) {
                return;
            }
            this.listHeader.forEach(item => {
                item.quantityMatched = 0;
            });
           this.updateAfterEdit.emit(this.listHeader);
           this.closeModel();
        }else
        {
            this.notify.error(this.l("Please check the data error before confilm!"));
        }
    }

    formData: any;
    uploadSubImage() {
        let input = document.createElement('input');
        input.type = 'file';
        input.className = 'd-none';
        input.id = 'imgInput';
        input.multiple = true;
        input.onchange = () => {
            let files = Array.from(input.files);
            this.onUpload(files);
        };
        input.click();
    }
    uploadData;
    onUpload(files: Array<any>): void {
        if (files.length > 0) {
            this.formData = new FormData();
            const formData: FormData = new FormData();
            const file = files[0];
            this.fileName = file?.name;
            formData.append('file', file, file.name);
            this.formData = formData;
        }
        this.createOrEditForm.get('fileName').setValue(this.fileName);
    }

    uploadUrl = `${AppConsts.remoteServiceBaseUrl}/InvoiceImport/ImportPOLinesFromExcel`;

    import() {
        this.isSave = true;
        this.spinnerService.show();
        this._http
            .post<any>(this.uploadUrl, this.formData)
            .pipe(finalize(() => {
                forEach(this.listHeader, (item) => {
                    if (item.errDescription != null) {
                        this.isSave = false;
                    }

                });
                this.spinnerService.hide();
            }))
            .subscribe(response => {
                this.listHeader = response.result.poLine;

            });
    }

    refresh() {
        this.listHeader = [];
        this.createOrEditForm?.get('fileName').setValue('');
    }

    callBackGrid(event) {
        this.uploadDataParams = event;
    }
}
