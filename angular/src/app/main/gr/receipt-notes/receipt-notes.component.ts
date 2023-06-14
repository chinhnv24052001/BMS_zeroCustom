import { ICellRendererParams, ValueGetterParams } from '@ag-grid-enterprise/all-modules';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TABS } from '@app/shared/constants/tab-keys';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { EventBusService } from '@app/shared/services/event-bus.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CommonGeneralCacheServiceProxy, GetRcvReceiptNoteHeadersDto, MstSupplierServiceProxy, PaymentHeadersServiceProxy, ProfileServiceProxy, RcvReceiptNoteHeadersServiceProxy } from '@shared/service-proxies/service-proxies';
import { ceil } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import { ActivatedRoute } from '@angular/router';
import { AppSessionService } from '@shared/common/session/app-session.service';
import { TmssSelectGridModalComponent } from '@app/shared/common/grid-input-types/tmss-select-grid-modal/tmss-select-grid-modal.component';
@Component({
  selector: 'app-receipt-notes',
  templateUrl: './receipt-notes.component.html',
  styleUrls: ['./receipt-notes.component.less']
})

export class ReceiptNotesComponent extends AppComponentBase implements OnInit {
  @ViewChild('listSupplierPopup', { static: true }) listSupplierPopup!: TmssSelectGridModalComponent;
  @Input() params: any;
  @Output() changeTabCode: EventEmitter<{ addRegisterNo: string }> = new EventEmitter();
  @Output() autoReloadWhenDisplayTab: EventEmitter<{ reload: boolean, registerNo?: string, reloadTabHasRegisterNo?: string, tabCodes?: string[], key: string }> = new EventEmitter();
  searchForm: FormGroup;
  gridColDef: CustomColDef[];
  supplierDefs: CustomColDef[];
  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridParams: GridParams | undefined;
  listReceipts: GetRcvReceiptNoteHeadersDto[] = [];

  listSupplierAll: { label: string, value: string | number }[] = [];
  siteList: { label: string, value: string | number }[] = [{ value: -1, label: 'Tất cả' }];
  siteListAll: { supplierId: number, id: number, vendorSiteCode: string }[] = [];
  listSupplier: { label: string, value: string | number }[] = [];
  employeeListAll: { value: number, title: string, label: string }[] = [];

  countTabReceipt: number = 10;
  countTabAcceptance: number = 100;
  selectedRow: GetRcvReceiptNoteHeadersDto = new GetRcvReceiptNoteHeadersDto();

  urlBase: string = AppConsts.remoteServiceBaseUrl;
  isLoading: boolean = false;
  //typeFilter;
  receiptNoteType: number = 0;

  receiptNoteStatusList = [
    {label: "", value : -1},
    {label: "Đã tạo GRN", value : 0},
    {label: "Đã nghiêm thu/Nhập kho", value : 1},
    {label: "Đã hủy", value : 2},
  ]

