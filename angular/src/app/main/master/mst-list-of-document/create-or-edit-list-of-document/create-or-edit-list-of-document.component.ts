import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppComponentBase } from '@shared/common/app-component-base';
import { MstDocumentDto, MstDocumentServiceProxy } from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { trim } from 'lodash';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-create-or-edit-list-of-document',
  templateUrl: './create-or-edit-list-of-document.component.html',
  styleUrls: ['./create-or-edit-list-of-document.component.less']
})
export class CreateOrEditListOfDocumentComponent extends AppComponentBase implements OnInit {
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('submitBtn', { static: false }) submitBtn: ElementRef;
    @Input() selectedRow: MstDocumentDto = new MstDocumentDto();
    @Output() close = new EventEmitter<any>();
    @Output() updateAfterEdit = new EventEmitter<any>();
    createOrEditForm: FormGroup;
    isEditForm: boolean = false;
    isSubmit = false;
    listStatus = [
        { label: this.l('Active'), value: 'Y' },
        { label: this.l('InActive'), value: 'N' }
    ];
    listProcessType;
    listIventoryGroup;

    constructor(
        injector: Injector,
        private _serviceProxy: MstDocumentServiceProxy,
        private formBuilder: FormBuilder
    ) {
        super(injector);
    }

    ngOnInit(): void {

    }

    buildForm() {
        this.createOrEditForm = this.formBuilder.group({
            id: [0],
            documentCode: [undefined, GlobalValidator.required],
            documentName: [undefined, GlobalValidator.required],
            processTypeId: [undefined],
            inventoryGroupId: [undefined],
            isIrregular: [undefined],
            leadtime: [undefined],
            status: 'Y',
        });
    }

    create() {
        this.isEditForm = false;
        this.buildForm();
        this.getCache();
        this.modal.show();
    }
    edit() {
        this.isEditForm = true;
        this.getCache();
        this.createOrEditForm = this.formBuilder.group({
            id: this.selectedRow.id,
            documentCode: [this.selectedRow.documentCode, GlobalValidator.required],
            documentName: [this.selectedRow.documentName, GlobalValidator.required],
            processTypeId: this.selectedRow.processTypeId,
            inventoryGroupId: this.selectedRow.inventoryGroupId,
            isIrregular: this.selectedRow.isIrregular,
            leadtime: this.selectedRow.leadtime,
            status: this.selectedRow.status == 'Active' ? 'Y' : 'N',
        });
        this.modal.show();
    }

    closeModel() {
        if(!this.isEditForm)
        {
            this.selectedRow = null;
        }
        this.modal.hide();
    }

    reset() {
        this.createOrEditForm = undefined;
    }

    save() {
        this.createOrEditForm.get('isIrregular').value == true ? this.createOrEditForm.get('isIrregular').setValue(1) : this.createOrEditForm.get('isIrregular').setValue(0);
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
                this._serviceProxy
                    .mstDocumentUpdate(this.createOrEditForm.getRawValue())
                    .subscribe((val) => {
                        this.notify.success(val.replace('Info: ', ''));
                        this.modal.hide();
                        this.close.emit();
                        this.spinnerService.hide();
                        this.updateAfterEdit.emit();
                    });
            } else {
                this._serviceProxy
                    .mstDocumentInsert(this.createOrEditForm.getRawValue())
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

        return true;
    }

    getCache()
    {
        this.listIventoryGroup = [];
        this.listProcessType = [];
        this._serviceProxy.mstInventoryGroupGetAll().subscribe((val) => {
            val.forEach((element) => {
                this.listIventoryGroup.push({
                    label: element.name,
                    value: element.id,
                });
            });
        });
        this._serviceProxy.mstPRoductTypeGetAll().subscribe((val) => {
            val.forEach((element) => {
                this.listProcessType.push({
                    label: element.processTypeName,
                    value: element.id,
                });
            });
        });

    }
}
