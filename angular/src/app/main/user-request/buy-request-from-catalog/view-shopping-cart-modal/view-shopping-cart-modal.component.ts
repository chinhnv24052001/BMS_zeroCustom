import { RowNode, ValueGetterParams, ValueFormatterParams, ICellEditorParams } from '@ag-grid-enterprise/all-modules';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Component, EventEmitter, Injector, Output, ViewChild } from '@angular/core';
import { AgCellEditorParams, CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { finalize } from 'rxjs/operators';
import { CommonAllGlCodeCombination, CommonGeneralCacheServiceProxy, UrBuyFromCatalogRequestServiceProxy } from '@shared/service-proxies/service-proxies';
import { GridTableService } from '@app/shared/services/grid-table.service';
import { AgDatepickerRendererComponent } from '@app/shared/common/grid-input-types/ag-datepicker-renderer/ag-datepicker-renderer.component';
import * as moment from 'moment';
import { TmssSelectGridModalComponent } from '@app/shared/common/grid-input-types/tmss-select-grid-modal/tmss-select-grid-modal.component';

@Component({
    selector: 'view-shopping-cart-modal',
    templateUrl: './view-shopping-cart-modal.component.html',
    styleUrls: ['./view-shopping-cart-modal.component.less']
})
export class ViewShoppingCartModalComponent extends AppComponentBase {
    @ViewChild('viewShoppingCartModal', { static: true }) modal!: ModalDirective;
    @ViewChild('selectBudgetCodeModal', { static: true }) selectBudgetCodeModal!: TmssSelectGridModalComponent;
    @ViewChild('selectBudgetCodeHeadModal', { static: true }) selectBudgetCodeHeadModal!: TmssSelectGridModalComponent;

    @Output() modalSave: EventEmitter<any> = new EventEmitter();
    @Output() modalClose: EventEmitter<any> = new EventEmitter();
    @Output() modalEdited: EventEmitter<any> = new EventEmitter();
    @Output() modalRefresh: EventEmitter<any> = new EventEmitter();

    productColDefs: CustomColDef[] = [];
    budgetCodeColDefs: CustomColDef[] = [];
    defaultColDef: CustomColDef = {
        suppressMenu: true
    };
    productParams: GridParams;

    productsOnCart: any[] = [];
    selectedProductNode: any;
    frameworkComponents: any;
    deliveryDate: any;
    warning: boolean = false;
    budgetCode: string = '';
    budgetCodeId: number | undefined;
    documentDate: any;
    urName: string = '';

    constructor(
        injector: Injector,
        private _dataFormatService: DataFormatService,
        private _serviceProxy: UrBuyFromCatalogRequestServiceProxy,
        private gridTableService: GridTableService,
        private _cacheProxy: CommonGeneralCacheServiceProxy
    ) {
        super(injector);
        this.frameworkComponents = {
            agDatepickerRendererComponent: AgDatepickerRendererComponent
        };
        this.productColDefs = [
            {
                headerName: this.l('No.'),
                headerTooltip: this.l('No.'),
                cellRenderer: (params) => params.rowIndex + 1,
                cellClass: ['text-center'],
                width: 60
            },
            {
                headerName: this.l('ProductCode'),
                headerTooltip: this.l('ProductCode'),
                valueGetter: (params: ValueGetterParams) => params.data ? params.data?.color ? params.data?.productCode + '.' + params.data?.color : params.data?.productCode : '',
                cellClass: ['text-left'],
                width: 120
            },
            {
                headerName: this.l('ProductName'),
                headerTooltip: this.l('ProductName'),
                field: 'productName',
                cellClass: ['text-left'],
                width: 300
            },
            {
                headerName: this.l('SupplierName'),
                headerTooltip: this.l('SupplierName'),
                field: 'supplierName',
                cellClass: ['text-left'],
                width: 200
            },
            {
                headerName: this.l('Currency'),
                headerTooltip: this.l('Currency'),
                field: 'currencyCode',
                cellClass: ['text-center'],
                width: 100
            },
            {
                headerName: this.l('Price'),
                headerTooltip: this.l('Price'),
                field: 'unitPrice',
                valueFormatter: (params: ValueFormatterParams) => this._dataFormatService.moneyFormat(params.value),
                cellClass: ['text-right'],
                width: 80
            },
            {
                headerName: this.l('Uom'),
                headerTooltip: this.l('Uom'),
                field: 'uom',
                cellClass: ['text-center'],
                width: 80
            },
            {
                headerName: this.l('Quantity'),
                headerTooltip: this.l('Quantity'),
                field: 'qty',
                editable: true,
                cellClass: ['cell-clickable', 'text-right'],
                width: 80
            },
            {
                headerName: this.l('TotalPrice'),
                headerTooltip: this.l('TotalPrice'),
                valueGetter: (params: ValueGetterParams) => params.data ? Number(params.data.qty * params.data.unitPrice) : 0,
                valueFormatter: (params: ValueFormatterParams) => this._dataFormatService.moneyFormat(params.value),
                cellClass: ['text-right'],
                width: 120
            },
            {
                headerName: this.l('DeliveryDate'),
                headerTooltip: this.l('DeliveryDate'),
                cellClass: ['text-left', 'cell-clickable'],
                field: 'deliveryDate',
                editable: true,
                cellRenderer: 'agDatepickerRendererComponent',
                valueGetter: params => this._dataFormatService.dateTimeFormat(params.data.doingDate),
                width: 150
            },
            {
                headerName: this.l('BudgetCode'),
                headerTooltip: this.l('BudgetCode'),
                cellClass: ['text-left', 'cell-clickable'],
                field: 'budgetCode',
                rowDrag: true,
                editable: true,
                width: 300
            }
        ];
        this.budgetCodeColDefs = [
            {
                headerName: this.l('BudgetCode'),
                headerTooltip: this.l('BudgetCode'),
                cellClass: ['text-left'],
                field: 'concatenatedSegments',
                flex: 1
            }
        ];
    }

    ngOnInit() {
    }

    show(products: any) {
        this.productsOnCart = [];
        this.productsOnCart = products;
        this.documentDate = new Date();
        this.modal!.show();
        this.productParams!.api!.setRowData(this.productsOnCart);
    }

    searchByEnter(params: ICellEditorParams) {
        const col = params?.colDef?.field;
        if (col === 'budgetCode') {
            var format = /^[!@#$%^&*()_+\-=\[\]{};':"\\|,<>\/?]*$/;
            var valueFilter = params.value?.toUpperCase().split(' ')[0].split('').filter(e => !format.test(e)).join('').trim();
            this.selectedProductNode.setDataValue('budgetCode', valueFilter);
            params.data.budgetCode = valueFilter;
            this.selectBudgetCodeModal.show(
                valueFilter,
                undefined,
                undefined,
                'budgetCode'
            );
        }
    }

    close() {
        this.modal!.hide();
        this.modalClose.emit(this.productsOnCart);
    }

    callBackPartGrid(params: GridParams) {
        this.productParams = params;
    }

    onChangeProductSelection(params: any) {
        const selectedNode = params.api.getSelectedNodes()[0];
        if (selectedNode) this.selectedProductNode = selectedNode;
    }

    cellEditingStopped(params: AgCellEditorParams) {
        if (params?.colDef?.field === 'qty') {
            if (!params.value || !Number(params.value) || Number(params.value) <= 0) {
                setTimeout(() => this.productParams.api.startEditingCell({ colKey: 'qty', rowIndex: this.selectedProductNode.rowIndex }));
                return this.notify.warn(this.l('MustGreaterThan', this.l('Quantity'), '0'));
            }
            params.data.qty = Number(params.value);

            let productAmount = 0;
            this.productParams?.api.forEachLeafNode((node: RowNode) => {
                productAmount += node.data.qty;
            });
            this.modalEdited.emit(productAmount);
        }
    }

    validateBeforeSave(list: any[]) {
        this.warning = false;
        let checkDate = moment();
        list.forEach(item => {
            if (!item.qty || !Number(item.qty) || Number(item.qty) <= 0) {
                this.notify.warn(this.l('MustGreaterThan', this.l('Quantity'), '0'));
                this.warning = true;
                return;
            }
            if (item.deliveryDate && moment(item.deliveryDate) <= checkDate || (!item.deliveryDate && moment(this.deliveryDate) <= checkDate)) {
                this.warning = true;
                this.notify.warn(this.l('DeliveryDateMustBeGreaterThanNow'));
                return;
            }
        });
        if (this.budgetCode && !this.budgetCodeId) {
            this.warning = true;
            this.notify.warn(this.l('IsInvalid', this.l('BudgetCode')));
            return;
        }

        return this.warning;
    }

    sendRequest() {
        this.validateBeforeSave(this.productsOnCart)
        if (this.warning == true) return;
        else {
            this.spinnerService.show();
            this.productsOnCart.forEach(prod => {
                if (prod.deliveryDate == null) prod.deliveryDate = this.deliveryDate;
                if (prod.budgetCodeId == null) prod.budgetCodeId = this.budgetCodeId;
                prod.documentDate = this.documentDate;
                prod.headerBudgetCodeId = this.budgetCodeId;
                prod.userRequestName = this.urName;
            });
            this._serviceProxy.createBuyRequest(this.productsOnCart)
                .pipe(finalize(() => {
                    this.spinnerService.hide();
                    this.modalSave.emit(null);
                    this.reload();
                    this.modal!.hide();
                }))
                .subscribe(res => this.notify.success(this.l('SuccessfullyCreatedUr', res)));
        }
    }

    reload() {
        this.productsOnCart = [];
        this.deliveryDate = undefined;
        this.documentDate = undefined;
        this.budgetCode = '';
        this.urName = '';
        this.budgetCodeId = undefined;
        this.modalRefresh.emit(null);
    }

    deleteRow() {
        this.productParams?.api.applyTransaction({ remove: [this.selectedProductNode.data] });
        this.productsOnCart = [];
        this.productsOnCart = this.gridTableService.getAllData(this.productParams);
        let productAmount = 0;
        this.productParams?.api.forEachLeafNode((node: RowNode) => {
            productAmount += node.data.qty;
        });
        this.modalEdited.emit(productAmount);
        // this.caculateTotalPrice();
    }

    patchBudgetCode(event: CommonAllGlCodeCombination, isGrid: boolean) {
        if (isGrid) {
            if (!event || !event.id) {
                setTimeout(() => this.productParams.api.startEditingCell({ colKey: 'budgetCode', rowIndex: this.selectedProductNode.rowIndex }));
                this.productsOnCart = this.gridTableService.getAllData(this.productParams);
                return this.notify.warn(this.l('CannotFind', this.l('BudgetCode')));
            }
            this.selectedProductNode.data = Object.assign(this.selectedProductNode.data, { budgetCode: event.concatenatedSegments, budgetCodeId: event.id });
            this.productParams.api.applyTransaction({ update: [this.selectedProductNode.data] });
            this.productsOnCart = this.gridTableService.getAllData(this.productParams);
        }
        else {
            this.budgetCode = event.concatenatedSegments;
            this.budgetCodeId = event.id;
        }
    }

    getAllGlCode(budgetCode: string, paginationParams: PaginationParamsModel) {
        return this._cacheProxy.getAllGlCodeCombinations(
            budgetCode ?? '',
            paginationParams ? paginationParams.sorting : '',
            paginationParams ? paginationParams.pageSize : 20,
            paginationParams ? paginationParams.skipCount : 0
        );
    }
}
