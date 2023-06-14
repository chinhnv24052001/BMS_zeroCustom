import { GridTableService } from './../../../shared/services/grid-table.service';
import { DataFormatService } from './../../../shared/services/data-format.service';
import { CreateRequestApprovalInputDto, GetAllContractHeaderDto, MstInventoryItemPriceServiceProxy, PrcContractHeaderServiceProxy, PrcContractLineServiceProxy, RequestApprovalTreeServiceProxy, ProcessTypeDto, RequestApprovalHistoryOutputDto, PrcContractTemplateServiceProxy, PrcContractTemplateDto, PrcAppendixContractDto, PrcAppendixContractItemsDto, MstInventoryGroupServiceProxy, CommonGeneralCacheServiceProxy } from './../../../../shared/service-proxies/service-proxies';
import { AppComponentBase } from 'shared/common/app-component-base';
import { Component, Injector, Input, OnInit, ViewChild } from "@angular/core";
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { finalize } from 'rxjs/operators';
import { ceil } from 'lodash-es';
import { ICellRendererParams, ValueGetterParams } from '@ag-grid-enterprise/all-modules';
import { ImportFromExcelComponent } from '@app/main/master/mst-inventory-item/importFromExcel/importFromExcel.component';
import { ViewApprovalHistoryModalComponent } from '@app/main/approve/view-approval-history-modal/view-approval-history-modal.component';
import { CreateOrEditPrcContractTemplateComponent } from './create-or-edit-prc-contract-template/create-or-edit-prc-contract-template.component';
import { CreateOrEditAppendixContractComponent } from './create-or-edit-appendix-contract/create-or-edit-appendix-contract.component';
import { CreateOrEditAppendixItemsComponent } from './create-or-edit-appendix-items/create-or-edit-appendix-items.component';
import { TmssSelectGridModalComponent } from '@app/shared/common/grid-input-types/tmss-select-grid-modal/tmss-select-grid-modal.component';
import { CellRendererComponent } from '@ag-grid-community/core/dist/cjs/es5/components/framework/componentTypes';
import { ImportMultipleContractComponent } from './import-multiple-contract/import-multiple-contract.component';
import { ViewListApproveDetailComponent } from '@app/shared/common/view-list-approve-detail/view-list-approve-detail.component';
import { CreateContractBackdateModalComponent } from './create-contract-backdate-modal/create-contract-backdate-modal.component';

@Component({
    selector: "app-framework-contract",
    templateUrl: "./framework-contract.component.html",
    styleUrls: ["./framework-contract.component.less"]
})

export class FrameworkContractComponent extends AppComponentBase implements OnInit {

    @ViewChild('importFromExcelComponent', { static: true })
    importFromExcelComponent: ImportFromExcelComponent;
    @ViewChild('viewDetailApprove', { static: true }) viewDetailApprove: ViewListApproveDetailComponent;
    @ViewChild('createOrEditContract', { static: true }) createOrEditContract: CreateOrEditPrcContractTemplateComponent;
    @ViewChild('createOrEditAppendix', { static: true }) createOrEditAppendix: CreateOrEditAppendixContractComponent;
    @ViewChild('createOrEditAppendixItems', { static: true }) createOrEditAppendixItems: CreateOrEditAppendixItemsComponent;
    @ViewChild('importMutipleContract', { static: true }) importMutipleContract: ImportMultipleContractComponent;
    @ViewChild('viewApprovalHistoryModal', { static: true }) viewApprovalHistoryModal!: ViewApprovalHistoryModalComponent;
    @ViewChild('selectDetailModal', { static: false }) selectDetailModal!: TmssSelectGridModalComponent;
    @ViewChild('createContractBackdate', { static: false }) createContractBackdate!: CreateContractBackdateModalComponent;

    paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
    paginationParamsDetail: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
    gridParams: GridParams | undefined;
    gridAppendixParams: GridParams | undefined;
    gridDetailParams: GridParams | undefined;
    selectedRow: PrcContractTemplateDto = new PrcContractTemplateDto();
    selectedRowFrame: PrcAppendixContractDto = new PrcAppendixContractDto();
    selectedRowFrames: PrcAppendixContractDto[] = [];
    selectedRowFrameId;
    selectedRowContractId;
    selectedRowItems: PrcAppendixContractItemsDto = new PrcAppendixContractItemsDto();
    gridColDef: CustomColDef[];
    gridDetailColDef: CustomColDef[];
    selectDetailColDef: CustomColDef[];
    listInventoryGroups: { label: string, value: string | number }[] = [];
    listSuppliers: { label: string, value: string | number }[] = [];
    listUsers: { label: string, value: string | number }[] = [];
    effectiveFrom;
    creationTime;
    effectiveTo;
    userId;
    // viewAll;
    contractNo = "";
    appendixNo;
    approveBy;
    approvalStatus;
    supplierId;
    inventoryGroupId;
    contractColDef: any;
    appendixColDef: any;
    contractData: any[] = [];
    appendixFull: any[] = [];
    appendixItemFull: any[] = [];
    appendixFilter: any[] = [];
    appendixItemFilter: any[] = [];
    listMstInventoryItems: any[] = [];
    approvalStatusList: { label: string, value: string }[] = [
        { label: this.l('All'), value: undefined },
        { label: this.l('Incomplate_Modal'), value: 'INCOMPLETE' },
        { label: this.l('Pendding_Modal'), value: 'PENDING' },
        { label: this.l('Approval_Modal'), value: 'APPROVED' },
        { label: this.l('Reject_Modal'), value: 'REJECT' }
    ];
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
    newDetail: PrcAppendixContractItemsDto = new PrcAppendixContractItemsDto();
    tabKey: number = 1;
    @Input() params: any;

    constructor(injector: Injector,
        private format: DataFormatService,
        private _serviceProxy: PrcContractTemplateServiceProxy,
        private _requestServiceProxy: RequestApprovalTreeServiceProxy,
        private gridTableService: GridTableService,
        private _approvalProxy: RequestApprovalTreeServiceProxy,
        private mstInventoryGroupServiceProxy: MstInventoryGroupServiceProxy,
        private commonGeneralCacheServiceProxy: CommonGeneralCacheServiceProxy,
    ) {
        super(injector);

        this.contractColDef = [
            // {
            //     headerName: "",
            //     headerTooltip: "",
            //     field: "checked",
            //     headerClass: ["align-checkbox-header"],
            //     cellClass: ["check-box-center"],
            //     // rowDrag : true,
            //     checkboxSelection: true,
            //     headerCheckboxSelection: true,
            //     headerCheckboxSelectionFilteredOnly: true,
            //     flex:0.1,
            //     maxWidth: 30
            // },
            {
                headerName: this.l('STT'),
                headerTooltip: this.l('STT'),
                cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
                width: 50,
                cellClass: 'text-center',
            },
            {
                headerName: this.l('ContractNo'),
                field: 'contractNo',
                width: 120,
            },
            {
                headerName: this.l('ContractDate'),
                field: 'contractDate',
                valueGetter: param => param.data ? this.format.dateFormat(param.data.contractDate) : "",
                width: 90,
                cellClass: 'text-center',
            },
            {
                headerName: this.l('EffectiveFrom'),
                field: 'effectiveFrom',
                valueGetter: param => param.data ? this.format.dateFormat(param.data.effectiveFrom) : "",
                width: 100,
                cellClass: 'text-center',
            },
            {
                headerName: this.l('EffectiveTo'),
                field: 'effectiveTo',
                valueGetter: param => param.data ? this.format.dateFormat(param.data.effectiveTo) : "",
                width: 95,
                cellClass: 'text-center',
            },
            {
                headerName: this.l('ProductGroupName'),
                field: 'productGroupName',
                width: 120,
                cellClass: 'text-left',
            },
            {
                headerName: this.l('SupplierName'),
                field: 'supplierName',
                width: 200,
                cellClass: 'text-left',
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
                minWidth: 140,
            },
            {
                headerName: this.l('CreationTime'),
                field: 'creationTime',
                valueGetter: param => param.data ? this.format.dateFormat(param.data.creationTime) : "",
                width: 95,
                cellClass: 'text-center',
            },
            {
                headerName: this.l('TotalPrice'),
                headerTooltip: this.l('TotalPrice'),
                field: 'totalAmount',
                width: 80,
                cellClass: 'text-center',
                valueFormatter: params => params.data ? this.format.floatMoneyFormat(params.value) : "0",
            },
            {
                headerName: this.l('ApprovalStatus'),
                headerTooltip: this.l('Status'),
                field: 'approvalStatus',
                valueGetter: (params: ValueGetterParams) => params.data?.approvalStatus == 'INCOMPLETE' ? this.l('Incomplate_Modal')
                    : params.data?.approvalStatus == 'PENDING' ? this.l('Pendding_Modal')
                        : params.data?.approvalStatus == 'APPROVED' ? this.l('Approval_Modal')
                            : this.l('Reject_Modal'),
                minWidth: 110,
                cellClass: 'text-center',
            },
        ];
        this.appendixColDef = [
            {
                headerName: "",
                headerTooltip: "",
                field: "checked",
                headerClass: ["align-checkbox-header"],
                cellClass: ["check-box-center"],
                // rowDrag : true,
                checkboxSelection: true,
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,
                flex: 0.1,
                maxWidth: 30
            },
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
                flex: 3,
            },
            {
                headerName: this.l('AppendixDate'),
                field: 'appendixDate',
                valueGetter: param => param.data ? this.format.dateFormat(param.data.appendixDate) : "",
                flex: 1.5,
                cellClass: 'text-center',
            },
            {
                headerName: this.l('EffectiveFrom'),
                field: 'effectiveFrom',
                valueGetter: param => param.data ? this.format.dateFormat(param.data.effectiveFrom) : "",
                flex: 1.5,
                cellClass: 'text-center',
            },
            {
                headerName: this.l('EffectiveTo'),
                field: 'effectiveTo',
                valueGetter: param => param.data ? this.format.dateFormat(param.data.effectiveTo) : "",
                flex: 1.5,
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
                flex: 3,
            },
            {
                headerName: this.l('TotalPrice'),
                headerTooltip: this.l('TotalPrice'),
                field: 'totalAmount',
                flex: 1.5,
                cellClass: 'text-center',
                valueFormatter: params => params.data ? this.format.floatMoneyFormat(params.value) : "",
            },
            {
                headerName: this.l('ApprovalStatus'),
                headerTooltip: this.l('Status'),
                field: 'approvalStatus',
                valueGetter: (params: ValueGetterParams) => params.data?.approvalStatus == 'INCOMPLETE' ? this.l('Incomplate_Modal')
                    : params.data?.approvalStatus == 'PENDING' ? this.l('Pendding_Modal')
                        : params.data?.approvalStatus == 'APPROVED' ? this.l('Approval_Modal')
                            : params.data?.approvalStatus == 'REJECTED' ? this.l('Reject_Modal')
                                : params.data?.approvalStatus == 'NEW' ? this.l('New') : "",
                minWidth: 110,
                flex: 1.5,
            },
        ]

