import { DataFormatService } from '@app/shared/services/data-format.service';
import { ICellRendererParams } from '@ag-grid-community/all-modules';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppComponentBase } from '@shared/common/app-component-base';
import { PrcAppendixContractDto, PrcAppendixContractInsertDto, PrcAppendixContractItemsDto, PrcContractTemplateImportDto, PrcContractTemplateServiceProxy, RequestApprovalTreeServiceProxy, RequestNextApprovalTreeInputDto } from '@shared/service-proxies/service-proxies';
import { assign, forEach, trim } from 'lodash';
import * as moment from 'moment';
import { AppConsts } from '@shared/AppConsts';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { GridParams } from '@app/shared/models/base.model';
import { ImportAttachFileComponent } from '@app/shared/common/import-attach-file/import-attach-file.component';

@Component({
    selector: 'app-create-or-edit-appendix-contract',
    templateUrl: './create-or-edit-appendix-contract.component.html',
    styleUrls: ['./create-or-edit-appendix-contract.component.less']
})
export class CreateOrEditAppendixContractComponent extends AppComponentBase implements OnInit {
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('submitBtn', { static: false }) submitBtn: ElementRef;
    @Input() selectedRow: PrcAppendixContractDto = new PrcAppendixContractDto();
    @Output() close = new EventEmitter<any>();
    @Output() updateAfterEdit = new EventEmitter<any>();
    @ViewChild("attach") attach: ImportAttachFileComponent;
    @Output() approveEvent: EventEmitter<any> = new EventEmitter();
  @Output() rejectEvent: EventEmitter<any> = new EventEmitter();
  @Output() requestMoreInfoEvent: EventEmitter<any> = new EventEmitter();
  @Output() forwardEvent: EventEmitter<any> = new EventEmitter();
  @Input() viewOnly = false;

