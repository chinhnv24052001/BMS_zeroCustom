import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { Component, ElementRef, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TmssSelectGridModalComponent } from '@app/shared/common/grid-input-types/tmss-select-grid-modal/tmss-select-grid-modal.component';
import { TABS } from '@app/shared/constants/tab-keys';
import { CustomColDef, PaginationParamsModel } from '@app/shared/models/base.model';
import { EventBusService } from '@app/shared/services/event-bus.service';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GetPurchaseRequestForCreatePODto, PurchaseOrdersServiceProxy } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'add-purchase-request-to-purchase-orders-modal',
  templateUrl: './add-purchase-request-to-purchase-orders-modal.component.html',
  styleUrls: ['./add-purchase-request-to-purchase-orders-modal.component.less']
})
export class AddPurchaseRequestToPurchaseOrdersModalComponent extends AppComponentBase implements OnInit {

  @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
  @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
  @ViewChild('listPurchaseOrders', { static: true }) listPurchaseOrders!: TmssSelectGridModalComponent;
  @Output() close = new EventEmitter<any>();
  @Output() changeTabCode: EventEmitter<{ addRegisterNo: string }> = new EventEmitter();
  @Output() autoReloadWhenDisplayTab: EventEmitter<{ reload: boolean, registerNo?: string, reloadTabHasRegisterNo?: string, tabCodes?: string[], key: string }> = new EventEmitter();
  createOrEditForm: FormGroup;
  purchaseOrdersDefs: CustomColDef[];
  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  selectMultiRows: GetPurchaseRequestForCreatePODto[];

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private eventBus: EventBusService,
    private purchaseOrdersServiceProxy: PurchaseOrdersServiceProxy,
  ) {
    super(injector);
  }

  ngOnInit(): void {

    this.purchaseOrdersDefs = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        maxWidth: 70,
      },
      {
        headerName: this.l('PoNumber'),
        headerTooltip: this.l('PoNumber'),
        field: 'poNumber',
        maxWidth: 100,
      },
      {
        headerName: this.l('Description'),
        headerTooltip: this.l('Description'),
        field: 'descriptions'
      },
      {
        headerName: this.l('SupplierName'),
        headerTooltip: this.l('SupplierName'),
        field: 'supplierName'
      }
    ];

  }

  buildForm() {
    this.createOrEditForm = this.formBuilder.group({
      id: [0],
      poNumber: [undefined],
    });
  }

  closeModal() {
    this.modal.hide();
  }

  reset() {
    this.createOrEditForm = undefined;
  }

  patchPurchaseOrders(event: any) {
    this.createOrEditForm.get('poNumber').setValue(event.poNumber);
    this.createOrEditForm.get('id').setValue(event.id);
  }

  getAllPurchaseOrders(poNumber: string) {
    return this.purchaseOrdersServiceProxy.getListPoForAddPrToPos(poNumber);
  }

  showPurchaseOrders() {
    this.listPurchaseOrders.show(this.createOrEditForm.get('poNumber').value);
  }

  show(selectMultiRows: GetPurchaseRequestForCreatePODto[]) {
    this.buildForm();
    this.selectMultiRows = selectMultiRows;
    this.modal.show();

  }

  addToPo() {
    if (this.createOrEditForm.get('id').value && this.createOrEditForm.get('id').value > 0) {
      this.spinnerService.show();
      this.purchaseOrdersServiceProxy.addPrToPoExist(this.createOrEditForm.get('id').value, this.selectMultiRows)
      .pipe(finalize(() => {
        this.spinnerService.hide();
      })).subscribe((res) => {
        this.modal.hide();
        this.close.emit();
        res.forEach(e => {
          this.eventBus.emit({
            type: 'openComponent',
            functionCode: TABS.CREATE_OR_EDIT_PURCHASE_ORDERS,
            tabHeader: this.l('CreateOrEditPurchaseOrder'),
            params: {
              data: {
                countTab: e.poNumber,
                purchaseOrderId: e.id
              }
            }
          });
          this.changeTabCode.emit({ addRegisterNo: e.poNumber });
          this.autoReloadWhenDisplayTab.emit({ reload: true, registerNo: e.poNumber, reloadTabHasRegisterNo: e.poNumber, tabCodes: [TABS.CREATE_OR_EDIT_PURCHASE_REQUEST], key: TABS.PURCHASE_REQUEST })
        })
      });
    } else {
      this.notify.warn(this.l('PoNumberEmpty'));
    }
  }
}
