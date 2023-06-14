import { AppComponentBase } from '@shared/common/app-component-base';
import { Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from "@angular/core";
import { LocationStrategy } from '@angular/common';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { PaymentHeadersServiceProxy, RequestApprovalTreeServiceProxy, UrUserRequestManagementServiceProxy } from '@shared/service-proxies/service-proxies';

@Component({
  selector: "app-note-modal",
  templateUrl: "./note-modal.component.html",
  styleUrls: ["./note-modal.component.less"]
})

export class NoteModalComponent extends AppComponentBase {

    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;

    @Input() hasStep = true;

    forward = false;

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
    this.forward = false;

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

  show(params : any,hasUserCbb: any,id?: any , code?: any, note? : any){

    this.processTypeCode = code ?? "";

    // this.hasUserCbb = hasUserCbb
    // this.note = note ?? "";
    // this.modal.show()

    if (hasUserCbb){
        this.spinnerService.show();
        this.userList = [];
    this._paymentHeadersServiceProxy.getTMVUserList()
    .pipe(finalize(()=>{
        this.request.getNextApprovalId(id,code)
        .pipe(finalize(()=>{
            this.spinnerService.show();
            this._userRequest.getAllApprovalInfo(id, code)
                .pipe(finalize(() => this.spinnerService.hide()))
                .subscribe(res => {
                    this.stepList = res;
                    let input = [];
                    res.forEach(e => {
                        input.push(e.approvalUserName + '('+ e.dayOfProcess +')');
                    })
                    this.stringStep = input.join("->");
                    // console.log(this.stepList)
                } );
            this.spinnerService.hide()
            this.isApprove = params;
            this.hasUserCbb = hasUserCbb
            this.note = note ?? "";
            //if (!hasUserCbb && this.userId != 0 && this.userId) this.notify.warn("Người dùng này không thể duyệt cuối");
            // else {
                this.modal.show();
            // }
        }))
        .subscribe(res => {
            this.userId = res;
            this.nextUserId = res;
            this.nextApprovalName = this.userList.find(e => e.value == res)?.label;
        })
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
                this.userList.push({ value: e.id, employeeCode: e.employeeCode, label: e.name + titleCode + deptName  +'(' + e.userName + ' - ' + e.emailAddress + ')' })
            });
        });
    }
    else {
        this.isApprove = params;
        this.hasUserCbb = hasUserCbb
        this.note = note ?? "";
        this.modal.show()
    }

  }

  close() {
    this.modal.hide();
    // this.selectedRequest.requestBaseUrl = location.origin + '/app/main/add-supplier' + '?uniqueRequest=' + encodeURI("lmao")
    // window.open(this.selectedRequest.requestBaseUrl , '_blank');
  }

  save() {
    let data = {
        note : this.note,
        userId: this.userId,
        isApprove : this.isApprove
    }
    //if(this.hasUserCbb && (this.processTypeCode == "UR" || this.processTypeCode == "PR") && (!this.userId || this.userId == 0)) return this.notify.warn("Cần assign chứng từ cho buyer");
    if(this.userId && this.userId != 0) this.approveAndForward.emit(data)
    else this.approveLast.emit(data)
    this.modal.hide();
  }
}
