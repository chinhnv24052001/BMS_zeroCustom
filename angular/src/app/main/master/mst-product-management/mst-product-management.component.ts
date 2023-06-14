import { AppConsts } from '@shared/AppConsts';
import { ICellRendererParams, ValueGetterParams } from '@ag-grid-enterprise/all-modules';
import { Component, ElementRef, HostListener, Injector, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    MstInventoryItemsServiceProxy,
    InventoryItemsSearchInputDto,
    InventoryItemsSearchOutputDto,
    MstInventoryGroupServiceProxy,
    MstInventoryItemPriceServiceProxy,
    GetByInventoryItemOutputDto,
    ImpInventoryItemPriceDto,
    CommonGeneralCacheServiceProxy,
} from '@shared/service-proxies/service-proxies';
import { ceil } from 'lodash-es';
import * as moment from 'moment';


import { FileDownloadService } from '@shared/utils/file-download.service';
import { ImportFromExcelComponent } from '../mst-inventory-item/importFromExcel/importFromExcel.component';
import { ImportInventoryItemComponent } from '../mst-inventory-item/importInventoryItem/importInventoryItem.component';
import { finalize } from 'rxjs/operators';
import { CreateEditProductManagementComponent } from './create-edit-product-management/create-edit-product-management.component';
import { CreateOrEditMstInventoryItemComponent } from '../mst-inventory-item/create-edit-mst-inventory-item/create-or-edit-mst-inventory-item.component';
import { HttpClient } from '@angular/common/http';
import * as FileSaver from 'file-saver';

@Component({
    selector: 'mst-product-management',
    templateUrl: './mst-product-management.component.html',
    styleUrls: ['./mst-product-management.component.css'],
})
export class MstProductManagementComponent extends AppComponentBase implements OnInit {
    @ViewChild('createEditProductManagement', { static: true }) createEditProductManagement: CreateEditProductManagementComponent;
    @ViewChild('importFromExcelComponent', { static: true })
    importFromExcelComponent: ImportFromExcelComponent;
    @ViewChild('importInventoryItemComponent', { static: true })
    importInventoryItemComponent: ImportInventoryItemComponent;
    itemsForm: FormGroup;
    gridColDef: CustomColDef[];
    gridColDefItemPrices: CustomColDef[];
    paginationParams: PaginationParamsModel = {
        pageNum: 1,
        pageSize: 1000,
        totalCount: 0,
        totalPage: 0,
        sorting: '',
        skipCount: 0,
    };
    paginationParamsItemPrice: PaginationParamsModel = {
        pageNum: 1,
        pageSize: 20,
        totalCount: 0,
        totalPage: 0,
        sorting: '',
        skipCount: 0,
    };
    gridParams: GridParams | undefined;
    gridParamsItemPrice: GridParams | undefined;
    listItem: InventoryItemsSearchOutputDto[];
    listItemPrices: GetByInventoryItemOutputDto[];
    selectedRow: InventoryItemsSearchOutputDto = new InventoryItemsSearchOutputDto();
    groupList: InventoryItemsSearchOutputDto[];
    searchInputDto: InventoryItemsSearchInputDto = new InventoryItemsSearchInputDto();
    listInventoryGroup: { label: string; value: number | undefined }[] = [];
    listCatalogs: { label: string; value: number | undefined }[] = [];
    listSuppliers: { label: string; value: number | undefined }[] = [];

