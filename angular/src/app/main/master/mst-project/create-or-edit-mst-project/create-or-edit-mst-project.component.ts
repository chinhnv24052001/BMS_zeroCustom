import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppComponentBase } from '@shared/common/app-component-base';
import { MstProjectDto, MstProjectServiceProxy } from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { trim } from 'lodash';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
    selector: 'app-create-or-edit-mst-project',
    templateUrl: './create-or-edit-mst-project.component.html',
    styleUrls: ['./create-or-edit-mst-project.component.less']
})
export class CreateOrEditMstProjectComponent extends AppComponentBase implements OnInit {
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('submitBtn', { static: false }) submitBtn: ElementRef;
    @Input() selectedRow: MstProjectDto = new MstProjectDto();
    @Output() close = new EventEmitter<any>();
    @Output() updateAfterEdit = new EventEmitter<any>();
    createOrEditForm: FormGroup;
    isEditForm: boolean = false;
    isSubmit = false;
    listStatus = [
        { label: this.l('Active'), value: 'Y' },
        { label: this.l('InActive'), value: 'N' }
    ]

    constructor(
        injector: Injector,
        private _mstProjectServiceProxy: MstProjectServiceProxy,
        private formBuilder: FormBuilder
    ) {
        super(injector);
    }

    ngOnInit(): void {

    }

    buildForm() {
        this.createOrEditForm = this.formBuilder.group({
            id: [0],
            projectCode: [undefined],
            projectName: [undefined],
            numberStage: [undefined],
            startDateActive: [undefined],
            endDateActive: [undefined],
            status: 'Y',
            category: [undefined],
        });
    }

    create() {
        this.isEditForm = false;
        this.buildForm();
        this.modal.show();
    }
    edit() {
        this.isEditForm = true;
        this.createOrEditForm = this.formBuilder.group({
            id: this.selectedRow.id,
            projectCode: this.selectedRow.projectCode,
            projectName: this.selectedRow.projectName,
            numberStage: this.selectedRow.numberStage,
            startDateActive: this.selectedRow.startDateActive,
            endDateActive: this.selectedRow.endDateActive,
            status: this.selectedRow.status,
            category: this.selectedRow.category,
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
                    .mstProjectUpdate(this.createOrEditForm.getRawValue())
                    .subscribe((val) => {
                        this.notify.success(val.replace('Info: ', ''));
                        this.modal.hide();
                        this.close.emit();
                        this.spinnerService.hide();
                        this.updateAfterEdit.emit();
                    });
            } else {
                this._mstProjectServiceProxy
                    .mstProjectInsert(this.createOrEditForm.getRawValue())
                    .subscribe((val) => {
                        if (val.includes('Error:')) {
                            this.notify.error(val.replace('Error: ', ''));
                        }
                        else {
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
    validate() {
        if (this.createOrEditForm.get('projectCode').value == null ||
            trim(this.createOrEditForm.get('projectCode').value) == '') {
            this.notify.error('Mã dự án không được để trống');
            return false;
        }
        if (this.createOrEditForm.get('startDateActive').value.valueOf() > this.createOrEditForm.get('endDateActive').value.valueOf()) {
            this.notify.error('Ngày bắt đầu không được lớn hơn ngày kết thúc');
            return false;
        }
        if (this.createOrEditForm.get('numberStage').value != null &&
            this.createOrEditForm.get('numberStage').value <= 0) {
            this.notify.error('Số giai đoạn không được nhỏ hơn 0');
            return false;
        }
        return true;
    }
}
