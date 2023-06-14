import { DataFormatService } from '@app/shared/services/data-format.service';
import { forEach } from 'lodash-es';
import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CommonGeneralCacheServiceProxy, PrcAppendixContractDto, PrcAppendixContractItemsDto, PrcContractTemplateDto, PrcContractTemplateImportDto, PrcContractTemplateInsertDto, PrcContractTemplateServiceProxy, RequestApprovalTreeServiceProxy, RequestNextApprovalTreeInputDto } from '@shared/service-proxies/service-proxies';
import { trim } from 'lodash';
import { ModalDirective } from 'ngx-bootstrap/modal';
import * as moment from 'moment';
import { AppConsts } from '@shared/AppConsts';
import { GridParams } from '@app/shared/models/base.model';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { ICellRendererParams } from '@ag-grid-community/all-modules';
import { CreateOrEditAppendixItemsComponent } from '../create-or-edit-appendix-items/create-or-edit-appendix-items.component';
import { GridTableService } from '@app/shared/services/grid-table.service';
import { ImportAttachFileComponent } from '@app/shared/common/import-attach-file/import-attach-file.component';
import { GridOptions } from '@ag-grid-enterprise/all-modules';

@Component({
    selector: 'app-create-or-edit-prc-contract-template',
    templateUrl: './create-or-edit-prc-contract-template.component.html',
    styleUrls: ['./create-or-edit-prc-contract-template.component.less']
})
export class CreateOrEditPrcContractTemplateComponent extends AppComponentBase implements OnInit {
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('submitBtn', { static: false }) submitBtn: ElementRef;
    @Input() selectedRow: PrcContractTemplateDto = new PrcContractTemplateDto();
    @Input() listRowAppendix: PrcAppendixContractDto[] = [];
    @Input() listRowItem: PrcContractTemplateImportDto[] = [];
    @Output() close = new EventEmitter<any>();
    @Output() updateAfterEdit = new EventEmitter<any>();
    @ViewChild('fileInput', { static: false }) InputVar: ElementRef;
    @ViewChild('createOrEditAppendixItems', { static: true }) createOrEditAppendixItems: CreateOrEditAppendixItemsComponent;
    @ViewChild("attach") attach: ImportAttachFileComponent;

