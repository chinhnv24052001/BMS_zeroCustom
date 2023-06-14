import { DateTime } from 'luxon';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Component, EventEmitter, Injector, OnInit, Output, ViewChild } from "@angular/core";
import { ModalDirective } from 'ngx-bootstrap/modal';
import { MstSupplierRequestServiceProxy, SupplierRequestInfoDto, RequestApprovalTreeServiceProxy, CreateRequestApprovalInputDto } from '@shared/service-proxies/service-proxies';
import { HttpParams, HttpClient } from '@angular/common/http';
import { Location, LocationStrategy } from '@angular/common';
import * as moment from 'moment';

@Component({
  selector: "app-create-request-modal",
  templateUrl: "./create-request-modal.component.html",
  styleUrls: ["./create-request-modal.component.scss"]
})

export class CreateRequestModalComponent extends AppComponentBase implements OnInit {

    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;

    @Output() modalSave = new EventEmitter<any>();
    constructor(private location: Location ,private locationStrategy : LocationStrategy ,injector: Injector,private _serviceProxy :MstSupplierRequestServiceProxy,
        private http :HttpClient,private _treeApproval : RequestApprovalTreeServiceProxy) {
    super(injector)
  }


  selectedRequest : SupplierRequestInfoDto = new SupplierRequestInfoDto();

  ngOnInit() {

  }

  reset(){
    this.selectedRequest.requestExpiredDate = undefined;
  }

  oldMail = "";

  show(params? : any){
    this.selectedRequest = params ?? new SupplierRequestInfoDto();
    if(!this.selectedRequest.id ||  this.selectedRequest.id == 0){
        this.selectedRequest.approvalStatus = "NEW";
        this.selectedRequest.requestExpiredDate = DateTime.local();
    }
    else {
        this.selectedRequest.requestExpiredDate = params.requestExpiredDate;
    }
    this.oldMail  = this.selectedRequest.requestEmail;
    this.modal.show();
  }

  close() {
    this.modal.hide();
    // this.selectedRequest.requestBaseUrl = location.origin + '/app/main/add-supplier' + '?uniqueRequest=' + encodeURI("lmao")
    // window.open(this.selectedRequest.requestBaseUrl , '_blank');
  }

  save() {
    if (this.checkValidateInputHasError("app-create-request-modal")) return;
    // console.log(moment(this.selectedRequest.requestExpiredDate).toDate())
    if (moment(this.selectedRequest.requestExpiredDate).startOf('day') <= moment().startOf('day')) return this.notify.warn("Ngày hết hạn phải lớn hơn ngày hiện tại")
    this.spinnerService.show()
    this.selectedRequest.isUpdateRequestOnly = true;
    if (this.selectedRequest?.requestEmail?.trim() != this.oldMail?.trim()) this.selectedRequest.requestBaseUrl = location.origin + '/add-supplier' + '?uniqueRequest=';
    // if (this.selectedRequest?.requestEmail?.trim() != this.oldMail?.trim()) this.selectedRequest.requestBaseUrl = location.origin ;
    this._serviceProxy.createOrEditSupplierRequest(this.selectedRequest)
    .pipe(finalize(()=>{

        this.spinnerService.hide();
        this.modalSave.emit(null);
        this.close();
    }))
    .subscribe(res => {
        if(!this.selectedRequest.id ||  this.selectedRequest.id == 0) {
            let input = new  CreateRequestApprovalInputDto();
            input.processTypeCode = "SR";
            input.reqId = res;
            this._treeApproval.createRequestApprovalTree(input).subscribe(r => {

            })
        }
        this.notify.success(this.l('SaveSuccessfully'));
    })
  }
}
