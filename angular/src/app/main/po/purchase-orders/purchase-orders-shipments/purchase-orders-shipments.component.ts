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
import { CommonGeneralCacheServiceProxy, GetPoLinesForEditDtocs, InputPurchaseOrderLinesDto, InputPurchaseOrdersShipmentsDto, MstLocationsServiceProxy, MstOrganizationsServiceProxy } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { PurchaseOrdersDistributionsComponent } from '../purchase-orders-distributions/purchase-orders-distributions.component';

@Component({
  selector: 'purchase-orders-shipments',
  templateUrl: './purchase-orders-shipments.component.html',
  styleUrls: ['./purchase-orders-shipments.component.less']
})
export class PurchaseOrdersShipmentsComponent extends AppComponentBase implements OnInit {

  @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
  @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
  @Output() close = new EventEmitter<any>();
  @ViewChild('poDistribuitons', { static: true }) poDistribuitons!: PurchaseOrdersDistributionsComponent;
  //Shipment
  @ViewChild('listLocation', { static: true }) listLocation!: TmssSelectGridModalComponent;
  listDestinationType: { label: string, value: string | number }[] = [];
  gridColDefShipments: CustomColDef[];
  paginationParamsShipments: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  pOShipmentsForm: FormGroup;
  gridParamsShipments: GridParams | undefined;
  listOrganization: { label: string, value: string | number }[] = [];
  selectedRowShipments: InputPurchaseOrdersShipmentsDto;
  displayedDataShipments = [];
  selectedNodeShipments;
  listPOShipments;
  frameworkComponentsShipments;
  totalQuantityShipments: number = 0;
  poLineRow: any;
  locationDefs: CustomColDef[];
  selectedNode;
  selectedRowPoDetail;
  frameworkComponents;
  tabKey: number = 1;
  shipTo: string;
  shipToLocationId: number;
  totalQuanity: number = 0;
  isValidNeedBy: boolean = true;

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private dataFormatService: DataFormatService,
    private gridTableService: GridTableService,
    private agDataValidateService: AgDataValidateService,
    private mstOrganizationsServiceProxy: MstOrganizationsServiceProxy,
    private mstLocationsServiceProxy: MstLocationsServiceProxy,
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
    this.gridColDefShipments = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        // cellRenderer: (params) => params.rowIndex + 1,
        width: 50,
        field: 'shipmentNum'
      },
      {
        headerName: this.l('Distributions'),
        headerTooltip: this.l('Distributions'),
        field: 'moreDistributions',
        cellClass: ['cell-border'],
        cellRenderer: 'agCellButtonRendererComponent',
        buttonDef: {
          text: this.l('Distributions'),
          className: 'btn btn-outline-primary',
          function: this.openDistributions.bind(this),
        },
        width: 70,
      },
      {
        headerName: this.l('Org'),
        headerTooltip: this.l('Org'),
        field: 'shipToOrganizationId',
        cellClass: ['cell-border'],
        width: 70,
        validators: ['required'],
        cellRenderer: 'agDropdownRendererComponent',
        list: () => { return this.listOrganization.map(e => Object.assign({}, { key: e.value, value: e.label })) },
      },
      {
        headerName: this.l('ShipTo'),
        headerTooltip: this.l('ShipTo'),
        field: 'shipTo',
        cellClass: ['cell-clickable', 'cell-border'],
        editable: true,
        validators: ['required'],
        width: 150,
      },
      {
        headerName: this.l('UOM'),
        headerTooltip: this.l('UOM'),
        field: 'uom',
        cellClass: ['cell-border'],
        width: 100,
      },
      {
        headerName: this.l('Quantity'),
        headerTooltip: this.l('Quantity'),
        field: 'quantity',
        editable: true,
        cellClass: ['cell-clickable', 'cell-border', 'text-right'],
        width: 70,
        validators: ['required', 'floatNumber'],
      },
      {
        headerName: this.l('ProsimedDate'),
        headerTooltip: this.l('ProsimedDate'),
        field: 'prosimedDate',
        valueGetter: params => this.dataFormatService.dateFormat(params.data.prosimedDate),
        cellClass: ['cell-border'],
        width: 150,
        cellRenderer: 'agDatepickerRendererComponent'
      },
      {
        headerName: this.l('NeedByDate'),
        headerTooltip: this.l('NeedByDate'),
        field: 'needByDate',
        valueGetter: params => this.dataFormatService.dateFormat(params.data.needByDate),
        cellClass: ['cell-clickable', 'cell-border'],
        editable: true,
        width: 130,
        validators: ['required'],
        cellRenderer: 'agDatepickerRendererComponent'
      },
      {
        headerName: this.l('OriginalDate'),
        headerTooltip: this.l('OriginalDate'),
        field: 'originalDate',
        valueGetter: params => this.dataFormatService.dateFormat(params.data.originalDate),
        cellClass: ['cell-border'],
        editable: true,
        cellRenderer: 'agDatepickerRendererComponent',
        width: 150,
      },
      {
        headerName: this.l('NoteForReceiver'),
        headerTooltip: this.l('NoteForReceiver'),
        field: 'noteForReceiver',
        cellClass: ['cell-border'],
        editable: true,
        width: 150,
      },
      {
        headerName: this.l('CountryOfOrigin'),
        headerTooltip: this.l('CountryOfOrigin'),
        field: 'countryOfOrigin',
        cellClass: ['cell-border'],
        editable: true,
        width: 100,
      },
      {
        headerName: this.l('ChargeAccount'),
        headerTooltip: this.l('ChargeAccount'),
        field: 'chargeAccount',
        cellClass: ['cell-border'],
        width: 200,
      },
      {
        headerName: this.l('Amount'),
        headerTooltip: this.l('Amount'),
        field: 'amount',
        cellClass: ['cell-border', 'text-right'],
        valueFormatter: params => this.dataFormatService.floatMoneyFormat((params.value) ? params.value : 0),
        width: 70,
      },
    ];
    this.locationDefs = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParamsShipments.pageNum! - 1) * this.paginationParamsShipments.pageSize! + params.rowIndex + 1).toString(),
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

    this.listOrganization = [];
    this.mstOrganizationsServiceProxy.getAllOrganizations().subscribe((res) => {
      res.forEach(e => this.listOrganization.push({ label: e.name, value: e.id }))
    });

  }

  show() {
    this.buildFormShipments();
  }

   //#region shipments
   callBackGridShipments(params: GridParams) {
    this.gridParamsShipments = params;
    if(this.tabKey === 2) {
      this.gridParamsShipments.columnApi.getAllColumns().forEach(e => {
        e.getColDef().editable = false;
        e.getColDef().cellClass = ['cell-border'];
      });
    }
    params.api.setRowData([]);
    if (this.poLineRow.listPOShipments && this.poLineRow.listPOShipments.length > 0) {
      params.api.setRowData(this.poLineRow.listPOShipments);
    } else {

    }
  }

  onChangeSelectionShipments(params) {
    const selectedRows = params.api.getSelectedRows();
    if (selectedRows) {
      this.selectedRowShipments = selectedRows[0];
    }
    this.selectedNodeShipments = this.gridParamsShipments.api.getSelectedNodes()[0] ?? [];
    // this.selectedRow = Object.assign({}, this.selectedRow);
  }

  cellEditingStoppedShipments(params: AgCellEditorParams) {
    const col = params.colDef.field;
    const rowIndex = this.gridParamsShipments.api.getDisplayedRowCount() - 1;
 
  }

  cellValueChangedShipments(params: AgCellEditorParams) {
    const field = params.colDef.field;
    const rowIndex = this.gridParamsShipments.api.getDisplayedRowCount() - 1;
    switch (field) {
      // case 'glDate':
      //   if (params.data['glDate']) {
      //     this.mstPeriodServiceProxy.checkGlDate(params.data['glDate'])
      //       .subscribe((val) => {
      //         if (!val) {
      //           this.notify.warn(this.l('GLDateCannotPeriod'))
      //         }
      //       });
      //   }
      //   break;
      case 'quantity':
        if (Number(params.data['quantity']) < 0) {
          this.notify.warn(this.l('QuanityGreatZero'));
          this.gridParamsShipments.api.startEditingCell({ colKey: 'quantity', rowIndex });
          return;
        }
        this.totalQuanity += Number(params.data['quantity'] ?? 0);
        break;
    }
    this.getDisplayedDataShipments();
    this.gridParamsShipments.api.refreshCells();
  }

  searchByEnterShipments(params: ICellEditorParams) {
    const col = params?.colDef?.field;
    switch (col) {
      case 'shipTo':
        this.listLocation.show(
          params.data?.shipTo ?? '',
          undefined,
          undefined,
          'shipTo'
        );
        break;
    }
  }

  patchLocation(event: any) {
    this.selectedNodeShipments.data.shipTo = event.locationCode;
    this.selectedNodeShipments.data.shipToLocationId = event.id;
    this.gridParamsShipments?.api.applyTransaction({ update: [this.selectedNodeShipments.data] });
    // this.formPRLines.get('locationCode').setValue(event.locationCode);
    // this.formPRLines.get('deliverToLocationId').setValue(event.id);
  }

  pathShipments(event: Event) {
    this.selectedNode.data = event;
    this.getDisplayedDataShipments();
  }

  buildFormShipments() {
    this.pOShipmentsForm = this.formBuilder.group({
      partNo: [undefined],
      partName: [undefined],
      quantity: [undefined]
    });
  }

  reset() {

  }

  addRowShipments() {

    // if (!this.pOShipmentsForm.get('partNo').value) {
    //   this.notify.warn(this.l('SelectBeforeAddShipments'));
    //   return;
    // }

    if (!this.validateBeforeAddRowShipments()) {
      return;
    }
    this.totalQuanity = 0;
    this.displayedDataShipments.forEach(e => {
      this.totalQuanity += Number(e.quantity ?? 0);
    });

    if (this.totalQuanity > Number(this.poLineRow.quantity ?? 0)) {
      this.notify.warn(this.l('TotalQuanityGreaterThan'));
      return;
    }

    const blankShipments = {
      shipmentNum: this.displayedDataShipments.length + 1,
      id: 0,
      org: undefined,
      shipToOrganizationId: this.poLineRow.destinationOrganizationId ?? 81,
      shipTo: this.poLineRow.locationCode ?? this.shipTo,
      shipToLocationId: this.poLineRow.deliverToLocationId ?? this.shipToLocationId,
      uom: this.poLineRow.unitMeasLookupCode,
      unitMeasLookupCode: this.poLineRow.unitMeasLookupCode,
      quantity: this.poLineRow.quantity,
      promisedDate: this.poLineRow.promisedDate,
      needByDate: this.poLineRow.needByDate,
      originalDate: undefined,
      noteForReceiver: undefined,
      countryOfOrigin: undefined,
      chargeAccount: this.poLineRow.chargeAccount,
      priceOverride: undefined,
    }

    this.gridParamsShipments.api.applyTransaction({ add: [blankShipments] });
    const rowIndex = this.gridParamsShipments.api.getDisplayedRowCount() - 1;
    setTimeout(() => {
      this.gridParamsShipments.api.startEditingCell({ colKey: 'shipToOrganizationId', rowIndex });
      this.selectedNodeShipments = this.gridParamsShipments.api.getRowNode(`${rowIndex}`);
      this.gridParamsShipments.api.getRowNode(`${rowIndex}`).setSelected(true);
    });

    this.getDisplayedDataShipments();
  }

  setRowShipments(rowData) {
    const dataShipments = {
      stt: this.displayedDataShipments.length + 1,
      id: 0,
      org: rowData.org,
      shipTo: rowData.shipTo,
      shipToLocationId: rowData.shipToLocationId,
      uom: rowData.uom,
      quantity: rowData.quantity,
      prosimedDate: rowData.prosimedDate,
      glDate: rowData.glDate,
      originalDate: rowData.originalDate,
      noteForReceiver: rowData.noteForReceiver,
      countryOfOrigin: rowData.countryOfOrigin,
      chargeAccount: rowData.chargeAccount,
      amount: rowData.amount,
    }
  }

  removeSelectedRowShipments() {
    if (!this.selectedRowShipments) {
      this.notify.warn(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Delete);
      return;
    }
    this.gridParamsShipments.api.applyTransaction({ remove: [this.selectedNodeShipments.data] })
    this.selectedRowShipments = undefined;
    // this.gridTableService.removeSelectedRow(this.gridParamsShipments, this.selectedRowShipments);
    // this.selectedRowShipments = undefined;
    this.getDisplayedDataShipments();
  }

  getDisplayedDataShipments() {
    this.displayedDataShipments = this.gridTableService.getAllData(this.gridParamsShipments);
  }

  validateBeforeAddRowShipments() {
    this.isValidNeedBy = false;
    this.gridTableService.getAllData(this.gridParamsShipments).forEach(data => {
      const timeNow = new Date().getTime();
      if (data.needByDate < timeNow) {
        this.notify.warn(this.l('NeedByDateGreatToday'));
        this.isValidNeedBy = true;
      }
    });

    return this.agDataValidateService.validateDataGrid(this.gridParamsShipments, this.gridColDefShipments, this.displayedDataShipments) && !this.isValidNeedBy;
  }

  
  getAllLocations(locationCode: any, paginationParams: PaginationParamsModel) {
    return this.mstLocationsServiceProxy.getAllLocations(locationCode)
  }

  showModal(selectRowLine: any, tabKey?: number) {
    this.tabKey = tabKey;

    this.gridParamsShipments?.api.setRowData([]);
    this.commonGeneralCacheServiceProxy.getListOrgzationsByPartNo(selectRowLine.partNo).subscribe((res) => {
      if(res.length > 0) {
        this.listOrganization = [];
        res.forEach(e => {
          this.listOrganization.push({label: e.organizationCode, value: e.id});
          this.gridParamsShipments?.api.redrawRows();
        });
      }

      this.mstLocationsServiceProxy.getLocationById(21).subscribe((val) => {
        this.shipTo = val.locationCode;
        this.shipToLocationId = val.id;
        if (!(selectRowLine.listPOShipments && selectRowLine.listPOShipments.length > 0)) {
          this.addRowShipments();
        }
      });
    });
    this.buildFormShipments();
    this.pOShipmentsForm.patchValue(selectRowLine);
    this.poLineRow = selectRowLine;
    this.gridParamsShipments?.api.setRowData(selectRowLine.listPOShipments);
    this.getDisplayedDataShipments();
    this.modal.show();
  }

  closeModal() {
    this.modal.hide();
  }

  openDistributions(params: any) {
    if (!this.validateBeforeAddRowShipments()) {
      return;
    }
    this.poDistribuitons.showModal(params.data, this.pOShipmentsForm.getRawValue(), this.tabKey);
  }

  patchDistribuions(e: Event) {
    this.selectedNodeShipments.data = e;
    this.getDisplayedDataShipments();
  }

  save() {
    if (!this.validateBeforeAddRowShipments()) {
      return;
    }
    this.totalQuanity = 0;
    this.displayedDataShipments.forEach(e => {
      this.totalQuanity += Number(e.quantity ?? 0);
    });
    
    if (this.totalQuanity > Number(this.poLineRow.quantity ?? 0)) {
      this.notify.warn(this.l('TotalQuanityGreaterThan'));
      return;
    }

    const obj = Object.assign(this.poLineRow, {
      listPOShipments: this.displayedDataShipments
    });
    this.close.emit(obj);
    this.modal.hide();
  }

  agKeyUp(event) {

  }

}
