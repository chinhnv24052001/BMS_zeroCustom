import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { MstPurchasePurposeServiceProxy, MstSupplierServiceProxy, MstUnitOfMeasureServiceProxy } from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'create-or-edit-mst-supplier-site',
    templateUrl: './create-or-edit-mst-supplier-site.component.html',
    styleUrls: ['./create-or-edit-mst-supplier-site.component.less']
})
export class CreateOrEditMstSupplierSiteComponent extends AppComponentBase implements OnInit {
    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
    @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
    @Output() close = new EventEmitter<any>();
    createOrEditForm: FormGroup;
    isEdit = true;
    inputText2Value = "";
    inputText2 = "";
    isSubmit = false;
    uomCodeErr = false;
    listStatus: { value: string, label: string; }[] = [{value: 'InActive', label: this.l('InActive')}, {value: 'Active', label: this.l('ActiveModal')}];
    duplicateName;
    supplierId: number = 0;
    valNumberInContry;
    @Input() supplierName;
    valNotNumber;

    constructor(
        injector: Injector,
        private _mstSupplierServiceProxy: MstSupplierServiceProxy,
        private formBuilder: FormBuilder
    ) {
        super(injector);
         this.valNotNumber = /^(?=.*?[0-9])/g;
    }

    ngOnInit(): void {
    }

    buildForm() {
        this.createOrEditForm = this.formBuilder.group({
            id: [0],
            country : [undefined, GlobalValidator.required],
            supplierId : [undefined,],
            supplierName : [this.supplierName],
            addressLine1 : [undefined, GlobalValidator.required],
            legalBusinessName : [undefined, GlobalValidator.required], 
            isSiteDefault : [undefined],
            // status: ['Active'],
        });
    }

    show(id?: number, _supplierId? : number) {
        this.buildForm();
        this.supplierId = _supplierId
        this.valNumberInContry= false;
        // this.duplicateName= false;
        // this.uomCodeErr = false;
        if (id && id > 0) {
            this.spinnerService.show();
            this.isEdit = true;
            this._mstSupplierServiceProxy.loadSiteById(id).subscribe(val => {
              this.createOrEditForm.patchValue(val);
              this.spinnerService.hide();
            });
          }
          else{
            this.createOrEditForm.get('supplierId').setValue(this.supplierId);
            this.isEdit = false;
          }
          this.modal.show();
    }

    closeModel() {
        this.modal.hide();
    }

    reset() {
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
            if (this.createOrEditForm.get('country').value && this.valNotNumber.test(this.createOrEditForm.get('country').value)) {
                this.valNumberInContry = true;
                return;
            }
            else
            {
                this.valNumberInContry = false;
            }

        // if(this.createOrEditForm.get('uomCode').value.length >3 )
        // {
        //   this.uomCodeErr =true;
        //   return;
        // }
        // else
        // {
        //   this.uomCodeErr = false;
        // }
        
        this.spinnerService.show();
        this._mstSupplierServiceProxy.saveSite(this.createOrEditForm.getRawValue())
        .pipe(finalize(() => {
            this.spinnerService.hide();
        }))
        .subscribe(val => {
            // if(val.name == AppConsts.CPS_KEYS.DUPLICATE_NAME)
            // {
            //     this.duplicateName = true;
            //     return;
            // }
            // else
            // {
            //     this.duplicateName = false;
            // }

          this.notify.success(this.l(AppConsts.CPS_KEYS.Saved_Successfully));
          this.close.emit(this.supplierId);
          this.modal.hide();
        });
    }
}
