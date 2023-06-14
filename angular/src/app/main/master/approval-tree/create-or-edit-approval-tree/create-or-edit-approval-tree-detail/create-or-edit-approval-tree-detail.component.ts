import { Component, ElementRef, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppComponentBase } from '@shared/common/app-component-base';
import { MstApprovalTreeServiceProxy, MstHrOrgStructureServiceProxy } from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
    selector: 'create-or-edit-approval-tree-detail',
    templateUrl: './create-or-edit-approval-tree-detail.component.html',
    styleUrls: ['./create-or-edit-approval-tree-detail.component.less']
})
export class CreateOrEditApprovalTreeDetailComponent extends AppComponentBase implements OnInit {

  @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
  @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
  @Output() close = new EventEmitter<any>();
  listApprovalType: { value: number, label: string }[] = [];
  listHrOrgStructure: { value: string, label: string, }[] = [];
  listTitle: { value: number, label: string, }[] = [];
  listUser: { value: number, label: string, }[] = [];
  listPosition: { value:  number, label: string,  }[] = [];
  hrOgrId;
  valHrOrg = false;
  valTitle = false;
  valDayOfProcess = false;


    // listProcessType: { value: number, label: string, }[] = [];
    createOrEditForm: FormGroup;
    isEdit = true;
    isSubmit = false;

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private _mstApprovalTreeServiceProxy: MstApprovalTreeServiceProxy,
        private _mstHrOrgStructureServiceProxy: MstHrOrgStructureServiceProxy
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.selectDropDownApprovalType();
        this.selectDropDownHrOrgStructure();
        this.selectDropDownTitle();
        this.getHrOrgInternal();
        this.selectDropDownPosition();
    }