    urlBase: string = AppConsts.remoteServiceBaseUrl;
    // click out side
    constructor(
        injector: Injector,
        private _mstInventoryItemsServiceProxy: MstInventoryItemsServiceProxy,
        private _mstInventoryItemPriceServiceProxy: MstInventoryItemPriceServiceProxy,
        private _mstInventoryGroupServiceProxy: MstInventoryGroupServiceProxy,
        private formBuilder: FormBuilder,
        private renderer: Renderer2,
        private dataFormatService: DataFormatService,
        private _fileDownloadService: FileDownloadService,
        private _http: HttpClient,
        private commonGeneralCacheServiceProxy: CommonGeneralCacheServiceProxy,
    ) {
        super(injector);
    }
    ngOnInit(): void {
        this.listItemPrices = [];
        this.buildForm();
        // get all group data
        this._mstInventoryGroupServiceProxy.getAllInventoryGroup().subscribe((res) => {
            var labeladd = { label: '', value: 0 };
            this.listInventoryGroup.push(labeladd);
            res.forEach((element) => {
                this.listInventoryGroup.push({ label: element.productGroupName, value: element.id });
            });
        });

        this.listSuppliers = [{ value: 0, label: 'Tất cả' }];
        this.listCatalogs = [{ value: 0, label: 'Tất cả' }];
    
        this.commonGeneralCacheServiceProxy.getAllSuppliers().subscribe((res) => {
          res.forEach(e => this.listSuppliers.push({ label: (e.supplierName), value: e.id }))
        });

        this.commonGeneralCacheServiceProxy.getAllCatalog().subscribe((res) => {
            res.forEach(e => this.listCatalogs.push({ label: e.catalogName, value: e.id }))
        })

        this.gridColDef = [
            {
                headerName: this.l('STT'),
                headerTooltip: this.l('STT'),
                cellRenderer: (params: ICellRendererParams) =>
                    (
                        (this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! +
                        params.rowIndex +
                        1
                    ).toString(),
                minWidth: 50,
                cellClass: ['text-center'],
            },
            {
                headerName: this.l('PartNo'),
                headerTooltip: this.l('PartNo'),
                field: 'partNo',
                minWidth: 150,
            },
            {
                headerName: this.l('Color'),
                headerTooltip: this.l('Color'),
                field: 'color',
                minWidth: 70,
            },
            {
                headerName: this.l('PartCodeCPS'),
                headerTooltip: this.l('PartCodeCPS'),
                field: 'partNoCPS',
                minWidth: 150,
            },
            {
                headerName: this.l('PartName'),
                headerTooltip: this.l('PartName'),
                field: 'partName',
                minWidth: 200,
            },
            {
                headerName: this.l('UnitPrice'),
                headerTooltip: this.l('UnitPrice'),
                field: 'unitPrice',
                minWidth: 100,
                valueFormatter: params => params.data ? this.dataFormatService.floatMoneyFormat(params.value) : "",
                cellClass: ['text-right'],

            },
            {
                headerName: this.l('TaxPrice'),
                headerTooltip: this.l('TaxPrice'),
                field: 'taxPrice',
                minWidth: 100,
                valueFormatter: params => params.data ? this.dataFormatService.floatMoneyFormat(params.value) : "",
                cellClass: ['text-right'],
            },
            {
                headerName: this.l('CurrencyCode'),
                field: 'currencyCode',
                minWidth: 80,
                cellClass: ['text-left'],
            },
            {
                headerName: this.l('UnitOfMeasure'),
                headerTooltip: this.l('PrimaryUnitOfMeasure'),
                field: 'primaryUnitOfMeasure',
                minWidth: 120,
            },
            {
                headerName: this.l('EffectiveFrom'),
                field: 'effectiveFrom',
                minWidth: 120,
                valueGetter: (params: ValueGetterParams) =>
                    params.data ? this.dataFormatService.dateFormat(params.data?.effectiveFrom) : '',
                cellClass: 'text-center',
            },
            {
                headerName: this.l('EffectiveTo'),
                field: 'effectiveTo',
                minWidth: 110,
                valueGetter: (params: ValueGetterParams) =>
                    params.data ? this.dataFormatService.dateFormat(params.data?.effectiveTo) : '',
                cellClass: 'text-center',
            },
            {
                headerName: this.l('Supplier'),
                headerTooltip: this.l('Supplier'),
                field: 'supplierName',
                minWidth: 110,
            },
            {
                headerName: this.l('PartNameSupplier'),
                headerTooltip: this.l('PartNameSupplier'),
                field: 'partNameSupplier',
                minWidth: 120,
                cellClass: ['text-left'],
            },
            // {
            //     headerName: this.l('CostOfSalesAccount'),
            //     headerTooltip: this.l('CostOfSalesAccount'),
            //     field: 'costOfSalesAccount',
            //     minWidth: 120,
            //     cellClass: ['text-left'],
            // },
            // {
            //     headerName: this.l('ExpenseAccount'),
            //     headerTooltip: this.l('ExpenseAccount'),
            //     field: 'expenseAccount',
            //     minWidth: 120,
            //     cellClass: ['text-left'],
            // },
            // {
            //     headerName: this.l('SaleAccount'),
            //     headerTooltip: this.l('SaleAccount'),
            //     field: 'salesAccount',
            //     minWidth: 120,
            //     cellClass: ['text-left'],
            // },
            {
                headerName: this.l('Status'),
                headerTooltip: this.l('Status'),
                field: 'isActive',
                minWidth: 90,
                cellClass: ['text-left'],
                cellRenderer: (params: ICellRendererParams) => {
                    return params.data.isActive == 1 ? this.l('Active') : this.l('InActive');
                }
            },
        ];
        this.searchItems();
    }
    buildForm() {
        this.itemsForm = this.formBuilder.group({
            keyword: [''],
            inventoryGroupId: 0,
            catalogId: [undefined],
            supplierId: [undefined],
            page: 1,
            pageSize: 5000,
        });
    }
    callBackGrid(params: GridParams) {
        this.gridParams = params;
        params.api.setRowData([]);
    }
    callBackGridItemsPrice(params: GridParams) {
        this.gridParamsItemPrice = params;
        params.api.setRowData([]);
    }
    onChangeSelection(params) {
        this.selectedRow = params.api.getSelectedRows()[0] ?? new InventoryItemsSearchOutputDto();
        this.selectedRow = Object.assign({}, this.selectedRow);
        this._mstInventoryItemPriceServiceProxy.getByInventoryItem(this.selectedRow.id).subscribe((res) => {
            this.listItemPrices = res.items;
        });
    }
    changePaginationParams(paginationParams: PaginationParamsModel) {
        if (!this.listItem) {
            return;
        }
        this.paginationParams = paginationParams;
        this.itemsForm.value.page = paginationParams.pageNum;
        this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
        this.itemsForm.value.pageSize = paginationParams.pageSize;
        this.searchItems();
    }
    searchItems() {
        this.spinnerService.show();

        this._mstInventoryItemsServiceProxy.searchInventoryItems(this.itemsForm.value)
        .pipe(finalize(()=>{
            this.spinnerService.hide();
        }))
        .subscribe((result) => {
            this.listItem = result.items;
            this.paginationParams.totalCount = result.totalCount;
            this.paginationParams.totalPage = Math.ceil(result.totalCount / this.paginationParams.pageSize);
            this.gridParams.api.setRowData(this.listItem);
            this.gridParams.api.sizeColumnsToFit();
        });

    }

    edit() {
        if (!this.selectedRow.id) {
            this.notify.error(this.l('Please Select Row'));
        }
        else {
            this.createEditProductManagement.show();
        }

    }
    editInventoryItemPrice() {
        this.importFromExcelComponent.show();
    }
    importInventoryItemImp() {
        this.importInventoryItemComponent.show();
    }

    exportTemplate(params: number) {
        this.spinnerService.show();
        this._mstInventoryItemsServiceProxy
            .exportTemplate(params)
            .pipe(finalize(() => this.spinnerService.hide()))
            .subscribe((res) => {
                this._fileDownloadService.downloadTempFile(res);
            });
    }

    delete() {
        if (!this.selectedRow.id) {
            this.notify.error(this.l('Please Select Row'));
        }
        else {
            this.message.confirm(
                this.l('AreYouSure', this.selectedRow.partNo),
                this.l('AreYouSure'),
                (isConfirmed) => {
                    if (isConfirmed) {
                        this._mstInventoryItemsServiceProxy.mstProductMngtDelete(this.selectedRow.id).subscribe((val) => {
                            if (val.includes("Error")) {
                                this.notify.error(val.replace("Error: ", ""));
                            }
                            else {
                                this.notify.success(val.replace("Info: ", ""));
                            }
                            this.searchItems();
                        });
                    }
                }
            );
        }
    }
    view() {
        if (!this.selectedRow.id) {
            this.notify.error(this.l('Please Select Row'));
        }
        else {
            this.createEditProductManagement.view();
        }
    }

    exportExcell() {
        this.spinnerService.show();
        this._http.post(`${this.urlBase}/api/MasterExcelExport/MstInventoryItemsExportExcel`,
            {
                inventoryGroupId: this.itemsForm.value.inventoryGroupId,
                keyword: this.itemsForm.value.keyword,
                page: this.itemsForm.value.page,
                pageSize: this.itemsForm.value.pageSize,
            },
            { responseType: 'blob' }).pipe(finalize(() => {
                this.spinnerService.hide();
            })).subscribe(blob => {
                FileSaver.saveAs(blob, 'MstInventoryItems.xlsx');
            });
    }

}
