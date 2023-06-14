import { ICellEditorParams, ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { Component, ElementRef, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AgCellButtonRendererComponent } from '@app/shared/common/grid-input-types/ag-cell-button-renderer/ag-cell-button-renderer.component';
import { AgDatepickerRendererComponent } from '@app/shared/common/grid-input-types/ag-datepicker-renderer/ag-datepicker-renderer.component';
import { AgDropdownRendererComponent } from '@app/shared/common/grid-input-types/ag-dropdown-renderer/ag-dropdown-renderer.component';
import { TmssSelectGridModalComponent } from '@app/shared/common/grid-input-types/tmss-select-grid-modal/tmss-select-grid-modal.component';
import { AgCellEditorParams, CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { AgDataValidateService } from '@app/shared/services/ag-data-validate.service';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { GridTableService } from '@app/shared/services/grid-table.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CommonGeneralCacheServiceProxy, GetPoShipmentsByLineForEditDto, InputPurchaseOrdersShipmentsDto, MstLocationsServiceProxy, MstOrganizationsServiceProxy, PurchaseRequestServiceProxy } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'purchase-orders-distributions',
  templateUrl: './purchase-orders-distributions.component.html',
  styleUrls: ['./purchase-orders-distributions.component.less']
})
export class PurchaseOrdersDistributionsComponent extends AppComponentBase implements OnInit {

  @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
  @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
  @Output() close = new EventEmitter<any>();
  @ViewChild('listRequester', { static: true }) listRequester!: TmssSelectGridModalComponent;
  @ViewChild('listLocationDistributions', { static: true }) listLocationDistributions!: TmssSelectGridModalComponent;
  @ViewChild('selectBudgetCodeHeadModal', { static: true }) selectBudgetCodeHeadModal: TmssSelectGridModalComponent;
  //Distributions
  listDestinationType: { label: string, value: string | number }[] = [];
  listOrganization: { label: string, value: string | number }[] = [];
  pODistributionsForm: FormGroup;
  gridColDefDistributions: CustomColDef[];
  budgetCodeColDefs: CustomColDef[];
  paginationParamsDistributions: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridParamsDistributions: GridParams | undefined;
  selectedRowDistributions;
  displayedDataDistributions = [];
  selectedNodeDistributions;
  listPurchaseDistributions;
  frameworkComponentsDistributions;
  totalQuantityDistributions: number = 0;
  poLineShipmentsRow;
  requestersDefs: CustomColDef[];
  locationDefs: CustomColDef[];
  // inputPurchaseOrdersHeadersDto: InputPurchaseOrdersHeadersDto = new InputPurchaseOrdersHeadersDto();
  listShipments = [];
  listDistributions = [];
  isEdit = false;
  selectedRowShipments;
  selectedRowPoDetail;
  frameworkComponents;
  poShipment: any;
  tabKey: number = 1;

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private dataFormatService: DataFormatService,
    private gridTableService: GridTableService,
    private agDataValidateService: AgDataValidateService,
    private purchaseRequestServiceProxy: PurchaseRequestServiceProxy,
    private mstLocationsServiceProxy: MstLocationsServiceProxy,
    private mstOrganizationsServiceProxy: MstOrganizationsServiceProxy,
    private commonGeneralCacheServiceProxy: CommonGeneralCacheServiceProxy,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.frameworkComponents = {
      agDatepickerRendererComponent: AgDatepickerRendererComponent,
      agDropdownRendererComponent: AgDropdownRendererComponent,
      agCellButtonRendererComponent: AgCellButtonRendererComponent
    };
    this.mstOrganizationsServiceProxy.getAllOrganizations().subscribe((res) => {
      res.forEach(e => this.listOrganization.push({ label: e.name, value: e.id }))
    });

