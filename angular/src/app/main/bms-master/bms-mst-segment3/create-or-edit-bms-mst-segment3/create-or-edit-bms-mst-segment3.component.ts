import { Component, ElementRef, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { BmsMstPeriodServiceProxy, BmsMstSegment1ServiceProxy, BmsMstSegment1TypeCostServiceProxy, BmsMstSegment3ServiceProxy, MstPeriodServiceProxy, MstPurchasePurposeServiceProxy, MstUnitOfMeasureServiceProxy } from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'create-or-edit-bms-mst-segment3',
    templateUrl: './create-or-edit-bms-mst-segment3.component.html',
    styleUrls: ['./create-or-edit-bms-mst-segment3.component.less']
})
export class CreateOrEditBmsMstSegment3Component extends AppComponentBase implements OnInit {
    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
    @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
    @Output() close = new EventEmitter<any>();
    createOrEditForm: FormGroup;
    isEdit = true;
    inputText2Value = "";
    inputText2 = "";
    isSubmit = false;
    uomCodeErr = false;
    listDivision: { value:  number,  label: string,  }[] = [];
    listDepartment: { value:  number,  label: string,  }[] = [];
    listPertiod: { value:  number, label: string,  }[] = [];
    listStatus: { value: string, label: string; }[] = [{value: 'InActive', label: this.l('InActive')}, {value: 'Active', label: this.l('ActiveModal')}];
    duplicateCode;

    constructor(
        injector: Injector,
        private _bmsMstSegment3ServiceProxy: BmsMstSegment3ServiceProxy,
        private _bmsMstSegment1TypeCostServiceProxy : BmsMstSegment1TypeCostServiceProxy,
        private _mstPeriodServiceProxy: BmsMstPeriodServiceProxy,
        private formBuilder: FormBuilder
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.selectDropDownDivision();
        this.selectDropDownPeriod();
        this.listDepartment.push({ value: 0, label: " " });
    }

    selectDropDownDivision() {
        this._bmsMstSegment3ServiceProxy.getAllDivisionNoPage().subscribe((result) => {
            this.listDivision = [];
            this.listDivision.push({ value: 0, label: " " });
            result.forEach(ele => {
                this.listDivision.push({ value: ele.id, label: ele.name });
            });
        });
    }

    selectDropDownDepartment() {
        this._bmsMstSegment3ServiceProxy.getAllDepartmentByDevisionNoPage(this.createOrEditForm.get('divisionId').value).subscribe((result) => {
            this.listDepartment = [];
            result.forEach(ele => {
                this.listDepartment.push({ value: ele.id, label: ele.name });
            });
             this.createOrEditForm.get('departmentId').setValue(0);
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
            divisionId: [undefined, GlobalValidator.required],
            departmentId: [undefined, GlobalValidator.required],
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
            this._bmsMstSegment3ServiceProxy.loadById(id).subscribe(val => {
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
        this._bmsMstSegment3ServiceProxy.save(this.createOrEditForm.getRawValue())
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