//drop down approval type
selectDropDownPosition() {
    this._mstApprovalTreeServiceProxy.getListPosition().subscribe((result) => {
        this.listPosition = [];
        this.listPosition.push({ value: 0, label: " " });
        result.forEach(ele => {
            this.listPosition.push({ value: ele.id, label: ele.positionName });
        });
    });
}

    //drop down approval type
    selectDropDownApprovalType() {
        this._mstApprovalTreeServiceProxy.getListApprovalType().subscribe((result) => {
            this.listApprovalType = [];
            this.listApprovalType.push({ value: 0, label: " " });
            result.forEach(ele => {
                this.listApprovalType.push({ value: ele.id, label: ele.approvalTypeName });
            });
        });
    }

    //drop down Org
    selectDropDownHrOrgStructure() {
        this._mstApprovalTreeServiceProxy.getListHrOrgStructure().subscribe((result) => {
            this.listHrOrgStructure = [];
            this.listHrOrgStructure.push({ value: "", label: " " });
            result.forEach(ele => {
                this.listHrOrgStructure.push({ value: ele.id, label: ele.name });
            });
        });
    }

    //drop down title
    selectDropDownTitle() {
        this._mstApprovalTreeServiceProxy.getListTitle().subscribe((result) => {
            this.listTitle = [];
            this.listTitle.push({ value: 0, label: " " });
            result.forEach(ele => {
                this.listTitle.push({ value: ele.id, label: ele.name });
            });
        });
    }

    //drop down user
    onChangeTitle() {
        if (this.createOrEditForm.get('approvalTypeId').value == 1) {
            if (this.createOrEditForm.get('titleId').value == null
                || this.createOrEditForm.get('titleId').value == undefined
                || this.createOrEditForm.get('titleId').value == "") {
                this.valTitle = true;
                return;
            }
            else {
                this.valTitle = false;
            }
        }
        else {
            this.valTitle = false;
        }

        this._mstHrOrgStructureServiceProxy.getListUserByHrOrg(this.createOrEditForm.get('hrOrgStructureId').value,
            this.createOrEditForm.get('titleId').value
        ).subscribe((result) => {
            this.createOrEditForm.get('listUserId').setValue(undefined);
            this.listUser = [];
            this.listUser.push({ value: 0, label: " " });
            result.forEach(ele => {
                this.listUser.push({ value: ele.id, label: ele.userName });
            });
        });
    }

    //hrOrgId not Invalid
    onChangeHrOrg() {
        if (this.createOrEditForm.get('approvalTypeId').value != 1) {
            if (this.createOrEditForm.get('hrOrgStructureId').value == null
                || this.createOrEditForm.get('hrOrgStructureId').value == undefined
                || this.createOrEditForm.get('hrOrgStructureId').value == "") {
                this.valHrOrg = true;
                return;
            }
            else {
                this.valHrOrg = false;
            }
        }
        else {
            this.valHrOrg = false;
        }
        // this.getListUser(this.createOrEditForm.get('hrOrgStructureId').value,this.createOrEditForm.get('titleId').value??0)
    }



    //get hrOrg Internal
    getHrOrgInternal() {
        this._mstApprovalTreeServiceProxy.getHrOrgInternal(
        ).subscribe((result) => {
            this.hrOgrId = result;
        });
    }

    //set hrOrg internal
    setHrOrgInternal() {
        if (this.createOrEditForm.get('approvalTypeId').value == 1) {
            this.createOrEditForm.get('hrOrgStructureId').setValue(this.hrOgrId);
        }
    }

    buildForm() {
        this.createOrEditForm = this.formBuilder.group({
            id: [0],
            approvalTypeId: [undefined, GlobalValidator.required],
            hrOrgStructureId: [undefined],
            // titleId: [undefined],
            positionId: [undefined],
            listUserId: [undefined],
            dayOfProcess: [0, GlobalValidator.required],
            check : [0],
        });
    }

    show(val?) {
        this.spinnerService.show();
        this.valHrOrg = false;
        this.valTitle = false;
        if (val) {
            this.createOrEditForm = this.formBuilder.group({
                id: [val.id],
                approvalTypeId: [val.approvalTypeId, GlobalValidator.required],
                hrOrgStructureId: [val.hrOrgStructureId],
                // titleId: [val.titleId],
                positionId: [val.positionId],
                listUserId: [val.listUserId],
                dayOfProcess: [val.dayOfProcess, GlobalValidator.required],
                check : [1],
            });
            this.isEdit = true;
            // this.getListUser(this.createOrEditForm.get('hrOrgStructureId').value,this.createOrEditForm.get('titleId').value??0);
            this.createOrEditForm.patchValue(val);
            this.spinnerService.hide();
        }
        else {
            this.spinnerService.show();
            this.buildForm();
            this.isEdit = false;
            this.spinnerService.hide();
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
        if(this.createOrEditForm.get('dayOfProcess').value >= 0)
        {
          this.valDayOfProcess = false;
        }
        else
        {
          this.valDayOfProcess = true;
          return;
        }


        if (this.createOrEditForm.get('approvalTypeId').value != 1) {
            if (this.createOrEditForm.get('hrOrgStructureId').value == null
                || this.createOrEditForm.get('hrOrgStructureId').value == undefined
                || this.createOrEditForm.get('hrOrgStructureId').value == "") {
                this.valHrOrg = true;
                return;
            }
            else {
                this.valHrOrg = false;
            }
        }
        else {
            this.valHrOrg = false;
            if (this.createOrEditForm.get('positionId').value == null
                || this.createOrEditForm.get('positionId').value == undefined
                || this.createOrEditForm.get('positionId').value == "") {
                this.valTitle = true;
                return;
            }
            else {
                this.valTitle = false;
            }
        }

        this.spinnerService.show();
        this.notify.success('Add Successfully');
        this.modal.hide();
        this.close.emit(this.createOrEditForm.getRawValue());
        this.spinnerService.hide();
    }

    getListUser(hrId?, titleId?) {
        this._mstHrOrgStructureServiceProxy.getListUserByHrOrg(hrId,titleId).subscribe((result) => {
            this.createOrEditForm.get('listUserId').setValue(undefined);
            this.listUser = [];
            this.listUser.push({ value: 0, label: " " });
            result.forEach(ele => {
                this.listUser.push({ value: ele.id, label: ele.userName });
            });
        });
    }

    onChangePosition() {
        if (this.createOrEditForm.get('approvalTypeId').value == 1) {
            if (this.createOrEditForm.get('positionId').value == null
                || this.createOrEditForm.get('positionId').value == undefined
                || this.createOrEditForm.get('positionId').value == "") {
                this.valTitle = true;
                return;
            }
            else {
                this.valTitle = false;
            }
        }
        else {
            this.valTitle = false;
        }

        this._mstHrOrgStructureServiceProxy.getListUserByHrOrg(this.createOrEditForm.get('hrOrgStructureId').value,
            this.createOrEditForm.get('positionId').value
        ).subscribe((result) => {
            this.createOrEditForm.get('listUserId').setValue(undefined);
            this.listUser = [];
            this.listUser.push({ value: 0, label: " " });
            result.forEach(ele => {
                this.listUser.push({ value: ele.id, label: ele.userName });
            });
        });
    }
}
