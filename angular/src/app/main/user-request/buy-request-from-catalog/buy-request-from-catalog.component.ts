import { CommonGeneralCacheServiceProxy } from './../../../../shared/service-proxies/service-proxies';
import { ViewProductDetailModalComponent } from './view-product-detail-modal/view-product-detail-modal.component';
import { ceil } from 'lodash-es';
import { PaginationParamsModel } from '@app/shared/models/base.model';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Component, Injector, ViewChild } from '@angular/core';
import { ViewShoppingCartModalComponent } from './view-shopping-cart-modal/view-shopping-cart-modal.component';
import { CreateBuyRequestFromCatalogDto, GetAllCatalogProductForViewDto, UrBuyFromCatalogRequestServiceProxy } from '@shared/service-proxies/service-proxies';
import { finalize } from 'rxjs/operators';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TABS } from '@app/shared/constants/tab-keys';
import { EventBusService } from '@app/shared/services/event-bus.service';

@Component({
  selector: 'buy-request-from-catalog',
  templateUrl: './buy-request-from-catalog.component.html',
  styleUrls: ['./buy-request-from-catalog.component.less']
})
export class BuyRequestFromCatalogComponent extends AppComponentBase {
    @ViewChild('viewShoppingCartModal', { static: true }) viewShoppingCartModal!: ViewShoppingCartModalComponent;
    @ViewChild('viewProductDetailModal', { static: true }) viewProductDetailModal!: ViewProductDetailModalComponent;

    productName: string = '';
    supplierName: string = '';
    inventoryGroupId: number = undefined;

    productAmount: number = 0;

    products: GetAllCatalogProductForViewDto[] = [];

    paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 10, totalCount: 0, skipCount: 0, sorting: '', totalPage: 0 };

    onCartProducts: CreateBuyRequestFromCatalogDto[] = [];

    serverPath: string = '';
    src: SafeResourceUrl | any | undefined;
    inventoryGroups: { label: string, value: number | undefined }[] = [];

    constructor(
        injector: Injector,
        private _serviceProxy: UrBuyFromCatalogRequestServiceProxy,
        private _dataFormatService: DataFormatService,
        private dom: DomSanitizer,
        private _cacheProxy: CommonGeneralCacheServiceProxy,
        private eventBus: EventBusService
    ) {
        super(injector);
    }

    ngOnInit() {
        this.getAllInventoryGroup();
        this.reload();
    }

    addToCart(item: any) {
        if (this.onCartProducts?.findIndex(e => e.id == item.id) != -1) {
            this.onCartProducts.find(e => e.id == item.id).qty += item.qty ?? 1;
        }
        else {
            this.onCartProducts.push(Object.assign({
                id: item.id,
                productId: item.productId,
                productCode: item.productCode,
                color: item.color,
                productName: item.productName,
                supplierId: item.supplierId,
                supplierName: item.supplierName,
                currencyId: item.currencyId,
                currencyCode: item.currencyCode,
                unitPrice: item.unitPrice,
                uom: item.primaryUomCode,
                qty: item.qty ?? 1,
                inventoryGroupId: item.inventoryGroupId,
                picDepartmentId: item.picDepartmentId,
                picUserId: item.picUserId,
                inventoryItemId: item.inventoryItemId,
                deliveryDate: undefined,
                documentDate: undefined
            }));
        }
        this.productAmount += item.qty ?? 1;
    }

    search() {
        this.getAllCatalog();
    }

    getAllCatalog() {
        this.spinnerService.show();
        this.products = [];
        return this._serviceProxy.getAllCatalogProducts(
            this.productName ?? '',
            this.supplierName ?? '',
            this.inventoryGroupId ?? undefined,
            this.paginationParams ? this.paginationParams.sorting : '',
            this.paginationParams ? this.paginationParams.skipCount : 0,
            this.paginationParams ? this.paginationParams.pageSize : 10
        )
        .pipe(finalize(() => this.spinnerService.hide()))
        .subscribe(res => {
            this.paginationParams.totalCount = res.totalCount;
            this.products = res.items ?? [];
            this.paginationParams.totalPage = ceil(
                res.totalCount / (this.paginationParams.pageSize ?? 0)
            );
        })
    }

    reload() {
        this.products = [];
        // this.productAmount = 0;
        // this.onCartProducts = [];
        this.productName = '';
        this.supplierName = '';
        this.inventoryGroupId = undefined;
        this.search();
    }

    openUrMgmt() {
        this.reload();
        this.onCartProducts = [];
        this.productAmount = 0;
        this.eventBus.emit({
            type: 'openComponent',
            functionCode: TABS.UR_REQUEST,
            tabHeader: this.l('ManageUserRequest'),
            params: {
                key: 1
            }
        });
    }

    moneyFormat(param: number) {
        return this._dataFormatService.moneyFormat(param);
    }

    domByPass(params: string) {
        return this.dom.bypassSecurityTrustUrl(params);
    }

    changePaginationParams(isNext: boolean, pageNum: number | undefined) {
        if (pageNum) {
            this.paginationParams.pageNum = pageNum;
            this.paginationParams.skipCount =
                ((this.paginationParams.pageNum ?? 1) - 1) * (this.paginationParams.pageSize ?? 10);
            this.paginationParams.pageSize = this.paginationParams.pageSize;
        }
        else {
            if (isNext) {
                this.paginationParams.pageNum += 1;
                this.paginationParams.skipCount =
                    ((this.paginationParams.pageNum ?? 1) - 1) * (this.paginationParams.pageSize ?? 10);
                this.paginationParams.pageSize = this.paginationParams.pageSize;
            }
            else {
                this.paginationParams.pageNum -= 1;
                this.paginationParams.skipCount =
                    ((this.paginationParams.pageNum ?? 1) - 1) * (this.paginationParams.pageSize ?? 10);
                this.paginationParams.pageSize = this.paginationParams.pageSize;
            }

        }


        this.getAllCatalog();
    }

    getAllInventoryGroup() {
        this.spinnerService.show();
        this.inventoryGroups = [];
        this.inventoryGroups.unshift({
                label: '',
                value: undefined
              });
        this._cacheProxy.getAllInventoryGroups()
            .pipe(finalize(() => this.spinnerService.hide()))
            .subscribe(res => res.map(e => this.inventoryGroups.push({
                label: e.productGroupName,
                value: e.id
            })));
    }

    cartEdit(event: any) {
        this.productAmount = event;
    }

    cartRefresh(event: any) {
        this.productAmount = 0;
        this.onCartProducts = [];
    }

    cartClose(event: any) {
        this.onCartProducts = [];
        this.onCartProducts = event;
    }
}
