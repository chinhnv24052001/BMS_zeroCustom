import { Component, ElementRef, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CommonGeneralCacheServiceProxy } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'purchase-order-terms-modal',
  templateUrl: './purchase-order-terms-modal.component.html',
  styleUrls: ['./purchase-order-terms-modal.component.less']
})
export class PurchaseOrderTermsModalComponent extends AppComponentBase implements OnInit {

  @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
  @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
  @Output() close = new EventEmitter<any>();
  createOrEditForm: FormGroup;
  listPayments: { label: string, value: string | number }[] = [];
  listFreights: { label: string, value: string | number }[] = [];
  listplaces: { label: string, value: string | number }[] = [];
  listCarriers: { label: string, value: string | number }[] = [];
  listShipments: { label: string, value: string | number }[] = [];
  listFobs: { label: string, value: string | number }[] = [];
  listPriceBasis: { label: string, value: string | number }[] = [];
  listPayOns: { label: string, value: string | number }[] = [];
  listPaidBys: { label: string, value: string | number }[] = [];
  listOthers: { label: string, value: string | number }[] = [];
  listUsers: { label: string, value: string | number }[] = [];

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private commonGeneralCacheServiceProxy: CommonGeneralCacheServiceProxy,
  ) {
    super(injector);
  }

  ngOnInit(): void {

    this.listplaces = [];
    this.listShipments = [];
    this.listPriceBasis = [];
    this.listPaidBys = [];
    this.listOthers = [];
    this.listPayments = [];

    this.commonGeneralCacheServiceProxy.getLookupsBy('PO_TERMS_PLACE').subscribe((val) => {
      val.forEach(e => {
        this.listplaces.push({value: e.displayedField, label: e.displayedField})
      });
    });

    this.commonGeneralCacheServiceProxy.getLookupsBy('PO_TERMS_SHIPMENT').subscribe((val) => {
      val.forEach(e => {
        this.listShipments.push({value: e.displayedField, label: e.displayedField})
      });
    });

    this.commonGeneralCacheServiceProxy.getLookupsBy('PO_TERMS_PRICE_BASIS').subscribe((val) => {
      val.forEach(e => {
        this.listPriceBasis.push({value: e.displayedField, label: e.displayedField})
      });
    });

    this.commonGeneralCacheServiceProxy.getLookupsBy('PO_TERMS_PAIR_BY').subscribe((val) => {
      val.forEach(e => {
        this.listPaidBys.push({value: e.displayedField, label: e.displayedField})
      });
    });

    this.commonGeneralCacheServiceProxy.getLookupsBy('FREIGHT TERMS').subscribe((val) => {
      val.forEach(e => {
        this.listFreights.push({value: e.displayedField, label: e.displayedField})
      });
    });

    this.commonGeneralCacheServiceProxy.getLookupsBy('PO_TERMS_OTHERS').subscribe((val) => {
      val.forEach(e => {
        this.listOthers.push({value: e.displayedField, label: e.displayedField})
      });
    });

    this.commonGeneralCacheServiceProxy.getAllPaymentTerms().subscribe((val) => {
      val.forEach(e => {
        this.listPayments.push({value: e.id, label: e.name})
      });
    });

    this.commonGeneralCacheServiceProxy.getAllUsersInfo().subscribe((res) => {
      res.forEach(e => this.listUsers.push({ label: e.name, value: e.id }))
    })
  }

  buildForm() {
    this.createOrEditForm = this.formBuilder.group({
      id: [0],
      termsId: 10061,
      attribute10: [undefined],
      freight: [undefined],
      attribute11: [undefined],
      carrier: [undefined],
      attribute12: [undefined],
      fob: [undefined],
      attribute13: [undefined],
      payOn: [undefined],
      attribute14: 'T/T ( Tele transfer)',
      attribute15: 'VAT excluded',
      personSigningId: [undefined],
      termDescription: [undefined],
      ContractExpirationDate: new Date(),
    });
  }

  showModal(formVal) {
    this.buildForm();
    this.createOrEditForm.patchValue(formVal);
    this.modal.show();
  }

  sendRequest() {

  }

  save() {
    // this.createOrEditForm
    this.close.emit(this.createOrEditForm.getRawValue());
    this.modal.hide();
  }

  reset() {
    this.createOrEditForm = undefined;
  }

  closeModal() {
    this.modal.hide();
  }

}
