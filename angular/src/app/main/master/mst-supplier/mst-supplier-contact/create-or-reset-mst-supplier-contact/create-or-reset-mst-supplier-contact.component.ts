import { Component, ElementRef, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { MstSupplierServiceProxy } from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'create-or-reset-mst-supplier-contact',
    templateUrl: './create-or-reset-mst-supplier-contact.component.html',
    styleUrls: ['./create-or-reset-mst-supplier-contact.component.less']
})
export class CreateOrResetMstSupplierContactComponent extends AppComponentBase implements OnInit {
    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
    @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
    @Output() close = new EventEmitter<any>();
    createOrEditForm: FormGroup;
    isEdit = true;
    statusId = 0;
    isSubmit = false;
    supplierSiteId: number = 0;
    supplierName: string = '';
    siteAddress: string = '';
    supplierNumber: string = '';
    equalRePassword: boolean = false;
    dontEnterUserName= false;
    dontEnterPassword= false;
    supplierId: number =0;

    constructor(
        injector: Injector,
        private _mstSupplierServiceProxy: MstSupplierServiceProxy,
        private formBuilder: FormBuilder
    ) {
        super(injector);
    }

    ngOnInit(): void {
    }

    buildFormCreate() {
        this.createOrEditForm = this.formBuilder.group({
            id: [0],
            supplierName: [undefined],
            supplierSiteId: [undefined],
            siteAddress: [undefined],
            supplierNumber: [undefined], 
            supplierId: [undefined],
            firstName: [undefined, GlobalValidator.required],
            midName: [undefined, GlobalValidator.required],
            lastName: [undefined, GlobalValidator.required],
            emailAddress: [undefined, GlobalValidator.required],
            userName: [undefined, GlobalValidator.maxLengthUserName],
            password: [undefined, GlobalValidator.requiredPassword],
            rePassword: [undefined],
            phone: [undefined, GlobalValidator.phoneFormat],
        });
    }

    buildFormEditInfo() {
        this.createOrEditForm = this.formBuilder.group({
            id: [0],
            supplierName: [undefined],
            supplierSiteId: [undefined],
            siteAddress: [undefined],
            supplierNumber: [undefined],
            supplierId: [undefined],
            firstName: [undefined, GlobalValidator.required],
            midName: [undefined, GlobalValidator.required],
            lastName: [undefined, GlobalValidator.required],
            emailAddress: [undefined, GlobalValidator.required],
            userName: [undefined],
            password: [undefined],
            phone: [undefined, GlobalValidator.phoneFormat],
        });
    }

    buildFormReset() {
        this.createOrEditForm = this.formBuilder.group({
            id: [0],
            supplierName: [undefined],
            supplierSiteId: [undefined],
            siteAddress: [undefined],
            supplierNumber: [undefined],
            supplierId: [undefined],
            fullName: [undefined],
            emailAddress: [undefined,],
            userName: [undefined],
            password: [undefined, GlobalValidator.requiredPassword],
            rePassword: [undefined, GlobalValidator.required],
            phone: [undefined],
        });
    }

    buildFormCreateAccount() {
        this.createOrEditForm = this.formBuilder.group({
            id: [0],
            supplierName: [undefined],
            supplierSiteId: [undefined],
            siteAddress: [undefined],
            supplierNumber: [undefined],
            supplierId: [undefined],
            fullName: [undefined],
            emailAddress: [undefined,],
            userName: [undefined, GlobalValidator.required, GlobalValidator.maxLengthUserName],
            password: [GlobalValidator.required, GlobalValidator.requiredPassword],
            rePassword: [undefined, GlobalValidator.required],
            phone: [undefined],
        });
    }

    // buildFormEditInfo() {
    //     this.createOrEditForm = this.formBuilder.group({
    //         id: [0],
    //         supplierName : [undefined],
    //         supplierSiteId : [undefined],
    //         siteAddress : [undefined],
    //         firstName : [undefined, GlobalValidator.required],
    //         midName : [undefined, GlobalValidator.required],
    //         lastName : [undefined, GlobalValidator.required],
    //         userName : [undefined],
    //         password : [undefined],
    //         rePassword : [undefined, GlobalValidator.required],
    //         phone : [undefined],
    //     });
    // }

    // buildFormCreateAccount() {
    //     this.createOrEditForm = this.formBuilder.group({
    //         id: [0],
    //         supplierName : [undefined],
    //         supplierSiteId : [undefined],
    //         siteAddress : [undefined],
    //         fullName : [undefined],
    //         userName : [undefined, GlobalValidator.required],
    //         password : [undefined, GlobalValidator.requiredPassword],
    //         rePassword : [undefined, GlobalValidator.required],
    //         phone : [undefined],
    //     });
    // }