    @Input() listRowItem: PrcContractTemplateImportDto[] = [];
    createOrEditForm: FormGroup;
    isEditForm: boolean = false;
    paginationParams = { pageNum: 1, pageSize: 5000, totalCount: 0 };
    isSubmit = false;
    listVendor;
    isInsertItems = false;
    listData: PrcContractTemplateImportDto[] = [];
    input: PrcAppendixContractInsertDto = new PrcAppendixContractInsertDto();
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
    data;
    imPortItemDto: PrcAppendixContractItemsDto = new PrcAppendixContractItemsDto();
    columnDef;
    fileName;
    uploadDataParams: GridParams;
    constructor(
        injector: Injector,
        private _serviceProxy: PrcContractTemplateServiceProxy,
        private formBuilder: FormBuilder,
        private _http: HttpClient,
        private dataFormatService: DataFormatService,
        private _approvalProxy: RequestApprovalTreeServiceProxy,
    ) {
        super(injector);
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
                headerName: this.l("InventoryGroup"),
                headerTooltip: this.l("InventoryGroup"),
                field: "inventoryGroupName",
                width: 130,
                cellClass: ["text-left"],
            },
            {
                headerName: this.l("CatalogName"),
                headerTooltip: this.l("CatalogName"),
                field: "catalogName",
                width: 130,
                cellClass: ["text-left"],
            },
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
                valueFormatter: params => params.data ? this.dataFormatService.floatMoneyFormat(params.value) : "",
            },
            {
                headerName: this.l("UnitPrice"),
                headerTooltip: this.l("UnitPrice"),
                field: "unitPriceStr",
                width: 130,
                cellClass: ["text-right"],
                valueFormatter: params => params.data ? this.dataFormatService.floatMoneyFormat(params.value) : "",
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
                valueFormatter: params => params.data ? this.dataFormatService.floatMoneyFormat(params.value) : "",
            },
            {
                headerName: this.l("Description"),
                headerTooltip: this.l("Description"),
                field: "description",
                width: 150,
                cellClass: ["text-left"],
            },
            {
                headerName: this.l("Length"),
                headerTooltip: this.l("Length"),
                field: "length",
                width: 90,
                cellClass: ["text-left"],
                valueFormatter: params => params.data ? this.dataFormatService.floatMoneyFormat(params.value) : "",
            },
            {
                headerName: this.l("UnitLength"),
                headerTooltip: this.l("UnitLength"),
                field: "unitLength",
                width: 120,
                cellClass: ["text-left"],
            },
            {
                headerName: this.l("Width"),
                headerTooltip: this.l("Width"),
                field: "width",
                width: 100,
                cellClass: ["text-left"],
                valueFormatter: params => params.data ? this.dataFormatService.floatMoneyFormat(params.value) : "",
            },
            {
                headerName: this.l("UnitWidth"),
                headerTooltip: this.l("UnitWidth"),
                field: "unitWidth",
                width: 120,
                cellClass: ["text-left"],
            },
            {
                headerName: this.l("Height"),
                headerTooltip: this.l("Height"),
                field: "height",
                width: 100,
                cellClass: ["text-left"],
                valueFormatter: params => params.data ? this.dataFormatService.floatMoneyFormat(params.value) : "",
            },
            {
                headerName: this.l("UnitHeight"),
                headerTooltip: this.l("UnitHeight"),
                field: "unitHeight",
                width: 120,
                cellClass: ["text-left"],
            },
            {
                headerName: this.l("Weight"),
                headerTooltip: this.l("Weight"),
                field: "weight",
                width: 90,
                cellClass: ["text-left"],
                valueFormatter: params => params.data ? this.dataFormatService.floatMoneyFormat(params.value) : "",
            },
            {
                headerName: this.l("UnitWeight"),
                headerTooltip: this.l("UnitWeight"),
                field: "unitWeight",
                width: 120,
                cellClass: ["text-left"],
            },
            {
                headerName: this.l("Material"),
                headerTooltip: this.l("Material"),
                field: "material",
                width: 120,
                cellClass: ["text-left"],
            },
            {
                headerName: this.l("COO"),
                headerTooltip: this.l("COO"),
                field: "coo",
                width: 120,
                cellClass: ["text-left"],
            },
            {
                headerName: this.l("UnitOfProduct"),
                headerTooltip: this.l("UnitOfProduct"),
                field: "unitOfProduct",
                width: 120,
                cellClass: ["text-left"],
            },
            {
                headerName: this.l("UnitOfExchangeProduct"),
                headerTooltip: this.l("UnitOfExchangeProduct"),
                field: "unitOfExchangeProduct",
                width: 120,
                cellClass: ["text-left"],
            },
            {
                headerName: this.l("Producer"),
                headerTooltip: this.l("Producer"),
                field: "producer",
                width: 120,
                cellClass: ["text-left"],
            },
        ]
    }

    ngOnInit(): void {
    }

    buildForm(contractId, supplierId, contractNo, supplierName) {
        this.createOrEditForm = this.formBuilder.group({
            id: [0],
            appendixNo: [undefined],
            appendixDate: moment(),
            effectiveFrom: [undefined],
            effectiveTo: [undefined],
            description: [undefined],
            contractId: contractId,
            supplierId: supplierId,
            contractNo: contractNo,
            supplierName: supplierName,
            signer_By: [undefined],
            fileName: [undefined],
        });
    }

    create(contractId, supplierId, contractNo, supplierName) {
        this.isEditForm = false;
        this.isInsertItems = true;
        this.listData = [];
        this.refresh();
        this.getCache();
        this.buildForm(contractId, supplierId, contractNo, supplierName);
        setTimeout(() => {
            this.attach.setData(this.selectedRow.id, "ANNEX");
        }, 100);

        //this.attach.setData(this.listAppendix[0].contractId, "CONTRACT");
        this.modal.show();
    }
    edit(supplierId, contractNo, supplierName) {
        this.isEditForm = true;
        this.getCache();
        this.listData = this.listRowItem;
        this.listData.forEach(item => {
            item.erroR_DESCRIPTION = '';
            item.unitPriceStr = item.unitPrice.toString();
        });
        if(this.listData.length > 0){
            this.isInsertItems = false;
        }
        this.createOrEditForm = this.formBuilder.group({
            id: this.selectedRow.id,
            appendixNo: this.selectedRow.appendixNo,
            appendixDate: this.selectedRow.appendixDate,
            effectiveFrom: this.selectedRow.effectiveFrom,
            effectiveTo: this.selectedRow.effectiveTo,
            description: this.selectedRow.description,
            contractId: this.selectedRow.contractId,
            supplierId: supplierId,
            contractNo: contractNo,
            supplierName: supplierName,
            signer_By: this.selectedRow.signer_By,
            fileName: '',
        });
        setTimeout(() => {
            this.attach.setData(this.selectedRow.id, "ANNEX");
        }, 100);
        this.modal.show();
    }

    closeModel() {
        if (!this.isEditForm) {
            this.selectedRow = null;
            this.listData = [];
        }
        this.modal.hide();
    }

    reset() {
        this.createOrEditForm = undefined;
    }

    save() {
        this.input.dtoAppendix = Object.assign(new PrcAppendixContractDto(), this.createOrEditForm.getRawValue());
        this.input.listItems = [];
        this.input.isInsertIttems = this.isInsertItems;
        this.listData?.forEach((item) => {
            item.qty = parseFloat(item.qtyStr);
            item.unitPrice = parseFloat(item.unitPriceStr);
            item.taxPrice = parseFloat(item.taxPriceStr);
            this.input.listItems.push(Object.assign(new PrcContractTemplateImportDto(), item));
        });
        if (this.validate()) {
            this.isSubmit = true;
            if (this.submitBtn) {
                this.submitBtn.nativeElement.click();
            }
            if (this.createOrEditForm.invalid) {
                return;
            }
            this.spinnerService.show();
            if (this.isEditForm) {
                this._serviceProxy
                    .prcAppendixContractUpdatetNew(this.input)
                    .subscribe((val) => {
                        let appendixId = this.input.dtoAppendix.id;
                        this.attach.saveAttachFile(appendixId);
                        this.notify.success(val.replace('Info: ', ''));
                        this.modal.hide();
                        this.close.emit();
                        this.spinnerService.hide();
                        this.updateAfterEdit.emit();
                    });
            } else {
                this._serviceProxy
                    .prcAppendixContractInsertNew(this.input)
                    .subscribe((val) => {
                        if (val==-1) {
                            this.notify.error("Data exist");
                        }
                        else {
                            // let body = Object.assign(new RequestNextApprovalTreeInputDto(), {
                            //     reqId: val,
                            //     processTypeCode: 'AN'
                            //   })
                            //   this._approvalProxy.createRequestApprovalTree(body)
                            //     .pipe(finalize(() => {
                            //       this.spinnerService.hide();
                            //     }))
                            //     .subscribe(res => this.notify.success(this.l('SavedSuccessfully')))
                        }
                        let appendixId = val;
                        this.attach.saveAttachFile(appendixId);
                        this.modal.hide();
                        this.close.emit();
                        this.spinnerService.hide();
                        this.updateAfterEdit.emit();
                    });
            }
        }
    }
    validate() {
        if (this.createOrEditForm.get('appendixNo').value == null ||
            trim(this.createOrEditForm.get('appendixNo').value) == '') {
            this.notify.warn('Số phụ lục không được để trống');
            return false;
        }

        if (this.createOrEditForm.get('effectiveFrom').value == null
            || this.createOrEditForm.get('effectiveFrom').value == undefined
            || this.createOrEditForm.get('effectiveFrom').value == ''
        ) {
            this.notify.warn('Ngày hợp đồng, ngày bắt đầu không được để trống');
            return false;
        }
        if (this.createOrEditForm.get('effectiveTo').value != null || this.createOrEditForm.get('effectiveTo').value != undefined || this.createOrEditForm.get('effectiveTo').value != '') {
            if (moment(this.createOrEditForm.get('effectiveFrom').value).toDate() > moment(this.createOrEditForm.get('effectiveTo').value).toDate()) {
                this.notify.warn('Ngày bắt đầu không được lớn hơn ngày kết thúc');
                return false;
            }
        }

        // if (this.createOrEditForm.get('effectiveFrom').value > this.createOrEditForm.get('effectiveTo').value) {
        //     this.notify.error('Ngày bắt đầu không được lớn hơn ngày kết thúc');
        //     return false;
        // }
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

    uploadUrl = `${AppConsts.remoteServiceBaseUrl}/ContractImport/ImportContractFromExcel`;

    import() {
        this._http
            .post<any>(this.uploadUrl, this.formData)
            .pipe(finalize(() => {
            })).subscribe(response => {
                this.listData = response.result.taxImportData;
                this.uploadDataParams.api.setRowData(this.listData);
            });
    }

    refresh() {
        this.listData = [];
    }

    callBackGrid(event) {
        this.uploadDataParams = event;
    }

    deleteAll() {
        this.message.confirm('Are you sure to delete all data?', 'Delete All', (result: boolean) => {
            if (result) {
                this._serviceProxy.prcContractAppendixItemsDeleteAll(this.listData[0].appendixId).subscribe(e => {
                    this.notify.success(e.replace('Info: ', ''));
                    this.listData = [];
                    this.isInsertItems = true;
                    this.uploadDataParams.api.setRowData(this.listData);
                });
            }
        });
    }
}
