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
    SegmentReadDataDto,
    SegmentExcelServiceProxy,
    BmsMstSegment1ServiceProxy,
    BmsMstSegment2ServiceProxy,
    BmsMstSegment3ServiceProxy,
    BmsMstSegment5ServiceProxy,
    BmsMstSegment4ServiceProxy,
    BmsMstPairingSegmentServiceProxy,
} from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { elementAt, finalize } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AppConsts } from '@shared/AppConsts';
import { FileUpload } from 'primeng/fileupload';
import { FileDownloadService } from '@shared/utils/file-download.service';

@Component({
    selector: 'bms-import-segment',
    templateUrl: './import-segment.component.html',
    styleUrls: ['./import-segment.component.less'],
})
export class BmsImportSegmentComponent extends AppComponentBase implements OnInit {
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
    uploadUrl: string;
    listItem: SegmentReadDataDto[];
    gridParams: GridParams | undefined;
    segNum: number = 0;
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
        private _egmentExcelServiceProxy: SegmentExcelServiceProxy,
        private _fileDownloadService: FileDownloadService,
        private _bmsMstSegment1ServiceProxy: BmsMstSegment1ServiceProxy,
        private _bmsMstSegment2ServiceProxy: BmsMstSegment2ServiceProxy,
        private _bmsMstSegment3ServiceProxy: BmsMstSegment3ServiceProxy,
        private _bmsMstSegment4ServiceProxy: BmsMstSegment4ServiceProxy,
        private _bmsMstSegment5ServiceProxy: BmsMstSegment5ServiceProxy,
        private _bmsMstPairingSegmentServiceProxy: BmsMstPairingSegmentServiceProxy,
    ) {
        super(injector);
        this.uploadUrl = AppConsts.remoteServiceBaseUrl + '/ImportExcel/BmsImportSegmentFromExcel';
    }

    ngOnInit(): void {
       
    }

    show(segNum) {
        this.segNum = segNum;
        // this.gridParams.api.setColumnDefs(this.gridColDef);   
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
                headerName: this.l('Period'),
                headerTooltip: this.l('Period'),
                field: 'periodName',
                maxWidth: 200,
            },
            {
                headerName: this.l('Code'),
                headerTooltip: this.l('Code'),
                field: 'code',
                maxWidth: 200,
                hide: this.segNum == 12345,
            },
            {
                headerName: this.l('Name'),
                headerTooltip: this.l('Name'),
                field: 'name',
                maxWidth: 300,
                hide: this.segNum == 12345,
            },
            {
                headerName: this.l('TypeCost'),
                headerTooltip: this.l('TypeCost'),
                field: 'typeCostName',
                hide: this.segNum != 1,
                maxWidth: 200,
            },
            {
                headerName: this.l('ProjectTypeName'),
                headerTooltip: this.l('ProjectTypeName'),
                field: 'projectTypeName',
                hide: this.segNum != 2,
                maxWidth: 200
            },
            {
                headerName: this.l('DepartmentName'),
                headerTooltip: this.l('DepartmentName'),
                field: 'departmentName',
                hide: this.segNum != 3,
                maxWidth: 200
            },
            {
                headerName: this.l('GroupSeg4Id'),
                headerTooltip: this.l('GroupSeg4Id'),
                field: 'groupSeg4Name',
                hide: this.segNum != 4,
                maxWidth: 200
            },

            //Budget plan import
              {
                headerName: this.l('Version'),
                headerTooltip: this.l('Version'),
                field: 'periodVersionName', 
                minWidth: 100,
                hide: this.segNum != 12345,
              },
              {
                headerName: this.l('Segment1Name'),
                headerTooltip: this.l('Segment1Name'),
                field: 'segment1Name', 
                minWidth: 200,
                hide: this.segNum != 12345,
              },
              {
                headerName: this.l('Segment2Name'),
                headerTooltip: this.l('Segment2Name'),
                field: 'segment2Name',
                minWidth: 200,
                hide: this.segNum != 12345,
              },
              {
                headerName: this.l('Segment3Name'),
                headerTooltip: this.l('Segment3Name'),
                field: 'segment3Name',
                minWidth: 200,
                hide: this.segNum != 12345,
              },
              {
                headerName: this.l('Segment4Name'),
                headerTooltip: this.l('Segment4Name'),
                field: 'segment4Name',
                minWidth: 200,
                hide: this.segNum != 12345,
              },
              {
                headerName: this.l('Segment5Name'),
                headerTooltip: this.l('Segment5Name'),
                field: 'segment5Name',
                minWidth: 200,
                hide: this.segNum != 12345,
              },
              {
                headerName: this.l('PairingText'),
                headerTooltip: this.l('PairingText'),
                field: 'pairingText',
                minWidth: 500,
                hide: this.segNum != 12345,
              },
              {
                headerName: this.l('Name'),
                headerTooltip: this.l('Name'),
                field: 'name',
                minWidth: 250,
                hide: this.segNum != 12345,
              },
              {
                headerName: this.l('Type'),
                headerTooltip: this.l('Type'),
                field: 'type',
                minWidth: 250,
                hide: this.segNum != 12345,
              },

            {
                headerName: this.l('Description'),
                headerTooltip: this.l('Description'),
                field: 'description',
                maxWidth: 400
            },
            {
                headerName: this.l('Status'),
                headerTooltip: this.l('Status'),
                field: 'isActive',
                hide: this.segNum != 5,
                cellRenderer: (params) => params.value ? this.l('Active') : this.l('InActive'),
                maxWidth: 100,
            },
            {
                headerName: this.l('Remark'),
                field: 'remark',
                width: 700,
                cellStyle: (params) => {
                    if (params.value) {
                        //mark police cells as red
                        return { color: 'yellow', backgroundColor: 'red' };
                    }
                    return null;
                },
            },
        ];
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
        formData.append('segNum', this.segNum.toString());
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
        this._egmentExcelServiceProxy.checkSaveAllImport(this.itemsImport).subscribe((res) => {
            if (res) {
                // if have remark
                this.notify.error(this.l('Import failed ! Please check the error message in the Remark column'));
            } else {

                switch (this.segNum) {
                    case 1:
                        this._bmsMstSegment1ServiceProxy.saveAllImport(this.itemsImport).subscribe(res => {
                            this.notify.success(this.l('Import Success'));
                            this.close.emit();
                            this.modal.hide();
                        });
                        break;
                    case 2:
                        this._bmsMstSegment2ServiceProxy.saveAllImport(this.itemsImport).subscribe(res => {
                            this.notify.success(this.l('Import Success'));
                            this.close.emit();
                            this.modal.hide();
                        });
                        break;
                    case 3:
                        this._bmsMstSegment3ServiceProxy.saveAllImport(this.itemsImport).subscribe(res => {
                            this.notify.success(this.l('Import Success'));
                            this.close.emit();
                            this.modal.hide();
                        });
                        break;
                    case 4:
                        this._bmsMstSegment4ServiceProxy.saveAllImport(this.itemsImport).subscribe(res => {
                            this.notify.success(this.l('Import Success'));
                            this.close.emit();
                            this.modal.hide();
                        });
                        break;
                    case 5:
                        this._bmsMstSegment5ServiceProxy.saveAllImport(this.itemsImport).subscribe(res => {
                            this.notify.success(this.l('Import Success'));
                            this.close.emit();
                            this.modal.hide();
                        });
                        break;
                    case 12345:
                            this._bmsMstPairingSegmentServiceProxy.saveAllImport(this.itemsImport).subscribe(res => {
                                this.notify.success(this.l('Import Success'));
                                this.close.emit();
                                this.modal.hide();
                            });
                            break;
                }

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
        this._egmentExcelServiceProxy
            .exportTemplate(this.segNum)
            .pipe(finalize(() => this.spinnerService.hide()))
            .subscribe((res) => {
                this._fileDownloadService.downloadTempFile(res);
            });
    }
}
