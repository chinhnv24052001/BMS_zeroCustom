import { finalize } from 'rxjs/operators';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from "@angular/core";
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { MstSupplierRequestServiceProxy, RequestApprovalTreeServiceProxy, RequestNextApprovalTreeInputDto, SupplierRequestInfoDto } from '@shared/service-proxies/service-proxies';
import { ceil } from 'lodash-es';
import { ViewListApproveDetailComponent } from '@app/shared/common/view-list-approve-detail/view-list-approve-detail.component';

@Component({
  selector: "app-mst-supplier-request",
  templateUrl: "./mst-supplier-request.component.html",
  styleUrls: ["./mst-supplier-request.component.scss"]
})

export class MstSupplierRequestComponent extends AppComponentBase implements OnInit {

    @ViewChild('viewDetailApprove', { static: true }) viewDetailApprove: ViewListApproveDetailComponent;
    tabKey: number = 1;
    paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
    gridParams: GridParams | undefined;
    selectedRow: SupplierRequestInfoDto = new SupplierRequestInfoDto();
    selectedRows: SupplierRequestInfoDto[] = [];
    gridColDef: CustomColDef[];

    requestTypeList: any[]=[];
    filterText = "";



    rowData: any[]=[];
  constructor(injector: Injector,private dataFormatService : DataFormatService,private _serviceProxy :MstSupplierRequestServiceProxy,private _approvalProxy: RequestApprovalTreeServiceProxy,) {
    super(injector);

    this.gridColDef = [
        {
            headerName: "",
            headerTooltip: "",
            field: "checked",
            headerClass: ["align-checkbox-header"],
            cellClass: ["check-box-center"],
            // rowDrag : true,
            checkboxSelection: true,
            headerCheckboxSelection: true,
            headerCheckboxSelectionFilteredOnly: true,
            flex:0.1,
            },
        {
            // STT
            headerName: this.l('STT'),
            headerTooltip: this.l('STT'),
            cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
            flex: 0.3
          },
          {
            headerName: this.l('RequestPerson'),
            field: 'requestPerson',
            flex: 3
          },
          {
            headerName: this.l('RequestEmail'),
            field: 'requestEmail',
            //valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.receivedDate): "",
            flex: 2
          },
          {
            headerName: this.l('RequestExpiredDate'),
            field: 'requestExpiredDate',
            valueGetter: param => param.data ? this.dataFormatService.dateFormat(param.data.requestExpiredDate): "",
            flex: 2
          },
          {
            headerName: this.l('ApprovalStatus'),
            field: 'approvalStatus',
            valueGetter: (params: any) => this.handleStatus(params.data?.approvalStatus, params.data?.departmentApprovalName),
            flex: 2
          },
          {
            headerName: this.l('Supplier'),
            field: 'supplierName',
            flex: 4
          },
          {
            headerName: this.l('AbbreviateName'),
            field: 'abbreviateName',
            flex: 2
          },
          {
            headerName: this.l('VatRegistrationNum'),
            field: 'taxRegistrationNumber',
            flex: 2.5
          },
          {
            headerName: this.l('CompanyAddress'),
            field: 'address',
            flex: 5
          },
        //   {
        //     headerName: 'Tel',
        //     field: 'tel',
        //     width: 150,
        //   },
        //   {
        //     headerName: 'Tax',
        //     field: 'tax',
        //     width: 150,
        //   },
        //   {
        //     headerName: 'Location',
        //     field: 'location',
        //     width: 200,
        //   },
        //   {
        //     headerName: this.l('Contact Person 1'),
        //     field: 'conntactPerson1',
        //     width: 300,
        //   },
        //   {
        //     headerName: this.l('Contact Mobile 1'),
        //     field: 'contactMobile1',
        //     width: 150,
        //   },
        //   {
        //     headerName: this.l('Contact Email 1'),
        //     field: 'contactEmail1',
        //     width: 200,
        //   },
        //   {
        //     headerName: this.l('Contact Person 2'),
        //     field: 'conntactPerson2',
        //     width: 300,
        //   },
        //   {
        //     headerName: this.l('Contact Mobile 2'),
        //     field: 'contactMobile2',
        //     width: 150,
        //   },
        //   {
        //     headerName: this.l('Contact Email 2'),
        //     field: 'contactEmail2',
        //     width: 200,
        //   },
        //   {
        //     headerName: this.l('Contact Person 3'),
        //     field: 'conntactPerson3',
        //     width: 300,
        //   },
        //   {
        //     headerName: this.l('Contact Mobile 3'),
        //     field: 'contactMobile3',
        //     width: 150,
        //   },
        //   {
        //     headerName: this.l('Contact Email 3'),
        //     field: 'contactEmail3',
        //     width: 200,
        //   },
        //   {
        //     headerName: this.l('Classification Type'),
        //     field: 'classificationType',
        //     width: 100,
        //   },
        //   {
        //     headerName: 'BeneficiaryName',
        //     field: 'beneficiaryName',
        //     width: 200,
        //   },
        //   {
        //     headerName: 'Beneficiary Account',
        //     field: 'beneficiaryAccount',
        //     width: 150,
        //   },
        //   {
        //     headerName: 'Bank Code',
        //     field: 'bankCode',
        //     width: 150,
        //   },
        //   {
        //     headerName: 'Bank Name',
        //     field: 'bankName',
        //     width: 200,
        //   },
        //   {
        //     headerName: 'Bank Branch',
        //     field: 'bankBranch',
        //     width: 200,
        //   },
        //   {
        //     headerName: 'Bank ddress',
        //     field: 'bankAddress',
        //     width: 300,
        //   },
    ]
  }

