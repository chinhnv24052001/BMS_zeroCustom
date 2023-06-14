import { Component, ElementRef, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { BmsMstPeriodServiceProxy, MstPurchasePurposeServiceProxy, MstSupplierServiceProxy, MstUnitOfMeasureServiceProxy } from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'create-or-edit-bms-mst-period',
    templateUrl: './create-or-edit-bms-mst-period.component.html',
    styleUrls: ['./create-or-edit-bms-mst-period.component.less']
})
export class CreateOrEditBmsMstPeriodComponent extends AppComponentBase implements OnInit {
    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
    @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
    @Output() close = new EventEmitter<any>();
    @Output() setTableVersion = new EventEmitter<any>();
    createOrEditForm: FormGroup;
    isEdit = true;
    inputText2Value = "";
    inputText2 = "";
    isSubmit = false;
    uomCodeErr = false;
    listStatus: { value: string, label: string; }[] = [{value: 'InActive', label: this.l('InActive')}, {value: 'Active', label: this.l('ActiveModal')}];
    duplicateName;
    duplicateCode;

    constructor(
        injector: Injector,
        private _bmsMstPeriodServiceProxy: BmsMstPeriodServiceProxy,
        private formBuilder: FormBuilder
    ) {
        super(injector);
    }

    ngOnInit(): void {
    }

    buildForm() {
        this.createOrEditForm = this.formBuilder.group({
            id: [0],
            periodName : [undefined, GlobalValidator.required],
            periodYear : [undefined, GlobalValidator.required],
            fromDate : [undefined, GlobalValidator.required],
            todate : [undefined, GlobalValidator.required],
            isActive : [true],
            description : [undefined,],
        });
    }

    show(id?: number) {
        this.buildForm();
        this.duplicateName= false;
        if (id && id > 0) {
            this.spinnerService.show();
            this.isEdit = true;
            this._bmsMstPeriodServiceProxy.loadById(id).subscribe(val => {
              this.createOrEditForm.patchValue(val);
              this.spinnerService.hide();
            });
          }
          else{
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

        this.spinnerService.show();
        this._bmsMstPeriodServiceProxy.save(this.createOrEditForm.getRawValue())
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
          this.close.emit();
          this.setTableVersion.emit();
          this.modal.hide();
        });
    }
}
