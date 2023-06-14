import { Component, ElementRef, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AgCellButtonRendererComponent } from '@app/shared/common/grid-input-types/ag-cell-button-renderer/ag-cell-button-renderer.component';
import { AgDropdownRendererComponent } from '@app/shared/common/grid-input-types/ag-dropdown-renderer/ag-dropdown-renderer.component';
import { TmssSelectGridModalComponent } from '@app/shared/common/grid-input-types/tmss-select-grid-modal/tmss-select-grid-modal.component';
import { AgCellEditorParams, CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { GridTableService } from '@app/shared/services/grid-table.service';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CommonGeneralCacheServiceProxy, GetListInvoiceHeadersDto, InputInvoiceAdjustedHeadersDto, InputInvoiceAdjustedLinesDto, InvoiceAdjustedServiceProxy } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'create-or-edit-ivnocie-adjusted',
  templateUrl: './create-or-edit-ivnocie-adjusted.component.html',
  styleUrls: ['./create-or-edit-ivnocie-adjusted.component.less']
})
export class CreateOrEditIvnocieAdjustedComponent extends AppComponentBase implements OnInit {

  @ViewChild('listLineInvoices', { static: true }) listLineInvoices!: TmssSelectGridModalComponent;
  @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
  @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
  @Output() close = new EventEmitter<any>();

  createOrEditForm: FormGroup;
  listInvocieAdjusted;
  invoiceId: number;
  listTypeInvoiceAdjusted: { label: string, value: number }[] = [];
  listSuppliers: { label: string, value: number }[] = [];
  listInvoicesCb: { label: string, value: string }[] = [];
  listTypeAdjusted: { label: string, value: string | number }[] = [];
  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridColDefDetail: CustomColDef[];
  lineInvoiceDefs: CustomColDef[];
  gridParamsDetail: GridParams | undefined;
  selectedRowDetail: InputInvoiceAdjustedLinesDto;
  selectedNode;
  frameworkComponents;
  displayedData: InputInvoiceAdjustedLinesDto[] = [];
  inputInvoiceAdjustedHeadersDto: InputInvoiceAdjustedHeadersDto = new InputInvoiceAdjustedHeadersDto();
  listInvoices: GetListInvoiceHeadersDto[] = [];

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private dataFormatService: DataFormatService,
    private commonGeneralCacheServiceProxy: CommonGeneralCacheServiceProxy,
    private invoiceAdjustedServiceProxy: InvoiceAdjustedServiceProxy,
    private gridTableService: GridTableService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.frameworkComponents = {
      agDropdownRendererComponent: AgDropdownRendererComponent,
      agCellButtonRendererComponent: AgCellButtonRendererComponent
    };

    // this.buildForm();

    this.listSuppliers = [];
    this.listTypeInvoiceAdjusted = [];
    this.listTypeAdjusted = [];

    this.commonGeneralCacheServiceProxy.getAllSuppliers().subscribe((res) => {
      res.forEach(e => this.listSuppliers.push({ label: (e.supplierName), value: e.id }))
    });

    this.listTypeInvoiceAdjusted.push({ label: 'Điều chỉnh tăng', value: 1 });
    this.listTypeInvoiceAdjusted.push({ label: 'Điều chỉnh giảm', value: 2 });

    this.listTypeAdjusted.push({ label: 'Đơn giá', value: 'UNIT_PRICE' });
    this.listTypeAdjusted.push({ label: 'Giá trị', value: 'VALUE' });