  handleStatus(status: string, department: string) {
    switch(status) {
        case 'NEW':
            return this.l('New') + (department ? ` - ${department}` : '');
        case 'INCOMPLETE':
            return this.l('New') + (department ? ` - ${department}` : '');
        case 'PENDING':
            return this.l('Pending') + (department ? ` - ${department}` : '');
        case 'WAITTING':
            return this.l('Waitting') + (department ? ` - ${department}` : '');
        case 'APPROVED':
            return this.l('Approved') + (department ? ` - ${department}` : '');
        case 'REJECTED':
            return this.l('Rejected') + (department ? ` - ${department}` : '');
        case 'FORWARD':
            return this.l('Forward') + (department ? ` - ${department}` : '');
    }
}



  ngOnInit() {
    this.searchData();
  }

  requestCheckInfo(params){
    if (!params.note || (params.note && params.note == "") ) return this.notify.warn("VUi lòng nhập yêu cầu kiểm tra")
    if (this.selectedRows[0]?.requestEmail?.trim()) this.selectedRows[0].requestBaseUrl = location.origin + '/add-supplier' + '?uniqueRequest=';
    this.selectedRows[0].picNote = params.note;
    this.spinnerService.show();
    this._serviceProxy.resentEmailToUser(this.selectedRows[0])
    .pipe(finalize(()=>{
        this.spinnerService.hide();
    }))
    .subscribe(res =>{
        this.notify.success("Yêu cầu thành công");
    })
  }

  getData(){
    return this._serviceProxy.getAllSupplier(
        this.filterText?? "",
        (this.paginationParams ? this.paginationParams.sorting : ''),
      (this.paginationParams ? this.paginationParams.pageSize : 20),
      (this.paginationParams ? this.paginationParams.skipCount : 1)
    )
  }

  searchData(){
    this.spinnerService.show();
    this.getData()
    .pipe(finalize(()=>{
        this.spinnerService.hide();
        this.selectedRow = new SupplierRequestInfoDto();
    }))
    .subscribe(val => {
        this.rowData = val.items;

        this.gridParams.api.setRowData(this.rowData);
        this.paginationParams.totalCount = val.totalCount;
        this.paginationParams.totalPage = ceil(val.totalCount / this.paginationParams.pageSize);
        // this.gridParams.api.sizeColumnsToFit();
    })
  }

  onChangeSelection(params) {
    this.selectedRow =
       params.api.getSelectedRows()[0] ?? new SupplierRequestInfoDto();
     this.selectedRow = Object.assign({}, this.selectedRow);

     this.selectedRows = params.api.getSelectedRows();
   }

