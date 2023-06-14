import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { MstProductGroupDto, MstProductGroupServiceProxy } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup } from '@angular/forms';
import { trim } from 'lodash-es';

@Component({
    selector: 'app-create-or-edit-mst-product-group',
    templateUrl: './create-or-edit-mst-product-group.component.html',
    styleUrls: ['./create-or-edit-mst-product-group.component.less']
})
export class CreateOrEditMstProductGroupComponent extends AppComponentBase implements OnInit {
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('submitBtn', { static: false }) submitBtn: ElementRef;
    @Input() selectedRow: MstProductGroupDto = new MstProductGroupDto();
    @Output() close = new EventEmitter<any>();
    @Output() updateAfterEdit = new EventEmitter<any>();
    createOrEditForm: FormGroup;
    isEditForm: boolean = false;
    isSubmit = false;
    listStatus = [
        { label: this.l('Active'), value: 'Y' },
        { label: this.l('InActive'), value: 'N' }
    ]
    listParent : MstProductGroupDto [] = [];
    defaultColDef = {
        floatingFilter: true,
        flex:false,
        filter: "agTextColumnFilter",
        resizable: false,
        sortable: true,
        isViewSideBar: false,
        floatingFilterComponentParams: { suppressFilterButton: true }, 
        textFormatter: function (r) {
            if (r == null) return null;
            return r.toLowerCase();
        },
    };
    parentColdef;
    constructor(
        injector: Injector,
        private _serviceProxy: MstProductGroupServiceProxy,
        private formBuilder: FormBuilder
    ) {
        super(injector);
        this.parentColdef = [
            {
                headerName: this.l('ProductGroupCode'),
                headerTooltip: this.l('ProductGroupCode'),
                field: 'productGroupCode',
                cellClass: ['text-left'],
                flex: 1
            },
            {
                headerName: this.l('ProductGroupName'),
                headerTooltip: this.l('ProductGroupName'),
                field: 'productGroupName',
                cellClass: ['text-left'],
                flex: 1
            },
        ];
    }

    ngOnInit(): void {

    }

    buildForm() {
        this.createOrEditForm = this.formBuilder.group({
            id: [0],
            productGroupCode: [undefined],
            productGroupName: [undefined],
            parentId: [undefined],
            status: 'Y',
        });
    }

    create() {
        this.getParentId();
        this.isEditForm = false;
        this.buildForm();
        this.modal.show();
    }
    edit() {
        this.isEditForm = true;
        this.getParentId(this.selectedRow.id);
        this.createOrEditForm = this.formBuilder.group({
            id: this.selectedRow.id,
            productGroupCode: this.selectedRow.productGroupCode,
            productGroupName: this.selectedRow.productGroupName,
            parentId: this.selectedRow.parentId,
            status: this.selectedRow.status == 'Active' ? 'Y' : 'N',
        });
        this.modal.show();
    }

    closeModel() {
        if(!this.isEditForm){
            this.selectedRow = null;
        }
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
        if (this.isEditForm) {
            this._serviceProxy
                .mstProductGroupUpdate(this.createOrEditForm.getRawValue())
                .subscribe((val) => {
                    this.notify.success(val.replace('Info: ', ''));
                    this.modal.hide();
                    this.close.emit();
                    this.spinnerService.hide();
                    this.updateAfterEdit.emit();
                });
        } else {
            this._serviceProxy
                .mstProductGroupInsert(this.createOrEditForm.getRawValue())
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

    getParentId(id?: number)
    {
        this._serviceProxy.mstProductGroupGetParentId(id).subscribe((val) => {
            this.listParent = val;
        });
    }
}
