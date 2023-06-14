import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { HttpClient } from '@angular/common/http';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { InputSearchInventoryCodeConfigDto, MstInventoryCodeConfigDto, MstInventoryCodeConfigServiceProxy } from '@shared/service-proxies/service-proxies';
import { FileDownloadService } from '@shared/utils/file-download.service';
import * as FileSaver from 'file-saver';
import { ceil } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import { CreateOrEditInventoryCodeConfigComponent } from './create-or-edit-inventory-code-config/create-or-edit-inventory-code-config.component';

@Component({
  selector: 'app-mst-inventory-code-config',
  templateUrl: './mst-inventory-code-config.component.html',
  styleUrls: ['./mst-inventory-code-config.component.less']
})
export class MstInventoryCodeConfigComponent extends AppComponentBase implements OnInit {
    @ViewChild('createOrEdit', { static: true }) createOrEdit: CreateOrEditInventoryCodeConfigComponent;

    configForm: FormGroup;
    gridColDef: CustomColDef[];
    paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
    gridParams: GridParams | undefined;
    listConfig: MstInventoryCodeConfigDto[];
    selectedRow: MstInventoryCodeConfigDto = new MstInventoryCodeConfigDto();
    input: InputSearchInventoryCodeConfigDto = new InputSearchInventoryCodeConfigDto();
    check = false;
    invNum;
    invSymbol;
    urlBase: string = AppConsts.remoteServiceBaseUrl;
    constructor(
        injector: Injector,
        private _serviceProxy: MstInventoryCodeConfigServiceProxy,
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
                headerName: this.l('InventoryGroupCode'),
                headerTooltip: this.l('InventoryGroupCode'),
                field: 'inventoryGroupCode',
                minWidth: 140,
            },
            {
                headerName: this.l('InventoryGroup'),
                headerTooltip: this.l('InventoryGroup'),
                field: 'inventoryGroupName',
                minWidth: 140,
            },
            {
                headerName: this.l('CodeHeader'),
                headerTooltip: this.l('CodeHeader'),
                field: 'codeHeader',
            },
            {
                headerName: this.l('StartNum'),
                headerTooltip: this.l('StartNum'),
                field: 'startNum',
                cellClass: 'text-right',
                minWidth: 90,
            },
            {
                headerName: this.l('EndNum'),
                headerTooltip: this.l('EndNum'),
                field: 'endNum',
                cellClass: 'text-center',
            },
            {
                headerName: this.l('CurrentNum'),
                headerTooltip: this.l('CurrentNum'),
                field: 'currentNum',
                cellClass: 'text-center',
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
        this.configForm = this.formBuilder.group({
            inventoryGroupCode: [undefined],
            inventoryGroupName: [undefined],
        });
        this.searchProject();
    }

    callBackGrid(params: GridParams) {
        this.gridParams = params;
        params.api.setRowData([]);
    }

    onChangeSelection(params) {
        this.selectedRow = params.api.getSelectedRows()[0] ?? new MstInventoryCodeConfigDto();
        this.selectedRow = Object.assign({}, this.selectedRow);
        this.check = true;
    }

    changePaginationParams(paginationParams: PaginationParamsModel) {
        if (!this.listConfig) {
            return;
        }
        this.paginationParams = paginationParams;
        this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
        this.paginationParams.pageSize = paginationParams.pageSize;
        this.searchProject();
    }

    searchProject() {
        this.spinnerService.show();
        this._serviceProxy.getMstInventoryCodeConfigSearch(
            this.configForm.value.inventoryGroupCode,
            this.configForm.value.inventoryGroupName,
            '',
            this.paginationParams ? this.paginationParams.pageSize : 5000,
            this.paginationParams ? this.paginationParams.skipCount : 0,
        )
            .pipe(finalize(() => {
                this.spinnerService.hide();
            }))
            .subscribe((result) => {
                this.listConfig = result.items;
                this.gridParams.api.setRowData(this.listConfig);
                this.paginationParams.totalCount = result.totalCount;
                this.paginationParams.totalPage = ceil(result.totalCount / this.paginationParams.pageSize);
                this.gridParams.api.sizeColumnsToFit();
            });
    }

    export() {
        this.spinnerService.show();
        this._http.post(`${this.urlBase}/api/MasterExcelExport/GetMstProjectExportExcel`,
        {
            projectCode: this.configForm.value.projectCode,
            projectName: this.configForm.value.projectName,
        },
            { responseType: 'blob' }).pipe(finalize(() => {
                this.spinnerService.hide();
            })).subscribe(blob => {
                FileSaver.saveAs(blob,'MstInventoryConfig.xlsx');
            });
    }
}
