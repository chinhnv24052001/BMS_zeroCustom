import { Component, ElementRef, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CommonGeneralCacheServiceProxy, MstCancelReasonServiceProxy, MstContractTemplateServiceProxy } from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'create-or-edit-cancel-reason',
    templateUrl: './create-or-edit-cancel-reason.component.html',
    styleUrls: ['./create-or-edit-cancel-reason.component.less']
})
export class CreateOrEditCancelReasonComponent extends AppComponentBase implements OnInit {


    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
    @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
    @Output() close = new EventEmitter<any>();

    createOrEditForm: FormGroup;
    isEdit = false;
    isSubmit = false;
    duplicateCode;
    listTypes: { label: string, value: string; }[] = [];

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private _cacheProxy: CommonGeneralCacheServiceProxy,
        private mstCancelReasonServiceProxy: MstCancelReasonServiceProxy
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.getAllProcessTypes();
    }

    buildForm() {
        this.createOrEditForm = this.formBuilder.group({
            id: [0],
            code: [undefined, GlobalValidator.required],
            name: [undefined, GlobalValidator.required],
            type: [undefined, GlobalValidator.required],
            description: [undefined],
        });
    }

    show(id?: number) {
        this.buildForm();
        if (id && id > 0) {
            this.spinnerService.show();
            this.isEdit = true;
            this.mstCancelReasonServiceProxy.loadById(id).subscribe(val => {
                this.createOrEditForm.patchValue(val);
                this.spinnerService.hide();
            });
        }
        this.modal.show();
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
        this.mstCancelReasonServiceProxy.save(this.createOrEditForm.getRawValue())
            .pipe(finalize(() => {
                this.spinnerService.hide();
            }))
            .subscribe(val => {
                this.notify.success(this.l(AppConsts.CPS_KEYS.Saved_Successfully));
                this.close.emit();
                this.modal.hide();
            });
    }

    closeModel() {
        this.modal.hide();
    }

    reset() {
        this.createOrEditForm = undefined;
    }

    getAllProcessTypes() {
        this._cacheProxy.getAllProcessType()
        .subscribe(res => {
            res.map(e =>
                this.listTypes.push({
                    label: e.processTypeName,
                    value: e.processTypeCode
            }))
        })
    }
}
