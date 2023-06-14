import { ICellEditorParams, ICellRendererParams, RowNode, ValueGetterParams } from '@ag-grid-enterprise/all-modules';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AgCheckboxRendererComponent } from '@app/shared/common/grid-input-types/ag-checkbox-renderer/ag-checkbox-renderer.component';
import { AgDatepickerRendererComponent } from '@app/shared/common/grid-input-types/ag-datepicker-renderer/ag-datepicker-renderer.component';
import { AgDropdownRendererComponent } from '@app/shared/common/grid-input-types/ag-dropdown-renderer/ag-dropdown-renderer.component';
import { TmssSelectGridModalComponent } from '@app/shared/common/grid-input-types/tmss-select-grid-modal/tmss-select-grid-modal.component';
import { AgCellEditorParams, CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { AgDataValidateService } from '@app/shared/services/ag-data-validate.service';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { GridTableService } from '@app/shared/services/grid-table.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CommonGeneralCacheServiceProxy, InputRcvReceiptNoteHeadersDto, InputRcvReceiptNoteLinesDto,MstSupplierServiceProxy, RcvReceiptNoteHeadersServiceProxy, SupplierOutputSelectDto } from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { ceil } from 'lodash-es';
import { DateTime } from 'luxon';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { saveAs } from 'file-saver';

@Component({
  selector: 'view-receipt-note-detail',
  templateUrl: './view-receipt-note-detail.component.html',
  styleUrls: ['./view-receipt-note-detail.component.less']
})
export class ViewReceiptNoteComponent extends AppComponentBase implements OnInit {

  @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
  @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
  @ViewChild('listAllReceiptNotes', { static: true }) listAllReceiptNotes!: TmssSelectGridModalComponent;
  @Output() close = new EventEmitter<any>();
  //searchForm: FormGroup;
  createOrEditForm: FormGroup;
  isEdit = true;
  isSubmit = false;

  gridColDefDetail: CustomColDef[];
  supplierDefs: CustomColDef[];
  categoryDefs: CustomColDef[];
  siteDefs: CustomColDef[];
  locationDefs: CustomColDef[];
  inventoryItemsDefs: CustomColDef[];
  uomItemsDefs: CustomColDef[];
  gridRNotesDef: CustomColDef[];
  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridParamsPrDetail: GridParams | undefined;
  gridParamsPrDetailDistributions: GridParams | undefined;
  paginationParamsDetail: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  
  listPrDetailDistributions;
  selectedRowPrDetail;
  selectedRowPrDetailDistributions;
  sumPrice: number = 0;
  suppliers: SupplierOutputSelectDto[] = [];
  frameworkComponents;
  isLoading = false;
  selectedNode;
  inputRcvShipmentHeadersDto: InputRcvReceiptNoteHeadersDto = new InputRcvReceiptNoteHeadersDto()
  listPoLineDetail: InputRcvReceiptNoteLinesDto[] = [];

  poTypeLookupCode: string = "";
  poNo: string = "";
  vendorName: string = "";
  needByDate: DateTime;
  itemDescription: string = "";
  destination: string = "";
  receivingRoutingDesc: number = 0;

  listSupplier: { label: string, value: string | number }[] = [];
  siteListAll: { supplierId: number, id: number, vendorSiteCode: string }[] = [];
  siteList: { label: string, value: string | number }[] = [];
  listLocationGrid: { value: string | number, key: string | number }[] = [];
  listLocationCombo:  { label: string, value: string | number }[] = [];

  listSubInventories: { value: string, key: string | number }[] = []
  vNewNote = true;
  userHandleList: { value: number, label: string }[] = []
  employeeListAll: { value: number, title: string, label: string }[] = [];
  urlBase: string = AppConsts.remoteServiceBaseUrl;
  receiptNoteStatusList = [
    {label: "", value : -1},
    {label: "Đã tạo GRN", value : 0},
    {label: "Đã nghiêm thu/Nhập kho", value : 1},
    {label: "Đã hủy", value : 2},
  ]

  receiptNoteType: number;
  @Input('params') params: any;

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private dataFormatService: DataFormatService,
    private _serviceProxy: RcvReceiptNoteHeadersServiceProxy,
    private mstSupplierServiceProxy: MstSupplierServiceProxy,
    private _commonService: CommonGeneralCacheServiceProxy,
    private http: HttpClient
  ) {
    super(injector);
    this.frameworkComponents = {
      agDatepickerRendererComponent: AgDatepickerRendererComponent,
      agSelectRendererComponent: AgDropdownRendererComponent,
      agCheckboxRendererComponent: AgCheckboxRendererComponent,
    };

    this.gridColDefDetail = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        width: 50,
      },
      {
        headerName: this.l('PartNo'),
        headerTooltip: this.l('PartNo'),
        field: 'partNo',
        width: 200
      },
      {
        headerName: this.l('ItemDescription'),
        headerTooltip: this.l('ItemDescription'),
        field: 'itemDescription',
        width: 350,
      },
      {
        headerName: this.l('QuantityShipped'),
        headerTooltip: this.l('QuantityShipped'),
        field: 'quantityShipped',
        width: 200,
      },
      {
        headerName: this.l('QuantityOrdered'),
        headerTooltip: this.l('QuantityOrdered'),
        field: 'quantityOrdered',
        width: 200
      },
      {
        headerName: this.l('PoNo'),
        headerTooltip: this.l('PoNo'),
        field: 'poNo',
        width: 200
      },
      
      {
        headerName: this.l('UnitOfMeasure'),
        headerTooltip: this.l('UnitOfMeasure'),
        field: 'unitOfMeasure',
        width: 200
      },
      {
        headerName: this.l('ExpiryDate'),
        headerTooltip: this.l('ExpiryDate'),
        field: 'expiryDate',
        width: 200,
        valueGetter: params => this.dataFormatService.dateFormat(params.data.expiryDate)
      },
      {
        headerName: this.l('FinishedDate'),
        headerTooltip: this.l('FinishedDate'),
        field: 'finishedDate',
        width: 200,
        valueGetter: params => this.dataFormatService.dateFormat(params.data.finishedDate)
      },
      
    ]

    this.gridRNotesDef = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        width: 50,
      },
      {
        headerName: this.l('ReceiptNoteNum'),
        headerTooltip: this.l('ReceiptNoteNum'),
        field: 'receiptNoteNum',
        width: 150,
      },
      {
        headerName: this.l('ReceiptDate'),
        headerTooltip: this.l('ReceiptDate'),
        field: 'receivedDate',
        valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.receivedDate) : "",
        width: 100,
      },
      {
        headerName: this.l('VendorName'),
        headerTooltip: this.l('VendorName'),
        field: 'vendorName',
        width: 300,
      },
      {
        headerName: this.l('VendorSiteCode'),
        headerTooltip: this.l('VendorSiteCode'),
        field: 'vendorSiteCode',
        width: 100,
      },

    ];

    

  }

  ngOnInit(): void {
    this.buildForm();
    
    console.log(this.params.editId); 

    this.receiptNoteType = this.params?.receiptNoteType;
    //edit 
    if (this.params.editId){
      //this.spinnerService.show();
      this.createOrEditForm.patchValue(this.params.selectedReceiptNote); 
      this.fillReceiptNoteDetail(this.params.editId);
      console.log(this.params.selectedReceiptNote);

      // this._serviceProxy.getReceiptNoteByIdForView(this.params.editId).subscribe((res) => {
      //   this.spinnerService.hide();
      //   this.createOrEditForm.patchValue(res); 
      //   this.fillReceiptNoteDetail(this.params.editId);
      //   //console.log(res);
      //   //this.setEnable(false);
      // });
    }
  }

  
  fillReceiptNoteDetail(id){
    this.spinnerService.show();
    
    this._serviceProxy.getReceiptNoteDetail(id).subscribe((val) => {
       this.spinnerService.hide();
       this.listPoLineDetail= val.items;
       this.gridParamsPrDetail.api.setRowData(this.listPoLineDetail);
       this.paginationParamsDetail.totalCount = val.totalCount;
       this.paginationParamsDetail.totalPage = ceil(val.totalCount / this.paginationParamsDetail.pageSize);
       this.gridParamsPrDetail.api.sizeColumnsToFit();
      });
      
  }

  searchReceiptNote() {
    this.listAllReceiptNotes.show();
    // if(!this.createOrEditForm.get('receiptNoteNum').value){
    //   this.listAllReceiptNotes.show();
    // }
  }


  patchReceiptNote(event: any) {
    this.createOrEditForm.patchValue(event);
    if (this.createOrEditForm.get("id").value > 0)
      this.fillReceiptNoteDetail(this.createOrEditForm.get("id").value);
  }

  buildForm() {
    this.createOrEditForm = this.formBuilder.group({
      id: [0],
      receiptSourceCode: [undefined],
      vendorId: [-1],
      vendorSiteId: [-1],
      organizationId: [0],
      shipmentNum: [undefined],
      receiptNoteNum: [undefined],
      billOfLading: [undefined],
      receivedDate: [new Date()],
      shippedDate: [new Date()],
      employeeId: [undefined],
      supplier: [undefined],
      waybillAirbillNum: [undefined],
      comments: [undefined],
      shipToOrgId: [0],
      newNote: this.params?.editId? [0] : [1],
      employeeId2: [undefined],
      deliverName1: [undefined],
      deliverTitle1: [undefined],
      deliverName2: [undefined],
      deliverTitle2: [undefined],
      employeeTitle1: [undefined],
      employeeTitle2: [undefined],
      receiptNoteType: 0,

      employeeName1: [undefined],
      employeeName2 : [undefined],
      vendorName : [undefined],
      vendorSiteCode : [undefined],
      serviceStartDate:[undefined],
      serviceEndDate:[undefined],
      status: 0,
      creatorUser: [undefined]
    });

   
    this.createOrEditForm.get("vendorId").valueChanges.subscribe(selectedValue => {
      this.createOrEditForm.get("vendorSiteId").setValue(-1);
    });
    this.createOrEditForm.get("newNote").valueChanges.subscribe(selectedValue => {

      this.vNewNote = selectedValue;
      if (selectedValue == 0) {
        this.listAllReceiptNotes.show();
      } else {
        //this.createOrEditForm.reset();
        this.resetFom();
      }
      this.setEnable(selectedValue);
    });
  }

  resetFom() {
    this.createOrEditForm.get("id").setValue(null);
    this.createOrEditForm.get("receiptNoteNum").setValue('');
    this.createOrEditForm.get("vendorId").setValue(-1);
    this.createOrEditForm.get("vendorSiteId").setValue(-1);
    this.createOrEditForm.get("receivedDate").setValue(new Date());
    this.createOrEditForm.get("shippedDate").setValue(new Date());
    this.createOrEditForm.get("employeeId").setValue(-1);
  }

  setEnable(isEnable) {
    if (isEnable) {
      this.createOrEditForm.get("receiptNoteNum").enable();
      this.createOrEditForm.get("vendorId").enable();
      this.createOrEditForm.get("vendorSiteId").enable();
      this.createOrEditForm.get("receivedDate").enable();
      this.createOrEditForm.get("shippedDate").enable();

      this.createOrEditForm.get("employeeId").enable();

    } else {
      this.createOrEditForm.get("receiptNoteNum").disable();
      this.createOrEditForm.get("vendorId").disable();
      this.createOrEditForm.get("vendorSiteId").disable();
      this.createOrEditForm.get("receivedDate").disable();
      this.createOrEditForm.get("shippedDate").disable();
      this.createOrEditForm.get("employeeId").disable();
    }
  }

  getSupplierList() {
    this.listSupplier = [{ value: -1, label: 'Tất cả' }];
    this.mstSupplierServiceProxy.getAllSupplierNotPaged("").subscribe(
      res => {
        res.forEach(e => this.listSupplier.push({ value: e.id, label: e.supplierName }));
      });

    this._commonService.getAllSupplierSites().subscribe(
      res => {
        res.forEach(e => this.siteListAll.push({ supplierId: e.supplierId, id: e.id, vendorSiteCode: e.vendorSiteCode }));
      });
  }
  
  getSiteList(supplierIdFilter) {
    this.siteList = [{ value: -1, label: 'Tất cả' }];
    this.siteListAll.filter(e => e.supplierId == supplierIdFilter)
      .forEach(e => this.siteList.push({ value: e.id, label: e.vendorSiteCode }));
   
    // this.mstSupplierServiceProxy.getAllSupplierSiteBySupplierIdNotPaged(supplierIdFilter, "").subscribe(
    //   res => {
    //     res.forEach(e => this.siteList.push({ value: e.id, label: e.vendorSiteCode }));
    //   });
  }

  closeModel() {
    this.modal.hide();
  }

  reset() {
    this.createOrEditForm = undefined;
  }

  cellValueChanged(params: AgCellEditorParams) {
    const field = params.colDef.field;
    const rowIndex = this.gridParamsPrDetail.api.getDisplayedRowCount() - 1;
    this.gridParamsPrDetail.api.refreshCells();
  }

  callBackGridPrDetail(params: GridParams) {
    this.gridParamsPrDetail = params;
    this.gridParamsPrDetail.columnApi.setColumnVisible('expiryDate', this.receiptNoteType == 0); 
    this.gridParamsPrDetail.columnApi.setColumnVisible('finishedDate', this.receiptNoteType == 1); 
    params.api.setRowData([]);
  }

  getAllReceiptNotes(suplierName: any, paginationParams: PaginationParamsModel) {
    return this._serviceProxy.getAllReceiptNotes(
      "",
      -1, //this.createOrEditForm.get("vendorId").value,
      -1, //this.createOrEditForm.get("vendorSiteId").value,
      -1,
      this.receiptNoteType,
      null,
      null,
      (this.paginationParams ? this.paginationParams.sorting : ''),
      (this.paginationParams ? this.paginationParams.pageSize : 100),
      (this.paginationParams ? this.paginationParams.skipCount : 1)
    );
  }

  onChangeSelectionPrDetail(params) {
    const selectedRows = params.api.getSelectedRows();
    if (selectedRows) {
      this.selectedRowPrDetail = selectedRows[0];

      this.poTypeLookupCode = this.selectedRowPrDetail.poTypeLookupCode;
      this.poNo = this.selectedRowPrDetail.poNo;
      this.vendorName = this.selectedRowPrDetail.vendorName;
      this.needByDate = this.selectedRowPrDetail.needByDate;
      this.itemDescription = this.selectedRowPrDetail.itemDescription;
      this.destination = this.selectedRowPrDetail.destination;
      this.receivingRoutingDesc = this.selectedRowPrDetail.receivingRoutingDesc;
    }
    // this.selectedRow = Object.assign({}, this.selectedRow);
  }


  cellEditingStopped(params: AgCellEditorParams) {
    const col = params.colDef.field;
    const rowIndex = this.gridParamsPrDetail.api.getDisplayedRowCount() - 1;
    switch (col) {
      case 'lineTypeId':
        if (params.data[col] === 1) {
          this.gridParamsPrDetail.api.startEditingCell({ colKey: 'partNo', rowIndex });
        }
        break;
    }
  }

  setLoading(params) {
    this.isLoading = params;
  }

  closeForm(){};

  printReceiptNote(formType: number){
    this._serviceProxy.getReceiptNoteReportById(this.createOrEditForm.get("id").value, formType)
      .subscribe( (res) => {
          this.http
              .post(
                  `${this.urlBase}/api/GRReport/ExportReceiptNoteReport`,
                      res,
                  {
                      responseType: "blob",
                  }
              )
              .pipe(finalize(() => (this.isLoading = false)))
              .subscribe((blob) => saveAs(blob, "ReceiptNote.pdf"));
      });
  };

  cancelReceiptNote(){
    let id = this.createOrEditForm.get("id").value
    if (this.createOrEditForm.get("status").value > 0){
      this.notify.warn("Phiếu nhận hàng không ở trạng thái có thể hủy");
      return; 
    }

    if (id && id> 0) {
      this.message.confirm('', this.l(AppConsts.CPS_KEYS.Are_You_Sure), (isConfirmed) => {
        if (isConfirmed) {
          this.spinnerService.show();
          this._serviceProxy.cancelReceiptNote(id).subscribe(val => {
            this.notify.success('Successfully Canceled');
            //this.search();
            this.createOrEditForm.get("status").setValue(2); 
            this.spinnerService.hide();
          }, error =>{
            this.spinnerService.hide();
          });
        }
      });
    } else {
      this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Delete))
    }
  }
}
