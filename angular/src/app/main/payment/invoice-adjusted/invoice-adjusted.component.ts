import { ICellRendererParams, ValueGetterParams } from '@ag-grid-enterprise/all-modules';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TABS } from '@app/shared/constants/tab-keys';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { EventBusService } from '@app/shared/services/event-bus.service';
import { AppComponentBase } from '@shared/common/app-component-base';
import { PurchaseRequestServiceProxy, RequestApprovalTreeServiceProxy, MstInventoryGroupServiceProxy, InvoiceAdjustedServiceProxy } from '@shared/service-proxies/service-proxies';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { ceil } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import { CreateOrEditIvnocieAdjustedComponent } from './create-or-edit-ivnocie-adjusted/create-or-edit-ivnocie-adjusted.component';

@Component({
  selector: 'app-invoice-adjusted',
  templateUrl: './invoice-adjusted.component.html',
  styleUrls: ['./invoice-adjusted.component.less']
})
export class InvoiceAdjustedComponent extends AppComponentBase implements OnInit {

  @ViewChild('createOrEditInvoiceAdjusted', { static: true }) createOrEditInvoiceAdjusted: CreateOrEditIvnocieAdjustedComponent;
  listSuppliers: { label: string, value: string | number }[] = [];
  invoiceAdjustedForm: FormGroup;
  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridColDef: CustomColDef[];
  gridParams: GridParams | undefined;
  listInvoiceAdjusted;
  selectedRow;

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private dataFormatService: DataFormatService,
    private invoiceAdjustedServiceProxy: InvoiceAdjustedServiceProxy,
  ) {
    super(injector);

    this.gridColDef = [
      // {
      //   headerName: "",
      //   headerTooltip: "",
      //   field: "checked",
      //   headerClass: ["align-checkbox-header"],
      //   cellClass: ["check-box-center"],
      //   checkboxSelection: true,
      //   headerCheckboxSelection: true,
      //   headerCheckboxSelectionFilteredOnly: true,
      //   width: 1,
      // },
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        maxWidth: 50,
        cellClass: ['text-center', 'cell-border'],
      },
      {
        headerName: this.l('InvoiceNo'),
        headerTooltip: this.l('InvoiceNo'),
        field: 'invoiceNo',
        maxWidth: 100,
        cellClass: ['cell-border'],
      },
      {
        headerName: this.l('TypeAdjusted'),
        headerTooltip: this.l('TypeAdjusted'),
        field: 'typeAdjusted',
        width: 150,
      },
      {
        headerName: this.l('SerialNo'),
        headerTooltip: this.l('SerialNo'),
        field: 'serialNo',
        cellClass: ['cell-border'],
        width: 120,
      },
      // {
      //   headerName: this.l('SupplierCode'),
      //   headerTooltip: this.l('SupplierCode'),
      //   field: 'supplierCode',
      //   maxWidth: 150,
      //   // valueGetter: (params: ValueGetterParams) => this.handleStatus(params.data?.authorizationStatus, params.data?.departmentApprovalName),
      //   cellClass: ['text-center', 'cell-border'],
      // },
      {
        headerName: this.l('SupplierName'),
        headerTooltip: this.l('SupplierName'),
        field: 'supplierName',
        cellClass: ['cell-border'],
        // valueGetter: (params: ValueGetterParams) => this.dataFormatService.formatMoney(params.data?.totalPrice),
        width: 200,
      },
      {
        headerName: this.l('VatAdjusted'),
        headerTooltip: this.l('VatAdjusted'),
        field: 'vatAdjusted',
      },
      {
        headerName: this.l('InvoiceDate'),
        headerTooltip: this.l('InvoiceDate'),
        field: 'invoiceDate',
        valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.invoiceDate) : "",
        width: 150,
      },
      {
        headerName: this.l('InvoiceNoAdjusted'),
        headerTooltip: this.l('InvoiceNoAdjusted'),
        field: 'invoiceNoAdjusted',
        maxWidth: 100,
        cellClass: ['text-center', 'cell-border'],
      },
      {
        headerName: this.l('SerialNoAdjusted'),
        headerTooltip: this.l('SerialNoAdjusted'),
        field: 'serialNoAdjusted',

        maxWidth: 130,
        cellClass: ['text-center', 'cell-border'],
      }
    ];
   }

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm() {
    this.invoiceAdjustedForm = this.formBuilder.group({
      invoiceNo: [undefined],
      serialNo: [undefined],
      supplierId: [undefined]
    });
    // this.searchPurchasePurpose();
  }

  changePaginationParams(paginationParams: PaginationParamsModel) {
    if (!this.listInvoiceAdjusted) {
      return;
    }
    this.paginationParams = paginationParams;
    this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
    this.paginationParams.pageSize = paginationParams.pageSize;
    // this.searchPurchaseRequest();
  }

  callBackGrid(params: GridParams) {
    this.gridParams = params;
    params.api.setRowData([]);
  }

  onChangeSelection(params) {

    // this.selectedRows = params.api.getSelectedRows();

    this.selectedRow =
      params.api.getSelectedRows()[0];
    this.selectedRow = Object.assign({}, this.selectedRow);
  }

  searchInvoiceAdjusted() {
    this.spinnerService.show();
    this.invoiceAdjustedServiceProxy.getAllInvoiceAdjusted(
      this.invoiceAdjustedForm.get('supplierId').value,
      this.invoiceAdjustedForm.get('invoiceNo').value,
      this.invoiceAdjustedForm.get('serialNo').value,
      (this.paginationParams ? this.paginationParams.sorting : ''),
      (this.paginationParams ? this.paginationParams.pageSize : 20),
      (this.paginationParams ? this.paginationParams.skipCount : 1))
      .pipe(finalize(() => {
        this.spinnerService.hide();
      }))
      .subscribe((val) => {
        this.gridParams.api.setRowData(val.items);
        this.paginationParams.totalCount = val.totalCount;
        this.paginationParams.totalPage = ceil(val.totalCount / this.paginationParams.pageSize);
      })
  }

  add() {
      // this.eventBus.emit({
      //   type: 'openComponent',
      //   functionCode: TABS.CREATE_OR_EDIT_INVOCIE_ADJUSTED,
      //   tabHeader: this.l('CreateOrEditInvoiceAdjusted'),
      // });
  

      this.createOrEditInvoiceAdjusted.showModal(0);
  }

  edit() {
    this.createOrEditInvoiceAdjusted.showModal(this.selectedRow.id);
  }

}
