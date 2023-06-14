import { Component, ElementRef, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TmssSelectGridModalComponent } from '@app/shared/common/grid-input-types/tmss-select-grid-modal/tmss-select-grid-modal.component';
import { EventBusService } from '@app/shared/services/event-bus.service';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GetPurchaseRequestForCreatePODto, MstInventoryGroupServiceProxy, PurchaseOrdersServiceProxy, PurchaseRequestServiceProxy } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'update-inventory-group-modal',
  templateUrl: './update-inventory-group-modal.component.html',
  styleUrls: ['./update-inventory-group-modal.component.less']
})
export class UpdateInventoryGroupModalComponent extends AppComponentBase implements OnInit {

  @Output() close = new EventEmitter<any>();
  @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
  @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
  createOrEditForm: FormGroup;
  type: number;
  selectMultiRows: GetPurchaseRequestForCreatePODto[];
  listInventoryGroups: { label: string, value: string | number }[] = [];
  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private purchaseRequestServiceProxy: PurchaseRequestServiceProxy,
    private eventBus: EventBusService,
    private mstInventoryGroupServiceProxy: MstInventoryGroupServiceProxy,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.listInventoryGroups = [];
    this.mstInventoryGroupServiceProxy.getAllInventoryGroup().subscribe((res) => {
      res.forEach(e => this.listInventoryGroups.push({ label: e.productGroupName, value: e.id }))
    });

  }

  buildForm() {
    this.createOrEditForm = this.formBuilder.group({
      inventoryGroupId: [undefined]
    });
  }

  show(selectedRows: GetPurchaseRequestForCreatePODto[]) {
    this.selectMultiRows = selectedRows;
    this.buildForm();
    this.modal.show();
  }


  closeModal() {  
    this.modal.hide();
    this.close.emit();
  }

  save() {
    if(this.createOrEditForm.get('inventoryGroupId').value) {
      this.spinnerService.show();
      this.purchaseRequestServiceProxy.updateInventoryGroup(this.createOrEditForm.get('inventoryGroupId').value,this.selectMultiRows)
      .pipe(finalize(() => {
        this.spinnerService.hide();
      }))
      .subscribe(() => {
        this.modal.hide();
        this.close.emit();
        this.notify.success(this.l('SavedSuccessfully'));
      })
    }
    else {
      this.notify.success(this.l('InventoryGroupCannotEmpty'));
    }
  }

  reset() {

  }

}
