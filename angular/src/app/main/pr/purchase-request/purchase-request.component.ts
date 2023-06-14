import { ICellRendererParams, ValueGetterParams } from '@ag-grid-enterprise/all-modules';
import { Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TmssSelectGridModalComponent } from '@app/shared/common/grid-input-types/tmss-select-grid-modal/tmss-select-grid-modal.component';
import { TABS } from '@app/shared/constants/tab-keys';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { EventBusService } from '@app/shared/services/event-bus.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CreateRequestApprovalInputDto, GetPurchaseRequestDto, MstInventoryGroupServiceProxy, PurchaseRequestServiceProxy, RequestApprovalTreeServiceProxy, RequestNextApprovalTreeInputDto, SearchPurchaseRequestDto } from '@shared/service-proxies/service-proxies';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { ceil } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import { CreateOrEditPurchaseRequestComponent } from './create-or-edit-purchase-request/create-or-edit-purchase-request.component';
import { ForwardPurchaseRequestComponent } from './forward-purchase-request/forward-purchase-request.component';
import { ImportPurchaseRequestComponent } from './import-purchase-request/import-purchase-request.component';
import { ViewPurchaseRequestComponent } from './view-purchase-request/view-purchase-request.component';
import { ViewListApproveDetailComponent } from '@app/shared/common/view-list-approve-detail/view-list-approve-detail.component';

@Component({
  selector: 'app-purchase-request',
  templateUrl: './purchase-request.component.html',
  styleUrls: ['./purchase-request.component.less']
})
export class PurchaseRequestComponent extends AppComponentBase implements OnInit {
  @ViewChild('viewPurchaseRequest', { static: true }) viewPurchaseRequest: ViewPurchaseRequestComponent;
  @ViewChild('forwardPurchaseRequest', { static: true }) forwardPurchaseRequest: ForwardPurchaseRequestComponent;
  @ViewChild('importPurchaseRequest', { static: true }) importPurchaseRequest: ImportPurchaseRequestComponent;
  @ViewChild('viewDetailApprove', { static: true }) viewDetailApprove: ViewListApproveDetailComponent;
  @Output() changeTabCode: EventEmitter<{ addRegisterNo: string }> = new EventEmitter();
  @Output() autoReloadWhenDisplayTab: EventEmitter<{ reload: boolean, registerNo?: string, reloadTabHasRegisterNo?: string, tabCodes?: string[], key: string }> = new EventEmitter();
  @ViewChild('listPreparers', { static: true }) listPreparers!: TmssSelectGridModalComponent;
  purchaseRequestForm: FormGroup;
  gridColDef: CustomColDef[];
  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridParams: GridParams | undefined;
  listPurchaseRequest: GetPurchaseRequestDto[] = [];
  countTab: number = 1;
  selectedRow: GetPurchaseRequestDto = new GetPurchaseRequestDto();
  selectedRows: GetPurchaseRequestDto[] = [];
  listPerparers: { label: string, value: string | number }[] = [];
  // approvalStatus: { label: string, value: string | number }[] = [];
  listInventoryGroups: { label: string, value: string | number }[] = [];
  preparersDefs: CustomColDef[];

  approvalStatus: { label: string, value: string }[] = [
    { label: this.l('All'), value: undefined },
    { label: this.l('New'), value: 'NEW' }, //Chưa hoàn thành
    { label: this.l('Pending'), value: 'PENDING' }, // Chờ xử lý -- Them Waiting (Đang đợi duyệt)
    { label: this.l('Approved'), value: 'APPROVED' },
    { label: this.l('Rejected'), value: 'REJECT' }
  ];

