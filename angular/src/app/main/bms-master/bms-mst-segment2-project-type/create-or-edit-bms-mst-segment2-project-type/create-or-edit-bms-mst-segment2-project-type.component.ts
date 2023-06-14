import { Component, ElementRef, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { BmsMstPeriodServiceProxy, BmsMstSegment1ServiceProxy, BmsMstSegment1TypeCostServiceProxy, BmsMstSegment2ProjectTypeServiceProxy, MstPeriodServiceProxy, MstPurchasePurposeServiceProxy, MstUnitOfMeasureServiceProxy } from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'create-or-edit-bms-mst-segment2-project-type',
    templateUrl: './create-or-edit-bms-mst-segment2-project-type.component.html',
    styleUrls: ['./create-or-edit-bms-mst-segment2-project-type.component.less']
})
export class CreateOrEditBmsMstSegment2ProjectTypeComponent extends AppComponentBase implements OnInit {
    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
    @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
    @Output() close = new EventEmitter<any>();
    createOrEditForm: FormGroup;
    isEdit = true;
    isSubmit = false;
    duplicateName;

    constructor(
        injector: Injector,
        private _bmsMstSegment2TypeCostServiceProxy : BmsMstSegment2ProjectTypeServiceProxy,
        private formBuilder: FormBuilder
    ) {
        super(injector);
    }

    ngOnInit(): void {
    }

    buildForm() {
        this.createOrEditForm = this.formBuilder.group({
            id: [0],
            projectTypeName : [undefined, GlobalValidator.required],
            description : [undefined],
        });
    }

    show(id?: number) {
        this.buildForm();
        this.duplicateName= false;
        if (id && id > 0) {
            this.spinnerService.show();
            this.isEdit = true;
            this._bmsMstSegment2TypeCostServiceProxy.loadById(id).subscribe(val => {
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
        this._bmsMstSegment2TypeCostServiceProxy.save(this.createOrEditForm.getRawValue())
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
          this.modal.hide();
        });
    }
}
