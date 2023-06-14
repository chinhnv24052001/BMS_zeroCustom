import { Component, ElementRef, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { MstPurchasePurposeServiceProxy } from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'create-or-edit-mst-purchase-purpose',
    templateUrl: './create-or-edit-mst-purchase-purpose.component.html',
    styleUrls: ['./create-or-edit-mst-purchase-purpose.component.less']
})
export class CreateOrEditMstPurchasePurposeComponent extends AppComponentBase implements OnInit {
    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
    @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
    @Output() close = new EventEmitter<any>();
    createOrEditForm: FormGroup;
    isEdit = false;
    isSubmit = false;
    duplicateCode;
    listStatus: { value: number, label: string; }[] = [{ value: 0, label: this.l('InActive') }, { value: 1, label: this.l('ActiveModal') }];

    constructor(
        injector: Injector,
        private _mstPurchasePurposeServiceProxy: MstPurchasePurposeServiceProxy,
        private formBuilder: FormBuilder
    ) {
        super(injector);
    }

    ngOnInit(): void {
    }

    buildForm() {
        this.createOrEditForm = this.formBuilder.group({
            id: [0],
            purchasePurposeName: [undefined, GlobalValidator.required],
            purchasePurposeCode: [undefined, GlobalValidator.required],
            haveBudgetCode: [undefined],
            status: [1],
        });
    }

    show(id?: number) {
        this.buildForm();
        this.duplicateCode = false;
        if (id && id > 0) {
            this.spinnerService.show();
            this.isEdit = true;
            this._mstPurchasePurposeServiceProxy.loadById(id).subscribe(val => {
                this.createOrEditForm.patchValue(val);
                this.spinnerService.hide();
            });
        }
        else
        {
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
        this._mstPurchasePurposeServiceProxy.save(this.createOrEditForm.getRawValue())
            .pipe(finalize(() => {
                this.spinnerService.hide();
            }))
            .subscribe(val => {
                if (val.code == AppConsts.CPS_KEYS.DUPLICATE_CODE) {
                    this.duplicateCode = true;
                    return;
                }
                else {
                    this.duplicateCode = false;
                }

                this.notify.success(this.l(AppConsts.CPS_KEYS.Saved_Successfully));
                this.close.emit();
                this.modal.hide();
            });
    }
}
