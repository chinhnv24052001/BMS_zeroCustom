import { AppComponentBase } from '@shared/common/app-component-base';
import { Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from "@angular/core";
import { MstCatalogServiceProxy, SearchCatalogOutputDto, MstInventoryGroupServiceProxy } from '@shared/service-proxies/service-proxies';
import { HttpClient } from '@microsoft/signalr';
import { finalize } from 'rxjs/operators';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: "app-create-or-edit-catalog-modal",
  templateUrl: "./create-or-edit-catalog-modal.component.html",
  styleUrls: ["./create-or-edit-catalog-modal.component.scss"]
})

export class CreateOrEditCatalogModalComponent extends AppComponentBase implements OnInit {

    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;

    @Input() inventoryGroupList : any[] = [];

    @Output() modalSave = new EventEmitter<any>();
    constructor(injector: Injector,private _serviceProxy :MstCatalogServiceProxy , private inventoryGroup: MstInventoryGroupServiceProxy ) {
    super(injector)
  }


  selectedData : SearchCatalogOutputDto = new SearchCatalogOutputDto();

  ngOnInit() {

  }

  reset(){

  }

  oldMail = "";

  show(params? : any){

    this.selectedData = params ?? new SearchCatalogOutputDto();
    if (!this.selectedData.id || this.selectedData.id == 0 ) this.selectedData.isActive = true;


    this.inventoryGroupList = [];
    this.spinnerService.show();
    this.inventoryGroup.getAllInventoryGroup()
    .pipe(finalize(()=>{
        this.modal.show();
        this.spinnerService.hide();
    }))
    .subscribe(res => {
        res.forEach(e => {
            this.inventoryGroupList.push({
                label: e.productGroupName,
                value : e.id
            })
        })
    })

    // console.log(this.selectedData)
    // this.oldMail  = this.selectedRequest.requestEmail;
    // this.modal.show();
  }

  close() {
    this.selectedData = new SearchCatalogOutputDto();
    this.modal.hide();
    // this.selectedRequest.requestBaseUrl = location.origin + '/app/main/add-supplier' + '?uniqueRequest=' + encodeURI("lmao")
    // window.open(this.selectedRequest.requestBaseUrl , '_blank');
  }

  save() {
    if (this.checkValidateInputHasError("app-create-or-edit-catalog-modal")) return;
    if (!this.selectedData.inventoryGroupId ||this.selectedData.inventoryGroupId == 0 ) return this.notify.warn("Inventory Group is required");

    this.spinnerService.show();
    this._serviceProxy.createOrEdit(this.selectedData)
    .pipe(finalize(()=>{
        this.spinnerService.hide();
    }))
    .subscribe(res => {
        this.modalSave.emit(null);
        this.close()
        this.notify.success("Lưu thông tin thành công");
    })
  }

}
