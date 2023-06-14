import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { HttpClient } from '@angular/common/http';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GetPurchasePurposeDto, InputPurchasePurposeDto, MstInventoryGroupDto, MstInventoryGroupServiceProxy, MstPurchasePurposeServiceProxy, MstUnitOfMeasureServiceProxy, UnitOfMeasureDto } from '@shared/service-proxies/service-proxies';
import * as FileSaver from 'file-saver';
import { ceil } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import { CreateOrEditMstIventoryGroupModalComponent } from './create-or-edit-mst-iventory-group-modal/create-or-edit-mst-iventory-group-modal.component';

@Component({
    selector: 'mst-iventory-group-modal',
    templateUrl: './mst-iventory-group-modal.component.html',
    styleUrls: ['./mst-iventory-group-modal.component.less']
})
export class MstIventoryGroupModalComponent extends AppComponentBase implements OnInit {
    @ViewChild('createOrEditMstIventoryGroupModal', { static: true }) createOrEditMstIventoryGroupModal: CreateOrEditMstIventoryGroupModalComponent;
    iventoryGroupForm: FormGroup;
    gridColDef: CustomColDef[];
    paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
    gridParams: GridParams | undefined;
    listIventoryGroup: MstInventoryGroupDto[];
    selectedRow: MstInventoryGroupDto = new MstInventoryGroupDto();
    urlBase: string = AppConsts.remoteServiceBaseUrl;

    constructor(
        injector: Injector,
        private _mstInventoryGroupServiceProxy: MstInventoryGroupServiceProxy,
        private formBuilder: FormBuilder,
        private _http: HttpClient,

    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.buildForm();
        this.gridColDef = [
            {
                headerName: this.l('STT'),
                headerTooltip: this.l('STT'),
                cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
                maxWidth: 70,
                minWidth: 50,
            },
            {
                headerName: this.l('CategoryType'),
                headerTooltip: this.l('CategoryType'),
                field: 'productName',
                minWidth: 120,
            },
            {
                headerName: this.l('InventoryGroupCode'),
                headerTooltip: this.l('InventoryGroupCode'),
                minWidth: 120,
                field: 'productGroupCode'
            },
            {
                headerName: this.l('InventoryGroup'),
                headerTooltip: this.l('InventoryGroup'),
                field: 'productGroupName',
                minWidth: 120,
            },
            {
                headerName: this.l('InventoryDepartment'),
                headerTooltip: this.l('InventoryDepartment'),
                minWidth: 130,
                field: 'departmentName'
            },
            {
                headerName: this.l('DepartmentInCharge'),
                headerTooltip: this.l('DepartmentInCharge'),
                field: 'purchaDepartmentName',
                minWidth: 150,
            },
            {
                headerName: this.l('DeliDepartment'),
                headerTooltip: this.l('DeliDepartment'),
                field: 'deliDepartmentName',
                minWidth: 150,
            },
            {
                headerName: this.l('Description'),
                headerTooltip: this.l('Description'),
                field: 'description',
                minWidth: 150
            },
            {
                headerName: this.l('Status'),
                headerTooltip: this.l('Status'),
                field: 'status',
                cellRenderer: (params) => this.l(params.value),
                cellClass: ['text-center'],
                minWidth: 100
            },
            {
                headerName: this.l('Catalog'),
                headerTooltip: this.l('Catalog'),
                field: 'isCatalog',
                cellRenderer: (params) => params.value ? `<div class="align-items-center"> <input type="checkbox" class="checkbox" disabled="disabled" checked="checked" /> </div>` : `<input type="checkbox" class="checkbox" disabled="disabled" />`,
                cellClass: ['text-center'],
                minWidth: 80,

            },
            {
                headerName: this.l('Inventory'),
                headerTooltip: this.l('Inventory'),
                field: 'isInventory',
                cellRenderer: (params) => params.value ? `<input type="checkbox" class="checkbox" disabled="disabled" checked="checked" />` : `<input type="checkbox" class="checkbox" disabled="disabled" />`,
                cellClass: ['text-center'],
                maxWidth: 100,
                minWidth: 80,

            },
            {
                headerName: this.l('UR'),
                headerTooltip: this.l('UR'),
                field: 'ur',
                cellRenderer: (params) => params.value ? `<input type="checkbox" class="checkbox" disabled="disabled" checked="checked" />` : `<input type="checkbox" class="checkbox" disabled="disabled" />`,
                cellClass: ['text-center'],
                minWidth: 80,

            },
            {
                headerName: this.l('PR'),
                headerTooltip: this.l('PR'),
                field: 'pr',
                cellRenderer: (params) => params.value ? `<input type="checkbox" class="checkbox" disabled="disabled" checked="checked" />` : `<input type="checkbox" class="checkbox" disabled="disabled" />`,
                cellClass: ['text-center'],
                minWidth: 80,

            },
            {
                headerName: this.l('PO'),
                headerTooltip: this.l('PO'),
                field: 'po',
                cellRenderer: (params) => params.value ? `<input type="checkbox" class="checkbox" disabled="disabled" checked="checked" />` : `<input type="checkbox" class="checkbox" disabled="disabled" />`,
                cellClass: ['text-center'],
                minWidth: 80,

            },
        ]
    }

