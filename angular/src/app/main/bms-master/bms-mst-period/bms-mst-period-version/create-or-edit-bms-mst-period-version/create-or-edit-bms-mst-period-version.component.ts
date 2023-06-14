import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { BmsPeriodVersionServiceProxy, MstPurchasePurposeServiceProxy, MstSupplierServiceProxy, MstUnitOfMeasureServiceProxy } from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'create-or-edit-bms-mst-period-version',
    templateUrl: './create-or-edit-bms-mst-period-version.component.html',
    styleUrls: ['./create-or-edit-bms-mst-period-version.component.less']
})
export class CreateOrEditBmsMstPeriodVersionComponent extends AppComponentBase implements OnInit {
    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
    @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
    @Output() close = new EventEmitter<any>();
    createOrEditForm: FormGroup;
    isEdit = true;
    inputText2Value = "";
    inputText2 = "";
    isSubmit = false;
    uomCodeErr = false;
    listStatus: { value: boolean, label: string; }[] = [{value: false, label: this.l('InActive')}, {value: true, label: this.l('ActiveModal')}];
    listVersion: { value:  number, label: string,  }[] = [];
    duplicateName;
    periodId: number = 0;
    valNumberInContry;
    @Input() periodName;
    valNotNumber;

    constructor(
        injector: Injector,
        private _bmsPeriodVersionServiceProxy: BmsPeriodVersionServiceProxy,
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
            periodId : [undefined, GlobalValidator.required],
            versionId : [undefined, GlobalValidator.required],
            isActive : [true], 
            periodName: [this.periodName],
            description : [undefined],
        });
    }

    show(id?: number, _periodId? : number) {
        this.selectDropVersion();
        this.buildForm();
        this.periodId = _periodId
        this.duplicateName= false;
        if (id && id > 0) {
            this.spinnerService.show();
            this.isEdit = true;
            this._bmsPeriodVersionServiceProxy.loadById(id).subscribe(val => {
              this.createOrEditForm.patchValue(val);
              this.spinnerService.hide();
            });
          }
          else{
            this.createOrEditForm.get('periodId').setValue(this.periodId);
            this.isEdit = false;
          }
          this.modal.show();
    }

    selectDropVersion() {
        this._bmsPeriodVersionServiceProxy.getAllMstVersionNoPage().subscribe((result) => {
            this.listVersion = [];
            this.listVersion.push({ value: 0, label: " " });
            result.forEach(ele => {
                this.listVersion.push({ value: ele.id, label: ele.versionName });
            });
        });
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
        
        this.spinnerService.show();
        this._bmsPeriodVersionServiceProxy.save(this.createOrEditForm.getRawValue())
        .pipe(finalize(() => {
            this.spinnerService.hide();
        }))
        .subscribe(val => {
            if(val.name == AppConsts.CPS_KEYS.DUPLICATE_NAME)
            {
                this.duplicateName = true;
                return;
            }
            else
            {
                this.duplicateName = false;
            }
          this.notify.success(this.l(AppConsts.CPS_KEYS.Saved_Successfully));
          this.close.emit(this.periodId);
          this.modal.hide();
        });
    }
}
