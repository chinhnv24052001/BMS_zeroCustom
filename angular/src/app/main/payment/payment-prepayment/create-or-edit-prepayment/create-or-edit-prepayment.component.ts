import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { Component, ElementRef, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TmssSelectGridModalComponent } from '@app/shared/common/grid-input-types/tmss-select-grid-modal/tmss-select-grid-modal.component';
import { CustomColDef, PaginationParamsModel } from '@app/shared/models/base.model';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { MstSupplierServiceProxy, PrepaymentServiceProxy } from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'create-or-edit-prepayment',
  templateUrl: './create-or-edit-prepayment.component.html',
  styleUrls: ['./create-or-edit-prepayment.component.less']
})
export class CreateOrEditPrepaymentComponent extends AppComponentBase implements OnInit {
  @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
  @ViewChild('listAllPOs', { static: true }) listAllPOs!: TmssSelectGridModalComponent;
  @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
  @Output() close = new EventEmitter<any>();
  createOrEditForm: FormGroup;
  isEdit = true;
  inputText2Value = "";
  inputText2 = "";
  isSubmit = false;
  uomCodeErr = false;

  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridRNotesDef: CustomColDef[];
  isLoading = false;
  listSupplier: { label: string, value: string | number }[] = [];

  constructor(
    injector: Injector,
    private _service: PrepaymentServiceProxy,
    private formBuilder: FormBuilder,
    private dataFormatService: DataFormatService,
    private mstSupplierServiceProxy: MstSupplierServiceProxy,
  ) {
    super(injector);

    this.gridRNotesDef = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        maxWidth: 60,
      },
      {
        headerName: this.l('PoNo'),
        headerTooltip: this.l('PoNo'),
        field: 'poNo',
        maxWidth: 110,
        cellClass: ['text-center'],
      },
      {
        headerName: this.l('TotalPrice'),
        headerTooltip: this.l('TotalPrice'),
        field: 'totalPrice',
        valueFormatter: param => param.data ? this.dataFormatService.formatMoney(param.data.totalPrice).toString() : "",
        cellClass:['text-right'],
        width: 100,
      },
      {
        headerName: this.l('AvailableAmount'),
        headerTooltip: this.l('AvailableAmount'),
        field: 'availableAmount',
        valueFormatter: param => param.data ? this.dataFormatService.formatMoney(param.data.availableAmount).toString() : "",
        cellClass:['text-right'],
        width: 100,
      },
      // {
      //   headerName: this.l('ApprovedDate'),
      //   headerTooltip: this.l('ApprovedDate'),
      //   field: 'approvedDate',
      //   valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.approvedDate) : "",
      //   width: 80,
      // },
      {
        headerName: this.l('VendorName'),
        headerTooltip: this.l('VendorName'),
        field: 'vendorName',
        minWidth: 300,
      },
    ];

    this.getSupplierList();
  }

  ngOnInit(): void {
  }

  buildForm() {
    this.createOrEditForm = this.formBuilder.group({
      id: [0],
      poHeaderId: [undefined, GlobalValidator.required],
      poNo: [undefined, GlobalValidator.required],
      vendorId: [undefined, GlobalValidator.required],
      amount: [undefined, GlobalValidator.required],
      advancedDate: [new Date(), GlobalValidator.required],
      isAppliedInvoice: [false],
      isPaymentAdded: [false],
      availableAmount: [undefined]
    });
  }

  getAllPOs(suplierName: any, paginationParams: PaginationParamsModel) {
    if(!suplierName)
    return this._service.getAllPOs(
      this.createOrEditForm.get("poNo").value,
      this.createOrEditForm.get("vendorId").value,
      -1, //this.createOrEditForm.get("vendorSiteId").value,
      -1,
      (this.paginationParams ? this.paginationParams.sorting : ''),
      (this.paginationParams ? this.paginationParams.pageSize : 100),
      (this.paginationParams ? this.paginationParams.skipCount : 1)
    );
    else
    console.log(suplierName);
    return this._service.getAllPOs(
      suplierName,
      this.createOrEditForm.get("vendorId").value,
      -1, //this.createOrEditForm.get("vendorSiteId").value,
      -1,
      (this.paginationParams ? this.paginationParams.sorting : ''),
      (this.paginationParams ? this.paginationParams.pageSize : 100),
      (this.paginationParams ? this.paginationParams.skipCount : 1)
    );
  }

  setLoading(params) {
    this.isLoading = params;
  }
  searchPOs() {
    this.listAllPOs.show();
  }
  patchSelectedPO(event: any) {
    this.createOrEditForm.patchValue(event);
    this.createOrEditForm.get('availableAmount').setValue(this.dataFormatService.numberFormat(event.availableAmount));
  }

  show(id?: number) {
    this.buildForm();
    this.uomCodeErr = false;
    if (id && id > 0) {
      this.spinnerService.show();
      this.isEdit = true;
      this._service.loadById(id)
      .pipe(finalize(() => {
        this.spinnerService.hide();
      })).subscribe(val => {
        this.createOrEditForm.patchValue(val);
        //this.createOrEditForm.get('amount').setValue(this.dataFormatService.formatMoney(val.amount));
      });
    }
    else {
      this.isEdit = false;
    }
    this.modal.show();
  }

  closeModel() {
    this.modal.hide();
  }

  reset() {
    this.createOrEditForm = undefined;
  }

  getSupplierList() {
    this.listSupplier = [{ value: -1, label: 'Tất cả' }];
    this.mstSupplierServiceProxy.getAllSupplierNotPaged("").subscribe(
      res => {
        res.forEach(e => this.listSupplier.push({ value: e.id, label: e.supplierName }));
      });
  }

  save() {
    if (this.createOrEditForm.get('isAppliedInvoice').value) {
      this.notify.warn('Prepayment đã được gán cho hóa đơn, không thể cập nhật!');
      return;
    }

    if (this.createOrEditForm.get('isPaymentAdded').value) {
      this.notify.warn('Prepayment đã được thanh toán, không thể cập nhật!');
      return;
    }

    this.isSubmit = true;
    if (this.submitBtn) {
      this.submitBtn.nativeElement.click();
    }

    if (!this.createOrEditForm.get("poNo").value) {
      this.notify.warn('Yêu cầu nhập PO!');
      return;
    }

    if (!(this.createOrEditForm.get("vendorId").value > 0)) {
      this.notify.warn('Yêu cầu nhập Vendor!');
      return;
    }

    if (!(this.createOrEditForm.get("amount").value > 0)) {
      this.notify.warn('Yêu cầu nhập amount > 0!');
      return;
    }

    // if (this.createOrEditForm.invalid) {
    //   return;
    // }

    this.spinnerService.show();
    this._service.save(this.createOrEditForm.getRawValue())
      .pipe(finalize(() => {
        this.spinnerService.hide();
      }))
      .subscribe(val => {
        this.notify.success(this.l(AppConsts.CPS_KEYS.Saved_Successfully));
        this.modal.hide();
        this.close.emit();
      });
  }
}
