// import { CommonGeneralCacheServiceProxy } from './../../../../shared/service-proxies/service-proxies';
// import { ImportCatalogPriceModalComponent } from './import-catalog-price-modal/import-catalog-price-modal.component';
// import { GridTableService } from '@app/shared/services/grid-table.service';
// import { finalize } from 'rxjs/operators';
// import { CreateOrEditCatalogPriceModalComponent } from './create-or-edit-catalog-price-modal/create-or-edit-catalog-price-modal.component';
// import { PaginationParamsModel } from '@app/shared/models/base.model';
// import { CustomColDef, GridParams } from './../../../shared/models/base.model';
// import { AppComponentBase } from '@shared/common/app-component-base';
// import { Component, Injector, ViewChild } from '@angular/core';
// import { FormBuilder, FormGroup } from '@angular/forms';
// import { ceil } from 'lodash';
// import { DataFormatService } from '@app/shared/services/data-format.service';

// @Component({
//     selector: 'catalog-price-management',
//     templateUrl: './catalog-price-management.component.html',
//     styleUrls: ['./catalog-price-management.component.less']
// })
// export class CatalogPriceManagementComponent extends AppComponentBase {
//     @ViewChild('createOrEditModal', { static: true }) createOrEditModal!: CreateOrEditCatalogPriceModalComponent;
//     @ViewChild('importCatalogModal', { static: true }) importCatalogModal!: ImportCatalogPriceModalComponent;

//     catalogPriceColDefs: CustomColDef[] = [];
//     defaultColDefs = {
//         sortable: true,
//         floatingFilter: false,
//         resizable: false,
//         suppressMenu: true,
//         menuTabs: [],
//     };

//     paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, skipCount: 0, sorting: '', totalPage: 0 };
//     catalogParams: GridParams | undefined;

//     selectCatalog: GetAllCatalogPriceForViewDto = new GetAllCatalogPriceForViewDto();

//     searchForm: FormGroup;
//     currencies: { label: string, value: number | undefined }[] = [];
//     taxRates: { label: number | undefined, value: number | undefined}[] = [
//         { label: 0, value: 0 },
//         { label: 5, value: 5 },
//         { label: 8, value: 8 },
//         { label: 10, value: 10 },
//     ];
//     catalogPriceList: GetAllCatalogPriceForViewDto[] = [];
//     inventoryGroups: { label: string, value: number | undefined }[] = [];

//     constructor(
//         injector: Injector,
//         private _formBuilder: FormBuilder,
//         private _serviceProxy: MstCatalogPriceMgmtServiceProxy,
//         private _dataFormatService: DataFormatService,
//         private _gridTableService: GridTableService,
//         private _cacheProxy: CommonGeneralCacheServiceProxy
//     ) {
//         super(injector);
//         this.catalogPriceColDefs = [
//             {
//                 headerName: this.l('No.'),
//                 headerTooltip: this.l('No.'),
//                 cellRenderer: (params) => params.rowIndex + 1 + ((this.paginationParams.pageNum ?? 1) - 1) * (this.paginationParams.pageSize ?? 20),
//                 cellClass: ['text-center'],
//                 flex: 0.5,
//             },
//             {
//                 headerName: this.l('ProductName'),
//                 headerTooltip: this.l('ProductName'),
//                 field: 'productName',
//                 cellClass: ['text-left'],
//                 flex: 1.5,
//             },
//             {
//                 headerName: this.l('SupplierName'),
//                 headerTooltip: this.l('SupplierName'),
//                 field: 'supplierName',
//                 cellClass: ['text-left'],
//                 flex: 1,
//             },
//             {
//                 headerName: this.l('Currency'),
//                 headerTooltip: this.l('Currency'),
//                 field: 'currencyCode',
//                 cellClass: ['text-center'],
//                 flex: 0.7,
//             },
//             {
//                 headerName: this.l('ContractPrice'),
//                 headerTooltip: this.l('ContractPrice'),
//                 field: 'contractPriceAmount',
//                 valueFormatter: params => params.data ? this._dataFormatService.moneyFormat(params.data?.contractPriceAmount) : null,
//                 cellClass: ['text-right'],
//                 flex: 1,
//             },
//             {
//                 headerName: this.l('MarketPrice'),
//                 headerTooltip: this.l('MarketPrice'),
//                 field: 'marketPriceAmount',
//                 valueFormatter: params => params.data ? this._dataFormatService.moneyFormat(params.data?.marketPriceAmount) : null,
//                 cellClass: ['text-right'],
//                 flex: 1,
//             },
//             {
//                 headerName: this.l('Tax'),
//                 headerTooltip: this.l('Tax'),
//                 field: 'taxPriceAmount',
//                 cellClass: ['text-right'],
//                 flex: 1,
//             },
//             {
//                 headerName: this.l('EffectFrom'),
//                 headerTooltip: this.l('EffectFrom'),
//                 field: 'effectFrom',
//                 cellClass: ['text-left'],
//                 valueFormatter: params => params.data ? this._dataFormatService.dateFormat(params.data?.effectFrom) : null,
//                 flex: 1,
//             },
//             {
//                 headerName: this.l('EffectTo'),
//                 headerTooltip: this.l('EffectTo'),
//                 field: 'effectTo',
//                 cellClass: ['text-left'],
//                 valueFormatter: params => params.data ? this._dataFormatService.dateFormat(params.data?.effectTo) : null,
//                 flex: 1,
//             },
//         ]
//     }