    createOrEditForm: FormGroup;
    isEditForm: boolean = false;
    isSubmit = false;
    listVendor;
    listInventoryGroup;
    listPaymentTerm;
    uploadData;
    paginationParams = { pageNum: 1, pageSize: 5000, totalCount: 0 };
    selectAppendixRow: PrcAppendixContractDto = new PrcAppendixContractDto();
    uploadDataParams: GridParams;
    appenParams: GridParams;
    checkGrid;
    formData: any;
    editSupplier;
    listData: PrcContractTemplateImportDto[] = [];
    listDataFull: PrcContractTemplateImportDto[] = [];
    listAppendix: PrcAppendixContractDto[] = [];
    listplaces: { label: string, value: string | number }[] = [];
    listCarriers: { label: string, value: string | number }[] = [];
    listShipments: { label: string, value: string | number }[] = [];
    listFobs: { label: string, value: string | number }[] = [];
    listPriceBasis: { label: string, value: string | number }[] = [];
    listPayOns: { label: string, value: string | number }[] = [];
    listPaidBys: { label: string, value: string | number }[] = [];
    listOthers: { label: string, value: string | number }[] = [];
    itemColumnDef;
    appenColumnDef;
    attackColDefs;
    uploadattachData = [];
    input: PrcContractTemplateInsertDto = new PrcContractTemplateInsertDto();
    fileName;
    fileAttackName;
    isView;
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
    constructor(
        injector: Injector,
        private _serviceProxy: PrcContractTemplateServiceProxy,
        private formBuilder: FormBuilder,
        private _http: HttpClient,
        private dataFormatService: DataFormatService,
        private gridTableService: GridTableService,
        private _approvalProxy: RequestApprovalTreeServiceProxy,
        private commonGeneralCacheServiceProxy: CommonGeneralCacheServiceProxy,
    ) {
        super(injector);
        this.itemColumnDef = [
            {
                headerName: this.l('STT'),
                headerTooltip: this.l('STT'),
                cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
                width: 60,
                cellClass: 'text-center',
            },
            {
                headerName: this.l("Remark"),
                headerTooltip: this.l("Error"),
                field: "erroR_DESCRIPTION",
                width: 120,
                cellClass: ['text-center'],
                cellStyle: (params) => {
                    if (params.data?.erroR_DESCRIPTION != "") {
                        return { 'background-color': '#f77878' };
                    }
                    else {
                        return '';
                    }
                },
            },
            {
                headerName: this.l("InventoryGroup"),
                headerTooltip: this.l("InventoryGroup"),
                field: "invetoryGroupName",
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
                valueFormatter: params => params.data ? this.dataFormatService.floatMoneyFormat(params.value) : "",
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
                headerName: this.l("RemarkModal"),
                headerTooltip: this.l("RemarkModal"),
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
        ];
        this.appenColumnDef = [
            {
                headerName: this.l('STT'),
                headerTooltip: this.l('STT'),
                cellRenderer: (params: ICellRendererParams) => (params.rowIndex + 1).toString(),
                width: 50,
                cellClass: 'text-center',
            },
            {
                headerName: this.l('AppendixNo'),
                field: 'appendixNo',
                width: 125,
            },
            {
                headerName: this.l('AppendixDate'),
                field: 'appendixDate',
                valueGetter: param => param.data ? this.dataFormatService.dateFormat(param.data.appendixDate) : "",
                width: 110,
                cellClass: 'text-center',
            },
            {
                headerName: this.l('EffectiveFrom'),
                field: 'effectiveFrom',
                valueGetter: param => param.data ? this.dataFormatService.dateFormat(param.data.effectiveFrom) : "",
                width: 115,
                cellClass: 'text-center',
            },
            {
                headerName: this.l('EffectiveTo'),
                field: 'effectiveTo',
                valueGetter: param => param.data ? this.dataFormatService.dateFormat(param.data.effectiveTo) : "",
                width: 115,
                cellClass: 'text-center',
            },
            {
                headerName: this.l('ExpiryBackdate'),
                field: 'expiryBackdate',
                flex: 1.5,
                cellClass: 'text-center',
            },
            {
                headerName: this.l('NoteOfBackdate'),
                field: 'noteOfBackdate',
                flex: 1.5
            },
            {
                headerName: this.l('Signer'),
                field: 'signer_By',
                width: 120,

                cellClass: 'text-left',
            },
            {
                headerName: this.l('TitleSigner'),
                field: 'titleSigner',
                width: 120,
                cellClass: 'text-left',
            },
            {
                headerName: this.l('SignerNCC'),
                field: 'signer_By_Suplier',
                width: 120,

                cellClass: 'text-left',
            },
            {
                headerName: this.l('TitleSignerNcc'),
                field: 'titleSignerNcc',
                width: 150,
                cellClass: 'text-left',
            },
            {
                headerName: this.l('Description'),
                field: 'description',
                width: 230,
            },
            {
                headerName: this.l('TotalPrice'),
                headerTooltip: this.l('TotalPrice'),
                field: 'totalAmount',
                width: 120,
                cellClass: 'text-center',
                valueFormatter: params => params.data ? this.dataFormatService.floatMoneyFormat(params.value) : "",
            },
            {
                headerName: this.l('Status'),
                headerTooltip: this.l('Status'),
                field: 'approvalStatus',
                width: 120,
            },
        ]
    }

    ngOnInit(): void {
        this.listplaces = [];
        this.listShipments = [];
        this.listPriceBasis = [];
        this.listPaidBys = [];
        this.listOthers = [];

        this.commonGeneralCacheServiceProxy.getLookupsBy('PO_TERMS_PLACE').subscribe((val) => {
          val.forEach(e => {
            this.listplaces.push({value: e.displayedField, label: e.displayedField})
          });
        });

        this.commonGeneralCacheServiceProxy.getLookupsBy('PO_TERMS_SHIPMENT').subscribe((val) => {
          val.forEach(e => {
            this.listShipments.push({value: e.displayedField, label: e.displayedField})
          });
        });

        this.commonGeneralCacheServiceProxy.getLookupsBy('PO_TERMS_PRICE_BASIS').subscribe((val) => {
          val.forEach(e => {
            this.listPriceBasis.push({value: e.displayedField, label: e.displayedField})
          });
        });

        this.commonGeneralCacheServiceProxy.getLookupsBy('PO_TERMS_PAIR_BY').subscribe((val) => {
          val.forEach(e => {
            this.listPaidBys.push({value: e.displayedField, label: e.displayedField})
          });
        });

        this.commonGeneralCacheServiceProxy.getLookupsBy('PO_TERMS_OTHERS').subscribe((val) => {
          val.forEach(e => {
            this.listOthers.push({value: e.displayedField, label: e.displayedField})
          });
        });
    }

    buildForm() {
        this.createOrEditForm = this.formBuilder.group({
            id: [0],
            contractNo: [undefined],
            contractDate: moment(),
            effectiveFrom: moment(),
            effectiveTo: [undefined],
            description: [undefined],
            supplierId: [undefined],
            signer_By: [undefined],
            signer_By_Suplier: [undefined],
            fileName: [undefined],
            fileAttackName: [undefined],
            inventoryGroupId: [undefined],
            paymentTermsId: [undefined],
            viewAll: false,

            placeOfDelivery: [undefined],
            shipment: [undefined],
            priceBasis: [undefined],
            paidBy: [undefined],
            orthers: [undefined],
            titleSigner: [undefined],
            titleSignerNcc: [undefined],
        });
    }

    create() {
        this.itemColumnDef[1].hide = false;
        this.isView = false;
        this.listAppendix = [];
        this.listData = [];
        this.refresh();
        this.isEditForm = false;
        this.editSupplier = true;
        this.buildForm();
        this.getCache();
        this.modal.show();
    }

    edit() {
        this.itemColumnDef[1].hide = false;
        this.isView = false;
        this.listAppendix = this.listRowAppendix;
        this.listDataFull = this.listRowItem;
        this.isEditForm = true;
        setTimeout(() => {
            this.listDataFull.forEach(item => {
                item.erroR_DESCRIPTION = '';
                item.unitPriceStr = item.unitPrice.toString();
                item.qtyStr = item.qty.toString();
                item.taxPriceStr = item.taxPrice.toString();
            });
        }, 150);

        this.getCache();
        this._serviceProxy.prcContractTemplateCheckEditSupplier(this.selectedRow.id).subscribe(res => {
            this.editSupplier = res;
        });
        this.createOrEditForm = this.formBuilder.group({
            id: this.selectedRow.id,
            contractNo: this.selectedRow.contractNo,
            contractDate: this.selectedRow.contractDate,
            effectiveFrom: this.selectedRow.effectiveFrom,
            effectiveTo: this.selectedRow.effectiveTo,
            description: this.selectedRow.description,
            supplierId: this.selectedRow.supplierId,
            signer_By: this.selectedRow.signer_By,
            signer_By_Suplier: this.selectedRow.signer_By_Suplier,
            fileName: '',
            fileAttackName: '',
            inventoryGroupId: this.selectedRow.inventoryGroupId,
            paymentTermsId: this.selectedRow.paymentTermsId,
            viewAll: false,
            placeOfDelivery: this.selectedRow.placeOfDelivery,
            shipment: this.selectedRow.shipment,
            paidBy: this.selectedRow.paidBy,
            orthers: this.selectedRow.orthers,
            titleSigner: this.selectedRow.titleSigner,
            titleSignerNcc: this.selectedRow.titleSignerNcc,
        });
        this.listData = this.listDataFull.filter(e => e.appendixId == this.listAppendix[0]?.id);

        setTimeout(() => {
            this.uploadDataParams.api.setRowData(this.listData);
            this.attach.setData(this.listAppendix[0].contractId, "CONTRACT");
        }, 100);
        this.modal.show();
    }

    view() {
        this.isView = true;
        this.listAppendix = this.listRowAppendix;
        this.listDataFull = this.listRowItem;
        this.isEditForm = true;
        this.itemColumnDef[1].hide = true;
        setTimeout(() => {
            this.listDataFull.forEach(item => {
                item.erroR_DESCRIPTION = '';
                item.unitPriceStr = item.unitPrice?.toString();
                item.qtyStr = item.qty?.toString();
                item.taxPriceStr = item.taxPrice?.toString();
            });
        }, 100);
        this.getCache();
        this._serviceProxy.prcContractTemplateCheckEditSupplier(this.selectedRow.id).subscribe(res => {
            this.editSupplier = res;
        });
        this.createOrEditForm = this.formBuilder.group({
            id: this.selectedRow.id,
            contractNo: this.selectedRow.contractNo,
            contractDate: this.selectedRow.contractDate,
            effectiveFrom: this.selectedRow.effectiveFrom,
            effectiveTo: this.selectedRow.effectiveTo,
            description: this.selectedRow.description,
            supplierId: this.selectedRow.supplierId,
            signer_By: this.selectedRow.signer_By,
            signer_By_Suplier: this.selectedRow.signer_By_Suplier,
            fileName: '',
            fileAttackName: '',
            inventoryGroupId: this.selectedRow.inventoryGroupId,
            paymentTermsId: this.selectedRow.paymentTermsId,
            viewAll: false,
            placeOfDelivery: this.selectedRow.placeOfDelivery,
            shipment: this.selectedRow.shipment,
            paidBy: this.selectedRow.paidBy,
            orthers: this.selectedRow.orthers,
            titleSigner: this.selectedRow.titleSigner,
            titleSignerNcc: this.selectedRow.titleSignerNcc,
        });
        this.listData = this.listDataFull.filter(e => e.appendixId == this.listAppendix[0]?.id);

        setTimeout(() => {
            this.uploadDataParams.api.setRowData(this.listData);
            this.attach.setData(this.listAppendix[0].contractId, "CONTRACT");
        }, 100);
        this.modal.show();
    }

    closeModel() {
        if (!this.isEditForm) {
            this.selectedRow = null;
            this.listRowAppendix = [];
            this.listRowItem = [];
            this.listData = [];
            this.listAppendix = [];
        }
        this.modal.hide();
    }

    reset() {
        this.createOrEditForm = undefined;
    }

    save() {
        this.input.p_appendix_no = this.selectAppendixRow.appendixNo;
        this.input.dto = Object.assign(new PrcContractTemplateDto(), this.createOrEditForm.getRawValue());
        this.input.listAppendix = this.listAppendix;
        this.input.listItems = [];
        this.listData.forEach(item => {
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
            if (this.isEditForm) {
                this._serviceProxy
                    .prcContractTemplateUpdate(this.createOrEditForm.getRawValue())
                    .subscribe((val) => {
                        this.notify.success(val.replace('Info: ', ''));
                        this.modal.hide();
                        this.close.emit();
                        this.spinnerService.hide();
                        this.updateAfterEdit.emit();
                        this.attach.saveAttachFile(this.createOrEditForm.get('id').value);
                    });
            } else {
                this._serviceProxy
                    .prcContractTemplateInsertNew(this.input)
                    .subscribe((val) => {
                        if (val.contractId == -1) {
                            this.notify.error("Data exist!");
                        }
                        else {
                            this.attach.saveAttachFile(val.contractId);
                            // val.appendixId.forEach(element => {
                            //     let body = Object.assign(new RequestNextApprovalTreeInputDto(), {
                            //         reqId: element,
                            //         processTypeCode: 'AN'
                            //     })
                            //     this._approvalProxy.createRequestApprovalTree(body)
                            //         .pipe(finalize(() => {
                            //             this.spinnerService.hide();
                            //         }))
                            //         .subscribe(res => this.notify.success(this.l('SavedSuccessfully')))
                            // });
                            this.modal.hide();
                            this.close.emit();
                            this.spinnerService.hide();
                            this.updateAfterEdit.emit();
                        }
                    });
            }
        }
    }

    deleteAppendix() {
        this.listAppendix = this.listAppendix.filter(e => e.appendixNo != this.selectAppendixRow.appendixNo);
        this.appenParams.api.setRowData(this.listAppendix);
    }

    validate() {
        if (this.createOrEditForm.get('contractNo').value == null ||
            trim(this.createOrEditForm.get('contractNo').value) == '') {
            this.notify.warn('Số hợp đồng không được để trống');
            return false;
        }
        if (this.createOrEditForm.get('effectiveFrom').value == null || this.createOrEditForm.get('contractDate').value == null
            || this.createOrEditForm.get('effectiveFrom').value == undefined || this.createOrEditForm.get('contractDate').value == undefined
            || this.createOrEditForm.get('effectiveFrom').value == '' || this.createOrEditForm.get('contractDate').value == ''
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
        return true;
    }

    getCache() {
        this.listVendor = [];
        this.listInventoryGroup = [];
        this.listPaymentTerm = [];
        this._serviceProxy.getAllVendor().subscribe(res => {
            forEach(res, (item) => {
                this.listVendor.push({ label: item.supplierName, value: item.id });
            });
        })
        this._serviceProxy.getAllInventoryGroup().subscribe(res => {
            forEach(res, (item) => {
                this.listInventoryGroup.push({ label: item.name, value: item.id });
            });
        })
        this._serviceProxy.getAllPaymentTerm().subscribe(res => {
            forEach(res, (item) => {
                this.listPaymentTerm.push({ label: item.code, value: item.id });
            });
        })

    }

    callBackGrid(event) {
        this.uploadDataParams = event;
    }

    uploadImportFile() {
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

    onUpload(files: Array<any>): void {
        if (files.length > 0) {
            this.formData = new FormData();
            const formData: FormData = new FormData();
            const file = files[0];
            this.fileAttackName = file?.name;
            formData.append('file', file, file.name);
            this.formData = formData;
        }
        this.createOrEditForm.get('fileAttackName').setValue(this.fileAttackName);
    }

    uploadUrl = `${AppConsts.remoteServiceBaseUrl}/ContractImport/ImportContractFromExcel`;

    import() {
        this._http
            .post<any>(this.uploadUrl, this.formData)
            .pipe(finalize(() => {
            })).subscribe(response => {
                this.listData = response.result.taxImportData;

                setTimeout(() => {
                    this.uploadDataParams.api.setRowData(this.listData);

                }, 100);
            });
    }

    refresh() {
        this.listData = [];
    }

    setDataToGrid(event) {
        this.listAppendix.push(Object.assign(new PrcAppendixContractDto(), event));
        this.appenParams.api.setRowData(this.listAppendix);
    }

    callBackAppenGrid(event) {
        this.appenParams = event;
    }

    onChangeAppenSelection(event) {
        this.selectAppendixRow = event.data;
        if (this.createOrEditForm.get('viewAll').value == true) {
            const appendixIds = this.listAppendix.map(x => x.id);
            this.listDataFull.forEach(x => {
                if (appendixIds.includes(x.appendixId)) {
                    this.listData.push(x);
                }
            });
        }
        else {
            this.listData = this.listDataFull.filter(x => x.appendixId == this.selectAppendixRow.id);
        }
        setTimeout(() => {
            this.uploadDataParams.api.setRowData(this.listData);

        }, 100);
    }

    viewAll(event) {
        this.listData = [];
        if (event.returnValue == true) {
            const appendixIds = this.listAppendix.map(x => x.id);
            this.listDataFull.forEach(x => {
                if (appendixIds.includes(x.appendixId)) {
                    this.listData.push(x);
                }
            });
        }
        else {
            this.listData = this.listDataFull.filter(x => x.appendixId == this.selectAppendixRow.id);
        }
        setTimeout(() => {
            this.uploadDataParams.api.setRowData(this.listData);

        }, 100);
    }
}
