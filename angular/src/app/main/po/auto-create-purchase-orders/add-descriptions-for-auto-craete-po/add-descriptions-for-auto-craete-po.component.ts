import { Component, ElementRef, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TmssSelectGridModalComponent } from '@app/shared/common/grid-input-types/tmss-select-grid-modal/tmss-select-grid-modal.component';
import { TABS } from '@app/shared/constants/tab-keys';
import { EventBusService } from '@app/shared/services/event-bus.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GetPurchaseRequestForCreatePODto, PurchaseOrdersServiceProxy } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'add-descriptions-for-auto-craete-po',
  templateUrl: './add-descriptions-for-auto-craete-po.component.html',
  styleUrls: ['./add-descriptions-for-auto-craete-po.component.less']
})
export class AddDescriptionsForAutoCraetePoComponent extends AppComponentBase implements OnInit {

  @Output() close = new EventEmitter<any>();
  @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
  @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
  @ViewChild('listPurchaseOrders', { static: true }) listPurchaseOrders!: TmssSelectGridModalComponent;
  createOrEditForm: FormGroup;
  type: number;
  selectMultiRows: GetPurchaseRequestForCreatePODto[];
  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private purchaseOrdersServiceProxy: PurchaseOrdersServiceProxy,
    private eventBus: EventBusService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
  }

  buildForm() {
    this.createOrEditForm = this.formBuilder.group({
      id: [0],
      descriptions: [undefined],
    });
  }

  show(selectedRows: GetPurchaseRequestForCreatePODto[]) {
    this.selectMultiRows = selectedRows;
    this.buildForm();
    this.modal.show();
  }

  save() {
    this.spinnerService.show();
        this.purchaseOrdersServiceProxy.createPOFromPR(this.createOrEditForm.get('descriptions').value, this.selectMultiRows)
          .pipe(finalize(() => {
            this.spinnerService.hide();
          }))
          .subscribe((res) => {
            this.modal.hide();
            this.close.emit();
            this.notify.success(this.l('SuccessfullyCreatedPo', res.length));
            this.eventBus.emit({
              type: 'openComponent',
              functionCode: TABS.PURCHASE_ORDERS,
              tabHeader: this.l('PurchaseOrdersManagement'),
              params: {
                  key: 1
              }
          });
        });
  }

  closeModal() {
    this.modal.hide();
  }

  reset() {
    this.createOrEditForm = undefined;
  }
}
