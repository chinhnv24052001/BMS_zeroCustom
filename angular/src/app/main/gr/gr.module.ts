import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TABS } from '@app/shared/constants/tab-keys';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { FormsModule } from '@angular/forms';
import { UtilsModule } from '@shared/utils/utils.module';
import { AdminSharedModule } from '@app/admin/shared/admin-shared.module';
import { CreateOrEditGoodsReceiptComponent } from './goods-receipt/create-or-edit-goods-receipt/create-or-edit-goods-receipt.component';
import { GoodsReceiptComponent } from './goods-receipt/goods-receipt.component';
import { ReceiptNotesComponent } from './receipt-notes/receipt-notes.component';
import { CreateOrEditReceiptNoteComponent } from './receipt-notes/create-or-edit-receipt-note/create-or-edit-receipt-note.component';
import { CreateOrEditGrFromReceiptNoteComponent } from './goods-receipt/create-or-edit-from-receipt-note/create-or-edit-gr-from-receipt-note.component';
import { ReturnGoodsReceiptComponent } from './goods-receipt/return-goods-receipt/return-goods-receipt.component';
import { ViewReceiptDetailComponent } from './goods-receipt/view-receipt-detail/view-receipt-detail.component';
import { ViewReceiptNoteComponent } from './receipt-notes/view-receipt-note-detail/view-receipt-note-detail.component';
import { ReturnGoodsReceiptListComponent } from './goods-receipt/return-goods-receipt/return-goods-receipt-list/return-goods-receipt-list.component';

const tabcode_component_dict = {
  [TABS.GOODS_RECEIPT]: GoodsReceiptComponent,
  [TABS.CREATE_OR_EDIT_GOODS_RECEIPT]: CreateOrEditGoodsReceiptComponent,
  [TABS.RECEIPT_NOTES]: ReceiptNotesComponent,
  [TABS.CREATE_OR_EDIT_RECEIPT_NOTES]: CreateOrEditReceiptNoteComponent,
  [TABS.CREATE_OR_EDIT_GR_FROM_RECEIPT_NOTES]: CreateOrEditGrFromReceiptNoteComponent,
  [TABS.RETURN_GOODS_RECEIPT]: ReturnGoodsReceiptComponent,
  [TABS.RETURN_GOODS_RECEIPT_LIST]: ReturnGoodsReceiptListComponent,
  [TABS.VIEW_GOODS_RECEIPT]: ViewReceiptDetailComponent,
  [TABS.VIEW_RECEIPT_NOTE]: ViewReceiptNoteComponent,
  
};

@NgModule({
  declarations: [
    GoodsReceiptComponent,
    CreateOrEditGoodsReceiptComponent,
    ReceiptNotesComponent,
    CreateOrEditReceiptNoteComponent,
    CreateOrEditGrFromReceiptNoteComponent,
    ReturnGoodsReceiptComponent,
    ReturnGoodsReceiptListComponent,
    ViewReceiptDetailComponent,
    ViewReceiptNoteComponent
  ],
  imports: [
    CommonModule,
    AppCommonModule,
    FormsModule,
    UtilsModule,
    AdminSharedModule,
  ]
})
export class GrModule {
  static getComponent(tabCode: string) {
    return tabcode_component_dict[tabCode];
}
 }
