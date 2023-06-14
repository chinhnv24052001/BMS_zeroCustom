import { Component, ElementRef, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { BmsMstPairingSegmentServiceProxy, BmsMstPeriodServiceProxy, BmsMstSegment1ServiceProxy, BmsMstSegment1TypeCostServiceProxy, BmsMstSegment2ServiceProxy, BmsMstSegment3ServiceProxy, BmsMstSegment4GroupServiceProxy, BmsMstSegment4ServiceProxy, BmsMstSegment5ServiceProxy, BmsPeriodVersionServiceProxy, MstPeriodServiceProxy, MstPurchasePurposeServiceProxy, MstUnitOfMeasureServiceProxy } from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'create-or-edit-bms-mst-pairing-segment',
    templateUrl: './create-or-edit-bms-mst-pairing-segment.component.html',
    styleUrls: ['./create-or-edit-bms-mst-pairing-segment.component.less']
})
export class CreateOrEditBmsMstPairingSegmentGroupComponent extends AppComponentBase implements OnInit {
    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
    @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
    @Output() close = new EventEmitter<any>();
    createOrEditForm: FormGroup;
    isEdit = true;
    isSubmit = false;
    listSegment1: { value: number, label: string, code: string }[] = [];
    listSegment2: { value: number, label: string, code: string }[] = [];
    listSegment3: { value: number, label: string, code: string }[] = [];
    listSegment4: { value: number, label: string, code: string }[] = [];
    listSegment5: { value: number, label: string, code: string }[] = [];
    listPertiod: { value:  number, label: string,  }[] = [];
    listPertiodVersion: { value:  number, label: string,  }[] = [];
    listType: { value:  number, label: string,  }[] = [{value: 1, label: 'Expense'}, {value: 2, label: 'Investment'}];
    paringArray:  string[] = [];
    duplicateName;
    type: number = 2;

    constructor(
        injector: Injector,
        private _mstPeriodServiceProxy: BmsMstPeriodServiceProxy,
        private _bmsPeriodVersionServiceProxy : BmsPeriodVersionServiceProxy,
        private _bmsMstPairingSegmentServiceProxy: BmsMstPairingSegmentServiceProxy,
        private _bmsMstSegment1ServiceProxy: BmsMstSegment1ServiceProxy,
        private _bmsMstSegment2ServiceProxy: BmsMstSegment2ServiceProxy,
        private _bmsMstSegment3ServiceProxy: BmsMstSegment3ServiceProxy,
        private _bmsMstSegment4ServiceProxy: BmsMstSegment4ServiceProxy,
        private _bmsMstSegment5ServiceProxy: BmsMstSegment5ServiceProxy,
        private formBuilder: FormBuilder
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.selectDropDownSegment1();
        this.selectDropDownSegment2();
        this.selectDropDownSegment3();
        this.selectDropDownSegment4();
        this.selectDropDownSegment5();
        this.selectDropDownPeriod();
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

    selectDropDownSegment3() {
        this._bmsMstSegment3ServiceProxy.getAllSegment3NoPage().subscribe((result) => {
            this.listSegment3 = [];
            this.listSegment3.push({ value: 0, label: " ", code: " " });
            result.forEach(ele => {
                this.listSegment3.push({ value: ele.id, label: ele.name, code: ele.code });
            });
        });
    }

    selectDropDownSegment4() {
        this._bmsMstSegment4ServiceProxy.getAllSegment4NoPage().subscribe((result) => {
            this.listSegment4 = [];
            this.listSegment4.push({ value: 0, label: " ", code: " " });
            result.forEach(ele => {
                this.listSegment4.push({ value: ele.id, label: ele.name, code: ele.code });
            });
        });
    }

    selectDropDownSegment5() {
        this._bmsMstSegment5ServiceProxy.getAllSegment5NoPage().subscribe((result) => {
            this.listSegment5 = [];
            this.listSegment5.push({ value: 0, label: " ", code: " " });
            result.forEach(ele => {
                this.listSegment5.push({ value: ele.id, label: ele.name, code: ele.code });
            });
        });
    }

    buildForm() {
        this.createOrEditForm = this.formBuilder.group({
            id: [0],
            periodVersion : [undefined, GlobalValidator.required],
            periodId : [undefined, GlobalValidator.required],
            segment1Id: [undefined, GlobalValidator.required],
            segment2Id: [undefined, GlobalValidator.required],
            segment3Id: [undefined, GlobalValidator.required],
            segment4Id: [undefined, GlobalValidator.required],
            segment5Id: [undefined, GlobalValidator.required],
            type: [1],
            pairingText: [undefined],
            name: [undefined, GlobalValidator.required],
            isActive: [true],
            description: [undefined],
        });
    }

    show(id?: number) {
        this.buildForm();
        this.duplicateName = false;
        if (id && id > 0) {
            this.spinnerService.show();
            this.isEdit = true;
            this._bmsMstPairingSegmentServiceProxy.loadById(id).subscribe(val => {
                this.createOrEditForm.patchValue(val);
                var stringArr= val.pairingText.split(".");
                this.paringArray[0] =stringArr[0];
                this.paringArray[1] =stringArr[1];
                this.paringArray[2] =stringArr[2];
                this.paringArray[3] =stringArr[3];
                this.paringArray[4] =stringArr[4];
                this.spinnerService.hide();
            });
        }
        else {
            this.paringArray =[];
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
        this._bmsMstPairingSegmentServiceProxy.save(this.createOrEditForm.getRawValue())
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

    onchangeValueParingText(id, segNum) {
        switch (segNum) {
            case 1:
                this.paringArray[0] = this.listSegment1.find(element => element.value == id).code;
                this.setValuePairing();
                break;
            case 2:
                this.paringArray[1] = this.listSegment2.find(element => element.value == id).code;
                this.setValuePairing();
                break;
            case 3:
                this.paringArray[2] = this.listSegment3.find(element => element.value == id).code;
                this.setValuePairing();
                break;
            case 4:
                this.paringArray[3] = this.listSegment4.find(element => element.value == id).code;
                this.setValuePairing();
                break;
            case 5:
                this.paringArray[4] = this.listSegment5.find(element => element.value == id).code;
                this.setValuePairing();
                break;
        }
    }

    onchangeByType(typeId)
    {
        this.type = typeId;
        this.setValuePairing();
    }

    setValuePairing()
    {
        var text ='';
        for( var i =0; i< 5; i++)
        {
            if(this.paringArray[i] != undefined && this.paringArray[i] != " ")
            {
                if(text == '')
                {
                    text +=  this.paringArray[i];
                }
                else
                {
                    if(this.type == 1 && i == 4)
                    {
                        text += this.paringArray[i];
                    }
                    else
                    {
                        text += '.'+ this.paringArray[i];
                    }
                }
            }
        }
        this.createOrEditForm.get("pairingText").setValue(text); 
    }
}
