import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { Component, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AgDatepickerRendererComponent } from '@app/shared/common/grid-input-types/ag-datepicker-renderer/ag-datepicker-renderer.component';
import { AgDropdownRendererComponent } from '@app/shared/common/grid-input-types/ag-dropdown-renderer/ag-dropdown-renderer.component';
import { AgCellEditorParams, CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { AgDataValidateService } from '@app/shared/services/ag-data-validate.service';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { GridTableService } from '@app/shared/services/grid-table.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GetPurchaseRequestDistributionsDto, GetPurchaseRequestForEditDto, GetPurchaseRequestLineForEditDto, PurchaseRequestServiceProxy } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'purchase-request-distributions-modal',
  templateUrl: './purchase-request-distributions-modal.component.html',
  styleUrls: ['./purchase-request-distributions-modal.component.less']
})
export class PurchaseRequestDistributionsModalComponent extends AppComponentBase implements OnInit {

  @Output() close = new EventEmitter<any>();
  @ViewChild("ViewModal", { static: true }) modal: ModalDirective;
  gridColDefDistributions: CustomColDef[];
  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridParamsDistributions: GridParams | undefined;
  selectedRowDistributions;
  PRDistributionsForm: FormGroup;
  displayedData = [];
  selectedNode;
  listPurchaseDistributions;
  frameworkComponents;
  totalQuantity: number = 0;
  prLineRow;
  constructor(
    injector: Injector,
    private dataFormatService: DataFormatService,
    private gridTableService: GridTableService,
    private formBuilder: FormBuilder,
    private agDataValidateService: AgDataValidateService,
    private purchaseRequestServiceProxy: PurchaseRequestServiceProxy,
  ) {
    super(injector);
    this.frameworkComponents = {
      agDatepickerRendererComponent: AgDatepickerRendererComponent,
      agDropdownRendererComponent: AgDropdownRendererComponent
    };
  }

