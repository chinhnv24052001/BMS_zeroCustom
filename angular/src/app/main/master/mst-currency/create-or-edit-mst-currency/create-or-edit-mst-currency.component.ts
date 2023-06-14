import { Component, ElementRef, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { MstCurrencyServiceProxy, MstPurchasePurposeServiceProxy } from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'create-or-edit-mst-currency',
    templateUrl: './create-or-edit-mst-currency.component.html',
    styleUrls: ['./create-or-edit-mst-currency.component.less']
})
export class CreateOrEditMstCurrencyComponent extends AppComponentBase implements OnInit {
    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
    @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
    @Output() close = new EventEmitter<any>();
    createOrEditForm: FormGroup;
    isEdit = false;
    isSubmit = false;
    duplicateCode;
    dupplicateName;
    listStatus: { value: string, label: string; }[] = [{ value: 'InActive', label: this.l('InActive') }, { value: 'Active', label: this.l('ActiveModal') }];

    constructor(
        injector: Injector,
        private _mstCurrencyServiceProxy: MstCurrencyServiceProxy,
        private formBuilder: FormBuilder
    ) {
        super(injector);
    }

    ngOnInit(): void {
    }
 
    buildForm() {
        this.createOrEditForm = this.formBuilder.group({
            id: [0],
            name: [undefined, GlobalValidator.required],
            currencyCode: [undefined, GlobalValidator.required],
            descriptionEnglish: [undefined],
            descriptionVetNamese: [undefined],
            status: ['Active'],
        });
    }

    show(id?: number) {
        this.buildForm();
        this.duplicateCode = false;
        this.dupplicateName= false;
        if (id && id > 0) {
            this.spinnerService.show();
            this.isEdit = true;
            this._mstCurrencyServiceProxy.loadById(id).subscribe(val => {
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
        this._mstCurrencyServiceProxy.save(this.createOrEditForm.getRawValue())
            .pipe(finalize(() => {
                this.spinnerService.hide();
            }))
            .subscribe(val => {
                if (val.name == AppConsts.CPS_KEYS.DUPLICATE_NAME) {
                    this.dupplicateName = true;
                    return;
                }
                else {
                    this.dupplicateName = false;
                }
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
