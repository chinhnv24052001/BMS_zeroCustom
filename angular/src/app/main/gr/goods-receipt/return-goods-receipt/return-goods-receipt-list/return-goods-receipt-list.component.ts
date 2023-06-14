import { ICellRendererParams, ValueGetterParams } from '@ag-grid-enterprise/all-modules';
import { Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TABS } from '@app/shared/constants/tab-keys';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { EventBusService } from '@app/shared/services/event-bus.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { InputRcvShipmentHeadersDto, MstSupplierServiceProxy, RcvShipmentHeadersServiceProxy, ReturnLinesDto, SearchAllReturnsDto } from '@shared/service-proxies/service-proxies';
import { ceil } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import { FileDownloadService } from '@shared/utils/file-download.service';
@Component({
  selector: 'app-return-goods-receipt-list',
  templateUrl: './return-goods-receipt-list.component.html',
  styleUrls: ['./return-goods-receipt-list.component.less']
})
export class ReturnGoodsReceiptListComponent extends AppComponentBase implements OnInit {
  @Output() changeTabCode: EventEmitter<{ addRegisterNo: string }> = new EventEmitter();
  @Output() autoReloadWhenDisplayTab: EventEmitter<{ reload: boolean, registerNo?: string,reloadTabHasRegisterNo?: string, tabCodes?: string[], key: string }> = new EventEmitter();

  @Input() receiptNum: any;

  searchForm: FormGroup;
  gridColDef: CustomColDef[];
  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridParams: GridParams | undefined;
  listReturns: ReturnLinesDto[] = [];
  countTabReceipt: number = 10;
  countTabAcceptance: number = 100;

  selectedRow: ReturnLinesDto = new ReturnLinesDto();

  listSupplierAll: { label: string, value: string | number }[] = [];
  listSupplier: { label: string, value: string | number }[] = [];
  siteListAll: { supplierId: number, id: number, vendorSiteCode: string }[] = [];
  siteList: { label: string, value: string | number }[] = [{ value: -1, label: 'Tất cả' }];

  supplierContactId: number;
  currentSupplierId: number = undefined;
  currentSiteId: number = undefined;