  ngOnInit(): void {

    this.gridColDefDistributions = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        width: 50,
      },
      {
        headerName: this.l('Quantity'),
        headerTooltip: this.l('Quantity'),
        field: 'quantity',
        editable: true,
        cellClass: ['cell-clickable', 'cell-border', 'text-right'],
        width: 70,
        validators: ['required', 'integerNumber'],
      },
      {
        headerName: this.l('ChargeAccount'),
        headerTooltip: this.l('ChargeAccount'),
        field: 'chargeAccount',
        cellClass: ['cell-clickable', 'cell-border'],
        editable: true,
        validators: ['required'],
        width: 200,
      },
      {
        headerName: this.l('RecoveryRate'),
        headerTooltip: this.l('RecoveryRate'),
        field: 'recoverRate',
        cellClass: ['cell-border'],
        editable: true,
        width: 100,
      },
      {
        headerName: this.l('GlDate'),
        headerTooltip: this.l('GlDate'),
        field: 'glDate',
        valueGetter: params => this.dataFormatService.dateFormat(params.data.glDate),
        cellClass: ['cell-clickable', 'cell-border'],
        editable: true,
        width: 150,
        validators: ['required'],
        cellRenderer: 'agDatepickerRendererComponent'
      },
      {
        headerName: this.l('BudgetAccount'),
        headerTooltip: this.l('BudgetAccount'),
        field: 'budgetAccount',
        cellClass: ['cell-border'],
        editable: true,
        validators: ['required'],
        width: 200,
      },
      {
        headerName: this.l('AccrualAccount'),
        headerTooltip: this.l('AccrualAccount'),
        field: 'accrualAccount',
        cellClass: ['cell-border'],
        editable: true,
        validators: ['required'],
        width: 200,
      },
      {
        headerName: this.l('VarianceAccount'),
        headerTooltip: this.l('VarianceAccount'),
        field: 'varianceAccount',
        cellClass: ['cell-border'],
        editable: true,
        validators: ['required'],
        width: 200,
      }
    ];
  }

  callBackGridDistributions(params: GridParams) {
    this.gridParamsDistributions = params;
    params.api.setRowData([]);
  }

  onChangeSelectionDistributions(params) {
    const selectedRows = params.api.getSelectedRows();
    if (selectedRows) {
      this.selectedRowDistributions = selectedRows[0];
    }
    // this.formPRLines.patchValue(this.selectedRowPrDetail);
    // this.selectedRow = Object.assign({}, this.selectedRow);
  }

  open(selectRowLine: GetPurchaseRequestLineForEditDto) {
    this.buildForm();
    this.PRDistributionsForm.patchValue(selectRowLine);
    this.totalQuantity = selectRowLine.quantity;
    this.prLineRow = selectRowLine;
    this.gridParamsDistributions.api.setRowData(selectRowLine.listDistributions)
    this.modal.show();
    this.getDisplayedData();
  }

  closeModel() {
    this.modal.hide();
  }

  cellValueChanged(params: AgCellEditorParams) {
    // const field = params.colDef.field;
    // const rowIndex = this.gridParamsPrDetail.api.getDisplayedRowCount() - 1;
    // switch (field) {
    //   case 'lineTypeId':
    //     if (field === 'lineTypeId') {
    //       if (params.data[field] === 1) {
    //         this.gridParamsPrDetail.api.startEditingCell({ colKey: 'partNo', rowIndex });
    //       } else {
    //         params.data['partNo'] = '';
    //         this.gridParamsPrDetail.api.startEditingCell({ colKey: 'partName', rowIndex });
    //       }
    //     }
    //     break;
    //   case 'itemDescription':
    //     this.gridParamsPrDetail.api.startEditingCell({ colKey: 'quantity', rowIndex });
    //     break;
    //   case 'quantity':
    //     params.data['amount'] = Math.round(Number(params.data['quantity'] ?? 0) * Number(params.data['unitPrice'] ?? 0) * 100) / 100;
    //     break;
    //   case 'unitPrice':
    //     params.data['amount'] = Math.round(Number(params.data['quantity'] ?? 0) * Number(params.data['unitPrice'] ?? 0) * 100) / 100;
    //     break;
    // }
    // this.getDisplayedData();
    // this.gridParamsPrDetail.api.refreshCells();
  }

  addRow() {
    const blankDistributions = {
      stt: this.displayedData.length + 1,
      id: 0,
      chargeAccount: undefined,
      recoveryRate: undefined,
      quantity: undefined,
      glDate: undefined,
      budgetAccount: undefined,
      accrualAccount: undefined,
      varianceAccount: undefined,
    }

    this.gridParamsDistributions.api.applyTransaction({ add: [blankDistributions] });
    const rowIndex = this.gridParamsDistributions.api.getDisplayedRowCount() - 1;
    setTimeout(() => {
      this.gridParamsDistributions.api.startEditingCell({ colKey: 'quantity', rowIndex });
      this.selectedNode = this.gridParamsDistributions.api.getRowNode(`${rowIndex}`);
      this.gridParamsDistributions.api.getRowNode(`${rowIndex}`).setSelected(true);
    });

    this.getDisplayedData();
  }

  removeSelectedRow() {
    if (!this.selectedRowDistributions) {
      this.notify.warn(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Delete);
      return;
    }
    this.gridTableService.removeSelectedRow(this.gridParamsDistributions, this.selectedRowDistributions);
    this.selectedRowDistributions = undefined;
    this.getDisplayedData();
  }

  agKeyUp(event: KeyboardEvent) {
    event.stopPropagation();
    // Press enter to search with modal
    if (event.key === 'ArrowDown') this.addRow();
  }

  getDisplayedData() {
    this.displayedData = this.gridTableService.getAllData(this.gridParamsDistributions);
    // this.calculateTotalPrice();
  }

  validateBeforeAddRow() {

    return this.agDataValidateService.validateDataGrid(this.gridParamsDistributions, this.gridColDefDistributions, this.displayedData);
  }

  buildForm() {
    this.PRDistributionsForm = this.formBuilder.group({
      partNo: [undefined],
      partName: [undefined],
      quantity: [undefined]
    });

  }

  save() {
    if (!this.validateBeforeAddRow()) {
      return;
    }

    const obj = Object.assign(this.prLineRow, {
      listDistributions: this.displayedData
    });
    this.close.emit(obj);
    console.log(obj);
    this.modal.hide();
  }

  cellEditingStopped(params: AgCellEditorParams) {
    const col = params.colDef.field;
    const rowIndex = this.gridParamsDistributions.api.getDisplayedRowCount() - 1;
    switch (col) {
      case 'chargeAccount':
        this.purchaseRequestServiceProxy.checkAccountDistributions(params.data[col]).subscribe((val) => {
          if (!val) {
            this.gridParamsDistributions.api.startEditingCell({ colKey: 'chargeAccount', rowIndex });
            this.notify.warn(this.l('AccountNotValid'))
          }
        });
        break;
      case 'budgetAccount':
        this.purchaseRequestServiceProxy.checkAccountDistributions(params.data[col]).subscribe((val) => {
          if (!val) {
            this.gridParamsDistributions.api.startEditingCell({ colKey: 'budgetAccount', rowIndex });
            this.notify.warn(this.l('AccountNotValid'))
          }
        });
        break;
      case 'accrualAccount':
        this.purchaseRequestServiceProxy.checkAccountDistributions(params.data[col]).subscribe((val) => {
          if (!val) {
            this.gridParamsDistributions.api.startEditingCell({ colKey: 'accrualAccount', rowIndex });
            this.notify.warn(this.l('AccountNotValid'))
          }
        });
        break;
      case 'varianceAccount':
        this.purchaseRequestServiceProxy.checkAccountDistributions(params.data[col]).subscribe((val) => {
          if (!val) {
            this.gridParamsDistributions.api.startEditingCell({ colKey: 'varianceAccount', rowIndex });
            this.notify.warn(this.l('AccountNotValid'))
          }
        });
        break;
    }
  }
}
