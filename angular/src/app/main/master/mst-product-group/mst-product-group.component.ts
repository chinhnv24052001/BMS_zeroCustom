import { MstProductGroupDto, MstProjectDto, MstProductGroupServiceProxy } from '@shared/service-proxies/service-proxies';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';
import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { HttpClient } from '@angular/common/http';
import * as FileSaver from 'file-saver';
import { ceil } from 'lodash-es';
import { CreateOrEditMstProductGroupComponent } from './create-or-edit-mst-product-group/create-or-edit-mst-product-group.component';

@Component({
    selector: 'app-mst-product-group',
    templateUrl: './mst-product-group.component.html',
    styleUrls: ['./mst-product-group.component.less']
})
export class MstProductGroupComponent extends AppComponentBase implements OnInit {
    @ViewChild('createOrEditMstProduct', { static: true }) createOrEditMstProduct: CreateOrEditMstProductGroupComponent;

    projectForm: FormGroup;
    gridColDef: CustomColDef[];
    paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
    gridParams: GridParams | undefined;
    listProject: MstProductGroupDto[];
    selectedRow: MstProductGroupDto = new MstProductGroupDto();
    check = false;
    invNum;
    invSymbol;
    urlBase: string = AppConsts.remoteServiceBaseUrl;
    constructor(
        injector: Injector,
        private _serviceProxy: MstProductGroupServiceProxy,
        private formBuilder: FormBuilder,
        private _http: HttpClient,
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.buildForm();
        this.gridColDef = [
            {
                headerName: this.l('No.'),
                headerTooltip: this.l('No.'),
                cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
                maxWidth: 60,
                cellClass: 'text-center',
            },
            {
                headerName: this.l('ProductGroupCode'),
                headerTooltip: this.l('ProductGroupCode'),
                field: 'productGroupCode',
                minWidth: 140,
            },
            {
                headerName: this.l('ProductGroupName'),
                headerTooltip: this.l('ProductGroupName'),
                field: 'productGroupName',
                minWidth: 140,
            },
            {
                headerName: this.l('ParentGroupName'),
                headerTooltip: this.l('ParentGroupName'),
                field: 'parentGroupName',
                minWidth: 140,
            },
            {
                headerName: this.l('Status'),
                headerTooltip: this.l('Status'),
                field: 'status',
                cellRenderer: (params) => this.l(params.value),
                maxWidth: 100,
            },
        ]
    }

    buildForm() {
        this.projectForm = this.formBuilder.group({
            name: [undefined],
            code: [undefined],
        });
        this.searchProject();
    }

    callBackGrid(params: GridParams) {
        this.gridParams = params;
        params.api.setRowData([]);
    }

    onChangeSelection(params) {
        this.selectedRow = params.api.getSelectedRows()[0] ?? new MstProductGroupDto();
        this.selectedRow = Object.assign({}, this.selectedRow);
        this.check = true;
    }

    changePaginationParams(paginationParams: PaginationParamsModel) {
        if (!this.listProject) {
            return;
        }
        this.paginationParams = paginationParams;
        this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
        this.paginationParams.pageSize = paginationParams.pageSize;
        this.searchProject();
    }

    searchProject() {
        this.spinnerService.show();
        this._serviceProxy.getProductGroupSearch(
            this.projectForm.value.code,
            this.projectForm.value.name,
            '',
            this.paginationParams ? this.paginationParams.pageSize : 5000,
            this.paginationParams ? this.paginationParams.skipCount : 0,
        )
            .pipe(finalize(() => {
                this.spinnerService.hide();
            }))
            .subscribe((result) => {
                this.listProject = result.items;
                this.gridParams.api.setRowData(this.listProject);
                this.paginationParams.totalCount = result.totalCount;
                this.paginationParams.totalPage = ceil(result.totalCount / this.paginationParams.pageSize);
                this.gridParams.api.sizeColumnsToFit();
            });
    }

    export() {
        this.spinnerService.show();
        this._http.post(`${this.urlBase}/api/MasterExcelExport/MstProductGroupExportExcel`,
            {
                code: this.projectForm.value.code,
                name: this.projectForm.value.name,
            },
            { responseType: 'blob' }).pipe(finalize(() => {
                this.spinnerService.hide();
            })).subscribe(blob => {
                FileSaver.saveAs(blob, 'MstProductGroup.xlsx');
            });
    }
}
