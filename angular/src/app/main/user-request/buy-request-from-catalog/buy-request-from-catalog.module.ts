import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuyRequestFromCatalogComponent } from './buy-request-from-catalog.component';
import { TABS } from '@app/shared/constants/tab-keys';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { FormsModule } from '@angular/forms';
import { UtilsModule } from '@shared/utils/utils.module';
import { AdminSharedModule } from '@app/admin/shared/admin-shared.module';
import { ViewShoppingCartModalComponent } from './view-shopping-cart-modal/view-shopping-cart-modal.component';
import { ViewProductDetailModalComponent } from './view-product-detail-modal/view-product-detail-modal.component';

const tabcode_component_dict = {
    [TABS.UR_BUY_REQUEST_FROM_CATALOG]: BuyRequestFromCatalogComponent,
};

@NgModule({
    imports: [
        CommonModule,
        AppCommonModule,
        FormsModule,
        UtilsModule,
        AdminSharedModule,
    ],
    declarations: [BuyRequestFromCatalogComponent, ViewShoppingCartModalComponent, ViewProductDetailModalComponent]
})
export class BuyRequestFromCatalogModule {
    static getComponent(tabCode: string) {
        return tabcode_component_dict[tabCode];
    }
}
