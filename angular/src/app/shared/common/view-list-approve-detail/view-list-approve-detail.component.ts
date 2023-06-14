import { AddUserStepModalComponent } from './add-user-step-modal/add-user-step-modal.component';
import { Component, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { CustomColDef, GridParams } from '@app/shared/models/base.model';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { GridTableService } from '@app/shared/services/grid-table.service';
import { AppComponentBase } from '@shared/common/app-component-base';
import { PaymentHeadersServiceProxy, RequestApprovalTreeServiceProxy, RequestNextApprovalTreeInputDto, UrUserRequestManagementServiceProxy } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { AgCellButtonRendererComponent } from '../grid-input-types/ag-cell-button-renderer/ag-cell-button-renderer.component';
import { AgDatepickerRendererComponent } from '../grid-input-types/ag-datepicker-renderer/ag-datepicker-renderer.component';
import { AgDropdownRendererComponent } from '../grid-input-types/ag-dropdown-renderer/ag-dropdown-renderer.component';

@Component({
  selector: 'view-list-approve-detail',
  templateUrl: './view-list-approve-detail.component.html',
  styleUrls: ['./view-list-approve-detail.component.less']
})
export class ViewListApproveDetailComponent extends AppComponentBase implements OnInit {
  @ViewChild("modal", { static: true }) modal: ModalDirective;
  @ViewChild("addUser", { static: true }) addUser: AddUserStepModalComponent;
  @Output() close = new EventEmitter<any>();
  gridColDefDetailApprove: CustomColDef[];
  gridParamsPrDetailAprrove: GridParams | undefined;
  listDetailApprove = [];
  @Output() confirm: EventEmitter<any> = new EventEmitter();
  @Output() getData: EventEmitter<any> = new EventEmitter();

  selectedStep : any[] = [];

    selectedId = [];
    defaultColDef = {
        flex:true,
        // rowDrag : true,
    }
    frameworkComponents;

  constructor(
    injector: Injector,
    private dataFormatService: DataFormatService,
    private gridTableService: GridTableService,
    private _serviceProxy: UrUserRequestManagementServiceProxy,
    private _approvalProxy: RequestApprovalTreeServiceProxy,
    private _paymentHeadersServiceProxy: PaymentHeadersServiceProxy
  ) {
    super(injector);
    this.frameworkComponents = {
        agDatepickerRendererComponent: AgDatepickerRendererComponent,
        agDropdownRendererComponent: AgDropdownRendererComponent,
        agCellButtonRendererComponent: AgCellButtonRendererComponent
      };
    this.gridColDefDetailApprove = [
        {
            headerName: "",
            headerTooltip: "",
            // field: "checked",
            headerClass: ["align-checkbox-header"],
            cellClass: ["check-box-center"],
            cellRenderer: 'agCellButtonRendererComponent',
            buttonDef: {
                iconName: "fa fa-arrow-up",
                className: 'btn btn-outline-primary',
                //disabled: params => params.data.approvalSeq == 1,
                function: this.upStep.bind(this),
              },
              buttonDefTwo: {
                iconName: "fa fa-arrow-down",
                className: 'btn btn-outline-primary',
                function: this.downStep.bind(this),
              },
            // rowDrag : true,
            // checkboxSelection: true,
            // headerCheckboxSelection: true,
            // headerCheckboxSelectionFilteredOnly: true,
            maxWidth:75,
            minWidth:75,
            flex:1.5,
            },
        //   {
        //     // STT
        //     headerName: this.l('No.'),
        //     headerTooltip: this.l('No.'),
        //     cellRenderer: (params) => params.rowIndex + 1,
        //     flex:0.8,
        //   },
          {
            headerName: this.l('Step'),
            headerTooltip: this.l('Step'),
            field: 'approvalSeq',
            cellClass: ['cell-border', 'custom-grid-text', 'custom-grid-cbb-text'],
            flex:1,
          },
          {
            headerName: this.l('UserApprove'),
            headerTooltip: this.l('UserApprove'),
            field: 'approvalUserName',
            cellClass: ['cell-border', 'text-left'],
            flex:3,
          },
          {
            headerName: this.l('Department'),
            headerTooltip: this.l('Deapartment'),
            field: 'approvalUserDepartment',
            cellClass: ['cell-border', 'text-left'],
            flex:3,
          },
          {
            headerName: this.l('Titles'),
            headerTooltip: this.l('Titles'),
            field: 'approvalUserTitle',
            cellClass: ['cell-border', 'text-left'],
            flex:3,
          },
          {
            headerName: this.l('ProcessingDate'),
            headerTooltip: this.l('ApproveDate'),
            field: 'approvalDate',
            valueGetter: params => this.dataFormatService.dateFormat(params.data.approvalDate),
            cellClass: ['cell-border', 'text-left'],
            flex:3,
          },
          // {
          //   headerName: this.l('RejectDate'),
          //   headerTooltip: this.l('RejectDate'),
          //   field: 'rejectDate',
          //   valueGetter: params => this.dataFormatService.dateFormat(params.data.approvalDate),
          //   cellClass: ['cell-border', 'text-left'],
          //   width: 150,
          // },
          {
            headerName: this.l('Status'),
            headerTooltip: this.l('Status'),
            field: 'approvalStatus',
            valueFormatter : params => params.data ? this.handleStatus(params.data?.approvalStatus) : "",
            cellClass: ['cell-border', 'text-center'],
            flex:3,
          },
          {
            headerName: this.l('Note'),
            headerTooltip: this.l('Note'),
            field: 'note',
            cellClass: ['cell-border', 'text-center'],
            flex:3,
          },
          {
            headerName: this.l('Bỏ qua'),
            cellClass: ['cell-border'],
            cellRenderer: 'agCellButtonRendererComponent',
            buttonDef: {
              text: this.l('Bỏ qua'),
              className: 'btn btn-outline-primary',
              function: this.skipUser.bind(this),
            },
            flex:3,
          },
          {
            headerName: this.l('Xóa'),
            cellClass: ['cell-border'],
            cellRenderer: 'agCellButtonRendererComponent',
            buttonDef: {
              text: this.l('Delete'),
              className: 'btn btn-outline-danger',
              function: this.deleteStep.bind(this),
            },
            flex:3,
          },

        ];
   }

   upStep(params){
    if (params?.node?.data?.approvalSeq == 1) return this.notify.warn("Không thể di chuyển đến vị trí này");
        if (this.reqIds.length == 0 ){
            this.spinnerService.show();
            this._approvalProxy.saveChangeStepPosition(params?.node?.data?.id,params?.node?.data?.approvalSeq -1)
            .pipe(finalize(()=>{
                this.spinnerService.hide();
                this.getApprovalInfos(this.reqId,this.type);
            }))
            .subscribe(res =>{
                //this.notify.success("Thêm mới thành công");
            })
        }
        else {
            this.spinnerService.show();
            this._approvalProxy.saveChangeStepPositionForMulltipleHeader(params?.node?.data?.approvalSeq,params?.node?.data?.approvalSeq - 1,this.type,this.reqIds)
            .pipe(finalize(()=>{
                this.spinnerService.hide();
                this.getApprovalInfos(this.reqId,this.type);
            }))
            .subscribe(res =>{
                //this.notify.success("Thêm mới thành công");
            })
        }
   }

   downStep(params){
    if (params?.node?.data?.approvalSeq == this.listDetailApprove.length) return this.notify.warn("Không thể di chuyển đến vị trí này");
    if (this.reqIds.length == 0 ){
        this.spinnerService.show();
        this._approvalProxy.saveChangeStepPosition(params?.node?.data?.id,params?.node?.data?.approvalSeq +1)
        .pipe(finalize(()=>{
            this.spinnerService.hide();
            this.getApprovalInfos(this.reqId,this.type);
        }))
        .subscribe(res =>{
            //this.notify.success("Thêm mới thành công");
        })
    }
    else {
        this.spinnerService.show();
        this._approvalProxy.saveChangeStepPositionForMulltipleHeader(params?.node?.data?.approvalSeq,params?.node?.data?.approvalSeq + 1,this.type,this.reqIds)
        .pipe(finalize(()=>{
            this.spinnerService.hide();
            this.getApprovalInfos(this.reqId,this.type);
        }))
        .subscribe(res =>{
            //this.notify.success("Thêm mới thành công");
        })
    }
   }

   deleteStep(params){
    if (!params?.data?.approvalTreeDetailId || params?.data?.approvalTreeDetailId == 0){
        if (this.reqIds.length > 0){
            this.spinnerService.show();
            this._approvalProxy.deleteStepForMultipleHeader(params?.data?.approvalSeq,this.type, this.reqIds)
            .pipe(finalize(()=>{
                this.spinnerService.hide();
                this.getApprovalInfos(this.reqId, this.type);
            }))
            .subscribe(res => {
                this.notify.success("Xóa thành công")
            })
        }
        else {
            this.spinnerService.show();
            this._approvalProxy.deleteStep(params?.data?.id)
            .pipe(finalize(()=>{
                this.spinnerService.hide();
                this.getApprovalInfos(this.reqId, this.type);
            }))
            .subscribe(res => {
                this.notify.success("Xóa thành công")
            })
        }

    }
    else {
        return this.notify.warn("Bạn chỉ có thể bỏ qua bước duyệt này , không thể xóa");
    }

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
        case 'SKIP':
            return this.l('Bỏ qua') ;
    }
}

  ngOnInit(): void {


  }

  onChangeGridStep(params){
    this.selectedStep = params.api.getSelectedRows();
    this.selectedId = [];
    this.selectedStep.forEach(e => {
        this.selectedId.push(e.id)
    })
  }

  callBackGridPoDetailAprrove(params: GridParams) {
    this.gridParamsPrDetailAprrove = params;
    params.api.setRowData(this.listDetailApprove);
  }

  getApprovalInfos(id: number, type: string,getUser? : boolean) {
    this.spinnerService.show();
    this._serviceProxy.getAllApprovalInfo(id,type)
      .pipe(finalize(() => {
        this.spinnerService.hide();
        // if (this.listDetailApprove.some(e => e.approvalStatus == 'WAITTING' || e.approvalStatus == 'APPROVED'))
        // {
        //     this.notify.warn("Đã gửi Request")
        // }
        // else {
            if (getUser){
                this.userList = [];
                this.spinnerService.show()
                this._paymentHeadersServiceProxy.getTMVUserList()
                .pipe(finalize(()=>{
                        this.spinnerService.hide()
                        this.modal.show();
                        //this.modal.show();
                    // this.spinnerService.hide()
                    // this.isApprove = params;
                    // this.hasUserCbb = hasUserCbb
                    // this.note = note ?? "";
                    // this.modal.show();
                }))
                .subscribe(
                    res => {
                        res.forEach(e =>{
                            let titleCode = (e.titleCode != "") ?  (' - ' + e.titleCode) : "";
                            let deptName = (e.deptName != "") ?  (' - ' + e.deptName) : "";
                            // let userName = (e.userName != "") ?  (e.userName) : "";
                            // let userName = (e.userName != "") ?  (e.userName) : "";
                            this.userList.push({ value: e.id, employeeCode: e.employeeCode, label: e.name + titleCode + deptName  +'(' + e.userName + ' - ' + e.emailAddress + ')' ,hrOrgStructureId: e.hrOrgStructureId,parentId: e.parentId})
                        });
                    });
            // }


        }

      }))
      .subscribe(res => {
        this.listDetailApprove = res;
        this.gridParamsPrDetailAprrove.api.setRowData(res);
        // this.gridParamsPrDetailAprrove.api.sizeColumnsToFit();
      });
  }

  reqId = 0 ;
  type = "";
  userList = [];
  reqIds = [];

  showModal(id: number, type: string, reqIds?: any[]) {
    this.reqId = id;
    this.type = type;
    this.reqIds = reqIds ?? [];
    this.getApprovalInfos(id, type,true);

  }

  closeModal() {
    this.modal.hide();
    this.close.emit();
  }

  listUpper = [];
  getUpperUser(num: number){
    let current = this.userList.find(e => e.value == num);
    if (current && (current.parentId != null && current.parentId != "")){
        let nextUser = this.userList.find(e => e.hrOrgStructureId == current.parentId);
        if (nextUser){
            this.listUpper.push(nextUser);
            this.getUpperUser(nextUser.value);
        }
    }
  }

  skipUser(params){
    if (!params?.data) return this.notify.warn("Vui lòng chọn dòng để bỏ qua")
    if (params?.data.approvalStatus == "SKIP") return this.notify.warn("Đã bỏ qua bước duyệt này")

            this.listUpper = [];
            this.getUpperUser(params.data.approvalUserId);
            let nextPendingStep =  this.listDetailApprove.find(e => e.approvalSeq > params.data.approvalSeq && e.approvalStatus == 'PENDING');

            if (nextPendingStep && params.data.approvalTypeId != nextPendingStep.approvalTypeId){
                this.addUser.userList = this.listUpper;
                this.addUser.show(params.data.id)
            }
            else if (!nextPendingStep ){
                this.addUser.userList = this.listUpper;
                if (this.listUpper.length > 0) this.addUser.show(params.data.id)
                else this.notify.warn("Không thể bỏ qua bước duyệt này vui lòng thêm bước duyệt khác")
            }
            else {
                this.addUser.userList = [];
                this.addUser.show(params.data.id)
            }

            // if (this.listUpper.length > 0 && nextPendingStep && !this.listUpper.find(e => e.value == nextPendingStep.approvalUserId)){

            // }
            // else {


            // }
  }



  reset() {

  }

  confirmSent(){

    this.message.confirm(this.l('AreYouSure'), this.l('SendRequestApprove'), (isConfirmed) => {
        if (isConfirmed) {
          if(this.reqIds.length == 0){
            this.spinnerService.show();
            let body = Object.assign(new RequestNextApprovalTreeInputDto(), {
              reqId: this.reqId,
              processTypeCode: this.type
            })

            this._approvalProxy.confirmRequestForSending(body)
              .pipe(finalize(() => {
                this.spinnerService.hide();
                this.modal.hide();
                this.getData.emit(null)
                // this.searchPurchaseRequest();
              }))
              .subscribe(res => this.notify.success(this.l('SendRequest') + " " + this.l('Successfully')))
          }
          else {
            this.spinnerService.show();
            let body = Object.assign(new RequestNextApprovalTreeInputDto(), {
              reqId: this.reqId,
              processTypeCode: this.type
            })

            this._approvalProxy.sentRequestForMultipleHeader(this.type,this.reqIds)
              .pipe(finalize(() => {
                this.spinnerService.hide();
                this.modal.hide();
                this.getData.emit(null)
                // this.searchPurchaseRequest();
              }))
              .subscribe(res => this.notify.success(this.l('SendRequest') + " " + this.l('Successfully')))
          }
        }
      })
    // this.confirm.emit(null)
  }

  addStep(params){
    this.addUser.userList = this.userList
    this.addUser.show(params.data.id);
    // if (this.selectedStep.length == 0) this.notify.warn("Vui lòng chọn dòng để bỏ qua")
  }

  skipOrForwardSkip(params){
    if (params.userId && params.userId != -1 && params.userId != 0) this.confirmAddStep(params);
    else this.skipStep(params);
  }

  confirmAddStep(params){
    this.spinnerService.show();
    this._approvalProxy.skipAndForwardForMultipleHeader(
        this.selectedStep[0].approvalSeq,
        params.userId ?? 0,
        params.note ?? "",
        this.type,
        this.reqIds,
    )
    .pipe(finalize(()=>{
        this.spinnerService.hide();
        this.getApprovalInfos(this.reqId, this.type);
    }))
    .subscribe(res => {
        this.notify.success(this.l('Bỏ qua') + " " + this.l('Successfully'));
    })
  }

  skipStep(params){
    this.spinnerService.show();
    let input = [];
    input.push(params.stepId ?? 0)
    if(this.reqIds.length == 0){
        this._approvalProxy.skipSelectedSteps(
            params.note,input)
        .pipe(finalize(()=>{
            this.spinnerService.hide();
            this.getApprovalInfos(this.reqId, this.type);
        }))
        .subscribe(res =>{
            this.notify.success('Skip successfully');
        })
    }
    else {
        this._approvalProxy.skipStepForMultipleHeader(
            params.note,this.selectedStep[0].approvalSeq,this.type ,this.reqIds)
        .pipe(finalize(()=>{
            this.spinnerService.hide();
            this.getApprovalInfos(this.reqId, this.type);
        }))
        .subscribe(res =>{
            this.notify.success('Skip successfully');
        })
    }
  }

  addNewStepRow(params){
    if (this.reqIds.length == 0 ){
        this.spinnerService.show();
        this._approvalProxy.addNewStepToTree(params.userId,this.reqId,this.type,params.dayOfProcess)
        .pipe(finalize(()=>{
            this.spinnerService.hide();
            this.getApprovalInfos(this.reqId,this.type);
        }))
        .subscribe(res =>{
            this.notify.success("Thêm mới thành công");
        })
    }
    else {
        this.spinnerService.show();
        this._approvalProxy.addNewStepToTreeForMulltipleHeader(params.userId,this.type,params.dayOfProcess,this.reqIds)
        .pipe(finalize(()=>{
            this.spinnerService.hide();
            this.getApprovalInfos(this.reqId,this.type);
        }))
        .subscribe(res =>{
            this.notify.success("Thêm mới thành công");
        })
    }

  }



  dragStart(params){
    // console.log(params)
  }

//   dragMove(params){
//     // console.log(params)
//   }

  dragEnded(params){
    if(params?.node?.data?.approvalSeq != (params.overIndex + 1))
    {
        if (this.reqIds.length == 0 ){
            this.spinnerService.show();
            this._approvalProxy.saveChangeStepPosition(params?.node?.data?.id,params.overIndex + 1)
            .pipe(finalize(()=>{
                this.spinnerService.hide();
                this.getApprovalInfos(this.reqId,this.type);
            }))
            .subscribe(res =>{
                //this.notify.success("Thêm mới thành công");
            })
        }
        else {
            this.spinnerService.show();
            this._approvalProxy.saveChangeStepPositionForMulltipleHeader(params?.node?.data?.approvalSeq,params.overIndex + 1,this.type,this.reqIds)
            .pipe(finalize(()=>{
                this.spinnerService.hide();
                this.getApprovalInfos(this.reqId,this.type);
            }))
            .subscribe(res =>{
                //this.notify.success("Thêm mới thành công");
            })
        }

    }
  }



}
