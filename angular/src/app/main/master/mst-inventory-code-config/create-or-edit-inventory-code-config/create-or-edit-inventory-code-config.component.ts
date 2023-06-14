import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppComponentBase } from '@shared/common/app-component-base';
import { MstInventoryCodeConfigDto, MstInventoryCodeConfigServiceProxy } from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { trim, forEach } from 'lodash-es';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
    selector: 'app-create-or-edit-inventory-code-config',
    templateUrl: './create-or-edit-inventory-code-config.component.html',
    styleUrls: ['./create-or-edit-inventory-code-config.component.less']
})
export class CreateOrEditInventoryCodeConfigComponent extends AppComponentBase implements OnInit {
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('submitBtn', { static: false }) submitBtn: ElementRef;
    @Input() selectedRow: MstInventoryCodeConfigDto = new MstInventoryCodeConfigDto();
    @Output() close = new EventEmitter<any>();
    @Output() updateAfterEdit = new EventEmitter<any>();
    createOrEditForm: FormGroup;
    isEditForm: boolean = false;
    isSubmit = false;
    listInevtoryGroup: any[] = [];
    listStatus = [
        { label: this.l('Active'), value: 'Y' },
        { label: this.l('InActive'), value: 'N' }
    ]

    constructor(
        injector: Injector,
        private _serviceProxy: MstInventoryCodeConfigServiceProxy,
        private formBuilder: FormBuilder
    ) {
        super(injector);
    }

    ngOnInit(): void {

    }

    buildForm() {
        this.createOrEditForm = this.formBuilder.group({
            id: [0],
            docCode: [undefined, GlobalValidator.required],
            inventoryGroupCode: [undefined],
            inventoryGroupName: [undefined],
            codeHeader: [undefined],
            startNum: [undefined],
            endNum: [undefined],
            currentNum: [0],
            status: 'Y',
        });
    }

    create() {
        this.getCache();
        this.isEditForm = false;
        this.buildForm();
        this.modal.show();
    }
    edit() {
        this.getCache();
        this.isEditForm = true;
        this.createOrEditForm = this.formBuilder.group({
            id: [this.selectedRow.id],
            docCode: [this.selectedRow.docCode],
            inventoryGroupCode: [this.selectedRow.inventoryGroupCode],
            inventoryGroupName: [this.selectedRow.inventoryGroupName],
            codeHeader: [this.selectedRow.codeHeader],
            startNum: [this.selectedRow.startNum],
            endNum: [this.selectedRow.endNum],
            currentNum: [this.selectedRow.currentNum],
            status: this.selectedRow.status == 'Active' ? 'Y' : 'N',
        });
        this.modal.show();
    }

    closeModel() {
        if(!this.isEditForm)
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
                this._serviceProxy
                    .mstInventoryCodeConfigUpdate(this.createOrEditForm.getRawValue())
                    .subscribe((val) => {
                        this.notify.success(val.replace('Info: ', ''));
                        this.modal.hide();
                        this.close.emit();
                        this.spinnerService.hide();
                        this.updateAfterEdit.emit();
                    });
            } else {
                this._serviceProxy
                    .mstInventoryCodeConfigInsert(this.createOrEditForm.getRawValue())
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
        if (this.createOrEditForm.get('inventoryGroupCode').value == null ||
            trim(this.createOrEditForm.get('inventoryGroupCode').value) == '') {
            this.notify.error('Mã nhóm hàng không được để trống');
            return false;
        }
        if (this.createOrEditForm.get('startNum').value > this.createOrEditForm.get('endNum')) {
            this.notify.error('Số bắt đầu được lớn hơn số kết thúc');
            return false;
        }
        return true;
    }
    getCache() {
        this.listInevtoryGroup = [];
        this._serviceProxy.getAllInventoryGroup().subscribe((val) => {
            forEach(val, (item) => {
                this.listInevtoryGroup.push({ label: item.docCode.replace(/ /g,''), value: trim(item.docCode.replace(/ /g,'')),name: item.inventoryGroupName,code: item.inventoryGroupCode});
            });
        });
        this.listInevtoryGroup = [...this.listInevtoryGroup];
    }
    setName()
    {
        let name = this.listInevtoryGroup.find(x => x.value == this.createOrEditForm.get('docCode').value);
        this.createOrEditForm.get('inventoryGroupCode').setValue(name.code);
        this.createOrEditForm.get('inventoryGroupName').setValue(name.name);
        let docCode = this.createOrEditForm.get('docCode').value.replace(/ /g, '');
        this.createOrEditForm.get('docCode').setValue(docCode);
    }
}
