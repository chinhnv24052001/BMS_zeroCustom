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
    InventoryPriceSearchInputDto,
    InventoryPriceSearchOutputDto,
    MstSupplierServiceProxy,
    GetByInventoryItemPriceOutputDto,
} from '@shared/service-proxies/service-proxies';
import { ceil } from 'lodash-es';
import * as moment from 'moment';
import { finalize } from 'rxjs/operators';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { CreateOrEditMstInventoryItemComponent } from '../mst-inventory-item/create-edit-mst-inventory-item/create-or-edit-mst-inventory-item.component';
import { ImportFromExcelComponent } from '../mst-inventory-item/importFromExcel/importFromExcel.component';
import { ImportInventoryItemComponent } from '../mst-inventory-item/importInventoryItem/importInventoryItem.component';

@Component({
    selector: 'mst-price-management',
    templateUrl: './mst-price-management.component.html',
    styleUrls: ['./mst-price-management.component.css'],
})
export class MstPriceManagementComponent extends AppComponentBase implements OnInit {
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
    listItem: InventoryPriceSearchOutputDto[];
    listItemPrices: GetByInventoryItemPriceOutputDto[];
    selectedRow: MstInventoryItemsDto = new MstInventoryItemsDto();
    groupList: InventoryItemsSearchOutputDto[];
    searchInputDto: InventoryItemsSearchInputDto = new InventoryItemsSearchInputDto();
    listInventoryGroup: { label: string; value: number | undefined }[] = [];
    inventoryPriceSearchInputDto: InventoryPriceSearchInputDto = new InventoryPriceSearchInputDto();
    listSupplier: { value: number, label: string, }[] = [];

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
        private _mstSupplierService: MstSupplierServiceProxy
    ) {
        super(injector);
    }
    ngOnInit(): void {
        this.listItemPrices = [];
        this.buildForm();

        this.selectDropdownSupplier();
        // get all group data
        this._mstInventoryGroupServiceProxy.getAllInventoryGroup().subscribe((res) => {
            var labeladd = { label: '', value: 0 };
            this.listInventoryGroup.push(labeladd);
            res.forEach((element) => {
                this.listInventoryGroup.push({ label: element.productGroupName, value: element.id });
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
                maxWidth: 40,
            },
            {
                headerName: this.l('PartNo'),
                headerTooltip: this.l('PartNo'),
                field: 'partNo',
                maxWidth: 100
            },
            {
                headerName: this.l('Color'),
                headerTooltip: this.l('Color'),
                field: 'color',
                maxWidth: 50
            },
            {
                headerName: this.l('PartName'),
                headerTooltip: this.l('PartName'),
                field: 'partName',
                width: 250
            },
            {
                headerName: this.l('PartNameSupplier'),
                headerTooltip: this.l('PartNameSupplier'),
                field: 'partNameSupplier',
                width: 300
            },
            {
                headerName: this.l('Supplier'),
                headerTooltip: this.l('Supplier'),
                field: 'supplierName',
                width: 350,
            },
            {
                headerName: this.l('Currency'),
                headerTooltip: this.l('Currency'),
                field: 'currencyCode',
                maxWidth: 100
            },
            {
                headerName: this.l('UnitPrice'),
                headerTooltip: this.l('UnitPrice'),
                field: 'unitPrice',
                maxWidth: 100,
                cellClass: ['cell-border', 'text-right'],
                valueGetter: params => this.dataFormatService.floatMoneyFormat(params.data.unitPrice),
            },
            {
                headerName: this.l('TaxPriceModal'),
                headerTooltip: this.l('TaxPriceModal'),
                field: 'taxPrice',
                maxWidth: 70,
                cellClass: ['cell-border', 'text-right'],
            },
            {
                headerName: this.l('EffectFrom'),
                headerTooltip: this.l('EffectFrom'),
                field: 'effectiveFrom',
                width: 100,
                valueGetter: params => this.dataFormatService.dateFormat(params.data.effectiveFrom),
            },
            {
                headerName: this.l('EffectTo'),
                headerTooltip: this.l('EffectTo'),
                field: 'effectiveTo',
                width: 100,
                valueGetter: params => this.dataFormatService.dateFormat(params.data.effectiveTo),
            },
        ];

        this.gridColDefItemPrices = [
            {
                // STT
                headerName: this.l('STT'),
                headerTooltip: this.l('STT'),
                cellRenderer: (params: ICellRendererParams) =>
                    (
                        params.rowIndex + 1
                    ).toString(),
                maxWidth: 50,
            },

            {
                headerName: this.l('PartNo'),
                field: 'partNo',
                width: 100,
            },
            {
                headerName: this.l('Color'),
                headerTooltip: this.l('Color'),
                field: 'color',
                maxWidth: 50
            },
            {
                headerName: this.l('PartName'),
                field: 'partName',
                width: 250,
            },
            {
                headerName: this.l('PartNameSupplier'),
                field: 'partNameSupplier',
                width: 200,
            },
            {
                headerName: this.l('Supplier'),
                field: 'supplierName',
                width: 150,
            },
            {
                headerName: this.l('Currency'),
                field: 'currencyCode',
                width: 100,
            },
            {
                headerName: this.l('UnitPrice'),
                field: 'unitPrice',
                maxWidth: 100,
                valueGetter: params => this.dataFormatService.floatMoneyFormat(params.data.unitPrice),
                cellClass: ['text-right'],
            },
            {
                headerName: this.l('TaxPriceModal'),
                field: 'taxPrice',
                maxWidth: 100,
                valueGetter: params => this.dataFormatService.floatMoneyFormat(params.data.taxPrice),
                cellClass: ['text-right'],
            },
            {
                headerName: this.l('EffectFrom'),
                field: 'effectiveFrom',
                width: 100,
                valueGetter: (params: ValueGetterParams) =>
                    params.data ? this.dataFormatService.dateFormat(params.data?.effectiveFrom) : '',
            },
            {
                headerName: this.l('EffectTo'),
                field: 'effectiveTo',
                width: 100,
                valueGetter: (params: ValueGetterParams) =>
                    params.data ? this.dataFormatService.dateFormat(params.data?.effectiveTo) : '',
            },
        ];
        this.searchItems();
    }

    selectDropdownSupplier() {
        this._mstSupplierService.getListSupplierDropdown().subscribe((result) => {
            this.listSupplier = [];
            this.listSupplier.push({ value: 0, label: " " });
            result.forEach(ele => {
                this.listSupplier.push({ value: ele.id, label: ele.name });
            });
        });
    }

    buildForm() {
        this.itemsForm = this.formBuilder.group({
            keyword: [''],
            inventoryGroupId: 0,
            supplierId: 0,
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
        this._mstInventoryItemPriceServiceProxy.getByInventoryPriceItem(this.selectedRow.id).subscribe((res) => {
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

        this._mstInventoryItemsServiceProxy.searchInventoryPrice(this.itemsForm.value).subscribe((result) => {
            this.listItem = result.items;
            this.paginationParams.totalCount = result.totalCount;
            this.paginationParams.totalPage = Math.ceil(result.totalCount / this.paginationParams.pageSize);
            this.gridParams.api.setRowData(this.listItem);
            // this.gridParams.api.sizeColumnsToFit();
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


}
