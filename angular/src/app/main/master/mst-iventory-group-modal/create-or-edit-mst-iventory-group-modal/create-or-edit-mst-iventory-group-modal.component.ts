import { TmssSelectGridModalComponent } from './../../../../shared/common/grid-input-types/tmss-select-grid-modal/tmss-select-grid-modal.component';
import { CustomColDef, PaginationParamsModel } from './../../../../shared/models/base.model';
import { CommonAllGlCodeCombination, CommonGeneralCacheServiceProxy } from './../../../../../shared/service-proxies/service-proxies';
import { Component, ElementRef, EventEmitter, Injector, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { MstInventoryGroupDto, MstInventoryGroupServiceProxy } from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'create-or-edit-mst-iventory-group-modal',
    templateUrl: './create-or-edit-mst-iventory-group-modal.component.html',
    styleUrls: ['./create-or-edit-mst-iventory-group-modal.component.less'],
})
export class CreateOrEditMstIventoryGroupModalComponent extends AppComponentBase {
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
    @ViewChild('selectBudgetCodeModal', { static: true }) selectBudgetCodeModal!: TmssSelectGridModalComponent;

    @Output() close = new EventEmitter<any>();
    @Output() updateAfterEdit = new EventEmitter<any>();


    createOrEditForm: FormGroup;
    isEdit: boolean = false;
    isSubmit = false;
    selected: MstInventoryGroupDto = new MstInventoryGroupDto();
    userId;
    listStatus: { value: string, label: string; }[] = [{ value: 'N', label: this.l('InActive') }, { value: 'Y', label: this.l('Active') }];
    listHr;
    listProductGroup;
    duplicateName;
    duplicateCode;
    locations: { label: string, value: string }[] = [];
    purchasePurposes: { label: string, value: string }[] = [];
    organizations: { label: string, value: string }[] = [];

    budgetCodeColDefs: CustomColDef[] = [];
    defaultColDef = {
        floatingFilter: true,
        flex: false,
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

    constructor(
        injector: Injector,
        private _mstInventoryGroupServiceProxy: MstInventoryGroupServiceProxy,
        private formBuilder: FormBuilder,
        private _cacheProxy: CommonGeneralCacheServiceProxy
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.getCache();
        this.budgetCodeColDefs = [
            {
                headerName: this.l('BudgetCode'),
                headerTooltip: this.l('BudgetCode'),
                cellClass: ['text-left'],
                field: 'concatenatedSegments',
                flex: 1
            }
        ];
    }

    buildForm() {
        this.createOrEditForm = this.formBuilder.group({
            id: [0],
            productGroupCode: [undefined, GlobalValidator.required],
            productGroupName: [undefined, GlobalValidator.required],
            picDepartmentId: [undefined],
            purchaDepartmentId: [undefined],
            isCatalog: [undefined],
            description: [undefined],
            isInventory: [undefined],
            ur: [undefined],
            pr: [undefined],
            po: [undefined],
            status: ['Y'],
            productGroupId: [undefined],
            deliDepartmentId: [undefined],
            purchasePurpose: [''],
            organizationName: [''],
            location: [''],
            budgetCode: ['']
        });
    }

    closeModel() {
        this.modal.hide();
    }

    show(id?: number) {
        this.duplicateName = false;
        this.duplicateCode = false;
        this.buildForm();
        if (id && id > 0) {
            this.spinnerService.show();
            this.isEdit = true;
            this._mstInventoryGroupServiceProxy.getInventoryGroupById(id)
                .pipe(finalize(() => {
                }))
                .subscribe(val => {
                    setTimeout(() => {
                    this.createOrEditForm.patchValue(val);
                    }, 50);
                    this.spinnerService.hide();
                });
        }
        else {
            this.isEdit = false;
        }
        this.modal.show();
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
        this._mstInventoryGroupServiceProxy.createOrEdit(this.createOrEditForm.getRawValue())
            .pipe(finalize(() => {
                this.spinnerService.hide();
            }))
            .subscribe(val => {
                if (val.name == AppConsts.CPS_KEYS.DUPLICATE_NAME) {
                    this.duplicateName = true;
                    return;
                }
                else {
                    this.duplicateName = false;
                }
                if (val.code == AppConsts.CPS_KEYS.DUPLICATE_CODE) {
                    this.duplicateCode = true;
                    return;
                }
                else {
                    this.duplicateCode = false;
                }
                this.notify.success(this.l(AppConsts.CPS_KEYS.Saved_Successfully));
                this.close.emit();
                this.modal.hide();
            });
    }

    getCache() {
        this.listHr = [];
        this.listProductGroup = [];
        this.organizations = [];
        this.purchasePurposes = [];
        this.locations = [];

        this._mstInventoryGroupServiceProxy.getAllMstHr().subscribe((result) => {
            result.forEach(element => {
                this.listHr.push({ value: element.stringId, label: element.name });
            });
        });

        this._mstInventoryGroupServiceProxy.getAllProductGroup().subscribe((result) => {
            result.forEach(element => {
                this.listProductGroup.push({ value: element.id, label: element.name });
            });
        });

        this._cacheProxy.getAllLocations().subscribe(res => res.map(e => {
            this.locations.push({
                label: e.locationCode,
                value: e.locationCode
            })
        }));

        this._cacheProxy.getAllPurchasePurpose().subscribe(res => res.map(e => {
            this.purchasePurposes.push({
                label: e.purchasePurposeName,
                value: e.purchasePurposeName
            })
        }));

        this._cacheProxy.getAllOrganization().subscribe(res => res.map(e => {
            this.organizations.push({
                label: e.name,
                value: e.name
            })
        }));
    }

    selectBudget(params) {
        this.selectBudgetCodeModal.show(params);
    }

    patchBudgetCode(event: CommonAllGlCodeCombination) {
        this.createOrEditForm.get('budgetCode').setValue(event.concatenatedSegments);
    }

    getAllGlCode(budgetCode: string, paginationParams: PaginationParamsModel) {
        return this._cacheProxy.getAllGlCodeCombinations(
            budgetCode ?? '',
            paginationParams ? paginationParams.sorting : '',
            paginationParams ? paginationParams.pageSize : 20,
            paginationParams ? paginationParams.skipCount : 0
        );
    }
}
