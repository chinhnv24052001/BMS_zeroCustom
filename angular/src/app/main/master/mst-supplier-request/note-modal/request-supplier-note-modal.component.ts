import { AppComponentBase } from '@shared/common/app-component-base';
import { Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from "@angular/core";
import { LocationStrategy } from '@angular/common';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { PaymentHeadersServiceProxy, RequestApprovalTreeServiceProxy, UrUserRequestManagementServiceProxy } from '@shared/service-proxies/service-proxies';

@Component({
  selector: "app-request-supplier-note-modal",
  templateUrl: "./request-supplier-note-modal.component.html",
  styleUrls: ["./request-supplier-note-modal.component.less"]
})

export class RequestSupplierNoteModalComponent extends AppComponentBase {

    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;

    @Input() hasStep = true;

    forward = false;

    @Output() modalSave = new EventEmitter<any>();
    @Output() approveAndForward = new EventEmitter<any>();
    @Output() approveLast = new EventEmitter<any>();
    constructor( injector: Injector,private _paymentHeadersServiceProxy: PaymentHeadersServiceProxy,private request: RequestApprovalTreeServiceProxy,private _userRequest: UrUserRequestManagementServiceProxy,) {
        super(injector)
    }

  note = "";
  nextApprovalName =""

  userId = 0;

  ngOnInit() {

  }

  reset(){

  }

  stepList = [];

  isApprove = false;
  oldMail = "";
  hasUserCbb = true;
  userList = [];
  nextUserId = 0;
  stringStep = ""

  processTypeCode = "";

  changeNextApproveUser(params){
    this.nextApprovalName = this.userList.find(e => e.value == params)?.label;
  }

  checkForward(params){
    if (!params) {
        //reset về người tiếp mặc định
        this.userId = this.nextUserId
        this.nextApprovalName = this.userList.find(e => e.value == this.nextUserId)?.label;
    }
  }

  show(){
    this.note = "";
    this.modal.show()
  }

  close() {
    this.modal.hide();
    // this.selectedRequest.requestBaseUrl = location.origin + '/app/main/add-supplier' + '?uniqueRequest=' + encodeURI("lmao")
    // window.open(this.selectedRequest.requestBaseUrl , '_blank');
  }

  save() {
    let data = {
        note : this.note,
    }
    this.modalSave.emit(data)
    this.modal.hide();
  }
}
