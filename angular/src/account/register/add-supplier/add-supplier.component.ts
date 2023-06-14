import { MstProvinceServiceProxy, MstDistrictServiceProxy, MstCurrencyServiceProxy } from '../../../shared/service-proxies/service-proxies';
import { finalize } from 'rxjs/operators';
import { Component, Injector, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AppComponentBase } from "@shared/common/app-component-base";
import { MstNationServiceProxy, MstSupplierRequestServiceProxy, SupplierRequestInfoDto } from "@shared/service-proxies/service-proxies";
import * as moment from "moment";
import { forkJoin } from 'rxjs';
import { ImportAttachFileComponent } from '@app/shared/common/import-attach-file/import-attach-file.component';

@Component({
  selector: "app-add-supplier",
  templateUrl: "./add-supplier.component.html",
  styleUrls: ["./add-supplier.component.scss"]
})

export class AddSupplierComponent extends AppComponentBase implements OnInit {
    @ViewChild("attach") attach: ImportAttachFileComponent;
    expired = false;
    now = moment();
    guId = "";
  constructor(injector:Injector,private activatedRoute: ActivatedRoute,private api : MstSupplierRequestServiceProxy
    ,private national : MstNationServiceProxy,private province : MstProvinceServiceProxy,private district :MstDistrictServiceProxy, private _curency: MstCurrencyServiceProxy) {
    super(injector)
    this.activatedRoute.queryParams
    .pipe(finalize(()=>{

    }))
    .subscribe(params => {
        this.guId = params['uniqueRequest'];

       // console.log(this.guId); // Print the parameter to the console.
   });

  }

  currencyList = [];
  selectedRequest: SupplierRequestInfoDto = new SupplierRequestInfoDto();

  nationList = [];
  provinceList = [];
  districtList = [];

  provinceSelectList = [];
  districtSelectList = [];

  isValidGUID(value) {
    if (value.length > 0) {
        if (!(/^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/).test(value)) {
            return false;
        }
    }

    return true;
}

  ngOnInit() {
    // if(this.isValidGUID(this.guId)){
    //     this.expired = true;
    //     return;
    // }
    // // window.addEventListener('locationchange', function () {
    // //     console.log('location changed!');
    // // });

   this.api.getSupplierByGuId(this.guId)
        .pipe(finalize(()=>{
            // if (moment(this.data.requestExpiredDate).isBefore(moment(this.now))) this.expired = true;
            // else this.expired = false;
            // console.log(this.expired)
            this.attach.setData(this.selectedRequest?.id,"SUPPLYREQUEST");
            // this.getCache();

            this._curency.loadAll(false)
            .pipe(finalize(() => {
                // this.searchData();
                this.selectedRequest.currencyId = this.currencyList.find(e => e.label == 'VND')?.value;
            }))
            .subscribe(res => {
                res.forEach(
                    e => {
                        this.currencyList.push({
                            label: e.currencyCode,
                            value: e.id,
                        })
                    }
                )


            })
        }))
        .subscribe(res =>{
            this.selectedRequest = res;
            if (!res) this.expired = true;
            this.expired = this.selectedRequest.isExpired;
            // console.log(this.data)
        },()=>{
            this.expired = true;
        })


  }

//   getCache(){
//     const nation = this.national.getAllNation();
//     const province = this.province.getByNationId();
//     const district = this.district.getByProvinceId();

//     this.nationList = [];
//   this.provinceList = [];
//   this.districtList = [];

//   this.provinceSelectList = [];
//   this.districtSelectList = [];

//     forkJoin([nation, province,district])
//     .pipe(finalize(()=>{
//         this.provinceList = this.provinceSelectList.filter(e => e.nationId == this.selectedRequest.nationId);
//         this.districtList = this.districtSelectList.filter(e => e.provinceId == this.selectedRequest.provinceId);
//     }))
//     .subscribe(res => {
//         res[0].forEach(e => {
//             this.nationList.push({
//                 label: e.nationName,
//                 value: e.id,
//             })
//         })

//         res[1].forEach(e => {
//             this.provinceSelectList.push({
//                 label: e.provinceName,
//                 value: e.id,
//                 nationId : e.nationId
//             })
//         })


//         res[2].forEach(e => {
//             this.districtSelectList.push({
//                 label: e.districtName,
//                 value: e.id,
//                 provinceId : e.provinceId
//             })
//         })



//     })
//   }


  saveInformation(){
    if (this.checkValidateInputHasError("app-add-supplier")) return;
    this.spinnerService.show()
    //this.selectedRequest.requestBaseUrl = location.origin + '/app/main/add-supplier' + '?uniqueRequest=';
    this.selectedRequest.isUpdateRequestOnly = false;
    this.api.createOrEditSupplierRequest(this.selectedRequest)
    .pipe(finalize(()=>{
        this.spinnerService.hide();
        // setTimeout(()=>{
        //     this.attach.setData(this.selectedRequest?.id,"SUPPLYREQUEST");
        // },100)
        // this.attach.setData(this.selectedRequest?.id,"SUPPLYREQUEST");
    }))
    .subscribe(res => {

        this.attach.saveAttachFile(res)

        this.notify.success(this.l('SaveSuccessfully'));
    })
  }

  setProvinceList(param){
    this.provinceList = this.provinceSelectList.filter(e => e.nationId == param);
    this.districtList = [];
    this.selectedRequest.provinceId = undefined;
    this.selectedRequest.districtId = undefined;
  }

  setDistrictList(param){
    this.districtList = this.districtSelectList.filter(e => e.provinceId == param);
    this.selectedRequest.districtId = undefined;
  }
}
