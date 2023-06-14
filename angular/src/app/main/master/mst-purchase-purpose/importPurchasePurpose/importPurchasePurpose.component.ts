import { ICellRendererParams, ValueGetterParams } from '@ag-grid-enterprise/all-modules';
import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    MstPurchasePurposeServiceProxy,
    MstInventoryItemsServiceProxy,
    PurchasePurposeImportDto,
} from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { elementAt, finalize } from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import { AppConsts } from '@shared/AppConsts';
import { FileUpload } from 'primeng/fileupload';
import { FileDownloadService } from '@shared/utils/file-download.service';

@Component({
    selector: 'importPurchasePurpose',
    templateUrl: './importPurchasePurpose.component.html',
    styleUrls: ['./importPurchasePurpose.component.less'],
})
export class ImportPurchasePurposeComponent extends AppComponentBase implements OnInit {
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('submitBtn', { static: false }) submitBtn: ElementRef;
    @ViewChild('imgInput', { static: false }) InputVar: ElementRef;
    @Output() close = new EventEmitter<any>();
    @Output() updateAfterEdit = new EventEmitter<any>();
    @ViewChild('ExcelFileUpload', { static: false }) excelFileUpload: FileUpload;
    gridColDef: CustomColDef[];

    createOrEditForm: FormGroup;
    isEditForm: boolean = false;
    isSubmit = false;
    listInventoryGroup: { label: string; value: number | undefined }[] = [];
    fileName: any;
    itemsImport = [];
    data;
    uploadUrl : string;
    listItem: PurchasePurposeImportDto[];
    gridParams: GridParams | undefined;
    paginationParams: PaginationParamsModel = {
        pageNum: 1,
        pageSize: 20,
        totalCount: 0,
        totalPage: 0,
        sorting: '',
        skipCount: 0,
    };

    constructor(
        injector: Injector,
        private _httpClient: HttpClient,
        private _mstPurchasePurposeServiceProxy: MstPurchasePurposeServiceProxy,
        private _fileDownloadService: FileDownloadService
    ) {
        super(injector);
        this.uploadUrl = AppConsts.remoteServiceBaseUrl + '/ImportExcel/ImportPurchasePurposeFromExcel';
    }

    ngOnInit(): void {
        this.gridColDef = [
            {
                headerName: this.l('STT'),
                headerTooltip: this.l('STT'),
                cellRenderer: (params: ICellRendererParams) =>
                    (
                        params.rowIndex + 1
                    ).toString(),
                maxWidth: 50,
            },
            {
                headerName: this.l('PurchasePurposeName'),
                field: 'purchasePurposeName',
                // width: 100,
            },
            {
                headerName: this.l('PurchasePurposeCode'),
                field: 'purchasePurposeCode',
                // maxWidth: 80,
            },
            {
                headerName: this.l('HaveBudgetCode'),
                headerTooltip: this.l('HaveBudgetCode'),
                field: 'haveBudgetCode',
                cellRenderer: (params) => params.value == 1 ? `<input type="checkbox" class="checkbox" disabled="disabled" checked="checked" />` : `<input type="checkbox" class="checkbox" disabled="disabled" />`,
                cellClass: ['text-center'],
                maxWidth: 120
              },
              {
                headerName: this.l('Status'),
                headerTooltip: this.l('Status'),
                field: 'status',
                cellRenderer: (params) => params.value == 1 ?  this.l('Active') : this.l('InActive'),
                cellClass: ['text-center'],
                maxWidth: 120
              },
            {
                headerName: this.l('Remark'),
                field: 'remark',
                width: 500,
                cellStyle: (params) => {
                    if (params.value) {
                        //mark police cells as red
                        return { color: 'yellow', backgroundColor: 'red' };
                    }
                    return null;
                },
            },
        ];
    }

    show() {
        this.listItem = [];
        this.modal.show();
    }

    closeModel() {
        this.modal.hide();
    }
    callBackGrid(params: GridParams) {
        this.gridParams = params;
        params.api.setRowData([]);
    }
    changePaginationParams(paginationParams: PaginationParamsModel) {
        if (!this.listItem) {
            return;
        }
        this.paginationParams = paginationParams;
        this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
    }

    onChangeSelection(params) {
        console.log('selected row', params);
    }

    //upload to back end
    uploadExcel(evt: any): void {
        this.itemsImport = [];
        const formData: FormData = new FormData();
        // const file = data.files[0];
        const file = evt.target.files[0];
        this.fileName = file.name;
        formData.append('file', file, file.name); 
        this.spinnerService.show();
        this._httpClient
            .post<any>(this.uploadUrl, formData)
            .pipe(finalize(() => this.excelFileUpload.clear()))
            .subscribe(response => {
                if (response.success) {
                    this.itemsImport = response.result.report;
                    this.listItem = this.itemsImport;
                    this.notify.success(this.l('Read data success!'));
                } 
                else if (response.error != null) {
                    this.notify.warn(this.l('Fail to read data!'));
                }
                this.spinnerService.hide();
            });
    }

    onUploadExcelError(): void {
        this.notify.error(this.l('ImportUsersUploadFailed'));
    }

    importExcel() {
        this._mstPurchasePurposeServiceProxy.checkSaveAllImport(this.itemsImport).subscribe((res) => {
            if (res) {
                // if have remark
                this.notify.error(this.l('Import failed ! Please check the error message in the Remark column'));
            } else {
                this._mstPurchasePurposeServiceProxy.saveAllImport(this.itemsImport).subscribe(res => {
                    this.notify.success(this.l('Import Success'));
                    this.close.emit();
                        this.modal.hide();
                });
            }
        });
    }

    reset() {
        setTimeout(() => {
            this.InputVar.nativeElement.value = '';
            this.fileName = '';
            this.InputVar.nativeElement.click();
        }, 500);
    }

    //Export teamplate 
  exportTemplate() {
    this.spinnerService.show();
    this._mstPurchasePurposeServiceProxy
      .exportTemplate()
      .pipe(finalize(() => this.spinnerService.hide()))
      .subscribe((res) => {
        this._fileDownloadService.downloadTempFile(res);
      });
  }
}