    show(id?: number, supplierName?, _supplierNumber?, supplierSiteId?, _siteAddress?, statusId?, supplierId?) {
        this.dontEnterUserName= false;
        this.dontEnterPassword= false;
        this.supplierSiteId = supplierSiteId;
        this.supplierName = supplierName;
        this.siteAddress = _siteAddress;
        this.supplierNumber = _supplierNumber;
        this.supplierId = supplierId;

        if (id && id > 0) {
            switch (statusId) {
                case 1:
                    // EditInfomation
                    this.buildFormEditInfo();
                    break;
                case 2:
                    // CreateAccount
                    this.buildFormCreateAccount();
                    break;
                case 3:
                    // ResetPassword
                    this.buildFormReset();
                    break;
            }
            this.spinnerService.show();
            this.isEdit = true;
            this.statusId = statusId;
            this._mstSupplierServiceProxy.loadById(id)
                .pipe(finalize(() => {
                    this.spinnerService.hide();
                }))
                .subscribe(val => {
                    val.supplierSiteId = supplierSiteId;
                    val.supplierName = supplierName;
                    val.siteAddress = _siteAddress;
                    val.supplierNumber = _supplierNumber;
                    if (statusId == 2) {
                        if (val.userName != null && val != undefined) {
                            this.notify.warn(this.l(AppConsts.CPS_KEYS.Account_Already_Xists));
                            this.modal.hide();
                            return false;
                        }
                    }
                    if (statusId == 3) {
                        val.password = '';
                        if (val.userName == null || val == undefined) {
                            this.notify.warn(this.l(AppConsts.CPS_KEYS.Account_Does_Not_Exist));
                            this.modal.hide();
                            return false;
                        }
                    }
                    this.createOrEditForm.patchValue(val);
                this.modal.show();
                });
        }
        else {
            this.statusId = statusId;
            this.buildFormCreate();
            this.isEdit = false;
            this.createOrEditForm.get('supplierName').setValue(this.supplierName);
            this.createOrEditForm.get('supplierSiteId').setValue(this.supplierSiteId);
            this.createOrEditForm.get('siteAddress').setValue(this.siteAddress);
            this.createOrEditForm.get('supplierNumber').setValue(this.supplierNumber); 
            this.createOrEditForm.get('supplierId').setValue(this.supplierId); 
            this.modal.show();
        }
       
    }

    closeModel() {
        this.modal.hide();
    }

    reset() {
        // if(!this.isEdit)
        // {
        //     this.createOrEditForm.get('id').setValue(0);
        //     this.createOrEditForm.get('firstName').setValue(undefined);
        //     this.createOrEditForm.get('midName').setValue(undefined);
        //     this.createOrEditForm.get('lastName').setValue(undefined);
        //     this.createOrEditForm.get('userName').setValue(undefined);
        //     this.createOrEditForm.get('password').setValue(undefined);
        //     this.createOrEditForm.get('rePassword').setValue(undefined);
        //     this.createOrEditForm.get('phone').setValue(undefined);
        // }
        this.createOrEditForm = undefined;
    }


    save() {
        this.isSubmit = true;
        if (this.submitBtn) {
            this.submitBtn.nativeElement.click();
        }
        if (this.createOrEditForm.invalid) {
            return;
        }

        if (this.checkValidateInputHasError("create-or-reset-mst-supplier-contact")) return;

        if (this.statusId != 1)
        {
            if (this.createOrEditForm.get('password').value == this.createOrEditForm.get('rePassword').value) {
                this.equalRePassword = false;
            }
            else {
                this.equalRePassword = true;
                return;
            }
        }
        //Check truong hop nhap userName nhung khong nhap mat khau
        if(this.createOrEditForm.get('password').value == undefined  && this.createOrEditForm.get('userName').value != undefined)
        {
           this.dontEnterPassword = true;
           return;
        }
        else
        {
            this.dontEnterPassword = false;
        }
        //Check truong hop nhap mat khau nhung khong nhap user name
        if(this.createOrEditForm.get('password').value != undefined 
         && (this.createOrEditForm.get('userName').value == undefined || this.createOrEditForm.get('userName').value == '' ))
        {
           this.dontEnterUserName = true;
           return;
        }
        else
        {
            this.dontEnterUserName = false;
        }

        this.spinnerService.show();
        this._mstSupplierServiceProxy.save(this.createOrEditForm.getRawValue())
            .pipe(finalize(() => this.spinnerService.hide()))
            .subscribe(val => {

                switch (this.statusId) {
                    case 0:
                        // Crate
                        this.notify.success(this.l(AppConsts.CPS_KEYS.Saved_Successfully));
                        break;
                    case 1:
                        // EditInfomation
                        this.notify.success(this.l(AppConsts.CPS_KEYS.Edit_Info_Successfully));
                        break;
                    case 2:
                        // CreateAccount
                        this.notify.success(this.l(AppConsts.CPS_KEYS.Create_Account_Successfully));
                        break;
                    case 3:
                        // ResetPassword
                        this.notify.success(this.l(AppConsts.CPS_KEYS.ResetPassWord_Successfully));
                        break;
                }
                this.modal.hide();
                this.close.emit(this.supplierSiteId);

            });
    }
}
