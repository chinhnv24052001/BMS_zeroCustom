import { ValueFormatterParams } from "@ag-grid-enterprise/all-modules";
import { Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from "@angular/core";
import { ImportAttachFileComponent } from "@app/shared/common/import-attach-file/import-attach-file.component";
import { DataFormatService } from "@app/shared/services/data-format.service";
import { AppComponentBase } from "@shared/common/app-component-base";
import { GetAllApprovalInfoForViewDto, MstSupplierRequestServiceProxy, SupplierRequestInfoDto, UrUserRequestManagementServiceProxy } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from "ngx-bootstrap/modal";
import { finalize } from "rxjs/operators";

@Component({
  selector: "app-view-supplier-request-info-modal",
  templateUrl: "./view-supplier-request-info-modal.component.html",
  styleUrls: ["./view-supplier-request-info-modal.component.scss"]
})

export class ViewSupplierRequestInfoModalComponent extends AppComponentBase  {
    @ViewChild("viewDetailModal", { static: true }) modal: ModalDirective;
    @ViewChild("attach") attach: ImportAttachFileComponent;

    selectedRequest : SupplierRequestInfoDto = new SupplierRequestInfoDto();

    @Input() viewOnly = false;
    @Output() approveEvent: EventEmitter<any> = new EventEmitter();
    @Output() rejectEvent: EventEmitter<any> = new EventEmitter();
    @Output() requestMoreInfoEvent: EventEmitter<any> = new EventEmitter();
    @Output() forwardEvent: EventEmitter<any> = new EventEmitter();


    approvalColDef: any;
    approvalInfos: GetAllApprovalInfoForViewDto[] = [];

  constructor(private injector: Injector,private _serviceProxy :MstSupplierRequestServiceProxy,private _dataFormatService: DataFormatService,
    private _urProxy: UrUserRequestManagementServiceProxy,) {
    super(injector);

    this.approvalColDef = [
        {
            // STT
            headerName: this.l('No.'),
            headerTooltip: this.l('No.'),
            cellRenderer: (params) => params.rowIndex + 1,
            cellClass: ['cell-border', 'text-center'],
            width: 50,
        },
        {
            headerName: this.l('Step'),
            headerTooltip: this.l('Step'),
            field: 'approvalSeq',
            cellClass: ['cell-border', 'custom-grid-text', 'custom-grid-cbb-text', 'text-center'],
            width: 60,
        },
        {
            headerName: this.l('UserApprove'),
            headerTooltip: this.l('UserApprove'),
            field: 'approvalUserName',
            cellClass: ['cell-border', 'text-left'],
            width: 140,
        },
        {
            headerName: this.l('Department'),
            headerTooltip: this.l('Department'),
            field: 'approvalUserDepartment',
            cellClass: ['cell-border', 'text-left'],
            width: 150,
        },
        {
            headerName: this.l('Titles'),
            headerTooltip: this.l('Titles'),
            field: 'approvalUserTitle',
            cellClass: ['cell-border', 'text-left'],
            width: 150,
        },
        {
            headerName: this.l('LeadTime'),
            headerTooltip: this.l('LeadTime'),
            field: 'leadTime',
            valueFormatter: (params: ValueFormatterParams) => this._dataFormatService.dateFormat(params.value),
            cellClass: ['cell-border', 'text-left'],
            width: 120,
        },
        {
            headerName: this.l('ApproveDate'),
            headerTooltip: this.l('ApproveDate'),
            field: 'approvalDate',
            valueFormatter: (params: ValueFormatterParams) => this._dataFormatService.dateFormat(params.value),
            cellClass: ['cell-border', 'text-left'],
            width: 120,
        },
        {
            headerName: this.l('RejectDate'),
            headerTooltip: this.l('RejectDate'),
            field: 'rejectDate',
            valueFormatter: (params: ValueFormatterParams) => this._dataFormatService.dateFormat(params.value),
            cellClass: ['cell-border', 'text-left'],
            width: 120,
        },
        {
            headerName: this.l('Status'),
            headerTooltip: this.l('Status'),
            field: 'approvalStatus',
            cellClass: ['cell-border', 'text-center'],
            valueFormatter: (params) => params.data ? this.handleStatus(params.data?.approvalStatus) : '',
            width: 100,
        },
        {
            headerName: this.l('Note'),
            headerTooltip: this.l('Note'),
            field: 'note',
            cellClass: ['cell-border', 'text-left'],
            width: 200,
        },
    ];
  }

  @Input() showFooter = false;

  checkInfo = false;
  noteForMail="";

  ngOnInit() {

  }

  getApprovalInfos() {
    this.approvalInfos = [];
    this.spinnerService.show();
    this._urProxy.getAllApprovalInfo(this.selectedRequest?.id, "SR")
        .pipe(finalize(() => this.spinnerService.hide()))
        .subscribe(res => this.approvalInfos = res);
    }

  handleStatus(status: string) {
    switch (status) {
        case 'NEW':
            return this.l('New');
        case 'PENDING':
            return this.l('');
        case 'APPROVED':
            return this.l('Approved');
        case 'REJECTED':
            return this.l('Rejected');
        case 'WAITTING':
            return this.l('Waitting');
        case 'FORWARD':
            return this.l('Forward') ;
    }
}

  show(params? : any){
    this.selectedRequest = params ?? new SupplierRequestInfoDto();
    this.attach.setData(this.selectedRequest?.id,"SUPPLYREQUEST");
    this.getApprovalInfos();
    this.modal.show();
  }

  close() {
    this.noteForMail = "";
    this.checkInfo = false;
    this.modal.hide();
    // this.selectedRequest.requestBaseUrl = location.origin + '/app/main/add-supplier' + '?uniqueRequest=' + encodeURI("lmao")
    // window.open(this.selectedRequest.requestBaseUrl , '_blank');
  }



  resentEmail(){
    if (!this.noteForMail || (this.noteForMail && this.noteForMail == "") ) return this.notify.warn("VUi lòng nhập yêu cầu kiểm tra")
    if (this.selectedRequest?.requestEmail?.trim()) this.selectedRequest.requestBaseUrl = location.origin + '/add-supplier' + '?uniqueRequest=';
    if (this.checkInfo) this.selectedRequest.picNote = this.noteForMail;
    this.spinnerService.show();
    this._serviceProxy.resentEmailToUser(this.selectedRequest)
    .pipe(finalize(()=>{
        this.spinnerService.hide();
    }))
    .subscribe(res =>{
        this.notify.success("Yêu cầu thành công");
    })
  }


}