  @Input() params: any;
  receiptType: number;

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private dataFormatService : DataFormatService,
    private eventBus: EventBusService,
    private _service: RcvShipmentHeadersServiceProxy,
    private mstSupplierServiceProxy: MstSupplierServiceProxy,
    private _fileDownloadService: FileDownloadService
  ) {
    super(injector);
    this.gridColDef = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        width: 100,
      },
      {
        headerName: this.l('ReceiptNum'),
        headerTooltip: this.l('ReceiptNum'),
        field: 'receiptNum',
        width: 100,
      },
      {
        headerName: this.l('PoNo'),
        headerTooltip: this.l('PoNo'),
        field: 'poNo',
        width: 100,
      },
      {
        headerName: this.l('PartNo'),
        headerTooltip: this.l('PartNo'),
        field: 'partNo',
        width: 150,
      },
      {
        headerName: this.l('ItemDescription'),
        headerTooltip: this.l('ItemDescription'),
        field: 'itemDescription',
        width: 250,
      },
      {
        headerName: this.l('QuantityReceived'),
        headerTooltip: this.l('QuantityReceived'),
        field: 'quantityReceived',
        width: 100,
        cellClass:['text-right'],
      },
      {
        headerName: this.l('UnitOfMeasure'),
        headerTooltip: this.l('UnitOfMeasure'),
        field: 'unitOfMeasure',
        width: 100,
      },
      {
        headerName: this.l('CreationTime'),
        headerTooltip: this.l('CreationTime'),
        field: 'creationTime',
        valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.creationTime): "",
        width: 100,
        hide: this.receiptType == 0
      },
      {
        headerName: this.l('Vendor'),
        headerTooltip: this.l('Vendor'),
        field: 'supplierName',
        width: 300,
      },
      {
        headerName: this.l('Note'),
        headerTooltip: this.l('Note'),
        field: 'remark',
        width: 300,
      }
    ];

    this.getSupplierList();
  }

  ngOnInit(): void {
    this.receiptType = this.params?.key?? 0;

    this.buildForm();

  }

  ngAfterViewInit(){
    // console.log(this.receiptNum)
    // this.receiptNum.focus();
  }

  getSupplierList() {
    this.listSupplier = [{ value: -1, label: 'Tất cả' }];
    this.mstSupplierServiceProxy.getAllSupplierNotPaged("").subscribe(
      res => {
        res.forEach(e => this.listSupplier.push({ value: e.id, label: e.supplierName }));
      });
  }

  onChangeSelection(params) {
    this.selectedRow = params.api.getSelectedRows()[0] ?? new InputRcvShipmentHeadersDto();
    this.selectedRow = Object.assign({}, this.selectedRow);
  }

  callBackGrid(params: GridParams) {
    this.gridParams = params;
    params.api.setRowData([]);
  }

  buildForm() {
    this.searchForm = this.formBuilder.group({
      sReceiptNum: [undefined],
      sVendorId: [undefined],
      sPoNo: [undefined],
      sPartNo: [undefined],
      sReceiptType: [undefined],
      sReceivedDateFrom: [undefined],
      sReceivedDateTo: [undefined],
    });
  }

  changePaginationParams(paginationParams: PaginationParamsModel) {
    if (!this.listReturns) {
      return;
    }
    this.paginationParams = paginationParams;
    this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
    this.paginationParams.pageSize = paginationParams.pageSize;
    this.searchReturns();
  }

  searchReturns() {
    this.spinnerService.show();
    this._service.getAllReturns(
      this.searchForm.get('sReceiptNum').value,
      this.searchForm.get('sVendorId').value,
      this.searchForm.get('sPoNo').value,
      this.searchForm.get('sPartNo').value,
      this.receiptType,
      this.searchForm.get('sReceivedDateFrom').value,
      this.searchForm.get('sReceivedDateTo').value,
      (this.paginationParams ? this.paginationParams.sorting : ''),
      (this.paginationParams ? this.paginationParams.pageSize : 20),
      (this.paginationParams ? this.paginationParams.skipCount : 1)
    ).pipe(finalize(()=> {
        this.spinnerService.hide();
      })).subscribe((val) => {
        this.listReturns = val.items;

        this.gridParams.api.setRowData(this.listReturns);
        this.paginationParams.totalCount = val.totalCount;
        this.paginationParams.totalPage = ceil(val.totalCount / this.paginationParams.pageSize);
      });
  }

  addNewReturn() {
    this.eventBus.emit({
      type: 'openComponent',
      functionCode: TABS.RETURN_GOODS_RECEIPT,
      tabHeader: this.l('AddReturnGoodsReceipt'),
      params: {
        data: {
         
        }
      }
    });
    if (this.receiptType == 0)
      this.countTabReceipt += 1;
    else
      this.countTabAcceptance += 1;
  }



  // viewDetail() {
  //   if (this.selectedRow.receiptNum == undefined){
  //     this.notify.warn("Chọn 1 bản ghi để hiển thị!")
  //     return;
  //   }

  //   this.eventBus.emit({
  //     type: 'openComponent',
  //     functionCode: TABS.VIEW_GOODS_RECEIPT,
  //     tabHeader: (this.receiptType == 0 ? this.l('viewGoodsReceipt'): this.l('viewServiceReceipt')) + '-' + this.selectedRow.receiptNum,
  //     params: {
  //       data: {
  //         countTab: this.receiptType == 0 ? this.countTabReceipt.toString(): this.countTabAcceptance.toString(),
  //         editId: this.selectedRow.headerId,
  //         selectedReceiptRow: this.selectedRow,
  //         receiptStatusList: this.receiptStatusList,
  //         approveStatusList: this.approveStatusList,
  //         receiptType: this.receiptType,
  //         currentSupplierId: this.currentSupplierId
  //       }
  //     }
  //   });
  //   if (this.receiptType == 0)
  //     this.countTabReceipt += 1;
  //   else
  //     this.countTabAcceptance += 1;
  // };

  export() {
    this.spinnerService.show();
    let body = new SearchAllReturnsDto();
    body = Object.assign({
      receiptNum: this.searchForm.get('sReceiptNum').value,
      vendorId: this.searchForm.get('sVendorId').value,
      poNo: this.searchForm.get('sPoNo').value,
      partNo: this.searchForm.get('sPartNo').value,
      receiptType: this.receiptType,
      receivedDateFrom: this.searchForm.get('sReceivedDateFrom')?.value?? undefined,
      receivedDateTo: this.searchForm.get('sReceivedDateTo')?.value?? undefined
    });

    this._service.exportReturns(body)
      .pipe(finalize(() => {
        this.spinnerService.hide();
      }))
      .subscribe(blob => {
        this._fileDownloadService.downloadTempFile(blob);
        this.notify.success(this.l('SuccessfullyExported'));
      });
  }
}