    this.gridColDefDistributions = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        // cellRenderer: (params) => params.rowIndex + 1,
        width: 50,
        field: 'distributionNum'
      },
      {
        headerName: this.l('Type'),
        headerTooltip: this.l('Type'),
        field: 'destinationTypeCode',
        editable: true,
        cellClass: ['cell-clickable', 'cell-border', 'text-right'],
        width: 70,
        validators: ['required'],
        cellRenderer: 'agDropdownRendererComponent',
        list: () => { return this.listDestinationType.map(e => Object.assign({}, { key: e.value, value: e.label })) },
      },
      {
        headerName: this.l('Requester'),
        headerTooltip: this.l('Requester'),
        field: 'requesterName',
        cellClass: ['cell-border'],
        editable: true,
        width: 200,
      },
      {
        headerName: this.l('DeliverTo'),
        headerTooltip: this.l('DeliverTo'),
        field: 'deliverTo',
        cellClass: ['cell-border'],
        editable: true,
        width: 100,
      },
      {
        headerName: this.l('Subinventory'),
        headerTooltip: this.l('Subinventory'),
        field: 'subinventory',
        cellClass: ['cell-border'],
        editable: true,
        width: 150,
      },
      {
        headerName: this.l('Quantity'),
        headerTooltip: this.l('Quantity'),
        field: 'quantityOrdered',
        editable: true,
        cellClass: ['cell-clickable', 'cell-border', 'text-right'],
        width: 80,
        validators: ['required', 'integerNumber'],
      },
      {
        headerName: this.l('PoChargeAccount'),
        headerTooltip: this.l('PoChargeAccount'),
        field: 'poChargeAccount',
        cellClass: ['cell-border'],
        validators: ['required'],
        editable: true,
        width: 200,
      },
      {
        headerName: this.l('DestinationChargeAccount'),
        headerTooltip: this.l('DestinationChargeAccount'),
        field: 'destinationChargeAccount',
        cellClass: ['cell-border'],
        editable: true,
        width: 200,
      },
      {
        headerName: this.l('RecoveryRate'),
        headerTooltip: this.l('RecoveryRate'),
        field: 'recoveryRate',
        cellClass: ['cell-border'],
        editable: true,
        width: 200,
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
    ];


    this.requestersDefs = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParamsDistributions.pageNum! - 1) * this.paginationParamsDistributions.pageSize! + params.rowIndex + 1).toString(),
        flex: 50,
      },
      {
        headerName: this.l('Name'),
        headerTooltip: this.l('Name'),
        field: 'name',
        flex: 200,
      },
      {
        headerName: this.l('UserName'),
        headerTooltip: this.l('UserName'),
        field: 'userName',
        flex: 200,
      },
      {
        headerName: this.l('Email'),
        headerTooltip: this.l('Email'),
        field: 'email',
        flex: 200,
      }
    ];

    this.locationDefs = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParamsDistributions.pageNum! - 1) * this.paginationParamsDistributions.pageSize! + params.rowIndex + 1).toString(),
        flex: 30,
      },
      {
        headerName: this.l('LocationCode'),
        headerTooltip: this.l('LocationCode'),
        field: 'locationCode',
        flex: 200,
      },
      {
        headerName: this.l('Description'),
        headerTooltip: this.l('Description'),
        field: 'description',
        flex: 200,
      },
    ];

    this.budgetCodeColDefs = [
      {
        headerName: this.l('BudgetCode'),
        headerTooltip: this.l('BudgetCode'),
        cellClass: ['text-center'],
        field: 'concatenatedSegments',
        flex: 1
      }
    ];

    this.listDestinationType = [];

    this.listDestinationType.push({ label: 'Expense', value: 'EXPENSE' });
    this.listDestinationType.push({ label: 'Inventory', value: 'INVENTORY' });
  }

  //#region Distribuitions
  callBackGridDistributions(params: GridParams) {
    this.gridParamsDistributions = params;
    if (this.tabKey === 2) {
      this.gridParamsDistributions.columnApi.getAllColumns().forEach(e => {
        e.getColDef().editable = false;
        e.getColDef().cellClass = ['cell-border'];
      });
    }
    params.api.setRowData([]);
    if (this.selectedRowShipments.listDistributions && this.selectedRowShipments.listDistributions.length > 0) {
      params.api.setRowData(this.selectedRowShipments.listDistributions);
    }
  }

  getAllGlCode(budgetCode: string, paginationParams: PaginationParamsModel) {
    return this.commonGeneralCacheServiceProxy.getAllGlCodeCombinations(
      budgetCode ?? '',
      paginationParams ? paginationParams.sorting : '',
      paginationParams ? paginationParams.pageSize : 20,
      paginationParams ? paginationParams.skipCount : 0
    );
  }

  getAllRequesters(userName: any, paginationParams: PaginationParamsModel) {
    return this.purchaseRequestServiceProxy.getListRequester(userName,
      (this.paginationParamsDistributions ? this.paginationParamsDistributions.sorting : ''),
      (this.paginationParamsDistributions ? this.paginationParamsDistributions.pageSize : 10000),
      (this.paginationParamsDistributions ? this.paginationParamsDistributions.skipCount : 1));
  }

  patchRequester(event: any) {
    this.selectedNodeDistributions.data.requesterName = event.name;
    this.selectedNodeDistributions.data.deliverToPersonId = event.id;
    this.gridParamsDistributions?.api.applyTransaction({ update: [this.selectedNodeDistributions.data] });
    // this.formPRLines.get('requesterName').setValue(event.name);
    // this.formPRLines.get('toPersonId').setValue(event.id);
  }

  onChangeSelectionDistributions(params) {
    const selectedRows = params.api.getSelectedRows();
    if (selectedRows) {
      this.selectedRowDistributions = selectedRows[0];
    }
    this.selectedNodeDistributions = this.gridParamsDistributions.api.getSelectedNodes()[0] ?? [];
    this.gridParamsDistributions.api.getRowNode(`${this.selectedNodeDistributions.rowIndex}`)?.setSelected(true);
    // this.formPRLines.patchValue(this.selectedRowPrDetail);
    // this.selectedRow = Object.assign({}, this.selectedRow);
  }

  getAllLocations(locationCode: any, paginationParams: PaginationParamsModel) {
    return this.mstLocationsServiceProxy.getAllLocations(locationCode)
  }

  patchLocationDistributions(event: any) {
    this.selectedNodeDistributions.data.deliverTo = event.locationCode;
    this.selectedNodeDistributions.data.deliverToLocationId = event.id;
    this.gridParamsDistributions?.api.applyTransaction({ update: [this.selectedNodeDistributions.data] });
    // this.formPRLines.get('locationCode').setValue(event.locationCode);
    // this.formPRLines.get('deliverToLocationId').setValue(event.id);
  }

  cellEditingStoppedDistributions(params: AgCellEditorParams) {
    const col = params.colDef.field;
    const rowIndex = this.gridParamsDistributions.api.getDisplayedRowCount() - 1;
  }

  cellValueChangedDistributions(params: AgCellEditorParams) {
    const field = params.colDef.field;
    const rowIndex = this.gridParamsDistributions.api.getDisplayedRowCount() - 1;
    this.getDisplayedDataDistributions();
    this.gridParamsDistributions.api.refreshCells();
  }

  pathDistributions(event: Event) {
    this.selectedNodeDistributions.data = event;
  }

  buildFormDistributions() {
    this.pODistributionsForm = this.formBuilder.group({
      partNo: [undefined],
      partName: [undefined],
      quantity: [undefined],
      shipToOrganizationId: [undefined],
      shipTo: [undefined],
    });
  }

  addRowDistributions() {

    if (!this.validateBeforeAddRowDistributions()) {
      return;
    }

    const blankDistributions = {
      distributionNum: this.displayedDataDistributions.length + 1,
      id: 0,
      destinationTypeCode: 'INVENTORY',
      requesterName: undefined,
      deliverToPersonId: undefined,
      deliverTo: this.poShipment.shipTo,
      deliverToLocationId: this.poShipment.shipToLocationId,
      subinventory: undefined,
      quantityOrdered: this.poShipment.quantity,
      poChargeAccount: this.poShipment.chargeAccount,
      destinationChargeAccount: undefined,
      recoveryRate: undefined,
      glDate: new Date(),
    }

    this.gridParamsDistributions.api.applyTransaction({ add: [blankDistributions] });
    const rowIndex = this.gridParamsDistributions.api.getDisplayedRowCount() - 1;
    setTimeout(() => {
      this.gridParamsDistributions.api.startEditingCell({ colKey: 'quantity', rowIndex });
      this.selectedNodeDistributions = this.gridParamsDistributions.api.getRowNode(`${rowIndex}`);
      this.gridParamsDistributions.api.getRowNode(`${rowIndex}`).setSelected(true);
    });

    this.getDisplayedDataDistributions();
  }

  setRowDistributions(rowData) {
    const dataDistributions = {
      stt: this.displayedDataDistributions.length + 1,
      id: rowData.id,
      destinationTypeCode: rowData.destinationTypeCode,
      requesterName: rowData.requesterName,
      deliverTo: rowData.deliverTo,
      subinventory: rowData.subinventory,
      quantity: rowData.quantity,
      poChargeAccount: rowData.poChargeAccount,
      destinationChargeAccount: rowData.destinationChargeAccount,
      recoveryRate: rowData.recoveryRate,
      glDate: rowData.glDate,
    }
  }

  removeSelectedRowDistributions() {
    if (!this.selectedRowDistributions) {
      this.notify.warn(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Delete);
      return;
    }
    this.gridTableService.removeSelectedRow(this.gridParamsDistributions, this.selectedRowDistributions);
    this.selectedRowDistributions = undefined;
    this.getDisplayedDataDistributions();
  }

  getDisplayedDataDistributions() {
    this.displayedDataDistributions = this.gridTableService.getAllData(this.gridParamsDistributions);
  }

  validateBeforeAddRowDistributions() {

    return this.agDataValidateService.validateDataGrid(this.gridParamsDistributions, this.gridColDefDistributions, this.displayedDataDistributions);
  }

  showModal(selectedRowShipments: InputPurchaseOrdersShipmentsDto, formPart: any, tabKey?: number) {
    this.tabKey = tabKey;
    this.buildFormDistributions();
    this.gridParamsDistributions?.api.setRowData([]);
    this.pODistributionsForm.patchValue(selectedRowShipments);
    this.pODistributionsForm.patchValue(formPart);
    this.poShipment = selectedRowShipments;
    this.gridParamsDistributions?.api.setRowData(selectedRowShipments.listDistributions);
    this.getDisplayedDataDistributions();
    this.modal.show();
  }

  searchByEnterDistributions(params: ICellEditorParams) {
    const col = params?.colDef?.field;
    switch (col) {
      case 'requesterName':
        this.listRequester.show(
          params.data?.requesterName ?? '',
          undefined,
          undefined,
          'requesterName'
        );
        break;
      case 'deliverTo':
        this.listLocationDistributions.show(
          params.data?.deliverTo ?? '',
          undefined,
          undefined,
          'deliverTo'
        );
        break;
      case 'poChargeAccount':
        this.selectBudgetCodeHeadModal.show(
          params.data?.poChargeAccount ?? '',
          undefined,
          undefined,
          'poChargeAccount'
        );
        break;
    }
  }

  patchBudgetCode(event: any) {
    this.selectedNodeDistributions.data.poChargeAccount = event.concatenatedSegments;
    this.gridParamsDistributions.api.applyTransaction({ update: [this.selectedNodeDistributions.data] });
  }

  closeModal() {
    this.modal.hide();
  }

  agKeyUp(e) {

  }

  reset() {

  }

  save() {

    if (!this.validateBeforeAddRowDistributions()) {
      return;
    }

    const obj = Object.assign(this.poShipment, {
      listDistributions: this.displayedDataDistributions
    });
    this.close.emit(obj);
    this.modal.hide();
  }

}
