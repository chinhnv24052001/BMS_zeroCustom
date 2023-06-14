import { ICellRendererParams } from '@ag-grid-community/core';
import { HttpClient } from '@angular/common/http';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { MstDocumentDto, MstDocumentServiceProxy } from '@shared/service-proxies/service-proxies';
import { FileDownloadService } from '@shared/utils/file-download.service';
import * as FileSaver from 'file-saver';
import { ceil } from 'lodash';
import { finalize } from 'rxjs/operators';
import { CreateOrEditListOfDocumentComponent } from './create-or-edit-list-of-document/create-or-edit-list-of-document.component';

@Component({
  selector: 'app-mst-list-of-document',
  templateUrl: './mst-list-of-document.component.html',
  styleUrls: ['./mst-list-of-document.component.less']
})
export class MstListOfDocumentComponent extends AppComponentBase implements OnInit {
    @ViewChild('createOrEdit', { static: true }) createOrEditMstProject: CreateOrEditListOfDocumentComponent;

    documentForm: FormGroup;
    gridColDef: CustomColDef[];
    paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
    gridParams: GridParams | undefined;
    listDocument: MstDocumentDto[];
    selectedRow: MstDocumentDto = new MstDocumentDto();
    input//: InputSearchMstDocument = new InputSearchMstDocument();
    check = false;
    urlBase: string = AppConsts.remoteServiceBaseUrl;
    constructor(
        injector: Injector,
       private _serviceProxy: MstDocumentServiceProxy,
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
                width: 45,
                cellClass: 'text-center',
            },
            {
                headerName: this.l('DocumentCode'),
                headerTooltip: this.l('DocumentCode'),
                field: 'documentCode',
                minWidth: 150,
            },
            {
                headerName: this.l('DocumentName'),
                headerTooltip: this.l('DocumentName'),
                field: 'documentName',
                minWidth: 150,
            },
            {
                headerName: this.l('TransactionType'),
                headerTooltip: this.l('TransactionType'),
                field: 'processTypeName',
                minWidth: 80,
            },
            {
                headerName: this.l('Irregular'),
                headerTooltip: this.l('Irregular'),
                field: 'isIrregular',
                cellClass: 'text-center',
                cellRenderer: (params) => params.data.isIrregular == 1 ? `<input style="margin-left : 35px;"  type="checkbox" class="checkbox" disabled="disabled" checked="checked" />` : `<input style="margin-left : 35px;" type="checkbox" class="checkbox" disabled="disabled" />`,
                width: 125,
            },
            {
                headerName: this.l('InventoryGroup'),
                headerTooltip: this.l('InventoryGroup'),
                field: 'productGroupName',
                cellClass: 'text-left',
                minWidth: 90,
            },
            {
                headerName: this.l('LeadTime'),
                headerTooltip: this.l('LeadTime'),
                field: 'leadtime',
                cellClass: 'text-right',
                minWidth: 80,
            },
            {
                headerName: this.l('Status'),
                headerTooltip: this.l('Status'),
                field: 'status',
                cellClass: 'text-center',
                minWidth: 80,
                cellRenderer: (params) => params.data.status == 'Active' ? this.l('Active') : this.l('InActive'),
            },

        ]
    }

    buildForm() {
        this.documentForm = this.formBuilder.group({
            code: [undefined],
            name: [undefined],
        });
        this.searchProject();
    }

    callBackGrid(params: GridParams) {
        this.gridParams = params;
        params.api.setRowData([]);
    }

    onChangeSelection(params) {
        this.selectedRow = params.api.getSelectedRows()[0] ?? new MstDocumentDto();
        this.selectedRow = Object.assign({}, this.selectedRow);
        this.check = true;
    }

    changePaginationParams(paginationParams: PaginationParamsModel) {
        if (!this.listDocument) {
            return;
        }
        this.paginationParams = paginationParams;
        this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
        this.paginationParams.pageSize = paginationParams.pageSize;
        this.searchProject();
    }

    searchProject() {
        this.spinnerService.show();
        this._serviceProxy.getMstDocumentSearch(
            this.documentForm.value.code,
            this.documentForm.value.name,
            '',
            this.paginationParams ? this.paginationParams.pageSize : 5000,
            this.paginationParams ? this.paginationParams.skipCount : 0,
        )
            .pipe(finalize(() => {
                this.spinnerService.hide();
            }))
            .subscribe((result) => {
                this.listDocument = result.items;
                this.gridParams.api.setRowData(this.listDocument);
                this.paginationParams.totalCount = result.totalCount;
                this.paginationParams.totalPage = ceil(result.totalCount / this.paginationParams.pageSize);
                this.gridParams.api.sizeColumnsToFit();
            });
    }

    export() {
        this.spinnerService.show();
        this._http.post(`${this.urlBase}/api/MasterExcelExport/MstDocumentExportExcel`,
        {
            projectCode: this.documentForm.value.code,
            projectName: this.documentForm.value.name,
        },
            { responseType: 'blob' }).pipe(finalize(() => {
                this.spinnerService.hide();
            })).subscribe(blob => {
                FileSaver.saveAs(blob,'MstDocument.xlsx');
            });
    }
}
