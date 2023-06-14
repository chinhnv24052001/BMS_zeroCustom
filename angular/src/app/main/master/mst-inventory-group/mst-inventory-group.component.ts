import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { Component, HostListener, Injector, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    MstHrOrgStructureServiceProxy,
    MstInventoryGroupDto,
    MstInventoryGroupServiceProxy,
} from '@shared/service-proxies/service-proxies';
import { ceil } from 'lodash-es';
import { CreateOrEditMstInventoryGroupComponent } from './create-oredit-mst-inventory-group/create-or-edit-mst-inventory-group.component';

@Component({
    selector: 'app-mst-inventory-group',
    templateUrl: './mst-inventory-group.component.html',
    styleUrls: ['./mst-inventory-group.component.css'],
})
export class MstInventoryGroupComponent extends AppComponentBase {
    @ViewChild('createOrEditMstInventoryGroupComponent', { static: true })
    createOrEditMstInventoryGroupComponent: CreateOrEditMstInventoryGroupComponent;
    gridColDef: CustomColDef[];
    paginationParams: PaginationParamsModel = {
        pageNum: 1,
        pageSize: 20,
        totalCount: 0,
        totalPage: 0,
        sorting: '',
        skipCount: 0,
    };
    gridParams: GridParams | undefined;
    listItem: MstInventoryGroupDto[];
    selectedRow: MstInventoryGroupDto = new MstInventoryGroupDto();
    groupList: MstInventoryGroupDto[];
    listHrOrgStructure: { value: string; label: string }[] = [];
    listUser: { value: number; label: string }[] = [];

    // click out side
    constructor(
        injector: Injector,
        private _mstInventoryGroupServiceProxy: MstInventoryGroupServiceProxy,
        private _mstHrOrgStructureServiceProxy: MstHrOrgStructureServiceProxy,
        private formBuilder: FormBuilder,
        private renderer: Renderer2
    ) {
        super(injector);
    }
    ngOnInit(): void {
        // get all group data
        this._mstInventoryGroupServiceProxy
            .getAll(
                '',
                '',
                this.paginationParams ? this.paginationParams.sorting : '',
                this.paginationParams ? this.paginationParams.pageSize : 20,
                this.paginationParams ? this.paginationParams.skipCount : 1
            )
            .subscribe((res) => {
                this.groupList = res.items;
            });
        this._mstHrOrgStructureServiceProxy.getAllActive().subscribe((val) => {
            val.forEach((element) => {
                this.listHrOrgStructure.push({
                    label: element.hrOrgStructureName,
                    value: element.id,
                });
            });
        });
        this.gridColDef = [
            {
                // STT
                headerName: this.l('STT'),
                headerTooltip: this.l('STT'),
                cellRenderer: (params: ICellRendererParams) =>
                    (
                        (this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! +
                        params.rowIndex +
                        1
                    ).toString(),
                width: 2,
            },
            {
                headerName: this.l('Product Group Name'),
                field: 'productGroupName',
            },
            {
                headerName: this.l('Product Group Code'),
                field: 'productGroupCode',
            },
            {
                headerName: this.l('Pic Department'),
                headerTooltip: this.l('PicDepartmentId'),
                field: 'departmentName',
                // cellRenderer: (params: ICellRendererParams) => {
                //     var label = this.listHrOrgStructure.find((x) => x.value == params.value);
                //     return label.label;
                // },
            },
            {
                headerName: this.l('User Name'),
                headerTooltip: this.l('User Name'),
                field: 'userName',
                // cellRenderer: (params: ICellRendererParams) => {
                //     var label = this.listHrOrgStructure.find((x) => x.value == params.value);
                //     return label.label;
                // },
            },
            {
                headerName: this.l('Catalog'),
                headerTooltip: this.l('Catalog'),
                field: 'isCatalog',
                cellRenderer: (params: ICellRendererParams) => {
                    if (params.value == true) {
                        return 'Yes';
                    } else {
                        return 'No';
                    }
                },
            },
        ];
    }

    callBackGrid(params: GridParams) {
        this.gridParams = params;
        params.api.setRowData([]);
    }
    onChangeSelection(params) {
        const selectedRow = params.api.getSelectedRows()[0] ?? new MstInventoryGroupDto();
        if (selectedRow) this.selectedRow = Object.assign({}, selectedRow);
    }
    changePaginationParams(paginationParams: PaginationParamsModel) {
        if (!this.listItem) {
            return;
        }
        this.paginationParams = paginationParams;
        this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
        this.paginationParams.pageSize = paginationParams.pageSize;
        this.searchItems();
    }
    searchItems() {
        this.spinnerService.show();
        this._mstInventoryGroupServiceProxy
            .getAll(
                '',
                '',
                this.paginationParams ? this.paginationParams.sorting : '',
                this.paginationParams ? this.paginationParams.pageSize : 20,
                this.paginationParams ? this.paginationParams.skipCount : 1
            )
            .subscribe((result) => {
                this.listItem = result.items;
                this.gridParams.api.setRowData(this.listItem);
                this.paginationParams.totalCount = result.totalCount;
                this.paginationParams.totalPage = ceil(result.totalCount / this.paginationParams.pageSize);
                this.gridParams.api.sizeColumnsToFit();
            });
        this.spinnerService.hide();
    }
    // addInventoryGroup() {
    //     // clear selected row
    //     this.selectedRow = new MstInventoryGroupDto();
    //     this.createOrEditMstInventoryGroupComponent.show(this.selectedRow);
    // }
    // editInventoryGroup() {
    //     if (!this.selectedRow.id) {
    //         // show notification select row
    //         this.notify.error(this.l('Please Select Row'));
    //     } else {
    //         this.createOrEditMstInventoryGroupComponent.show(this.selectedRow);
    //     }
    // }
    deleteInventoryGroup() {
        if (!this.selectedRow.id) {
            // show notification select row
            this.notify.error(this.l('Please Select Row'));
        } else {
            this.message.confirm(this.l('AreYouSure'), this.l('Delete'), (isConfirmed) => {
                if (isConfirmed) {
                    this._mstInventoryGroupServiceProxy.deleteInventoryGroup(this.selectedRow.id).subscribe(() => {
                        this.notify.success(this.l('SuccessfullyDeleted'));
                        this.searchItems();
                    });
                }
            });
        }
    }
}
