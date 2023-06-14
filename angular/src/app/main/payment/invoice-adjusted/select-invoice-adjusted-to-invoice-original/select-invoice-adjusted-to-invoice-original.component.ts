import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { Component, ElementRef, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { AppComponentBase } from '@shared/common/app-component-base';
import { InvoiceAdjustedServiceProxy } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'select-invoice-adjusted-to-invoice-original',
  templateUrl: './select-invoice-adjusted-to-invoice-original.component.html',
  styleUrls: ['./select-invoice-adjusted-to-invoice-original.component.less']
})
export class SelectInvoiceAdjustedToInvoiceOriginalComponent extends AppComponentBase implements OnInit {


  @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
  @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
  @Output() close = new EventEmitter<any>();
  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridColDef: CustomColDef[];
  gridParams: GridParams | undefined;
  listInvoiceAdjusted;
  selectedRow;

  constructor(
    injector: Injector,
    private invoiceAdjustedServiceProxy: InvoiceAdjustedServiceProxy,
    private dataFormatService: DataFormatService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
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

  closeModal() {
    this.modal.hide();
  }

  reset() {

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

}
