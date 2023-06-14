import { FileDownloadService } from './../../../../shared/utils/file-download.service';
import { DataFormatService } from './../../../shared/services/data-format.service';
import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { AppComponentBase } from '@shared/common/app-component-base';
import { InputSearchMstProject, MstProjectDto, MstProjectServiceProxy } from '@shared/service-proxies/service-proxies';
import { ceil } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import { CreateOrEditMstProjectComponent } from './create-or-edit-mst-project/create-or-edit-mst-project.component';
import { HttpClient } from '@angular/common/http';
import { AppConsts } from '@shared/AppConsts';
import * as saveAs from 'file-saver';
import * as FileSaver from 'file-saver';

@Component({
    selector: 'app-mst-project',
    templateUrl: './mst-project.component.html',
    styleUrls: ['./mst-project.component.less']
})
export class MstProjectComponent extends AppComponentBase implements OnInit {
    @ViewChild('createOrEditMstProject', { static: true }) createOrEditMstProject: CreateOrEditMstProjectComponent;

    projectForm: FormGroup;
    gridColDef: CustomColDef[];
    paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
    gridParams: GridParams | undefined;
    listProject: MstProjectDto[];
    selectedRow: MstProjectDto = new MstProjectDto();
    input: InputSearchMstProject = new InputSearchMstProject();
    check = false;
    invNum;
    invSymbol;
    urlBase: string = AppConsts.remoteServiceBaseUrl;
    constructor(
        injector: Injector,
        private _mstProjectServiceProxy: MstProjectServiceProxy,
        private formBuilder: FormBuilder,
        private dataFormatService: DataFormatService,
        private _http: HttpClient,
        private _fileDownloadService: FileDownloadService


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
                maxWidth: 80,
                cellClass: 'text-center',

            },
            {
                headerName: this.l('ProjectCode'),
                headerTooltip: this.l('ProjectCode'),
                field: 'projectCode',
                minWidth: 140,
            },
            {
                headerName: this.l('ProjectName'),
                headerTooltip: this.l('ProjectName'),
                field: 'projectName',
                minWidth: 140,
            },
            {
                headerName: this.l('ProCategory'),
                headerTooltip: this.l('ProCategory'),
                field: 'category',
            },
            {
                headerName: this.l('NumberStage'),
                headerTooltip: this.l('NumberStage'),
                field: 'numberStage',
                cellClass: 'text-right',
                minWidth: 90,
            },
            {
                headerName: this.l('StartDateActive'),
                headerTooltip: this.l('StartDateActive'),
                field: 'startDateActive',
                cellClass: 'text-center',
                valueGetter: (params) =>
                    params.data ? this.dataFormatService.dateFormat(params.data?.startDateActive) : '',
            },
            {
                headerName: this.l('EndDateActive'),
                headerTooltip: this.l('EndDateActive'),
                field: 'endDateActive',
                cellClass: 'text-center',
                valueGetter: (params) =>
                    params.data ? this.dataFormatService.dateFormat(params.data?.endDateActive) : '',
            },
            {
                headerName: this.l('Status'),
                headerTooltip: this.l('Status'),
                field: 'status',
                cellRenderer: (params) => this.l(params.value),
                cellClass: 'text-center',
            },

        ]
    }

    buildForm() {
        this.projectForm = this.formBuilder.group({
            projectName: [undefined],
            projectCode: [undefined],
        });
        this.searchProject();
    }

    callBackGrid(params: GridParams) {
        this.gridParams = params;
        params.api.setRowData([]);
    }

    onChangeSelection(params) {
        this.selectedRow = params.api.getSelectedRows()[0] ?? new MstProjectDto();
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
        this._mstProjectServiceProxy.getMstProjectSearch(
            this.projectForm.value.projectCode,
            this.projectForm.value.projectName,
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
        this._http.post(`${this.urlBase}/api/MasterExcelExport/GetMstProjectExportExcel`,
        {
            projectCode: this.projectForm.value.projectCode,
            projectName: this.projectForm.value.projectName,
        },
            { responseType: 'blob' }).pipe(finalize(() => {
                this.spinnerService.hide();
            })).subscribe(blob => {
                FileSaver.saveAs(blob,'MstProject.xlsx');
            });
    }
}
