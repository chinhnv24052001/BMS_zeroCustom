import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GetPrepaymentDto, MstSupplierServiceProxy, PaymentPrepaymentDto, PrepaymentServiceProxy } from '@shared/service-proxies/service-proxies';
import { ceil } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import { CreateOrEditPrepaymentComponent } from './create-or-edit-prepayment/create-or-edit-prepayment.component';

@Component({
  selector: 'app-payment-prepayment',
  templateUrl: './payment-prepayment.component.html',
  styleUrls: ['./payment-prepayment.component.css']
})
export class PaymentPrepaymentComponent extends AppComponentBase implements OnInit {
  @ViewChild('createOrEditPaymentAdvance', { static: true }) createOrEditPaymentAdvance: CreateOrEditPrepaymentComponent;
  searchForm: FormGroup;
  gridColDef: CustomColDef[];
  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridParams: GridParams | undefined;
  listPaymentAdvance: PaymentPrepaymentDto[];
  selectedRow: PaymentPrepaymentDto = new PaymentPrepaymentDto();
  listSupplier: { label: string, value: string | number }[] = [];
  constructor(
    injector: Injector,
    private _service: PrepaymentServiceProxy,
    private dataFormatService: DataFormatService,
    private formBuilder: FormBuilder,
    private mstSupplierServiceProxy: MstSupplierServiceProxy,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.buildForm();
    this.gridColDef = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        width: 2,
      },
      {
        headerName: this.l('PoNo'),
        headerTooltip: this.l('PoNo'),
        field: 'poNo'
      },
      {
        headerName: this.l('SupplierName'),
        headerTooltip: this.l('SupplierName'),
        field: 'supplierName'
      },
      {
        headerName: this.l('AdvancedDate'),
        headerTooltip: this.l('AdvancedDate'),
        field: 'advancedDate',
        valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.advancedDate) : "",
      },
      {
        headerName: this.l('Prepayment'),
        headerTooltip: this.l('Prepayment'),
        field: 'amount',
        valueFormatter: param => param.data ? this.dataFormatService.formatMoney(param.data.amount).toString() : "",
        cellClass:['text-right'],
      },
      {
        headerName: this.l('InvoiceNum'),
        headerTooltip: this.l('InvoiceNum'),
        field: 'invoiceNum'
      },
      {
        headerName: this.l('InvoiceDate'),
        headerTooltip: this.l('InvoiceDate'),
        field: 'invoiceDate',
        valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.invoiceDate) : "",
      },
      {
        headerName: this.l('PaymentNo'),
        headerTooltip: this.l('PaymentNo'),
        field: 'paymentNo'
      },
      {
        headerName: this.l('RequestDate'),
        headerTooltip: this.l('RequestDate'),
        field: 'paymentRequestDate',
        valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.paymentRequestDate) : "",
      }
    ]
    this.getSupplierList();
  }

  buildForm() {
    this.searchForm = this.formBuilder.group({
      poNo: [undefined],
      vendorId: [-1],
      vendorSiteId: [-1]
    });
  }

  callBackGrid(params: GridParams) {
    this.gridParams = params;
    params.api.setRowData([]);
  }

  onChangeSelection(params) {
    this.selectedRow = params.api.getSelectedRows()[0] ?? new PaymentPrepaymentDto();
    this.selectedRow = Object.assign({}, this.selectedRow);
  }

  changePaginationParams(paginationParams: PaginationParamsModel) {
    if (!this.listPaymentAdvance) {
      return;
    }
    this.paginationParams = paginationParams;
    this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
    this.paginationParams.pageSize = paginationParams.pageSize;
    this.search();
  }

  search() {
    this.spinnerService.show();
    this._service.getAllPrepayment(
      this.searchForm.get('poNo').value,
      this.searchForm.get('vendorId').value,
      -1, //this.searchForm.get('vendorSiteId').value,
      -1,
     (this.paginationParams ? this.paginationParams.sorting : ''),
      (this.paginationParams ? this.paginationParams.pageSize : 20),
       (this.paginationParams ? this.paginationParams.skipCount : 1))
   .pipe(finalize(() => {
        this.spinnerService.hide();
    })).subscribe((result) => {
      this.listPaymentAdvance = result.items;
      this.gridParams.api.setRowData(this.listPaymentAdvance);
      this.paginationParams.totalCount = result.totalCount;
      this.paginationParams.totalPage = ceil(result.totalCount / this.paginationParams.pageSize);
      this.gridParams.api.sizeColumnsToFit();
    });
  }

  getSupplierList() {
    this.listSupplier = [{ value: -1, label: 'Tất cả' }];
    this.mstSupplierServiceProxy.getAllSupplierNotPaged("").subscribe(
      res => {
        res.forEach(e => this.listSupplier.push({ value: e.id, label: e.supplierName }));
      });
  }

  add() {
    this.createOrEditPaymentAdvance.show();
    //this.search();
  }

  edit() {
    if (this.selectedRow.id && this.selectedRow.id > 0) {
      this.createOrEditPaymentAdvance.show(this.selectedRow.id);
    } else {
      this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Edit));
    }
   // this.search();
  }

  delete() {
    if (this.selectedRow.isAppliedInvoice) {
      this.notify.warn('Prepayment đã được gán cho hóa đơn, không thể xóa!');
      return;
    }

    if (this.selectedRow.isPaymentAdded) {
      this.notify.warn('Prepayment đã được thanh toán, không thể xóa!');
      return;
    }

    if (this.selectedRow.id && this.selectedRow.id > 0) {
      this.message.confirm('', this.l(AppConsts.CPS_KEYS.Are_You_Sure), (isConfirmed) => {
        if (isConfirmed) {
          this.spinnerService.show();
          this._service.delete(this.selectedRow.id)
          .pipe(finalize(() => {
            this.spinnerService.hide();
          })).subscribe(val => {
            this.notify.success('Successfully Deleted');
            this.search();
          });
        }
      });
    } else {
      this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Delete))
    }
  }

}
