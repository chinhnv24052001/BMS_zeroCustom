import { forEach } from 'lodash-es';
import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppComponentBase } from '@shared/common/app-component-base';
import { MstQuotaExpenseDto, MstQuotaExpenseServiceProxy } from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { ModalDirective } from 'ngx-bootstrap/modal';
import * as moment from 'moment';

@Component({
    selector: 'app-create-or-edit-quota-expense-group',
    templateUrl: './create-or-edit-quota-expense-group.component.html',
    styleUrls: ['./create-or-edit-quota-expense.component.less']
})
export class CreateOrEditQuotaExpenseGroupComponent extends AppComponentBase implements OnInit {
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('submitBtn', { static: false }) submitBtn: ElementRef;
    @Input() selectedRow: MstQuotaExpenseDto = new MstQuotaExpenseDto();
    @Output() close = new EventEmitter<any>();
    @Output() updateAfterEdit = new EventEmitter<any>();
    createOrEditForm: FormGroup;
    isEditForm: boolean = false;
    isSubmit = false;
    listCurrency;
    listTitle;
    listUnit;
    listHrOrg;
    listInventory;
    inventoryGroup;
    listStatus = [
        { label: 'Active', value: 'Y' },
        { label: 'Inactive', value: 'N' },
    ]
    qoutaList = [
        { label: 'Giá trị', value: 2 },
    ]
    constructor(
        injector: Injector,
        private _mstProjectServiceProxy: MstQuotaExpenseServiceProxy,
        private formBuilder: FormBuilder
    ) {
        super(injector);
    }

    ngOnInit(): void {
    }

    buildForm() {
        this.createOrEditForm = this.formBuilder.group({
            id: [0],
            quotaCode: [undefined],
            quotaName: [undefined],
            quotaType: 2,
            orgId: [undefined],
            titleId: [undefined],
            quotaPrice: [undefined],
            currencyCode: [undefined],
            startDate: [undefined],
            endDate: [undefined],
            status: 'Y',
        });
    }

    create() {
        this.isEditForm = false;
        this.buildForm();
        this.modal.show();
        this.getCache();
    }
    edit() {
        this.isEditForm = true;
        this.getCache();
        this.createOrEditForm = this.formBuilder.group({
            id: this.selectedRow.id,
            quotaCode: this.selectedRow.quotaCode,
            quotaName: this.selectedRow.quotaName,
            quotaType: this.selectedRow.quotaType,
            orgId: this.selectedRow.orgId,
            titleId: this.selectedRow.titleId,
            quotaPrice: this.selectedRow.quotaPrice,
            currencyCode: this.selectedRow.currencyCode,
            startDate: this.selectedRow.startDate,
            endDate: this.selectedRow.endDate,
            status: this.selectedRow.status == 'Active' ? 'Y' : 'N',
        });
        this.modal.show();

    }

    closeModel() {
        this.selectedRow = null;
        this.modal.hide();
    }

    reset() {
        this.createOrEditForm = undefined;
    }

    save() {
        if (this.validate()) {
            this.isSubmit = true;
            if (this.submitBtn) {
                this.submitBtn.nativeElement.click();
            }
            if (this.createOrEditForm.invalid) {
                return;
            }
            this.spinnerService.show();
            if (this.isEditForm) {
                this._mstProjectServiceProxy
                    .mstQuotaExpenseUpdate(this.createOrEditForm.getRawValue())
                    .subscribe((val) => {
                        this.notify.success(val.replace('Info: ', ''));
                        this.modal.hide();
                        this.close.emit();
                        this.spinnerService.hide();
                        this.updateAfterEdit.emit();
                    });
            } else {
                this._mstProjectServiceProxy
                    .mstQuotaExpenseInsert(this.createOrEditForm.getRawValue())
                    .subscribe((val) => {
                        if (val.includes('Error:')) {
                            this.notify.error(val.replace('Error: ', ''));
                        }
                        else{
                            this.notify.success(val.replace('Info: ', ''));
                            this.modal.hide();
                            this.close.emit();
                        }
                        this.spinnerService.hide();
                        this.updateAfterEdit.emit();
                    });
            }
        }

    }

    getCache() {
        this.listCurrency = [];
        this.listTitle = [];
        this.listUnit = [];
        this.listHrOrg = [];
        this.listInventory = [];
        this._mstProjectServiceProxy.getAllMstCurrency()
            .subscribe((val) => {
                forEach(val, (item) => {
                    this.listCurrency.push({ label: item.name, value: item.id })
                });
            });
        this._mstProjectServiceProxy.getAllMstTitle().subscribe((val) => {
            forEach(val, (item) => {
                this.listTitle.push({ label: item.name, value: item.id })
            });
        });
        this._mstProjectServiceProxy.getAllMstUnitOfMeasure().subscribe((val) => {
            forEach(val, (item) => {
                this.listUnit.push({ label: item.name, value: item.id })
            });
        });
        this._mstProjectServiceProxy.getAllMstInventoryGroup().subscribe((val) => {
            this.inventoryGroup = val;
            forEach(val, (item) => {
                this.listInventory.push({ label: item.name, value: item.code })
            });
        });
        this._mstProjectServiceProxy.getAllMstHrOrgStructure().subscribe((val) => {
            forEach(val, (item) => {
                this.listHrOrg.push({ label: item.name, value: item.stringId })
            });
        });
    }

    setQuotaName() {
        const qtName = this.inventoryGroup.find((item) => item.code === this.createOrEditForm.get('quotaCode').value);
        this.createOrEditForm.get('quotaName').setValue(qtName.name);
    }
    validate() {
        if (this.createOrEditForm.get('quotaPrice').getRawValue() <= 0) {
            this.notify.error('Số lượng không được nhỏ hơn 0');
            return false;
        }
        if (this.createOrEditForm.get('startDate').value > this.createOrEditForm.get('endDate').value) {
            this.notify.error('Ngày bắt đầu không được lớn hơn ngày kết thúc');
            return false;
        }
        return true;
    }
}
