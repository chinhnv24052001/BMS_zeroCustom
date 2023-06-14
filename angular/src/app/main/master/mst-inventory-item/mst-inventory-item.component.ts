import { AppConsts } from '@shared/AppConsts';
import { ICellRendererParams, ValueGetterParams } from '@ag-grid-enterprise/all-modules';
import { Component, ElementRef, HostListener, Injector, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    MstInventoryItemsDto,
    MstInventoryItemsServiceProxy,
    InventoryItemsSearchInputDto,
    InventoryItemsSearchOutputDto,
    MstInventoryGroupServiceProxy,
    MstInventoryItemPriceServiceProxy,
    GetByInventoryItemOutputDto,
    ImpInventoryItemPriceDto,
} from '@shared/service-proxies/service-proxies';
import { ceil } from 'lodash-es';
import * as moment from 'moment';

import { CreateOrEditMstInventoryItemComponent } from './create-edit-mst-inventory-item/create-or-edit-mst-inventory-item.component';

import { ImportFromExcelComponent } from './importFromExcel/importFromExcel.component';
import { finalize } from 'rxjs/operators';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { ImportInventoryItemComponent } from './importInventoryItem/importInventoryItem.component';

@Component({
    selector: 'app-mst-inventory-item',
    templateUrl: './mst-inventory-item.component.html',
    styleUrls: ['./mst-inventory-item.component.css'],
})
export class MstInventoryItemComponent extends AppComponentBase implements OnInit {
    @ViewChild('createOrEditMstInventoryItemComponent', { static: true })
    createOrEditMstInventoryItemComponent: CreateOrEditMstInventoryItemComponent;
    @ViewChild('importFromExcelComponent', { static: true })
    importFromExcelComponent: ImportFromExcelComponent;
    @ViewChild('importInventoryItemComponent', { static: true })
    importInventoryItemComponent: ImportInventoryItemComponent;
    itemsForm: FormGroup;
    gridColDef: CustomColDef[];
    gridColDefItemPrices: CustomColDef[];
    paginationParams: PaginationParamsModel = {
        pageNum: 1,
        pageSize: 20,
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
    selectedRow: MstInventoryItemsDto = new MstInventoryItemsDto();
    groupList: InventoryItemsSearchOutputDto[];
    searchInputDto: InventoryItemsSearchInputDto = new InventoryItemsSearchInputDto();
    listInventoryGroup: { label: string; value: number | undefined }[] = [];

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
        private _fileDownloadService: FileDownloadService
    ) {
        super(injector);
    }
    ngOnInit(): void {
        this.listItemPrices = [];
        this.buildForm();
        // get all group data
        this._mstInventoryGroupServiceProxy.getAllInventoryGroup().subscribe((res) => {
            var labeladd = { label: '', value: undefined };
            this.listInventoryGroup.push(labeladd);
            res.forEach((element) => {
                this.listInventoryGroup.push({ label: element.productGroupCode, value: element.id });
            });
        });

        this.gridColDef = [
            {
                // STT
                headerName: this.l('STT'),
                headerTooltip: this.l('STT'),
                cellRenderer: (params: ICellRendererParams) =>
                    (
                        (this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! +
                        params.rowIndex +
                        1
                    ).toString(),
                width: 2,
            },
            {
                headerName: this.l('InventoryItemId'),
                headerTooltip: this.l('InventoryItemId'),
                field: 'inventoryItemId',
                hide: true,
            },
            {
                headerName: this.l('Inventory Group'),
                headerTooltip: this.l('InventoryGroupId'),
                field: 'productGroupName',
            },
            {
                headerName: this.l('Part Name'),
                headerTooltip: this.l('PartName'),
                field: 'partName',
                width: 400,
            },
            {
                headerName: this.l('Part No'),
                headerTooltip: this.l('PartNo'),
                field: 'partNo',
            },
            {
                headerName: this.l('Color'),
                headerTooltip: this.l('Color'),
                field: 'color',
                width: 90,
            },
            {
                headerName: this.l('OrganizationId'),
                headerTooltip: this.l('OrganizationId'),
                field: 'organizationId',
                hide: true,
            },
            {
                headerName: this.l('Primary Uom Code'),
                headerTooltip: this.l('PrimaryUomCode'),
                field: 'primaryUomCode',
                width: 90,
            },
            {
                headerName: this.l('Primary Unit Of Measure'),
                headerTooltip: this.l('PrimaryUnitOfMeasure'),
                field: 'primaryUnitOfMeasure',
                width: 120,
            },
            {
                headerName: this.l('Item Type'),
                headerTooltip: this.l('ItemType'),
                field: 'itemType',
                width: 90,
            },
        ];
        this.gridColDefItemPrices = [
            {
                headerName: this.l('Part Name'),
                field: 'partName',
                width: 400,
            },
            {
                headerName: this.l('Unit Price'),
                field: 'unitPrice',
                width: 200,
                cellRenderer: (params: ICellRendererParams) => {
                    return params.value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
                },
                cellClass: ['text-right'],
            },
            {
                headerName: this.l('Unit Of Measure'),
                field: 'unitOfMeasure',
                width: 150,
                cellClass: ['text-right'],
            },
            {
                headerName: this.l('CurrencyCode'),
                field: 'currencyCode',
                width: 90,
                cellClass: ['text-right'],
            },
            {
                headerName: this.l('Effective From'),
                field: 'effectiveFrom',
                width: 150,
                valueGetter: (params: ValueGetterParams) =>
                    params.data ? this.dataFormatService.dateFormat(params.data?.effectiveFrom) : '',
                cellClass: 'text-right',
            },
            {
                headerName: this.l('Effective To'),
                field: 'effectiveTo',
                width: 150,
                valueGetter: (params: ValueGetterParams) =>
                    params.data ? this.dataFormatService.dateFormat(params.data?.effectiveTo) : '',
                cellClass: 'text-right',
            },
        ];
        this.searchItems();
    }
    buildForm() {
        this.itemsForm = this.formBuilder.group({
            keyword: [''],
            inventoryGroupId: 0,
            page: 1,
            pageSize: 20,
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
        this.selectedRow = params.api.getSelectedRows()[0] ?? new MstInventoryItemsDto();
        this.selectedRow = Object.assign({}, this.selectedRow);
        console.log(this.selectedRow);

        // get price
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

        this._mstInventoryItemsServiceProxy.searchInventoryItems(this.itemsForm.value).subscribe((result) => {
            this.listItem = result.items;
            this.paginationParams.totalCount = result.totalCount;
            this.paginationParams.totalPage = Math.ceil(result.totalCount / this.paginationParams.pageSize);
            this.gridParams.api.setRowData(this.listItem);
            this.gridParams.api.sizeColumnsToFit();
        });
        this.spinnerService.hide();
    }
    addInventoryItem() {
        // clear selected row
        this.selectedRow = new MstInventoryItemsDto();
        this.createOrEditMstInventoryItemComponent.show(false);
    }
    editInventoryItem() {
        if (!this.selectedRow.id) {
            // show notification select row
            this.notify.error(this.l('Please Select Row'));
        } else {
            this.createOrEditMstInventoryItemComponent.show(true);
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
}
