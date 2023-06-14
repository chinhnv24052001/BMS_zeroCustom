import { Component, ElementRef, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TmssSelectGridModalComponent } from '@app/shared/common/grid-input-types/tmss-select-grid-modal/tmss-select-grid-modal.component';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GetPurchaseOrdersDto, PurchaseOrdersServiceProxy } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { type } from 'os';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'note-modal-supplier-confirm',
  templateUrl: './note-modal-supplier-confirm.component.html',
  styleUrls: ['./note-modal-supplier-confirm.component.less']
})
export class NoteModalSupplierConfirmComponent extends AppComponentBase implements OnInit {
  @Output() close = new EventEmitter<any>();
  @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
  @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
  @ViewChild('listPurchaseOrders', { static: true }) listPurchaseOrders!: TmssSelectGridModalComponent;
  createOrEditForm: FormGroup;
  type: number;
  selectedRows: GetPurchaseOrdersDto[] = [];
  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private purchaseOrdersServiceProxy: PurchaseOrdersServiceProxy,
  ) {
    super(injector);
  }

  ngOnInit(): void {
  }

  buildForm() {
    this.createOrEditForm = this.formBuilder.group({
      id: [0],
      note: [undefined],
    });
  }

  show(type: number, selectedRows: GetPurchaseOrdersDto[] = []) {
    this.selectedRows = selectedRows;
    this.buildForm();
    this.type = type;
    this.modal.show();
  }

  save() {
    let listId: any = [];
    this.selectedRows.forEach(e => listId.push(e.id))
    this.spinnerService.show();
    this.purchaseOrdersServiceProxy.supplierComfirm(this.type, this.createOrEditForm.get('note').value, listId)
      .pipe(finalize(() => {
      this.spinnerService.hide();
    }))
      .subscribe(val => {
        this.modal.hide();
        this.close.emit();
        this.notify.success(this.l('SavedSuccessfully'));
      });
  }

  closeModal() {
    this.modal.hide();
  }

  reset() {
    this.createOrEditForm = undefined;
  }

}
