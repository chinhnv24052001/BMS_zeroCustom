import { DateTime } from 'luxon';
import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GridParams } from '@app/shared/models/base.model';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { PrcAppendixContractDto, PrcAppendixContractInsertDto, PrcAppendixContractItemsDto, PrcContractTemplateDto, PrcContractTemplateImportDto, PrcContractTemplateImportMultipleDto, PrcContractTemplateServiceProxy } from '@shared/service-proxies/service-proxies';
import { forEach, trim } from 'lodash-es';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-import-multiple-contract',
    templateUrl: './import-multiple-contract.component.html',
    styleUrls: ['./import-multiple-contract.component.less']
})
export class ImportMultipleContractComponent extends AppComponentBase implements OnInit {
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('submitBtn', { static: false }) submitBtn: ElementRef;
    @Output() close = new EventEmitter<any>();
    @Output() updateAfterEdit = new EventEmitter<any>();
    createOrEditForm: FormGroup;
    isEditForm: boolean = false;
    paginationParams = { pageNum: 1, pageSize: 5000, totalCount: 0 };
    isSubmit = false;
    listItems: PrcContractTemplateImportDto[] = [];
    listContract: PrcContractTemplateDto[] = [];
    inputInsert: PrcContractTemplateImportMultipleDto = new PrcContractTemplateImportMultipleDto();
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
    contractColDef;
    fileName;
    uploadDataParams: GridParams;
    isSave = false;
    constructor(
        injector: Injector,
        private _serviceProxy: PrcContractTemplateServiceProxy,
        private formBuilder: FormBuilder,
        private _http: HttpClient,
        private dataFormatService: DataFormatService

    ) {
        super(injector);
        this.contractColDef = [
            {
                headerName: this.l('STT'),
                headerTooltip: this.l('STT'),
                cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
                width: 60,
                cellClass: 'text-center',
            },
            {
                headerName: this.l("Error"),
                headerTooltip: this.l("Error"),
                field: "erroR_DESCRIPTION",
                width: 120,
                cellClass: ['text-center'],
                cellStyle: (params) => {
                    if (params.value != '') {
                        return { 'background-color': '#f77878' };
                    } else {
                        return '';
                    }
                }
            },
            {
                headerName: this.l('ContractNo'),
                field: 'contractNo',
                width: 120,
            },
            {
                headerName: this.l('ContractAppendixNo'),
                field: 'contractAppendixNo',
                width: 120,
            },
            {
                headerName: this.l('ContractDate'),
                field: 'contractDateStr',
                valueGetter: param => param.data ? this.dataFormatService.dateFormat(param.data.contractDateStr) : "",
                width: 120,
                cellClass: 'text-center',
            },
            {
                headerName: this.l('EffectiveFrom'),
                field: 'effectiveFromStr',
                valueGetter: param => param.data ? this.dataFormatService.dateFormat(param.data.effectiveFromStr) : "",
                width: 125,
                cellClass: 'text-center',
            },
            {
                headerName: this.l('EffectiveTo'),
                field: 'effectiveToStr',
                valueGetter: param => param.data ? this.dataFormatService.dateFormat(param.data.effectiveToStr) : "",
                width: 115,
                cellClass: 'text-center',
            },
            {
                headerName: this.l('AppendixDate'),
                field: 'appendixDateStr',
                valueGetter: param => param.data ? this.dataFormatService.dateFormat(param.data.appendixDateStr) : "",
                width: 120,
                cellClass: 'text-center',
            },

            {
                headerName: this.l('EffectiveFromStrAppendix'),
                field: 'effectiveFromStrAppendix',
                valueGetter: param => param.data ? this.dataFormatService.dateFormat(param.data.effectiveFromStrAppendix) : "",
                width: 125,
                cellClass: 'text-center',
            },
            {
                headerName: this.l('EffectiveToStrAppendix'),
                field: 'effectiveToStrAppendix',
                valueGetter: param => param.data ? this.dataFormatService.dateFormat(param.data.effectiveToStrAppendix) : "",
                width: 115,
                cellClass: 'text-center',
            },

            {
                headerName: this.l('SupplierName'),
                field: 'supplierName',
                width: 165,
                cellClass: 'text-center',
            },
            {
                headerName: this.l('InventoryGroup'),
                field: 'productGroupName',
                width: 115,
                cellClass: 'text-center',
            },
            {
                headerName: this.l('PaymentTerms'),
                field: 'paymentermsName',
                width: 145,
                cellClass: 'text-center',
            },
            {
                headerName: this.l('Signer'),
                field: 'signer_By',
                width: 150,
                cellClass: 'text-left',
            },
            {
                headerName: this.l('TitleSigner'),
                field: 'signer_By_Titles',
                width: 150,
                cellClass: 'text-left',
            },
            {
                headerName: this.l('SignerSupplier'),
                field: 'signer_By_Suplier',
                width: 150,
                cellClass: 'text-left',
            },
            {
                headerName: this.l('TitleSignerNcc'),
                field: 'signer_By_Suplier_Titles',
                width: 150,
                cellClass: 'text-left',
            },
            {
                headerName: this.l('SignerAppendix'),
                field: 'signerByAppendix',
                width: 150,
                cellClass: 'text-left',
            },
            {
                headerName: this.l('TitlesSignerByAppendix'),
                field: 'titlesSignerByAppendix',
                width: 150,
                cellClass: 'text-left',
            },
            {
                headerName: this.l('SignerBySuplierAppendix'),
                field: 'signerBySuplierAppendix',
                width: 150,
                cellClass: 'text-left',
            },
            {
                headerName: this.l('TitlesSignerBySuplierAppendix'),
                field: 'titlesSignerBySuplierAppendix',
                width: 150,
                cellClass: 'text-left',
            },
            {
                headerName: this.l('Description'),
                field: 'description',
                minWidth: 180,
            },
            {
                headerName: this.l('DescriptionAppendix'),
                field: 'descriptionAppendix',
                minWidth: 180,
            },
        ];
        this.columnDef = [
            {
                headerName: this.l('STT'),
                headerTooltip: this.l('STT'),
                cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
                width: 60,
                cellClass: 'text-center',
            },
            {
                headerName: this.l("Error"),
                headerTooltip: this.l("Error"),
                field: "erroR_DESCRIPTION",
                width: 120,
                cellClass: ['text-center'],
                cellStyle: (params) => {
                    if (params.value != '') {
                        return { 'background-color': '#f77878' };
                    } else {
                        return '';
                    }
                }
            },
            {
                headerName: this.l('ContractNo'),
                field: 'contractNo',
                width: 120,
            },
            {
                headerName: this.l('ContractAppendixNo'),
                field: 'contractAppendixNo',
                width: 120,
            },
            // {
            //     headerName: this.l("CatalogName"),
            //     headerTooltip: this.l("CatalogName"),
            //     field: "catalogName",
            //     width: 130,
            //     cellClass: ["text-left"],
            // },
            {
                headerName: this.l("PartNo"),
                headerTooltip: this.l("PartNo"),
                field: "partNo",
                width: 130,
                cellClass: ["text-left"],
            },
            {
                headerName: this.l("PartName"),
                headerTooltip: this.l("PartName"),
                field: "partName",
                width: 130,
                cellClass: ["text-left"],
            },
            {
                headerName: this.l("UnitOfMeasure"),
                headerTooltip: this.l("UnitOfMeasure"),
                field: "unitOfMeasure",
                width: 130,
                cellClass: ["text-left"],
            },
            {
                headerName: this.l("Qty"),
                headerTooltip: this.l("Qty"),
                field: "qtyStr",
                width: 130,
                cellClass: ["text-right"],
                valueFormatter: params => params.data ? this.dataFormatService.moneyFormat(params.value) : "",
            },
            {
                headerName: this.l("UnitPrice"),
                headerTooltip: this.l("UnitPrice"),
                field: "unitPriceStr",
                width: 130,
                cellClass: ["text-right"],
                valueFormatter: params => params.data ? this.dataFormatService.moneyFormat(params.value) : "",
            },
            {
                headerName: this.l("TaxPrice"),
                headerTooltip: this.l("TaxPrice"),
                field: "taxPriceStr",
                width: 130,
                cellClass: ["text-right"],
            },
            {
                headerName: this.l("TotalPrice"),
                headerTooltip: this.l("TotalPrice"),
                field: "salesAmount",
                width: 100,
                cellClass: ["text-right"],
                valueFormatter: params => params.data ? this.dataFormatService.moneyFormat(params.value) : "",
            },
            {
                headerName: this.l("Description"),
                headerTooltip: this.l("Description"),
                field: "description",
                width: 150,
                cellClass: ["text-left"],
            },
            // {
            //     headerName: this.l("Length"),
            //     headerTooltip: this.l("Length"),
            //     field: "length",
            //     width: 90,
            //     cellClass: ["text-left"],
            //     valueFormatter: params => params.data ? this.dataFormatService.moneyFormat(params.value) : "",
            // },
            // {
            //     headerName: this.l("UnitLength"),
            //     headerTooltip: this.l("UnitLength"),
            //     field: "unitLength",
            //     width: 120,
            //     cellClass: ["text-left"],
            // },
            // {
            //     headerName: this.l("Width"),
            //     headerTooltip: this.l("Width"),
            //     field: "width",
            //     width: 100,
            //     cellClass: ["text-left"],
            //     valueFormatter: params => params.data ? this.dataFormatService.moneyFormat(params.value) : "",
            // },
            // {
            //     headerName: this.l("UnitWidth"),
            //     headerTooltip: this.l("UnitWidth"),
            //     field: "unitWidth",
            //     width: 120,
            //     cellClass: ["text-left"],
            // },
            // {
            //     headerName: this.l("Height"),
            //     headerTooltip: this.l("Height"),
            //     field: "height",
            //     width: 100,
            //     cellClass: ["text-left"],
            //     valueFormatter: params => params.data ? this.dataFormatService.moneyFormat(params.value) : "",
            // },
            // {
            //     headerName: this.l("UnitHeight"),
            //     headerTooltip: this.l("UnitHeight"),
            //     field: "unitHeight",
            //     width: 120,
            //     cellClass: ["text-left"],
            // },
            // {
            //     headerName: this.l("Weight"),
            //     headerTooltip: this.l("Weight"),
            //     field: "weight",
            //     width: 90,
            //     cellClass: ["text-left"],
            //     valueFormatter: params => params.data ? this.dataFormatService.moneyFormat(params.value) : "",
            // },
            // {
            //     headerName: this.l("UnitWeight"),
            //     headerTooltip: this.l("UnitWeight"),
            //     field: "unitWeight",
            //     width: 120,
            //     cellClass: ["text-left"],
            // },
            // {
            //     headerName: this.l("Material"),
            //     headerTooltip: this.l("Material"),
            //     field: "material",
            //     width: 120,
            //     cellClass: ["text-left"],
            // },
            // {
            //     headerName: this.l("COO"),
            //     headerTooltip: this.l("COO"),
            //     field: "coo",
            //     width: 120,
            //     cellClass: ["text-left"],
            // },
            // {
            //     headerName: this.l("UnitOfProduct"),
            //     headerTooltip: this.l("UnitOfProduct"),
            //     field: "unitOfProduct",
            //     width: 120,
            //     cellClass: ["text-left"],
            // },
            // {
            //     headerName: this.l("UnitOfExchangeProduct"),
            //     headerTooltip: this.l("UnitOfExchangeProduct"),
            //     field: "unitOfExchangeProduct",
            //     width: 120,
            //     cellClass: ["text-left"],
            // },
            // {
            //     headerName: this.l("Producer"),
            //     headerTooltip: this.l("Producer"),
            //     field: "producer",
            //     width: 120,
            //     cellClass: ["text-left"],
            // },
        ]
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
        this.listContract = [];
        this.listItems = [];
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
            this.spinnerService.show();
            this._serviceProxy
                .prcContractTemplateInsMultiple(this.inputInsert)
                .pipe(finalize(() => {
                    this.modal.hide();
                    this.close.emit();
                    this.spinnerService.hide();
                    this.updateAfterEdit.emit();
                }))
                .subscribe((val) => {
                    if (val.includes('Error:')) {
                        this.notify.error(val.replace('Error: ', ''));
                    }
                    else {
                        this.notify.success(val.replace('Info: ', ''));
                    }
                });
        }else
        {
            this.notify.error(this.l("Please check the data error before saving!"));
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

    uploadUrl = `${AppConsts.remoteServiceBaseUrl}/ContractImport/ImportContractMultipleFromExcel`;

    import() {
        this.isSave = true;
        this.spinnerService.show();
        this._http
            .post<any>(this.uploadUrl, this.formData)
            .pipe(finalize(() => {
                this.spinnerService.hide();
                forEach(this.listContract, (item) => {
                    if (item.erroR_DESCRIPTION != "") {
                        this.isSave = false;
                    }
                });
                forEach(this.listItems, (item) => {
                    if (item.erroR_DESCRIPTION != "") {
                        this.isSave = false;
                    }
                });
            }))
            .subscribe(response => {
                this.listContract = response.result.taxImportData.listContract;
                this.listItems = response.result.taxImportData.listItems;
                this.inputInsert = response.result.taxImportData;
            });
    }

    refresh() {
        this.listContract = [];
        this.listItems = [];
        this.createOrEditForm?.get('fileName').setValue('');
    }

    callBackGrid(event) {
        this.uploadDataParams = event;
    }
}