  @Input() params: any;
  tabKey: number = 1;
  isDisabled: boolean = false;
  buyerColDef:any;

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private dataFormatService: DataFormatService,
    private eventBus: EventBusService,
    private purchaseRequestServiceProxy: PurchaseRequestServiceProxy,
    private _approvalProxy: RequestApprovalTreeServiceProxy,
    private mstInventoryGroupServiceProxy: MstInventoryGroupServiceProxy,
    private _fileDownloadService: FileDownloadService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.buildForm();
    if (this.params?.purchaseRequest != null) {
        this.purchaseRequestForm.get('requisitionNo').setValue(this.params?.purchaseRequest);
    }
    this.buyerColDef = [
        {
            // STT
            headerName: this.l('STT'),
            headerTooltip: this.l('STT'),
            cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
            flex:1,
            cellClass: ['text-center', 'cell-border'],
          },
          {
            headerName: this.l('UserName'),
            headerTooltip: this.l('UserName'),
            field: 'userName',
            flex:2,
            cellClass: ['text-center', 'cell-border'],
          },
          {
            headerName: this.l('Name'),
            headerTooltip: this.l('Name'),
            field: 'name',
            flex:3,
          },
    ]
    this.gridColDef = [
      {
        headerName: "",
        headerTooltip: "",
        field: "checked",
        headerClass: ["align-checkbox-header"],
        cellClass: ["check-box-center"],
        checkboxSelection: true,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        width: 1,
      },
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        maxWidth: 50,
        cellClass: ['text-center', 'cell-border'],
      },
      {
        headerName: this.l('ReqisitionNumber'),
        headerTooltip: this.l('ReqisitionNumber'),
        field: 'requisitionNo',
        maxWidth: 120,
        cellClass: ['text-center', 'cell-border'],
      },
      {
        headerName: this.l('Description'),
        headerTooltip: this.l('Description'),
        field: 'description',
        width: 300,
      },
      {
        headerName: this.l('InventoryGroup'),
        headerTooltip: this.l('InventoryGroup'),
        field: 'productGroupName',
        cellClass: ['cell-border'],
        validators: ['required'],
        width: 120,
      },
      {
        headerName: this.l('ApproveStatus'),
        headerTooltip: this.l('ApproveStatus'),
        field: 'authorizationStatus',
        maxWidth: 150,
        valueGetter: (params: ValueGetterParams) => this.handleStatus(params.data?.authorizationStatus, params.data?.departmentApprovalName),
        cellClass: ['text-center', 'cell-border'],
      },
      {
        headerName: this.l('TotalPrice'),
        headerTooltip: this.l('TotalPrice'),
        field: 'totalPrice',
        cellClass: ['cell-border', 'text-right'],
        valueGetter: (params: ValueGetterParams) => this.dataFormatService.formatMoney(params.data?.totalPrice),
        maxWidth: 120,
      },
      {
        headerName: this.l('RequestNote'),
        headerTooltip: this.l('RequestNote'),
        field: 'requestNote',
      },
      {
        headerName: this.l('ReplyNote'),
        headerTooltip: this.l('ReplyNote'),
        field: 'replyNote',
      },
      {
        headerName: this.l('Preparer'),
        headerTooltip: this.l('Preparer'),
        field: 'preparerName',
        width: 150,
      },
      {
        headerName: this.l('CreationTime'),
        headerTooltip: this.l('CreationTime'),
        field: 'creationTime',
        valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.creationTime) : "",
        maxWidth: 130,
        cellClass: ['text-center', 'cell-border'],
      },
      {
        headerName: this.l('Currency'),
        headerTooltip: this.l('Currency'),
        field: 'currency',
        maxWidth: 100,
        cellClass: ['text-center', 'cell-border'],
      }
    ];

    this.preparersDefs = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
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

    if (this.params?.key === 1) {
      this.tabKey = 1;
    } else {
      this.tabKey = 2;
    }

    // this.listPerparers = [{ value: 0, label: 'Tất cả' }];
    // this.purchaseRequestServiceProxy.getAllUsers().subscribe((res) => {
    //   res.forEach(e => this.listPerparers.push({ label: e.name, value: e.id }))
    // });

    this.listInventoryGroups = [{ value: 0, label: 'Tất cả' }];
    this.mstInventoryGroupServiceProxy.getAllInventoryGroup().subscribe((res) => {
      res.forEach(e => this.listInventoryGroups.push({ label: e.productGroupName, value: e.id }))
    });

    this.searchPurchaseRequest();
  }

  onChangeSelection(params) {

    this.selectedRows = params.api.getSelectedRows();

    this.selectedRow =
      params.api.getSelectedRows()[0] ?? new GetPurchaseRequestDto();
    this.selectedRow = Object.assign({}, this.selectedRow);

    if (this.selectedRow.creatorUserId === this.appSession.userId && (this.selectedRow.authorizationStatus === 'INCOMPLETE' || this.selectedRow.authorizationStatus === 'NEW')) {
      this.isDisabled = true;
    } else {
      this.isDisabled = false;
    }
  }

  callBackGrid(params: GridParams) {
    this.gridParams = params;
    params.api.setRowData([]);
  }

  buildForm() {
    this.purchaseRequestForm = this.formBuilder.group({
      requisitionNo: [undefined],
      preparerName: [undefined],
      preparerId: [undefined],
      buyerName: [undefined],
      buyerId: [undefined],
      fromDate: [undefined],
      toDate: [undefined],
      inventoryGroupId: [undefined],
      status: [undefined],
    });
    // this.searchPurchasePurpose();
  }

  changePaginationParams(paginationParams: PaginationParamsModel) {
    if (!this.listPurchaseRequest) {
      return;
    }
    this.paginationParams = paginationParams;
    this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
    this.paginationParams.pageSize = paginationParams.pageSize;
    this.searchPurchaseRequest();
  }

  searchPurchaseRequest() {
    this.spinnerService.show();
    this.purchaseRequestServiceProxy.getAllPurchaseRequest(
      this.purchaseRequestForm.get('requisitionNo').value,
      this.purchaseRequestForm.get('preparerId').value,
      this.purchaseRequestForm.get('buyerId').value,
      this.purchaseRequestForm.get('inventoryGroupId').value,
      this.purchaseRequestForm.get('status').value,
      (this.tabKey == 1 ? true : false),
      this.purchaseRequestForm.get('fromDate').value,
      this.purchaseRequestForm.get('toDate').value,
      (this.paginationParams ? this.paginationParams.sorting : ''),
      (this.paginationParams ? this.paginationParams.pageSize : 20),
      (this.paginationParams ? this.paginationParams.skipCount : 1))
      .pipe(finalize(() => {
        this.spinnerService.hide();
      }))
      .subscribe((val) => {
        this.listPurchaseRequest = val.items;

        this.gridParams.api.setRowData(this.listPurchaseRequest);
        this.paginationParams.totalCount = val.totalCount;
        this.paginationParams.totalPage = ceil(val.totalCount / this.paginationParams.pageSize);
        // this.gridParams.api.sizeColumnsToFit();
      });
  }

  addPurchaseRequest() {
    // this.createOrEditMstPurchaseRequest.show();
    this.eventBus.emit({
      type: 'openComponent',
      functionCode: TABS.CREATE_OR_EDIT_PURCHASE_REQUEST,
      tabHeader: this.l('CreateOrEditPurchaseRequest'),
      params: {
        data: {
          countTab: this.countTab.toString(),
          purchaseRequestId: 0
        }
      }
    });
    this.changeTabCode.emit({ addRegisterNo: this.countTab.toString() });
    this.autoReloadWhenDisplayTab.emit({ reload: true, registerNo: this.countTab.toString(), reloadTabHasRegisterNo: this.countTab.toString(), tabCodes: [TABS.CREATE_OR_EDIT_PURCHASE_REQUEST], key: TABS.PURCHASE_REQUEST })
    this.countTab += 1;
  }

  editPurchaseRequest() {
    if (this.selectedRow.id && this.selectedRow.id > 0) {
      this.eventBus.emit({
        type: 'openComponent',
        functionCode: TABS.CREATE_OR_EDIT_PURCHASE_REQUEST,
        tabHeader: this.l('CreateOrEditPurchaseRequest'),
        params: {
          data: {
            countTab: this.countTab.toString(),
            purchaseRequestId: this.selectedRow.id
          }
        }
      });
      this.changeTabCode.emit({ addRegisterNo: this.countTab.toString() });
      this.autoReloadWhenDisplayTab.emit({ reload: true, registerNo: this.countTab.toString(), reloadTabHasRegisterNo: this.countTab.toString(), tabCodes: [TABS.CREATE_OR_EDIT_PURCHASE_REQUEST], key: TABS.PURCHASE_REQUEST })
      this.countTab += 1;
    } else {
      this.notify.warn(this.l('SelectLine'));
    }
  }

  deletePurchaseRequest() {
    if (this.selectedRows && this.selectedRows.length > 0) {
      this.message.confirm('', this.l(AppConsts.CPS_KEYS.Are_You_Sure), (isConfirmed) => {
        if (isConfirmed) {
          this.spinnerService.show();
          this.selectedRows.forEach(e => {
            this.purchaseRequestServiceProxy.deletePurchaseRequest(this.selectedRow.id)
            .pipe(finalize(() => {
              this.spinnerService.hide();
              this.searchPurchaseRequest();
            }))
            .subscribe(val => {
              this.notify.success(AppConsts.CPS_KEYS.Successfully_Deleted);
            });
          });

        }
      });
    } else {
      this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Delete))
    }
  }

  viewDetail() {
    if (this.selectedRow.id && this.selectedRow.id > 0) {
      this.viewPurchaseRequest.show(this.selectedRow.id, this.isDisabled);
    } else {
      this.notify.warn(this.l('SelectLine'));
    }
  }

  preparersPopup() {
    this.listPreparers.show(this.purchaseRequestForm.get('preparerName').value);
  }

  patchPreparers(event: any) {
    this.purchaseRequestForm.get('preparerName').setValue(event.name);
    this.purchaseRequestForm.get('preparerId').setValue(event.id);
  }

  getAllPreparers(userName: any, paginationParams: PaginationParamsModel) {
    return this.purchaseRequestServiceProxy.getListRequester(userName,
      (this.paginationParams ? this.paginationParams.sorting : ''),
      (this.paginationParams ? this.paginationParams.pageSize : 5000),
      (this.paginationParams ? this.paginationParams.skipCount : 1));
  }

  forwardPr() {
    if (this.selectedRow.id && this.selectedRow.id > 0) {
      this.forwardPurchaseRequest.show();
    } else {
      this.notify.warn(this.l('SelectLine'));
    }

  }

  importPr() {
    this.importPurchaseRequest.show();
  }

  sendRequest() {
    if (this.selectedRows.length > 0) {
      this._approvalProxy.checkRequestNextMultipleApprovalTree('PR', this.selectedRows.map(e => e.id)).subscribe(res => {
        this.viewDetailApprove.showModal(this.selectedRows[0].id, 'PR', this.selectedRows.map(e => e.id));
      })
    }
    else {
      this.notify.warn(this.l('SelectLine'));
    }
  }

  // sendRequest() {
  //   if (this.selectedRow && this.selectedRow.id > 0) {

  //     this.viewDetailApprove.showModal(this.selectedRow.id, 'PR');
      // this.message.confirm(this.l('AreYouSure'), this.l('SendRequestApprove'), (isConfirmed) => {
      //   if (isConfirmed) {
      //     this.spinnerService.show();
      //     this.selectedRows.forEach(e => {
      //       let body = Object.assign(new RequestNextApprovalTreeInputDto(), {
      //         reqId: e.id,
      //         processTypeCode: 'PR'
      //       })

      //       this._approvalProxy.requestNextApprovalTree(body)
      //         .pipe(finalize(() => {
      //           this.spinnerService.hide();
      //           this.searchPurchaseRequest();
      //         }))
      //         .subscribe(res => this.notify.success(this.l('Successfully')))
      //     })
      //   }
      // })
  //   } else {
  //     this.notify.warn(this.l('SelectLine'));
  //   }
  // }

  confirmRequest(){
     this.message.confirm(this.l('AreYouSure'), this.l('SendRequestApprove'), (isConfirmed) => {
          if (isConfirmed) {
            this.spinnerService.show();
            this.selectedRows.forEach(e => {
              let body = Object.assign(new RequestNextApprovalTreeInputDto(), {
                reqId: e.id,
                processTypeCode: 'PR'
              })

              this._approvalProxy.requestNextApprovalTree(body)
                .pipe(finalize(() => {
                  this.spinnerService.hide();
                  this.searchPurchaseRequest();
                }))
                .subscribe(res => this.notify.success(this.l('Successfully')))
            })
          }
        })
  }

  export() {
    this.spinnerService.show();
    let body = new SearchPurchaseRequestDto();
    body = Object.assign({
      requisitionNo: this.purchaseRequestForm.get('requisitionNo').value,
      buyerId: this.purchaseRequestForm.get('buyerId').value,
      inventoryGroupId: this.purchaseRequestForm.get('inventoryGroupId').value,
      status: this.purchaseRequestForm.get('status').value,
      fromDate: this.purchaseRequestForm.get('fromDate')?.value ?? undefined,
      toDate: this.purchaseRequestForm.get('toDate')?.value ?? undefined
    });

    this.purchaseRequestServiceProxy.exportPr(body)
      .pipe(finalize(() => {
        this.spinnerService.hide();
      }))
      .subscribe(blob => {
        this._fileDownloadService.downloadTempFile(blob);
        this.notify.success(this.l('SuccessfullyExported'));
      });
  }

  handleStatus(status: string, department: string) {
    switch (status) {
      case 'NEW':
        return this.l('New') + (department ? ` - ${department}` : '');
      case 'INCOMPLETE':
        return this.l('New') + (department ? ` - ${department}` : '');
      case 'PENDING':
        return this.l('Pending') + (department ? ` - ${department}` : '');
      case 'WAITTING':
        return this.l('Approved') + (department ? ` - ${department}` : '');
      case 'APPROVED':
        return this.l('Approved') + (department ? ` - ${department}` : '');
      case 'REJECTED':
        return this.l('Rejected') + (department ? ` - ${department}` : '');
    }
  }

  undoRequest() {
    if (this.selectedRow && this.selectedRow.id > 0) {
      this.message.confirm(this.l('AreYouSure'), this.l('UndoRequest'), (isConfirmed) => {
        if (isConfirmed) {
          this.spinnerService.show();

          this.spinnerService.show();
          this._approvalProxy.undoRequest(
            this.selectedRow.id,
            "PO"
          ).pipe(finalize(() => {
            this.spinnerService.hide();
            this.searchPurchaseRequest();
          }))
            .subscribe(res => this.notify.success(this.l('UndoSuccessfully')))

        }
      })
    }  else {
      this.notify.warn(this.l('SelectLine'));
  }

}

    assignJob(params){
        this.spinnerService.show();
        this._approvalProxy.assignJobToOtherBuyer("PR",this.selectedRows[0].id,params.id)
        .pipe(finalize(()=>{
            this.spinnerService.hide();
            this.searchPurchaseRequest()
        }))
        .subscribe(res => {
            this.notify.success("AsignedSuccessfully")
        })
    }

    getAllBuyer(name){
        return this._approvalProxy.getAllBuyerInfo(name)
    }
}
