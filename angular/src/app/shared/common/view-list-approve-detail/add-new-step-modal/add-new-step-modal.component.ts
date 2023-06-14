import { PaymentHeadersServiceProxy } from '@shared/service-proxies/service-proxies';
import { Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { ModalDirective } from "ngx-bootstrap/modal";
import { finalize } from 'rxjs/operators';

@Component({
  selector: "app-add-new-step-modal",
  templateUrl: "./add-new-step-modal.component.html",
  styleUrls: ["./add-new-step-modal.component.scss"]
})

export class AddNewStepModalComponent extends AppComponentBase implements OnInit{

    @ViewChild("ViewModal", { static: true }) modal: ModalDirective;
  @Output() modalSave = new EventEmitter<any>();
  constructor(injector: Injector,private _paymentHeadersServiceProxy: PaymentHeadersServiceProxy) {
    super(injector);
  }

  userId;
  @Input() userList = [];
  stepId = 0;
  note ="";
  dayOfProcess = 1;

  ngOnInit() {

  }

  show() {
    this.userId = 0;
    this.dayOfProcess = 1;
    // this.stepId = stepId;
    this.note = "";
    // this.spinnerService.show();
        this.modal.show();

    // this.userList = [];
    // this._paymentHeadersServiceProxy.getTMVUserList()
    // .pipe(finalize(()=>{
    //         this.spinnerService.hide()
    //         this.modal.show();
    //     // this.spinnerService.hide()
    //     // this.isApprove = params;
    //     // this.hasUserCbb = hasUserCbb
    //     // this.note = note ?? "";
    //     // this.modal.show();
    // }))
    // .subscribe(
    //     res => {
    //         res.forEach(e =>{
    //             let titleCode = (e.titleCode != "") ?  (' - ' + e.titleCode) : "";
    //             let deptName = (e.deptName != "") ?  (' - ' + e.deptName) : "";
    //             // let userName = (e.userName != "") ?  (e.userName) : "";
    //             // let userName = (e.userName != "") ?  (e.userName) : "";
    //             this.userList.push({ value: e.id, employeeCode: e.employeeCode, label: e.name + titleCode + deptName  +'(' + e.userName + ' - ' + e.emailAddress + ')' })
    //         });
    //     });

  }

  close(){
    this.modal.hide();
  }

  save(){
    if (this.userList.length > 0 && (!this.userId || this.userId == 0)) return this.notify.warn("Vui lòng chọn người kiểm duyệt")
    if (!this.dayOfProcess ) return this.notify.warn("Vui lòng nhập ngày xử lý")
    // if (!this.note ||  this.note == "") return this.notify.warn("Vui lòng ghi lại lý do chuyển tiếp hoặc lý do bỏ qua bước duyệt")
    let body = {
        userId: this.userId,
        stepId: this.stepId,
        note: this.note,
        dayOfProcess: this.dayOfProcess,
    }
    this.modalSave.emit(body);
    this.modal.hide();
  }

  reset(){

  }
}
