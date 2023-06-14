import { finalize } from 'rxjs/operators';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from "@angular/core";
import { ModalDirective } from 'ngx-bootstrap/modal';
import { HttpClient } from '@angular/common/http';
import { MstGlExchangeRateServiceProxy, SearchOutputDto } from '@shared/service-proxies/service-proxies';

@Component({
  selector: "app-create-or-edit-currency-data-modal",
  templateUrl: "./create-or-edit-currency-data-modal.component.html",
  styleUrls: ["./create-or-edit-currency-data-modal.component.scss"]
})

export class CreateOrEditCurrencyDataModalComponent extends AppComponentBase  {

    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;

    @Input() currencyList : any[] = [];
    @Input() currencyDataList : any[] = [];

    @Output() modalSave = new EventEmitter<any>();
    constructor(injector: Injector,private http :HttpClient,private _serviceProxy :MstGlExchangeRateServiceProxy) {
    super(injector)
  }


  selectedData : SearchOutputDto = new SearchOutputDto();

  ngOnInit() {

  }

  reset(){

  }

  oldMail = "";

  show(params? : any){
    this.currencyDataList = [];
    this.currencyList.forEach(e => {
        this.currencyDataList.push({
            label : e.label,
            value : e.label,
            id : e.value
        })
    })
    this.selectedData = params ?? new SearchOutputDto();
    // console.log(this.selectedData)
    // this.oldMail  = this.selectedRequest.requestEmail;
    this.modal.show();
  }

  close() {
    this.selectedData = new SearchOutputDto();
    this.modal.hide();
    // this.selectedRequest.requestBaseUrl = location.origin + '/app/main/add-supplier' + '?uniqueRequest=' + encodeURI("lmao")
    // window.open(this.selectedRequest.requestBaseUrl , '_blank');
  }

  save() {
    if (this.checkValidateInputHasError("app-create-or-edit-currency-data-modal")) return;

    if (!this.selectedData.fromCurrency || !this.selectedData.toCurrency || this.selectedData.fromCurrency.trim() == "" || this.selectedData.toCurrency.trim() == "")
        return this.notify.warn("Vui lòng chọn ngoại tệ và đơn vị quy đổi");

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