  supplierContactId: number;
  currentSupplierId: number = undefined;
  currentSiteId: number = undefined;

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private dataFormatService: DataFormatService,
    private eventBus: EventBusService,
    private _service: RcvReceiptNoteHeadersServiceProxy,
    private mstSupplierServiceProxy: MstSupplierServiceProxy,
    private _commonService: CommonGeneralCacheServiceProxy,
    private http: HttpClient,
    private _paymentHeadersServiceProxy: PaymentHeadersServiceProxy,
    private $route: ActivatedRoute,
    private _profileService: ProfileServiceProxy,
    private _appSessionService: AppSessionService,
  ) {
    super(injector);
   
    this.getSupplierList();
    this.gridColDef = [
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
        flex: 1,
      },
      {
        headerName: this.l('ShippedDate'),
        headerTooltip: this.l('ShippedDate'),
        field: 'shippedDate',
        valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.shippedDate) : "",
        flex: 1,
        hide: this.receiptNoteType == 1
      },
      {
        headerName: this.l('ReceiptDate'),
        headerTooltip: this.l('ReceiptDate'),
        field: 'receivedDate',
        valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.receivedDate) : "",
        flex: 1,
        hide: this.receiptNoteType == 1
      },
      {
        headerName: this.l('ServiceStartDate'),
        headerTooltip: this.l('ServiceStartDate'),
        field: 'serviceStartDate',
        valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.serviceStartDate) : "",
        flex: 1,
        hide: this.receiptNoteType == 0
      },
      {
        headerName: this.l('ServiceEndDate'),
        headerTooltip: this.l('ServiceEndDate'),
        field: 'serviceEndDate',
        valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.serviceEndDate) : "",
        flex: 1,
        hide: this.receiptNoteType == 0
      },
      {
        headerName: this.l('Vendor'),
        headerTooltip: this.l('VendorName'),
        field: 'vendorName',
        flex: 3,
      },
      {
        headerName: this.l('VendorSiteCode'),
        headerTooltip: this.l('VendorSiteCode'),
        field: 'vendorSiteCode',
        flex: 1,
      },
      {
        headerName: this.l('Status'),
        field: 'status',
        valueGetter: params => (params.data ) ? this.receiptNoteStatusList.find(e => e.value == params.data!.status)?.label : "",
        sortable: true,
      },
      {
        headerName: this.l('CreatorUser'),
        headerTooltip: this.l('CreatorUser'),
        field: 'creatorUser',
        flex: 1,
      },
      

    ];

    this.supplierDefs = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        maxWidth: 50,
      },
      {
        headerName: this.l('Code'),
        headerTooltip: this.l('Code'),
        field: 'registryId',
        maxWidth: 150,
      },
      {
        headerName: this.l('SupplierName'),
        headerTooltip: this.l('SupplierName'),
        field: 'supplierName',
        flex: 350,
      },
    ];
  }

  ngOnInit(): void {
    //   console.log( this.$route.snapshot.paramMap.get('receiptNoteType'));
    //   this.$route.queryParams.subscribe(params => {
    //     console.log(params);
    //     this.typeFilter = params['receiptNoteType'];
    //     console.log(this.typeFilter);
    //  });
    this.receiptNoteType = this.params?.key?? 0;
    this.buildForm();
    console.log(this.receiptNoteType);
  }

  getSupplierList() {
    //this._appSessionService.user.supplierContactId
    
    this._profileService.getCurrentUserSupplierId()
    .subscribe((res)=>{
      this.currentSupplierId = res;
      this.mstSupplierServiceProxy.getAllSupplierNotPaged("")
      .pipe(finalize(() => {
        if (this.currentSupplierId != -1) {
          this.searchForm.get("sVendorId").setValue(this.currentSupplierId);
        }
      }))
      .subscribe(
        res => {
          this.listSupplier = this.currentSupplierId != -1 ? []: [{ value: -1, label: 'Tất cả' }];; 
          res.filter(e => this.currentSupplierId == -1 || e.id == this.currentSupplierId)
            .forEach(e => this.listSupplier.push({ value: e.id, label: e.supplierName }));
            //sites
      });

      this._commonService.getAllSupplierSites()
          .pipe(finalize(() =>{
            this.getSiteList(this.currentSupplierId) ;
          })).subscribe(
            res => {
              this.siteListAll = [];
              res.forEach(e => this.siteListAll.push({ supplierId: e.supplierId, id: e.id, vendorSiteCode: e.vendorSiteCode }));
            });
    });
       
   
    this._paymentHeadersServiceProxy.getTMVUserList().subscribe(
       res => {
           this.employeeListAll = [{ value: -1, title:'', label: '' }];
           res.forEach(e => 
               this.employeeListAll.push({ value: e.id, title : e.titleDescription, label: e.name }));
       });
  }

patchSupplier(event: any) {
  //this.supplierId = event.id ?? 0;
  this.searchForm.get("vendorId").setValue(event.id ?? 0);

//   this.listSupplierPopup.show(
//     params.data?.suggestedVendorName ?? '',
//     undefined,
//     undefined,
//     'suggestedVendorName'
//   );
 }