    this.gridColDefDetail = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params) => params.rowIndex + 1,
        width: 50,
        cellClass: ['cell-border', 'text-center'],
      },
      {
        headerName: this.l('SelectLineInv'),
        headerTooltip: this.l('SelectLineInv'),
        cellClass: ['cell-clickable', 'cell-border'],
        cellRenderer: 'agCellButtonRendererComponent',
        buttonDef: {
          text: this.l('SelectLine'),
          className: 'btn btn-outline-primary',
          function: this.showSearcLineInvoice.bind(this),
        },
        width: 70,
      },
      {
        headerName: this.l('TypeAdjusted'),
        headerTooltip: this.l('TypeAdjusted'),
        field: 'typeAdjusted',
        cellClass: ['cell-border'],
        validators: ['required'],
        cellRenderer: 'agDropdownRendererComponent',
        list: () => { return this.listTypeAdjusted.map(e => Object.assign({}, { key: e.value, value: e.label })) },
        width: 70,
      },
      {
        headerName: this.l('ContentAdjusted'),
        headerTooltip: this.l('ContentAdjusted'),
        field: 'contentAdjusted',
        cellClass: ['cell-border', 'cell-clickable'],
        width: 200,
        editable: true,
        validators: ['required'],
      },
      {
        headerName: this.l('InvLineAdjusted'),
        headerTooltip: this.l('InvLineAdjusted'),
        field: 'invLineAdjusted',
        cellClass: ['cell-border'],
        width: 100,
      },
      {
        headerName: this.l('Quantity'),
        headerTooltip: this.l('Quantity'),
        field: 'quantity',
        cellClass: ['cell-border', 'text-right'],
        width: 80,
        validators: ['required', 'floatNumber'],
      },

      // {
      //   headerName: this.l('UOM'),
      //   headerTooltip: this.l('UOM'),
      //   field: 'unitMeasLookupCode',
      //   cellClass: ['cell-clickable', 'cell-border'],
      //   editable: true,
      //   width: 150,
      // },
      {
        headerName: this.l('UnitPrice'),
        headerTooltip: this.l('UnitPrice'),
        field: 'unitPrice',
        editable: true,
        cellClass: ['cell-clickable', 'cell-border', 'text-right'],
        width: 100,
        valueGetter: params => this.dataFormatService.floatMoneyFormat((params.data.unitPrice) ? params.data.unitPrice : 0)
      },
      {
        headerName: this.l('TotalPrice'),
        headerTooltip: this.l('TotalPrice'),
        field: 'totalPrice',
        cellClass: ['cell-border', 'text-right'],
        width: 100,
        valueGetter: params => this.dataFormatService.floatMoneyFormat((params.data.totalPrice) ? params.data.totalPrice : 0),
      },
      {
        headerName: this.l('Tax'),
        headerTooltip: this.l('Tax'),
        field: 'tax',
        cellClass: ['cell-border', 'text-right'],
        width: 70,
      },
      {
        headerName: this.l('VAT'),
        headerTooltip: this.l('VAT'),
        field: 'vat',
        cellClass: ['cell-border', 'text-right'],
        width: 100,
        valueGetter: params => this.dataFormatService.floatMoneyFormat((params.data.vat) ? params.data.vat : 0),
      },
      {
        headerName: this.l('TotalPriceAdjusted'),
        headerTooltip: this.l('TotalPriceAdjusted'),
        field: 'totalPriceAdjusted',
        cellClass: ['cell-border', 'text-right'],
        valueGetter: params => this.dataFormatService.floatMoneyFormat((params.data.totalPriceAdjusted) ? params.data.totalPriceAdjusted : 0),
        width: 130,
      }
    ];

    this.lineInvoiceDefs = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params) => params.rowIndex + 1,
        width: 50,
        cellClass: ['cell-border', 'text-center'],
      },
      // {
      //   headerName: this.l('lineNum'),
      //   headerTooltip: this.l('lineNum'),
      //   field: 'lineNum',
      //   cellClass: ['cell-border'],
      //   validators: ['required'],
      //   cellRenderer: 'agDropdownRendererComponent',
      //   width: 70,
      // },
      {
        headerName: this.l('PoNumber'),
        headerTooltip: this.l('PoNumber'),
        field: 'poNumber',
        cellClass: ['cell-border'],
        width: 100,
        validators: ['required'],
      },
      {
        headerName: this.l('LineNum'),
        headerTooltip: this.l('LineNum'),
        field: 'lineNum',
        cellClass: ['cell-border'],
        width: 200,
      },
      {
        headerName: this.l('ItemDescription'),
        headerTooltip: this.l('ItemDescription'),
        field: 'itemDescription',
        cellClass: ['cell-border'],
        width: 150,
      },

      {
        headerName: this.l('Quantity'),
        headerTooltip: this.l('Quantity'),
        field: 'quantity',
        cellClass: ['cell-border', 'text-right'],
        width: 80,
      },
      {
        headerName: this.l('UnitPrice'),
        headerTooltip: this.l('UnitPrice'),
        field: 'unitPrice',
        editable: true,
        cellClass: ['cell-border', 'text-right'],
        width: 100,
        valueGetter: params => this.dataFormatService.floatMoneyFormat((params.data.unitPrice) ? params.data.unitPrice : 0)
      },
      {
        headerName: this.l('TaxRate'),
        headerTooltip: this.l('TaxRate'),
        field: 'taxRate',
        cellClass: ['cell-border', 'text-right'],
        width: 70,
      },
      {
        headerName: this.l('VAT'),
        headerTooltip: this.l('VAT'),
        field: 'vat',
        cellClass: ['cell-border', 'text-right'],
        width: 100,
        valueGetter: params => this.dataFormatService.floatMoneyFormat((params.data.vat) ? params.data.vat : 0),
      }
    ];
  }

  buildForm() {
    this.createOrEditForm = this.formBuilder.group({
      id: 0,
      invoiceNo: [undefined],
      serialNo: [undefined],
      invoiceDate: [undefined],
      invoiceNoAdjusted: [undefined],
      serialNoAdjusted: [undefined],
      invoiceDateAdjusted: [undefined],
      supplierId: [undefined],
      bankAccount: [undefined],
      bankName: [undefined],
      typeAdjusted: [undefined],
      description: [undefined],
    });

    this.createOrEditForm.get('supplierId').valueChanges.subscribe((val) => {
      this.listInvoicesCb = [];
      this.invoiceAdjustedServiceProxy.getListInvoiceHeadersByVendorId(this.createOrEditForm.get('supplierId').value ?? 0).subscribe((res) => {
        this.listInvoices = res;
        res.forEach(e => this.listInvoicesCb.push({ label: e.invoiceNo, value: e.invoiceNo }))
      });
    });

    this.createOrEditForm.get('invoiceNoAdjusted').valueChanges.subscribe((val) => {
      let invSelect = this.listInvoices.find(e => e.invoiceNo === val);
      this.invoiceId = invSelect.id;
      this.createOrEditForm.get('invoiceDateAdjusted').setValue(invSelect?.invoiceDate);
      this.createOrEditForm.get('serialNoAdjusted').setValue(invSelect?.serialNo);
    });
  }

  callBackGridDetail(params: GridParams) {
    this.gridParamsDetail = params;
    this.gridParamsDetail?.api.setRowData([]);

    // this.gridTableService.selectFirstRow(this.gridParamsPoDetail.api)
  }

  onChangeSelectionDetail(params: GridParams) {
    const selectedRows = params?.api.getSelectedRows();
    if (selectedRows) {
      this.selectedRowDetail = selectedRows[0];
    }
    this.selectedNode = this.gridParamsDetail?.api.getSelectedNodes()[0] ?? [];
    this.gridParamsDetail?.api.getRowNode(`${this.selectedNode.rowIndex}`)?.setSelected(true);
    // this.formPRLines.patchValue(this.selectedRowPrDetail);
  }

  cellValueChanged(params: AgCellEditorParams) {
    const field = params.colDef.field;
    const rowIndex = this.gridParamsDetail?.api.getDisplayedRowCount() - 1;
    this.selectedNode = params.node;
    switch (field) {
      case 'unitPrice':
        if (Number(params.data['unitPrice']) < 0) {
          this.notify.warn(this.l('UnitPriceGreatZero'));
          this.gridParamsDetail.api.startEditingCell({ colKey: 'unitPrice', rowIndex });
          return;
        }
        params.data['totalPrice'] = Number(params.data['quantity'] ?? 0) * Number(params.data['unitPrice'] ?? 0);
        params.data['vat'] = Number(params.data['totalPrice'] ?? 0) * (Number(params.data['tax'] ?? 0)/ 100);
        params.data['totalPriceAdjusted'] = Number(params.data['totalPrice'] ?? 0) + Number(params.data['vat'] ?? 0);
        break;
      }

      this.getDisplayedData();
      this.gridParamsDetail.api.refreshCells();
  }

  cellEditingStopped(params: AgCellEditorParams) {
  }

  addRow() {

    const blankLine = {
      lineNum: this.displayedData.length + 1,
      typeAdjusted: '1',
      id: 0,
      originalInvoiceLineId: 0,
      contentAdjusted: undefined,
      invLineAdjusted: undefined,
      quantity: undefined,
      unitPrice: undefined,
      totalPrice: undefined,
      tax: undefined,
      vat: undefined,
      totalPriceAdjusted: undefined,
    }


    this.gridParamsDetail?.api.applyTransaction({ add: [blankLine] });
    const rowIndex = this.gridParamsDetail.api.getDisplayedRowCount() - 1;
    setTimeout(() => {
      // this.gridParamsDetail.api.startEditingCell({ colKey: 'productCode', rowIndex });
      this.selectedNode = this.gridParamsDetail.api.getRowNode(`${rowIndex}`);
      this.gridParamsDetail.api.getRowNode(`${rowIndex}`).setSelected(true);
    });

    this.getDisplayedData();
  }

  deleteRow() {
    this.gridParamsDetail?.api.applyTransaction({ remove: [this.selectedNode.data] });
  }

  getDisplayedData() {
    this.displayedData = this.gridTableService.getAllData(this.gridParamsDetail);
  }

  save() {
    this.spinnerService.show();
    this.inputInvoiceAdjustedHeadersDto = Object.assign(this.createOrEditForm.getRawValue(), {
      inputInvoiceAdjustedLinesDtos: this.displayedData
    });

    this.invoiceAdjustedServiceProxy.createOrEditInvoiceAdjusted(this.inputInvoiceAdjustedHeadersDto)
    .pipe(finalize(() => {
      this.spinnerService.hide();
    }))
    .subscribe((res) => {
      this.notify.success(this.l('SavedSuccessfully'));
      this.modal.hide();
    });
  }

  showModal(id: number) {
    this.listInvoices = [];
    this.buildForm();
    if (id > 0) {
      this.invoiceAdjustedServiceProxy.getInvoiceAdjestedId(id)
      .subscribe((res) => {
        this.createOrEditForm.patchValue(res);
        this.gridParamsDetail?.api.setRowData(res.inputInvoiceAdjustedLinesDtos);
        this.getDisplayedData();
      })
    }
    this.modal.show();
  }

  reset() {

  }
  closeModal() {
    this.modal.hide();
  }

  patchLineInvoice(event: any) {
    this.selectedNode.data.quantity = event.quantity;
    this.selectedNode.data.tax = event.taxRate;
    this.selectedNode.data.invLineAdjusted = event.lineNum;
    this.selectedNode.data.originalInvoiceLineId = event.id;
    this.gridParamsDetail?.api.applyTransaction({ update: [this.selectedNode.data] });
  }

  getLineInvoiceByHeader(headersId: any, paginationParams: PaginationParamsModel) {
    return this.invoiceAdjustedServiceProxy.getListInvoiceLineByHeadersId(headersId ?? 0);
  }

  showSearcLineInvoice(param: any) {
    this.listLineInvoices.show(this.invoiceId ?? 0);
  }

}
