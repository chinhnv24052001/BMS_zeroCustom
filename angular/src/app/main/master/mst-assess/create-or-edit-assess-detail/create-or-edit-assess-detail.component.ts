import { LocationStrategy } from "@angular/common";
import { Component, EventEmitter, Injector, OnInit, Output, ViewChild } from "@angular/core";
import { HttpClient } from "@microsoft/signalr";
import { AppComponentBase } from "@shared/common/app-component-base";
import { AssessDetailInfoDto, MstAssessServiceProxy } from "@shared/service-proxies/service-proxies";
import { ModalDirective } from "ngx-bootstrap/modal";

@Component({
  selector: "app-create-or-edit-assess-detail",
  templateUrl: "./create-or-edit-assess-detail.component.html",
  styleUrls: ["./create-or-edit-assess-detail.component.scss"]
})

export class CreateOrEditAssessDetailComponent extends AppComponentBase implements OnInit {
    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;

    @Output() modalSave = new EventEmitter<any>();
    constructor(injector: Injector,private _serviceProxy : MstAssessServiceProxy) {
    super(injector)
  }


  selectedAssessDetail : AssessDetailInfoDto = new AssessDetailInfoDto();

  ngOnInit() {

  }

  reset(){
    this.selectedAssessDetail = new AssessDetailInfoDto();
  }

  oldMail = "";

  show(params? : any){
    this.selectedAssessDetail = params ?? new AssessDetailInfoDto();
    this.modal.show();
  }

  close() {
    this.modal.hide();
    // this.selectedAssessDetail.requestBaseUrl = location.origin + '/app/main/add-supplier' + '?uniqueRequest=' + encodeURI("lmao")
    // window.open(this.selectedAssessDetail.requestBaseUrl , '_blank');
  }

  save() {
    if (this.checkValidateInputHasError("app-create-or-edit-assess-detail")) return;
    this.modalSave.emit(this.selectedAssessDetail);
    this.modal.hide()
  }
}
