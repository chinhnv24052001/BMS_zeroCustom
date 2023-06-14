import { DigitalInvoiceDetailComponent } from './digital-invoice-detail/digital-invoice-detail.component';
import { DigitalInvoiceComponent } from './digital-invoice/digital-invoice.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TABS } from '@app/shared/constants/tab-keys';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { FormsModule } from '@angular/forms';
import { UtilsModule } from '@shared/utils/utils.module';
import { AdminSharedModule } from '@app/admin/shared/admin-shared.module';
import { PaymentHeadersComponent } from './payment-headers/payment-headers.component';
import { InvoicesComponent } from './invoice/invoices.component';
import { CreateOrEditInvoicesComponent } from './invoice/create-or-edit-invoices/create-or-edit-invoices.component';
import { CreateOrEditPaymentHeadersComponent } from './payment-headers/create-or-edit-payment-headers/create-or-edit-payment-headers.component';
import { ApplyPrepaymentComponent } from './invoice/apply-prepayment/apply-prepayment.component';
import { PaymentPrepaymentComponent } from './payment-prepayment/payment-prepayment.component';
import { CreateOrEditPrepaymentComponent } from './payment-prepayment/create-or-edit-prepayment/create-or-edit-prepayment.component';
import { CompareInvoiceComponent } from './compare-invoice/compare-invoice.component';
import { PaymentFromSuppliersComponent } from './payment-from-suppliers/payment-from-suppliers.component';
import { CreateOrEditPaymentFromSupliersComponent } from './payment-from-suppliers/create-or-edit-payment-from-suppliers/create-or-edit-payment-from-suppliers.component';
import { InvoiceImportMultipleComponent } from './invoice/invoice-import-multiple/invoice-import-multiple.component';
import { MatchedInvoiceComponent } from './invoice/matched-invoice/matched-invoice.component';
import { ImportPoItemsComponent } from './invoice/create-or-edit-invoices/import-po-items/import-po-items.component';
import { NoteModalComponent } from './invoice/note-modal/note-modal.component';
import { InvoiceAdjustedComponent } from './invoice-adjusted/invoice-adjusted.component';
import { CreateOrEditIvnocieAdjustedComponent } from './invoice-adjusted/create-or-edit-ivnocie-adjusted/create-or-edit-ivnocie-adjusted.component';
import { SelectInvoiceAdjustedToInvoiceOriginalComponent } from './invoice-adjusted/select-invoice-adjusted-to-invoice-original/select-invoice-adjusted-to-invoice-original.component';

const tabcode_component_dict = {
    [TABS.PAYMENT_REQUEST]: PaymentHeadersComponent,
    [TABS.INVOICE]: InvoicesComponent,
    [TABS.INVOCIE_ADJUSTED]: InvoiceAdjustedComponent,
    [TABS.CREATE_OR_EDIT_INVOCIE_ADJUSTED]: CreateOrEditIvnocieAdjustedComponent,
    [TABS.DIGITAL_INVOICE]: DigitalInvoiceComponent,
    [TABS.DIGITAL_INVOICE_DETAIL]: DigitalInvoiceDetailComponent,
    [TABS.PAYMENT_ADVANCE]: PaymentPrepaymentComponent,
    [TABS.COMPARE_INVOICE]: CompareInvoiceComponent,
    [TABS.CREATE_OR_EDIT_PAYMENT_REQUEST]: CreateOrEditPaymentHeadersComponent,
    [TABS.PAYMENT_REQUEST_FROM_SUPPLIERS]: PaymentFromSuppliersComponent,
};

@NgModule({
  declarations: [
    PaymentHeadersComponent,
    CreateOrEditPaymentHeadersComponent,
    InvoicesComponent,
    CreateOrEditInvoicesComponent,
    DigitalInvoiceComponent,
    DigitalInvoiceDetailComponent,
    PaymentPrepaymentComponent,
    CreateOrEditPrepaymentComponent,
    CompareInvoiceComponent,
    ApplyPrepaymentComponent,
    PaymentFromSuppliersComponent,
    CreateOrEditPaymentFromSupliersComponent,
    InvoiceImportMultipleComponent,
    MatchedInvoiceComponent,
    ImportPoItemsComponent,
    NoteModalComponent,
    InvoiceAdjustedComponent,
    CreateOrEditIvnocieAdjustedComponent,
    SelectInvoiceAdjustedToInvoiceOriginalComponent
  ],
  imports: [
    CommonModule,
    AppCommonModule,
    FormsModule,
    UtilsModule,
    AdminSharedModule
  ],
  exports:[
    CreateOrEditPaymentHeadersComponent
  ]
})
export class PaymentRequestModule {
  static getComponent(tabCode: string) {
    return tabcode_component_dict[tabCode];
}
 }
