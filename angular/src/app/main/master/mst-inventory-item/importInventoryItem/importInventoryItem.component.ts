import { ICellRendererParams, ValueGetterParams } from '@ag-grid-enterprise/all-modules';
import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { AppComponentBase } from '@shared/common/app-component-base';
import {
    MstInventoryGroupServiceProxy,
    MstInventoryItemsDto,
    MstInventoryItemPriceServiceProxy,
    MstPurchasePurposeServiceProxy,
    MstInventoryItemsServiceProxy,
    ProductImportDto,
} from '@shared/service-proxies/service-proxies';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { GlobalValidator } from '@shared/utils/validators';
import { lowerFirst, slice } from 'lodash-es';
import { DateTime } from 'luxon';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { parse } from 'querystring';
import { elementAt, finalize } from 'rxjs/operators';
import * as XLSX from 'xlsx/xlsx';
import {HttpClient} from '@angular/common/http';
import { AppConsts } from '@shared/AppConsts';
import { FileUpload } from 'primeng/fileupload';
import { maxHeaderSize } from 'http';

@Component({
    selector: 'importInventoryItem',
    templateUrl: './importInventoryItem.component.html',
    styleUrls: ['./importInventoryItem.component.less'],
})
export class ImportInventoryItemComponent extends AppComponentBase implements OnInit {
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
    // itemDto: ImpInventoryItemDto = new ImpInventoryItemDto();
    listItem: ProductImportDto[];
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
        private _mstInventoryItemServiceProxy: MstInventoryItemsServiceProxy,
        private formBuilder: FormBuilder,
        private dataFormatService: DataFormatService,
        private _serviceProxy: MstInventoryItemsServiceProxy,
        private _fileDownloadService: FileDownloadService,
        private _httpClient: HttpClient,
    ) {
        super(injector);
        this.uploadUrl = AppConsts.remoteServiceBaseUrl + '/ImportExcel/ImportProductFromExcel';


    }

    ngOnInit(): void {
        this.buildForm();
        // get list inventory group
        this.gridColDef = [
            {
                // STT
                headerName: this.l('STT'),
                headerTooltip: this.l('STT'),
                cellRenderer: (params: ICellRendererParams) =>
                    (
                        params.rowIndex + 1
                    ).toString(),
                maxWidth: 50,
            },
            {
                headerName: 'Remark',
                field: 'remark',
                maxWidth: 500,
                cellStyle: (params) => {
                    if (params.value) {
                        //mark police cells as red
                        return { color: 'yellow', backgroundColor: 'red' };
                    }
                    return null;
                },
            },
            {
                headerName: this.l('InventoryGroupId'),
                field: 'productGroupName',
                width: 100,
            },
            {
                headerName: this.l('Catalog'),
                field: 'catalogName',
                width: 100,
            },
            {
                headerName: this.l('PartCode'),
                field: 'itemsCode',
                width: 100,
            },
            {
                headerName: this.l('Color'),
                field: 'color',
                maxWidth: 80,
            },
            {
                headerName: this.l('PartName'),
                field: 'itemsName',
                maxWidth: 120,
            },
            {
                headerName: this.l('PartNameBySupplier'),
                field: 'partNameSupplier',
                maxWidth: 300,
            },
            {
                headerName: this.l('Specification'),
                field: 'specification',
                maxWidth: 300,
            },
            {
                headerName: this.l('ApplicableProgram'),
                field: 'applicableProgram',
                maxWidth: 300,
            },
            {
                headerName: this.l('Supplier'),
                field: 'supplierName',
                maxWidth: 300,
            },
            {
                headerName: this.l('UnitOfMeasure'),
                field: 'unitOfMeasure',
                maxWidth: 90,
            },
            {
                headerName: this.l('Image'),
                field: 'productImage',
                maxWidth: 120,
            },
            {
                headerName: this.l('ConvertionUnitOfCode'),
                field: 'convertionUnitOfCode',
                maxWidth: 300,
            },
            {
                headerName: this.l('Producer'),
                field: 'producer',
                maxWidth: 300,
            },

            {
                headerName: this.l('Material'),
                field: 'material',
                maxWidth: 300,
            },

            {
                headerName: this.l('CountryOfOrigin'),
                field: 'origin',
                maxWidth: 300
            },
            {
                headerName: this.l('HowToPack'),
                field: 'howToPack',
                maxWidth: 100,
            },
            {
                headerName: this.l('AvailableTime'),
                field: 'availableTime',
                maxWidth: 100,
            },
            {
                headerName: this.l('Priority'),
                field: 'priority',
                maxWidth: 100,
            },
            {
                headerName: this.l('SafetyStockLevel'),
                field: 'safetyStockLevel',
                maxWidth: 100,
            },
            {
                headerName: this.l('MinimumQuantity'),
                field: 'minimumQuantity',
                maxWidth: 100,
                cellClass: ['text-right'],
            },
            {
                headerName: this.l('FactoryUse'),
                field: 'factoryUse',
                maxWidth: 100,
            },
            {
                headerName: this.l('Length'),
                field: 'length',
                maxWidth: 100,
                cellClass: ['text-right'],
            },
            {
                headerName: this.l('UnitLength'),
                field: 'unitLength',
                maxWidth: 100,
            },
            {
                headerName: this.l('Width'),
                field: 'width',
                maxWidth: 100,
                cellClass: ['text-right'],
            },
            {
                headerName: this.l('UnitWidth'),
                field: 'unitWidth',
                maxWidth: 100,
            },
            {
                headerName: this.l('Height'),
                field: 'height',
                maxWidth: 100,
                cellClass: ['text-right'],
            },
            {
                headerName: this.l('UnitHeight'),
                field: 'unitHeight',
                maxWidth: 100,
            },
            {
                headerName: this.l('Weight'),
                field: 'weight',
                maxWidth: 100,
                cellClass: ['text-right'],
            },
            {
                headerName: this.l('UnitWeight'),
                field: 'unitWeight',
                maxWidth: 100,
            },
        ];
    }
    buildForm() {
        this.createOrEditForm = this.formBuilder.group({
            id: [0],
            inventoryItemId: [undefined],
            partName: [undefined],
            organizationId: [undefined],
            inventoryGroupId: [undefined, GlobalValidator.required],
            isActive: 1,
            primaryUomCode: [undefined],
            primaryUnitOfMeasure: [undefined],
            partNo: [undefined],
            color: [undefined],
            itemType: [undefined],
        });
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

    save() {
        this.isSubmit = true;
        if (this.submitBtn) {
            this.submitBtn.nativeElement.click();
        }
        if (this.createOrEditForm.invalid) {
            return;
        }
        this.spinnerService.show();
        console.log(this.createOrEditForm.getRawValue());
    }

    //Upload in font
    onUpload(evt: any): void {
        const formData: FormData = new FormData();
        const file = evt.target.files[0];
        this.fileName = file.name;
        formData.append('file', file, file.name);
        this.itemsImport = [];
        /* wire up file reader */
        type AOA = any[][];
        const target: DataTransfer = <DataTransfer>evt.target;
        if (target.files.length !== 1) throw new Error('Cannot use multiple files');
        const reader: FileReader = new FileReader();
        reader.onload = (e: any) => {
            /* read workbook */
            const bstr: string = e.target.result;
            const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
            /* grab first sheet */
            const wsname: string = wb.SheetNames[0];
            const ws: XLSX.WorkSheet = wb.Sheets[wsname];
            /* save data */
            this.data = <AOA>XLSX.utils.sheet_to_json(ws, { header: 3 });

            for (var i = 1; i < this.data.length; i++) {
                // this.itemDto = new ImpInventoryItemDto();
                // this.itemDto.itemsCode = this.data[i][0];
                // this.itemDto.productGroupName = this.data[i][1];
                // this.itemDto.partNameSupplier = this.data[i][2];

                // this.itemsImport.push(this.itemDto);
            }
            this.listItem = this.itemsImport;
        };
        reader.readAsBinaryString(target.files[0]);
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

    // uploadExcel(data: { files: File }): void {
    //     const formData: FormData = new FormData();
    //     const file = data.files[0];
    //     formData.append('file', file, file.name);

    //     this._httpClient
    //     .post<any>(this.uploadUrl, formData)
    //     .pipe(finalize(() => this.excelFileUpload.clear()))
    //     .subscribe(response => {
    //         if (response.success) {
    //             this.itemsImport = response.result.report;
    //             this.listItem = this.itemsImport;
    //             this.notify.success(this.l('Read data success!'));
    //         }
    //         else if (response.error != null) {
    //             this.notify.warn(this.l('Fail to read data!'));
    //         }
    //         this.spinnerService.hide();
    //     });
    // }

    onUploadExcelError(): void {
        this.notify.error(this.l('ImportUsersUploadFailed'));
    }

    importExcel() {
        this._mstInventoryItemServiceProxy.createImpInventoryItemDto(this.itemsImport).subscribe((res) => {
            this.listItem = res;
            // if no remark => import success
            if (this.listItem.filter((x) => x.remark).length === 0) {
                this.notify.success(this.l('Import Success'));
                this.modal.hide();
            } else {
                this.notify.error(this.l('Import failed ! Please check the error message in the Remark column'));
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

    exportTemplate(params: number) {
        this.spinnerService.show();
        this._mstInventoryItemServiceProxy
            .exportTemplate(params)
            .pipe(finalize(() => this.spinnerService.hide()))
            .subscribe((res) => {
                this._fileDownloadService.downloadTempFile(res);
            });
    }
}