        this.gridDetailColDef = [
            {
                headerName: this.l('STT'),
                headerTooltip: this.l('STT'),
                cellRenderer: (params: ICellRendererParams) => (params.rowIndex + 1).toString(),
                cellClass: 'text-center',
                width: 50,
            },
            {
                headerName: this.l('PartNo'),
                field: 'partNo',
                flex: 1,
            },
            {
                headerName: this.l('PartName'),
                field: 'partName',
                flex: 3,
                editable: (params) => {
                    if (params.data.partNo == null) {
                        return true;
                    }
                    return false;
                }
            },
            {
                headerName: this.l('UnitPrice'),
                field: 'unitPrice',
                flex: 1,
                cellClass: 'text-right',
                valueFormatter: params => params.data ? this.format.floatMoneyFormat(params.value) : "",
                editable: true,
            },
            {
                headerName: this.l('TaxPrice'),
                field: 'taxPrice',
                cellClass: 'text-right',
                flex: 1,
            },
            {
                headerName: this.l('Qty'),
                field: 'qty',
                cellClass: 'text-right',
                flex: 1,
                valueFormatter: params => params.value ? this.format.floatMoneyFormat(params.value) : "",
                editable: true,
            },
        ];
        this.selectDetailColDef = [
            {
                headerName: this.l('STT'),
                headerTooltip: this.l('STT'),
                cellRenderer: (params: ICellRendererParams) => (params.rowIndex + 1).toString(),
                cellClass: 'text-center',
                width: 60,
            },
            {
                headerName: this.l('PartNo'),
                field: 'partNo',
                minWidth: 80,
                maxWidth: 100,
            },
            {
                headerName: this.l('PartName'),
                field: 'partName',
                minWidth: 140,
            },
            {
                headerName: this.l('Color'),
                field: 'color',
                width: 60,
                cellClass: 'text-center',
            },
            {
                headerName: this.l('PartNameSupplier'),
                field: 'partNameSupplier',
                minWidth: 130,
            },
            {
                headerName: this.l('CurrencyCode'),
                field: 'currencyCode',
                width: 90,
                cellClass: 'text-center',
            },
            {
                headerName: this.l('UnitPrice'),
                field: 'unitPrice',
                width: 80,
                cellClass: 'text-right',
                valueFormatter: params => params.data ? this.format.floatMoneyFormat(params.value) : "",
            },
            {
                headerName: this.l('TaxPrice'),
                field: 'taxPrice',
                cellClass: 'text-right',
                width: 80,
            },
        ]
    }

    ngOnInit() {
        if (this.params?.key === 1) {
            this.tabKey = 1;
        } else {
            this.tabKey = 2;
        }
        this.getCache();
    }

    getData() {
        this.spinnerService.show();
        setTimeout(() => {
            this.getContract();
        }, 100);
        setTimeout(() => {
            this.getAppendix();
        }, 100);
        setTimeout(() => {
            this.getAppendixItems();
        }, 100);
    }

    search() {
        this.getData();
    }

    onChangeSelection(params) {
        this.selectedRow = params.api.getSelectedRows()[0] ?? new PrcContractTemplateDto();
        this.appendixFilter = this.appendixFull.filter(x => x.contractId == this.selectedRow.id);
        this.appendixItemFilter = [];
    }

    onChangeSelectionAppendix(params) {
        this.appendixItemFilter = [];
        this.selectedRowFrame = params.api.getSelectedRows()[0] ?? new PrcAppendixContractDto();
        this.selectedRowFrames = params.api.getSelectedRows();
        this.appendixItemFilter = this.appendixItemFull.filter(x => x.appendixId == this.selectedRowFrame.id);
    }

    callBackGrid(params: GridParams) {
        this.gridParams = params;
        this.spinnerService.show();
        this.getContract();
        this.spinnerService.hide();
    }

    callBackGridAppendix(params: GridParams) {
        this.gridAppendixParams = params;
        this.spinnerService.show();
        this.getAppendix();
        this.spinnerService.hide();
    }

    onChangeDetailSelection(params) {
        this.selectedRowItems = params.api.getSelectedRows()[0] ?? new PrcAppendixContractItemsDto();
        this.gridDetailParams = params;
        // this.gridDetailParams.api.sizeColumnsToFit();
    }

    callBackDetailGrid(params: GridParams) {
        this.gridDetailParams = params;
        this.spinnerService.show();
        this.getAppendixItems();
        this.appendixItemFilter = this.appendixItemFull.filter(x => x.appendixId == this.selectedRowFrame.id);
        this.spinnerService.hide();
    }


    changePaginationParams(paginationParams: PaginationParamsModel) {
        if (!this.contractData) {
            return;
        }
        this.paginationParams = paginationParams;
        this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
        this.paginationParams.pageSize = paginationParams.pageSize;
        this.getContract();
    }
    changePaginationParamsAppendix(paginationParams: PaginationParamsModel) {
        if (!this.contractData) {
            return;
        }
        this.paginationParams = paginationParams;
        this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
        this.paginationParams.pageSize = paginationParams.pageSize;
        this.getAppendix();
    }
    changePaginationParamsDetail(paginationParams) {
        this.gridDetailParams = paginationParams;
    }

    sentRequest() {
        // let body = Object.assign(new CreateRequestApprovalInputDto(), {
        //     reqId: this.selectedRowFrame.id,
        //     processTypeCode: 'AN'
        // })
        // this.message.confirm(this.l('AreYouSure'), this.l('SendRequestApprove'), (isConfirmed) => {
        //     if (isConfirmed) {
        //         this.spinnerService.show();
        //         this._requestServiceProxy.createRequestApprovalTree(body)
        //             .pipe(finalize(() => {
        //                 this.spinnerService.hide();
        //             }))
        //             .subscribe(res => this.notify.success(this.l('Successfully')))
        //     }
        // })
        let checkBackdate = false;
        this.selectedRowFrames.forEach(e => {
            if (e.isBackdate) {
                checkBackdate = true;
            }
        });

        if (checkBackdate) {
            this.notify.warn(this.l('ListAppendix2Type'));
            return;
        }

        if (this.selectedRowFrames.length > 0) {
            this._approvalProxy.checkRequestNextMultipleApprovalTree(this.selectedRowFrames[0].isBackdate ? 'BD' : 'AN', this.selectedRowFrames.map(e => e.id)).subscribe(res => {
                this.viewDetailApprove.showModal(this.selectedRowFrames[0].id, this.selectedRowFrames[0].isBackdate ? 'BD' : 'AN', this.selectedRowFrames.map(e => e.id));
            })

        }
        else {
            this.notify.warn(this.l('SelectLine'));
        }
        //     if (this.selectedRow ) {

        //     this.viewDetailApprove.showModal(this.selectedRowFrame.id, 'AN');
        //   } else {
        //     this.notify.warn(this.l('SelectLine'));
        //   }
    }

    undoRequest() {
        if (this.selectedRow && this.selectedRow.id > 0) {
            this.message.confirm(this.l('AreYouSure'), this.l('UndoRequest'), (isConfirmed) => {
                if (isConfirmed) {
                    this.spinnerService.show();

                    this.spinnerService.show();
                    this._requestServiceProxy.undoRequest(
                        this.selectedRowFrame.id,
                        this.selectedRowFrame.isBackdate ? 'BD' : 'AN'
                    ).pipe(finalize(() => {
                        this.spinnerService.hide();
                        this.search();
                    }))
                        .subscribe(res => this.notify.success(this.l('UndoSuccessfully')))

                }
            })
        } else {
            this.notify.warn(this.l('SelectLine'));
        }

    }

    approveHis() {
        this.spinnerService.show();
    }

    getContract() {
        this._serviceProxy.getPrcContractTemplateSearch(
            this.contractNo,
            this.effectiveFrom,
            this.effectiveTo,
            this.creationTime,
            this.appendixNo,
            this.approveBy,
            (this.tabKey == 1 ? true : false),
            this.approvalStatus,
            this.inventoryGroupId,
            this.supplierId,
            this.userId,
            '',
            this.paginationParams.pageSize,
            (this.paginationParams.pageNum - 1) * this.paginationParams.pageSize
        )
            .pipe(finalize(() => {
                this.spinnerService.hide();
                setTimeout(() => {
                    this.gridTableService.selectFirstRow(this.gridParams.api);
                }, 100);
                this.onChangeSelection(this.gridParams);
            }))
            .subscribe(res => {
                this.contractData = res.items;
                this.gridParams.api.setRowData(this.contractData);
                this.paginationParams.totalCount = res.totalCount;
                this.paginationParams.totalPage = ceil(res.totalCount / this.paginationParams.pageSize);
            });
    }

    getAppendix() {
        this._serviceProxy.getPrcContractTemplateSearchAppendix(
            this.contractNo,
            this.effectiveFrom,
            this.effectiveTo,
            this.creationTime,
            this.appendixNo,
            this.approveBy,
            (this.tabKey == 1 ? true : false),
            this.approvalStatus,
            this.inventoryGroupId,
            this.supplierId,
            this.userId,
            '',
            this.paginationParamsDetail.pageSize,
            (this.paginationParamsDetail.pageNum - 1) * this.paginationParamsDetail.pageSize
        )
            .pipe(finalize(() => {
                this.spinnerService.hide();
                // this.paginationParamsDetail.totalCount = this.appendixFilter.length;
                // this.paginationParamsDetail.totalPage = ceil(this.appendixFilter.length / this.paginationParamsDetail.pageSize);
            }))
            .subscribe(res => {
                this.appendixFull = res;
                setTimeout(() => {
                    this.appendixFilter = this.appendixFull.filter(x => x.contractId == this.selectedRow.id);
                }, 100);
                setTimeout(() => {
                    this.gridAppendixParams.api.setRowData(this.appendixFilter);
                    this.gridTableService.selectFirstRow(this.gridAppendixParams.api);
                }, 100);
                this.onChangeSelectionAppendix(this.gridAppendixParams);
            });
    }

    getAppendixItems() {
        this._serviceProxy.getPrcContractTemplateSearchAppendixItems(
            this.contractNo,
            this.effectiveFrom,
            this.effectiveTo,
            this.creationTime,
            this.appendixNo,
            this.approveBy,
            (this.tabKey == 1 ? true : false),
            this.approvalStatus,
            this.inventoryGroupId,
            this.supplierId,
            this.userId,
            '',
            this.paginationParams.pageSize,
            (this.paginationParams.pageNum - 1) * this.paginationParams.pageSize
        )
            .pipe(finalize(() => {
                setTimeout(() => {
                    this.appendixItemFilter = this.appendixItemFull.filter(x => x.appendixId == this.selectedRowFrameId);
                }, 100);
                this.gridDetailParams.api.setRowData(this.appendixItemFilter);
                this.spinnerService.hide();
                this.gridTableService.selectFirstRow(this.gridDetailParams.api);
            }))
            .subscribe(res => {
                this.appendixItemFull = res;
            });
    }

    deleteContract() {
        this.message.confirm(this.l('AreYouSure'), this.l('DeleteThisContract'), (isConfirmed) => {
            if (isConfirmed) {
                this.spinnerService.show();
                this._serviceProxy.prcContractTemplateDelete(this.selectedRow.id)
                    .pipe(finalize(() => {
                        this.spinnerService.hide();
                        this.getData();
                    }))
                    .subscribe(res => this.notify.success(res.replace('Info:', '')))
            }
        })
    }

    deleteAppendix() {
        this.message.confirm(this.l('AreYouSure'), this.l('DeleteThisContract'), (isConfirmed) => {
            if (isConfirmed) {
                this.spinnerService.show();
                this._serviceProxy.prcContractAppendixDelete(this.selectedRowFrame.id)
                    .pipe(finalize(() => {
                        this.spinnerService.hide();
                        this.getAppendix();
                        this.appendixFilter = this.appendixFull.filter(x => x.appendixId == this.selectedRow.id);
                    }))
                    .subscribe(res => this.notify.success(res.replace('Info:', '')))
            }
        })
    }

    setData(data) {
        this.gridDetailParams.api.getSelectedRows()[0].appendixId = data.grA_ID;
        this.gridDetailParams.api.getSelectedRows()[0].itemId = data.itemId;
        this.gridDetailParams.api.getSelectedRows()[0].partNo = data.partNo;
        this.gridDetailParams.api.getSelectedRows()[0].partName = data.partName;
        this.gridDetailParams.api.getSelectedRows()[0].partNameSupplier = data.partNameSupplier;
        this.gridDetailParams.api.getSelectedRows()[0].unitPrice = data.unitPrice;
        this.gridDetailParams.api.getSelectedRows()[0].taxPrice = data.taxPrice;
        this.gridDetailParams.api.getSelectedRows()[0].qty = data.qty;
        this.gridDetailParams.api.getSelectedRows()[0].currencyCode = data.currencyCode;
        this.gridDetailParams.api.getSelectedRows()[0].unitOfMeasureId = data.unitOfMeasureId;
        this.gridDetailParams.api.setRowData(this.appendixItemFilter);
    }

    requestBackdate() {
        if (this.selectedRowFrames && this.selectedRowFrames.length > 0) {
            this.createContractBackdate.show(this.selectedRowFrames[0].id);
        } else {
            this.notify.warn(this.l('SelectLine'));
        }

    }

    getCache() {
        this.listMstInventoryItems = [];
        this._serviceProxy.getAllMstInventoryItems().subscribe((val) => {
            this.listMstInventoryItems = val;
        });

        this.listInventoryGroups = [{ value: 0, label: 'Tất cả' }];
        this.mstInventoryGroupServiceProxy.getAllInventoryGroup().subscribe((res) => {
            res.forEach(e => this.listInventoryGroups.push({ label: e.productGroupName, value: e.id }))
        });

        this.listSuppliers = [{ value: 0, label: 'Tất cả' }];

        this.commonGeneralCacheServiceProxy.getAllSuppliers().subscribe((res) => {
            res.forEach(e => this.listSuppliers.push({ label: (e.supplierNumber + ' - ' + e.supplierName), value: e.id }))
        });

        this.listUsers = [{ value: 0, label: 'Tất cả' }];

        this.commonGeneralCacheServiceProxy.getAllUsersInfo().subscribe((res) => {
            res.forEach(e => this.listUsers.push({ label: (e.name), value: e.id }))
        })

    }
}