    buildForm() {
        this.iventoryGroupForm = this.formBuilder.group({
            iventoryGroupName: [undefined],
            iventoryCode: [undefined]
        });
        this.searchInventoryGroup();
    }

    callBackGrid(params: GridParams) {
        this.gridParams = params;
        params.api.setRowData([]);
    }

    onChangeSelection(params) {
        this.selectedRow = params.api.getSelectedRows()[0] ?? new UnitOfMeasureDto();
        this.selectedRow = Object.assign({}, this.selectedRow);
        this.gridParams.api.sizeColumnsToFit();
    }

    changePaginationParams(paginationParams: PaginationParamsModel) {
        if (!this.listIventoryGroup) {
            return;
        }
        this.paginationParams = paginationParams;
        this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
        this.paginationParams.pageSize = paginationParams.pageSize;
        this.searchInventoryGroup();
    }

    searchInventoryGroup() {
        this.spinnerService.show();
        this._mstInventoryGroupServiceProxy.getAll(
            this.iventoryGroupForm.get('iventoryGroupName').value,
            this.iventoryGroupForm.get('iventoryCode').value,
            (this.paginationParams ? this.paginationParams.sorting : ''),
            (this.paginationParams ? this.paginationParams.pageSize : 20),
            (this.paginationParams ? this.paginationParams.skipCount : 1))
            .pipe(finalize(() => {
                this.spinnerService.hide();
            }))
            .subscribe((result) => {
                this.listIventoryGroup = result.items;
                this.gridParams.api.setRowData(this.listIventoryGroup);
                this.paginationParams.totalCount = result.totalCount;
                this.paginationParams.totalPage = ceil(result.totalCount / this.paginationParams.pageSize);
                this.gridParams.api.sizeColumnsToFit();
            });
    }

    add() {
        this.createOrEditMstIventoryGroupModal.show();
    }

    edit() {
        if (this.selectedRow.id && this.selectedRow.id > 0) {
            this.createOrEditMstIventoryGroupModal.show(this.selectedRow.id);
        } else {
            this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Edit));
        }
    }


    delete() {
        if (this.selectedRow.id && this.selectedRow.id > 0) {
            this.message.confirm('', this.l(AppConsts.CPS_KEYS.Are_You_Sure), (isConfirmed) => {
                if (isConfirmed) {
                    this.spinnerService.show();
                    this._mstInventoryGroupServiceProxy.deleteInventoryGroup(this.selectedRow.id).subscribe(val => {
                        this.notify.success('Successfully Deleted');
                        this.searchInventoryGroup();
                        this.spinnerService.hide();
                    });
                }
            });
        } else {
            this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Delete))
        }
    }

    exportExcell() {
        this.spinnerService.show();
        this._http.post(`${this.urlBase}/api/MasterExcelExport/MstInventoryGroupExportExcel`,
            {
                iventoryGroupName: this.iventoryGroupForm.value.iventoryGroupName,
                iventoryGroupCode: this.iventoryGroupForm.value.iventoryCode,

            },
            { responseType: 'blob' }).pipe(finalize(() => {
                this.spinnerService.hide();
            })).subscribe(blob => {
                FileSaver.saveAs(blob, 'MstInventoryGroup.xlsx');
            });
    }

}