   callBackGrid(params: GridParams) {
     this.gridParams = params;
    //  params.api.setRowData([]);
   }

   changePaginationParams(paginationParams: PaginationParamsModel) {
     if (!this.rowData) {
       return;
     }
     this.paginationParams = paginationParams;
     this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
     this.paginationParams.pageSize = paginationParams.pageSize;
     this.searchData();
   }

   approveRequest(createAccount? : boolean){
    if (!this.selectedRow.supplierName || this.selectedRow.supplierName.trim() == "" || !this.selectedRow.taxRegistrationNumber || this.selectedRow.taxRegistrationNumber.trim() == "") return this.notify.warn("Chưa đủ thông tin để xác nhận")

    this.spinnerService.show();
    this.selectedRow.createAccount = createAccount ? true : false;
    this.selectedRow.requestBaseUrl = location.origin;
        this._serviceProxy.approve(this.selectedRow)
        .pipe(finalize(()=>{
            this.spinnerService.hide();
            this.searchData()
        }))
        .subscribe(res => {
            this.notify.success(this.l("Approved"));
        })
   }

   rejectRequest(){
    this._serviceProxy.rejectRequest(this.selectedRow)
        .pipe(finalize(()=>{
            this.spinnerService.hide();
            this.searchData()
        }))
        .subscribe(res => {

            this.notify.success(this.l("Rejected"));
        })
   }

   sendRequest() {
    if (this.selectedRows.length > 0){
        this._approvalProxy.checkRequestNextMultipleApprovalTree('SR',this.selectedRows.map(e => e.id)).subscribe(res => {
            this.viewDetailApprove.showModal(this.selectedRows[0].id, 'SR',this.selectedRows.map(e => e.id));
        })

    }
    else {
        this.notify.warn(this.l('SelectLine'));
    }
    // if (this.selectedRow ) {

    //     this.viewDetailApprove.showModal(this.selectedRow.id, 'SR');
    //   } else {
    //     this.notify.warn(this.l('SelectLine'));
    //   }

}


  confirmRequest(){
    let body = Object.assign(new RequestNextApprovalTreeInputDto(), {
        reqId: this.selectedRow.id,
        processTypeCode: 'SR'
    })
    this.message.confirm(this.l('AreYouSure'), this.l('SendRequestApprove'), (isConfirmed) => {
        if (isConfirmed) {
            this.spinnerService.show();
            // let body = Object.assign(new RequestNextApprovalTreeInputDto(), {
            //     reqId: this.selectedUR.id,
            //     processTypeCode: 'UR'
            // })

            this.spinnerService.show();
            this._approvalProxy.requestNextApprovalTree(body)
                .pipe(finalize(() => {
                    this.spinnerService.hide();
                    this.searchData();
                }))
                .subscribe(res => this.notify.success(this.l('Successfully')))
            // this._approvalProxy.createRequestApprovalTree(body)
            //     .pipe(finalize(() => {
            //         this.spinnerService.hide();
            //         this.search();
            //     }))
            //     .subscribe(res => this.notify.success(this.l('Successfully')))
        }
    })
  }

  undoRequest(){
    this.message.confirm(this.l('AreYouSure'), this.l('UndoRequest'), (isConfirmed) => {
        if (isConfirmed) {
            this.spinnerService.show();

            this.spinnerService.show();
            this._approvalProxy.undoRequest(
                this.selectedRow.id,
                "SR"
            ).pipe(finalize(() => {
                    this.spinnerService.hide();
                    this.searchData();
                }))
                .subscribe(res => this.notify.success(this.l('UndoSuccessfully') ))

        }
    })
  }

  deleteRequest(){
    this.message.confirm(this.l('AreYouSure'), this.l('DeleteThisRequest'), (isConfirmed) => {
        if (isConfirmed) {
            this.spinnerService.show();
            this._serviceProxy.deleteSupplierRequest(this.selectedRow.id)
            .pipe(finalize(()=>{
                this.spinnerService.hide();
                this.searchData();
            }))
            .subscribe(res => {
                this.notify.success("DeleteSuccessfully")
            })

        }
    })

}

}
