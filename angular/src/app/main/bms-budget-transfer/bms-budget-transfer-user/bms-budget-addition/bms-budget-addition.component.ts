import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { MstPurchasePurposeServiceProxy, MstUnitOfMeasureServiceProxy } from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { CreateOrEditBmsBudgetTransferUserComponent } from '../create-or-edit-bms-budget-transfer-user/create-or-edit-bms-budget-transfer-user.component';

@Component({
    selector: 'bms-budget-addition',
    templateUrl: './bms-budget-addition.component.html',
    styleUrls: ['./bms-budget-addition.component.less']
})
export class BmsBudgetAdditionComponent extends AppComponentBase implements OnInit {
    @ViewChild(' createOrEditBmsBudgetTransferUser', { static: true })  createOrEditBmsBudgetTransferUser: CreateOrEditBmsBudgetTransferUserComponent;
    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
    @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
    @Output() close = new EventEmitter<any>();
    createOrEditForm: FormGroup;
    listStatusIsNewBudgetCode: { value: number, label: string; }[] = [{value: 0, label: this.l('NO')}, {value: 1, label: this.l('YES')}];
    listBudgetType: { value: number, label: string; }[] = [{value: 0, label: ''}, {value: 1, label: this.l('Expense')}, {value: 2, label: this.l('Invest')}];
    activeBudgetType;
    @Input() tabKey: any;
    isAddition =1;
    constructor(
        injector: Injector,
        private formBuilder: FormBuilder
    ) {
        super(injector);
    }

    ngOnInit(): void {
    }

    buildForm() {
        this.createOrEditForm = this.formBuilder.group({
            isNewBudgetCode: [0],
            budgetType : [0],
        });
    }

    show(id?: number) {
        this.activeBudgetType = true;
        this.buildForm();
          this.modal.show();
    }

    closeModel() {
        this.modal.hide();
    }

    reset() {
        this.createOrEditForm = undefined;
    }

    onchange(id)
    {
        if(id != 0)
        {
            this.activeBudgetType = false;
        }
        else
        {
            this.activeBudgetType = true;
        }
    }

    add() {
        if(this. createOrEditForm.get('isNewBudgetCode').value == 0)
        {
            this.createOrEditBmsBudgetTransferUser.show(0, 1,0);
            this.modal.hide();
        }
    }

    closeAndSave()
    {
        this.close.emit();
    }
}
