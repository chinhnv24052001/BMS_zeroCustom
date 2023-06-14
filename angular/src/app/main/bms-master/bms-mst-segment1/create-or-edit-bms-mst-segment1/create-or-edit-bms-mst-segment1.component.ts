import { Component, ElementRef, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { BmsMstPeriodServiceProxy, BmsMstSegment1ServiceProxy, BmsMstSegment1TypeCostServiceProxy, MstPeriodServiceProxy, MstPurchasePurposeServiceProxy, MstUnitOfMeasureServiceProxy } from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'create-or-edit-bms-mst-segment1',
    templateUrl: './create-or-edit-bms-mst-segment1.component.html',
    styleUrls: ['./create-or-edit-bms-mst-segment1.component.less']
})
export class CreateOrEditBmsMstSegment1Component extends AppComponentBase implements OnInit {
    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
    @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
    @Output() close = new EventEmitter<any>();
    createOrEditForm: FormGroup;
    isEdit = true;
    inputText2Value = "";
    inputText2 = "";
    isSubmit = false;
    uomCodeErr = false;
    listCost: { value:  number,  label: string,  }[] = [];
    listPertiod: { value:  number, label: string,  }[] = [];
    listStatus: { value: string, label: string; }[] = [{value: 'InActive', label: this.l('InActive')}, {value: 'Active', label: this.l('ActiveModal')}];
    duplicateCode;

    constructor(
        injector: Injector,
        private _bmsMstSegment1ServiceProxy: BmsMstSegment1ServiceProxy,
        private _bmsMstSegment1TypeCostServiceProxy : BmsMstSegment1TypeCostServiceProxy,
        private _mstPeriodServiceProxy: BmsMstPeriodServiceProxy,
        private formBuilder: FormBuilder
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.selectDropDownCost();
        this.selectDropDownPeriod();
    }

    selectDropDownCost() {
        this._bmsMstSegment1TypeCostServiceProxy.getListSegment1TypeCosts().subscribe((result) => {
            this.listCost = [];
            this.listCost.push({ value: 0, label: " " });
            result.forEach(ele => {
                this.listCost.push({ value: ele.id, label: ele.typeCostName });
            });
        });
    }

    selectDropDownPeriod() {
        this._mstPeriodServiceProxy.getAllBmsPeriodNoPage('', 0, '', 20, 0 ).subscribe((result) => {
            this.listPertiod = [];
            this.listPertiod.push({ value: 0, label: " " });
            result.forEach(ele => {
                this.listPertiod.push({ value: ele.id, label: ele.periodName });
            });
        });
    }

    buildForm() {
        this.createOrEditForm = this.formBuilder.group({
            id: [0],
            code : [undefined, GlobalValidator.required],
            name : [undefined, GlobalValidator.required],
            periodId : [undefined, GlobalValidator.required],
            typeCostId: [undefined, GlobalValidator.required],
            description : [undefined],
        });
    }

    show(id?: number) {
        this.buildForm();
        this.duplicateCode= false;
        this.uomCodeErr = false;
        if (id && id > 0) {
            this.spinnerService.show();
            this.isEdit = true;
            this._bmsMstSegment1ServiceProxy.loadById(id).subscribe(val => {
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
        this._bmsMstSegment1ServiceProxy.save(this.createOrEditForm.getRawValue())
        .pipe(finalize(() => {
            this.spinnerService.hide();
        }))
        .subscribe(val => {
            if(val.code == AppConsts.CPS_KEYS.DUPLICATE_CODE)
            {
                this.duplicateCode = true;
                return;
            }
            else
            {
                this.duplicateCode = false;
            }

          this.notify.success(this.l(AppConsts.CPS_KEYS.Saved_Successfully));
          this.close.emit();
          this.modal.hide();
        });
    }
}
