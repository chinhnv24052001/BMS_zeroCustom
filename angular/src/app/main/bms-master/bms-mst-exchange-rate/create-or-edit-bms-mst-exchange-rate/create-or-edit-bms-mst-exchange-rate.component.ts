import { Component, ElementRef, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { BmsMstPeriodServiceProxy, BmsMstSegment1ServiceProxy, BmsMstSegment1TypeCostServiceProxy, BmsMstSegment4GroupServiceProxy, BmsPeriodVersionServiceProxy, ExchangeRateMasterServiceProxy, MstCurrencyServiceProxy, MstPeriodServiceProxy, MstPurchasePurposeServiceProxy, MstUnitOfMeasureServiceProxy } from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'create-or-edit-bms-mst-exchange-rate',
    templateUrl: './create-or-edit-bms-mst-exchange-rate.component.html',
    styleUrls: ['./create-or-edit-bms-mst-exchange-rate.component.less']
})
export class CreateOrEditBmsMstExchangeRateComponent extends AppComponentBase implements OnInit {
    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
    @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
    @Output() close = new EventEmitter<any>();
    createOrEditForm: FormGroup;
    isEdit = true;
    isSubmit = false;
    listPertiod: { value:  number, label: string,  }[] = [];
    listPertiodVersion: { value:  number, label: string,  }[] = [];
    listCurrency: { value:  number, label: string,  }[] = [];

    constructor(
        injector: Injector,
        private _exchangeRateMasterServiceProxy: ExchangeRateMasterServiceProxy,
        private _mstPeriodServiceProxy: BmsMstPeriodServiceProxy,
        private _bmsPeriodVersionServiceProxy : BmsPeriodVersionServiceProxy,
        private _mstCurrencyServiceProxy: MstCurrencyServiceProxy,
        private formBuilder: FormBuilder
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.selectDropDownPeriod();
        this.selectDropDownCurrency();
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

    selectDropDownCurrency() {
        this._mstCurrencyServiceProxy.loadAllCurrencyNoPage().subscribe((result) => {
            this.listCurrency = [];
            this.listCurrency.push({ value: 0, label: " " });
            result.forEach(ele => {
                this.listCurrency.push({ value: ele.id, label: ele.currencyCode });
            });
        });
    }

    buildForm() {
        this.createOrEditForm = this.formBuilder.group({
            id: [0],
            periodVersionId : [undefined, GlobalValidator.required],
            periodId : [undefined, GlobalValidator.required],
            currencyId : [undefined, GlobalValidator.required],
            exchangeRate : [undefined, GlobalValidator.required],
            description : [undefined],
        });
    }

    show(id?: number) {
        this.buildForm();
        if (id && id > 0) {
            this.spinnerService.show();
            this.isEdit = true;
            this._exchangeRateMasterServiceProxy.loadById(id).subscribe(val => {
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
        this._exchangeRateMasterServiceProxy.save(this.createOrEditForm.getRawValue())
        .pipe(finalize(() => {
            this.spinnerService.hide();
        }))
        .subscribe(val => {
          this.notify.success(this.l(AppConsts.CPS_KEYS.Saved_Successfully));
          this.close.emit();
          this.modal.hide();
        });
    }
}