//     ngOnInit() {
//         this.buildForm();
//         this.getAllCurrency();
//         this.getAllInventoryGroup();
//         this.search();
//     }

//     buildForm() {
//         this.searchForm = this._formBuilder.group({
//             productName: [''],
//             effectFrom: [undefined],
//             effectTo: [undefined],
//             supplierName: [''],
//             inventoryGroup: [undefined]
//         });
//     }

//     getAllCurrency() {
//         this._cacheProxy.getAllCurrencies()
//         .pipe(finalize(() => {}))
//         .subscribe(res => {
//             this.currencies = res.map(e => ({
//                 label: e.currencyCode,
//                 value: e.id
//             }))
//         })
//     }

//     getAllInventoryGroup() {
//         this.spinnerService.show();
//         this.inventoryGroups = [];
//         this.inventoryGroups.unshift({
//                 label: '',
//                 value: undefined
//               });
//         this._cacheProxy.getAllInventoryGroups()
//             .pipe(finalize(() => this.spinnerService.hide()))
//             .subscribe(res => res.map(e => this.inventoryGroups.push({
//                 label: e.productGroupName,
//                 value: e.id
//             })));
//     }

//     catalogGridCallBack(params: GridParams) {
//         this.catalogParams = params;
//         this.search();
//     }

//     onChangeCatalogSelection(params: any) {
//         this.selectCatalog = params.api?.getSelectedRows()[0] ?? new GetAllCatalogPriceForViewDto();
//     }

//     changePaginationParams(paginationParams: PaginationParamsModel) {
//         this.paginationParams = paginationParams;
//         this.paginationParams.skipCount =
//             ((paginationParams.pageNum ?? 1) - 1) * (paginationParams.pageSize ?? 20);
//         this.paginationParams.pageSize = paginationParams.pageSize;

//         this.getAllCatalogPrice();
//     }

//     search() {
//         this.getAllCatalogPrice();
//     }

//     getAllCatalogPrice() {
//         this.spinnerService.show();
//         this.catalogPriceList = [];
//         return this._serviceProxy.getAllCatalogPrice(
//             this.searchForm.get('productName')?.value ?? '',
//             this.searchForm.get('supplierName')?.value ?? '',
//             this.searchForm.get('inventoryGroup')?.value ?? 0,
//             this.searchForm.get('effectFrom')?.value ?? undefined,
//             this.searchForm.get('effectTo')?.value ?? undefined,
//             this.paginationParams ? this.paginationParams.sorting : '',
//             this.paginationParams ? this.paginationParams.skipCount : 0,
//             this.paginationParams ? this.paginationParams.pageSize : 20
//         )
//         .pipe(finalize(() => this.spinnerService.hide()))
//         .subscribe(res => {
//             this.paginationParams.totalCount = res.totalCount;
//             this.catalogPriceList = res.items ?? [];
//             this.paginationParams.totalPage = ceil(
//                 res.totalCount / (this.paginationParams.pageSize ?? 0)
//             );
//             this._gridTableService.selectFirstRow(this.catalogParams?.api);
//         })
//     }

//     delete() {
//         this.message.confirm('Xóa bản ghi đã chọn', this.l('AreYouSure'), (isConfirmed) => {
//             if (isConfirmed) {
//                 this.spinnerService.show();
//                 this._serviceProxy.delete(this.selectCatalog?.id)
//                     .pipe(finalize(() => this.spinnerService.hide()))
//                     .subscribe(() => {
//                     this.catalogGridCallBack(this.catalogParams);
//                     this.notify.success(this.l('SuccessfullyDeleted'));
//                 });
//             }
//         })
//     }
// }