getAllSupplier(suplierName: any, paginationParams: PaginationParamsModel) {
  return this.mstSupplierServiceProxy.getAllSupplierNotPaged(
    suplierName ?? ''
  );
}

getSiteList(supplierIdFilter) {
  this.siteList = [{ value: -1, label: 'Tất cả' }];
  this.siteListAll.filter(e => e.supplierId == supplierIdFilter)
    .forEach(e => this.siteList.push({ value: e.id, label: e.vendorSiteCode }));
 
  if(this.siteList != undefined && this.siteList.length == 2){
    this.searchForm.get("sVendorSiteId").setValue(this.siteList[1].value);
  }
  // this.mstSupplierServiceProxy.getAllSupplierSiteBySupplierIdNotPaged(supplierIdFilter, "").subscribe(
  //   res => {
  //     res.forEach(e => this.siteList.push({ value: e.id, label: e.vendorSiteCode }));
  //   });
}

  onChangeSelection(params) {
    this.selectedRow =
      params.api.getSelectedRows()[0] ?? new GetRcvReceiptNoteHeadersDto();
    this.selectedRow = Object.assign({}, this.selectedRow);
  }


  callBackGrid(params: GridParams) {
    this.gridParams = params;
    this.gridParams.columnApi.setColumnVisible('serviceStartDate', this.receiptNoteType == 1); 
    this.gridParams.columnApi.setColumnVisible('serviceEndDate', this.receiptNoteType == 1); 
    this.gridParams.columnApi.setColumnVisible('shippedDate', this.receiptNoteType == 0); 
    this.gridParams.columnApi.setColumnVisible('receivedDate', this.receiptNoteType == 0); 
    params.api.setRowData([]);
  }

  buildForm() {
    this.searchForm = this.formBuilder.group({
      sReceiptNoteNum: [undefined],
      sVendorId: [this.currentSupplierId],
      sVendorSiteId: [undefined],
      sStatus:[-1],
      sShippedDateFrom: [undefined],
      sShippedDateTo: [undefined],
    });

    //console.log(this.currentSupplierId); 

    this.searchForm.get("sVendorId").valueChanges.subscribe(selectedValue => {
      // console.log('sVendorId value changed')
      // console.log(selectedValue)                              //latest value of firstname
      // console.log(this.searchForm.get("sVendorId").value)   //latest value of firstname
      this.searchForm.get("sVendorSiteId").setValue(-1);
      this.getSiteList(selectedValue);
    });
  }

  changePaginationParams(paginationParams: PaginationParamsModel) {
    if (!this.listReceipts) {
      return;
    }
    this.paginationParams = paginationParams;
    this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
    this.paginationParams.pageSize = paginationParams.pageSize;
    this.searchReceiptNotes();
  }

  searchReceiptNotes() {
    this.spinnerService.show();
    this._service.getAllReceiptNotes(
      this.searchForm.get('sReceiptNoteNum').value,
      this.searchForm.get('sVendorId').value,
      this.searchForm.get('sVendorSiteId').value,
      this.searchForm.get('sStatus').value,
      this.receiptNoteType,
      this.searchForm.get('sShippedDateFrom').value,
      this.searchForm.get('sShippedDateTo').value,
      (this.paginationParams ? this.paginationParams.sorting : ''),
      (this.paginationParams ? this.paginationParams.pageSize : 20),
      (this.paginationParams ? this.paginationParams.skipCount : 1)
    ).pipe(finalize(()=> {
          this.spinnerService.hide();
      }))
      .subscribe((val) => {
        this.listReceipts = val.items;
        this.gridParams.api.setRowData(this.listReceipts);
        this.paginationParams.totalCount = val.totalCount;
        this.paginationParams.totalPage = ceil(val.totalCount / this.paginationParams.pageSize);
        this.gridParams.api.sizeColumnsToFit();
      });
   
  }

  addReceiptNote() {
    this.eventBus.emit({
      type: 'openComponent',
      functionCode: TABS.CREATE_OR_EDIT_RECEIPT_NOTES,
      tabHeader: (this.receiptNoteType == 0 ? this.l('createReceiptNote'): this.l('createAcceptanceNote')),
      params: {
        data: {
          countTab: this.receiptNoteType == 0 ? this.countTabReceipt.toString(): this.countTabAcceptance.toString(),
          editId: null,
          selectedReceiptNote: null,
          siteListAll : this.siteListAll,
          listSupplier: this.listSupplier,
          employeeListAll: this.employeeListAll,
          receiptNoteType: this.receiptNoteType,
          currentSupplierId: this.currentSupplierId,
          currentSiteId: this.currentSiteId
        }
      }
    });
    //this.changeTabCode.emit({ addRegisterNo: this.countTab.toString() });
    //this.autoReloadWhenDisplayTab.emit({ reload: true, registerNo: this.countTab.toString(), reloadTabHasRegisterNo: this.countTab.toString(), tabCodes: [TABS.CREATE_OR_EDIT_GR_FROM_RECEIPT_NOTES], key: TABS.GOODS_RECEIPT })
    if (this.receiptNoteType == 0) 
      this.countTabReceipt += 1;
    else 
      this.countTabAcceptance += 1;
  }

  editReceiptNote() {
    if (!this.selectedRow.id) {
      this.notify.warn("Chọn 1 dòng để update");
      return; 
    }

    this.eventBus.emit({
      type: 'openComponent',
      functionCode: TABS.CREATE_OR_EDIT_RECEIPT_NOTES,
      tabHeader: (this.receiptNoteType == 0 ? this.l('editReceiptNote'): this.l('editAcceptanceNote')) + '-' + this.selectedRow.receiptNoteNum,
      params: {
        data: {
          countTab: this.receiptNoteType == 0 ? this.countTabReceipt.toString(): this.countTabAcceptance.toString(),
          editId: this.selectedRow.id,
          selectedReceiptNote: this.selectedRow,
          siteListAll : this.siteListAll,
          listSupplier: this.listSupplier,
          employeeListAll: this.employeeListAll,
          receiptNoteType: this.receiptNoteType,
          currentSupplierId: this.currentSupplierId,
          currentSiteId: this.currentSiteId
        }
      }
    });
    if (this.receiptNoteType == 0) 
      this.countTabReceipt += 1;
    else 
      this.countTabAcceptance += 1;
  }

  deleteReceiptNote() {

  }

  setLoading(params) {
    this.isLoading = params;
  }

  printReceiptNote(formType: number){
    
      this._service.getReceiptNoteReportById(this.selectedRow.id, formType)
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
  }

  viewDetail() {
    this.eventBus.emit({
      type: 'openComponent',
      functionCode: TABS.VIEW_RECEIPT_NOTE,
      tabHeader: (this.receiptNoteType == 0 ?  this.l('viewReceiptNote'): this.l('viewAcceptanceNote')) + '-' + this.selectedRow.receiptNoteNum,
      params: {
        data: {
          countTab: this.receiptNoteType == 0 ? this.countTabReceipt.toString(): this.countTabAcceptance.toString(),
          editId: this.selectedRow.id,
          selectedReceiptNote: this.selectedRow,
          receiptNoteType: this.receiptNoteType
        }
      }
    });
    //this.changeTabCode.emit({ addRegisterNo: this.countTab.toString() });
    //this.autoReloadWhenDisplayTab.emit({ reload: true, registerNo: this.countTab.toString(), reloadTabHasRegisterNo: this.countTab.toString(), tabCodes: [TABS.CREATE_OR_EDIT_PURCHASE_REQUEST], key: TABS.PURCHASE_REQUEST })
    if (this.receiptNoteType == 0) 
      this.countTabReceipt += 1;
    else 
      this.countTabAcceptance += 1;
  }; 
  
}
