import { Component, ElementRef, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { BmsMstPeriodServiceProxy, BmsMstSegment1ServiceProxy, BmsMstSegment1TypeCostServiceProxy, BmsMstSegment2ServiceProxy, BmsMstSegment4GroupServiceProxy, BmsPeriodVersionServiceProxy, ExchangeRateMasterServiceProxy, MstCurrencyServiceProxy, MstPeriodServiceProxy, MstPurchasePurposeServiceProxy, MstUnitOfMeasureServiceProxy, ProjectCodeServiceProxy } from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'create-or-edit-bms-mst-project-code',
    templateUrl: './create-or-edit-bms-mst-project-code.component.html',
    styleUrls: ['./create-or-edit-bms-mst-project-code.component.less']
})
export class CreateOrEditBmsMstProjectCodeComponent extends AppComponentBase implements OnInit {
    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
    @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
    @Output() close = new EventEmitter<any>();
    createOrEditForm: FormGroup;
    isEdit = true;
    isSubmit = false;
    listPertiod: { value:  number, label: string,  }[] = [];
    listPertiodVersion: { value:  number, label: string,  }[] = [];
    listSegment1: { value: number, label: string, code: string }[] = [];
    listSegment2: { value: number, label: string, code: string }[] = [];
    duplicateName;
    projectCodeArray:  string[] = [];
    constructor(
        injector: Injector,
        private _mainComponentServiceProxy: ProjectCodeServiceProxy,
        private _mstPeriodServiceProxy: BmsMstPeriodServiceProxy,
        private _bmsPeriodVersionServiceProxy : BmsPeriodVersionServiceProxy,
        private _bmsMstSegment1ServiceProxy: BmsMstSegment1ServiceProxy,
        private _bmsMstSegment2ServiceProxy: BmsMstSegment2ServiceProxy,
        private formBuilder: FormBuilder
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.selectDropDownPeriod();
        this.selectDropDownSegment1();
        this.selectDropDownSegment2();
        this.listPertiodVersion = [];
        
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

    getListVersionByPeriodId(id) {
        this._bmsPeriodVersionServiceProxy.getAllVersionByPeriodIdNoPage(id).subscribe((result) => {
            this.listPertiodVersion = [];
            this.listPertiodVersion.push({ value: 0, label: " " });
            result.forEach(ele => {
                this.listPertiodVersion.push({ value: ele.id, label: ele.versionName });
            });
        });
    }

    selectDropDownSegment1() {
        this._bmsMstSegment1ServiceProxy.getAllSegment1NoPage().subscribe((result) => {
            this.listSegment1 = [];
            this.listSegment1.push({ value: 0, label: " ", code: " " });
            result.forEach(ele => {
                this.listSegment1.push({ value: ele.id, label: ele.name, code: ele.code });
            });
        });
    }

    selectDropDownSegment2() {
        this._bmsMstSegment2ServiceProxy.getAllSegment2NoPage().subscribe((result) => {
            this.listSegment2 = [];
            this.listSegment2.push({ value: 0, label: " ", code: " " });
            result.forEach(ele => {
                this.listSegment2.push({ value: ele.id, label: ele.name, code: ele.code });
            });
        });
    }

    buildForm() {
        this.createOrEditForm = this.formBuilder.group({
            id: [0],
            periodVersionId : [undefined, GlobalValidator.required],
            periodId : [undefined, GlobalValidator.required],
            segment1Id : [undefined, GlobalValidator.required],
            segment2Id : [undefined, GlobalValidator.required],
            codeProject : [undefined],
        });
    }

    show(id?: number) {
        this.duplicateName =false;
        this.buildForm();
        if (id && id > 0) {
            this.spinnerService.show();
            this.isEdit = true;
            this._mainComponentServiceProxy.loadById(id).subscribe(val => {
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
        this._mainComponentServiceProxy.save(this.createOrEditForm.getRawValue())
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

    onchangeValueProjectCode(id, segNum) {
        switch (segNum) {
            case 1:
                this.projectCodeArray[0] = this.listSegment1.find(element => element.value == id).code;
                this.setValueProjectCode();
                break;
            case 2:
                this.projectCodeArray[1] = this.listSegment2.find(element => element.value == id).code;
                this.setValueProjectCode();
                break;
        }
    }

    setValueProjectCode()
    {
        var text ='';
        for( var i =0; i< 2; i++)
        {
            if(this.projectCodeArray[i] != undefined && this.projectCodeArray[i] != " ")
            {
                if(text == '')
                {
                    text +=  this.projectCodeArray[i];
                }
                else
                {
                    text += '.'+ this.projectCodeArray[i];
                }
            }
        }
        this.createOrEditForm.get("codeProject").setValue(text); 
    }
}
