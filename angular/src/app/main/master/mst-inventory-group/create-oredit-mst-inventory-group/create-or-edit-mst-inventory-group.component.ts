import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    MstHrOrgStructureServiceProxy,
    MstInventoryGroupDto,
    MstInventoryGroupServiceProxy,
} from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { pipe } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'create-or-edit-mst-inventory-group',
    templateUrl: './create-or-edit-mst-inventory-group.component.html',
    styleUrls: ['./create-or-edit-mst-inventory-group.component.less'],
})
export class CreateOrEditMstInventoryGroupComponent extends AppComponentBase {
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    // @ViewChild('submitBtn', { static: false }) submitBtn: ElementRef;
    @Output() close = new EventEmitter<any>();
    @Output() updateAfterEdit = new EventEmitter<any>();

    createOrEditForm: FormGroup;
    isEditForm: boolean = false;
    isSubmit = false;
    listInventoryGroup: { label: string; value: number | undefined }[] = [];
    listHrOrgStructure: { label: string; value: string | undefined }[] = [];
    listUser: any[] = [];
    listUserForChoosing = [
        // { label: '', value: undefined },
        // { label: 'hoan', value: 77 },
        // { label: 'admin', value: 676 },
    ];

    selected: MstInventoryGroupDto = new MstInventoryGroupDto();

    constructor(
        injector: Injector,
        private _mstInventoryGroupServiceProxy: MstInventoryGroupServiceProxy,
        private _mstHrOrgStructureServiceProxy: MstHrOrgStructureServiceProxy,
        private formBuilder: FormBuilder
    ) {
        super(injector);
    }

    ngOnInit(): void {
        // get list inventory group
    }

    buildForm(params) {
        this._mstHrOrgStructureServiceProxy
            .getAllActive()
            .pipe(
                finalize(() => {
                    this.createOrEditForm = this.formBuilder.group({
                        id: [0],
                        productGroupName: [undefined, GlobalValidator.required],
                        productGroupCode: [undefined, GlobalValidator.required],
                        picDepartmentId: [''],
                        isCatalog: [undefined],
                    });
                    this.createOrEditForm.patchValue(params);
                    this.createOrEditForm.get('picDepartmentId').setValue(params.picDepartmentId);
                })
            )
            .subscribe((val) => {
                this.listHrOrgStructure = [];
                var labeladd = { label: '', value: '' };
                this.listHrOrgStructure.push(labeladd);
                val.forEach((element) => {
                    this.listHrOrgStructure.push({
                        label: element.hrOrgStructureName,
                        value: element.id,
                    });
                });
            });
    }

    show(params?: any) {
        this.spinnerService.show();
        // console.log(params);
        this.selected = params ?? new MstInventoryGroupDto();
        this._mstHrOrgStructureServiceProxy
            .getAllActive()
            .pipe(
                finalize(() => {
                    this._mstHrOrgStructureServiceProxy
                        .getUserByHrOrgStructureId()
                        .pipe(
                            finalize(() => {
                                this.spinnerService.hide();
                                let picDepartmentId = this.selected.picDepartmentId;
                                if (picDepartmentId && picDepartmentId != null && picDepartmentId != undefined)
                                    this.listUserForChoosing = this.listUser.filter(
                                        (e) => e.hrOrgStructureId == picDepartmentId!.toString().toLowerCase()
                                    );
                                else this.listUserForChoosing = this.listUser;
                                var labeladd = { label: '', value: undefined };
                                this.listUserForChoosing.unshift(labeladd);
                                this.modal.show();
                            })
                        )
                        .subscribe((val) => {
                            // list user add blank option
                            this.listUser = [];
                            var labeladd = { label: '', value: undefined };
                            this.listUser.push(labeladd);
                            this.listUserForChoosing.push(labeladd);
                            val.forEach((element) => {
                                this.listUser.push({
                                    label: element.employeeName,
                                    value: element.id,
                                    hrOrgStructureId: element.hrOrgStructureId,
                                });
                            });
                        });
                })
            )
            .subscribe((val) => {
                this.listHrOrgStructure = [];
                var labeladd = { label: '', value: '' };
                this.listHrOrgStructure.push(labeladd);
                val.forEach((element) => {
                    this.listHrOrgStructure.push({
                        label: element.hrOrgStructureName,
                        value: element.id,
                    });
                });
            });
    }

    closeModel() {
        this.resetModalValue();
        this.modal.hide();
    }

    resetModalValue() {
        this.listHrOrgStructure = [];
        this.listUser = [];
        this.listUserForChoosing = [];
        this.selected = new MstInventoryGroupDto();
    }

    // getAllPicUser() {
    //     this._mstHrOrgStructureServiceProxy
    //         .getUserByHrOrgStructureId(this.createOrEditForm.get('picDepartmentId').value)
    //         .subscribe((val) => {
    //             console.log('user');
    //             // list user add blank option
    //             this.listUser = [];
    //             var labeladd = { label: '', value: undefined };
    //             this.listUser.push(labeladd);
    //             val.forEach((element) => {
    //                 this.listUser.push({
    //                     label: element.employeeName,
    //                     value: element.id,
    //                 });
    //             });
    //         });
    // }

    reset() {
        this.createOrEditForm = undefined;
    }

    save() {
        this.isSubmit = true;
        // if (this.submitBtn) {
        //     this.submitBtn.nativeElement.click();
        // }
        // if (this.createOrEditForm.invalid) {
        //     return;
        // }
        this.spinnerService.show();
        this._mstInventoryGroupServiceProxy
            .createOrEdit(this.selected)
            .pipe(
                finalize(() => {
                    this.spinnerService.hide();
                })
            )
            .subscribe((val) => {
                // this.spinnerService.hide();
                this.notify.success('Saved Successfully');
                this.updateAfterEdit.emit();
                this.resetModalValue();
                this.modal.hide();
                this.close.emit();
            });

        // this.createOrEditForm.get('picDepartmentId').setValue('0D0A113B-5AF4-4C93-AF3C-013FECA5B02C');
        // this.createOrEditForm.get('picUserId').setValue(1);
    }
    // onchangePicDepartmentId() {
    //     // get user by department id
    //     this.getAllPicUser();
    // }

    changeDepartmentValue(params) {
        // console.log(params);
        // console.log(this.listUser.filter((e) => e.label == 'admin'));
        this.listUserForChoosing = [];
        if (params && params != null && params != undefined && params != 0)
            this.listUserForChoosing = this.listUser.filter(
                (e) => e.hrOrgStructureId == params!.toString().toLowerCase()
            );
        else this.listUserForChoosing = this.listUser;

        var labeladd = { label: '', value: undefined };
        this.listUserForChoosing.unshift(labeladd);
        // this.selected.picUserId = undefined;
    }
}
