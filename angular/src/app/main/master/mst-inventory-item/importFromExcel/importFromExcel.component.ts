import { PrcContractLineServiceProxy } from './../../../../../shared/service-proxies/service-proxies';
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
    ImpInventoryItemPriceDto,
    MstInventoryItemsServiceProxy,
} from '@shared/service-proxies/service-proxies';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { GlobalValidator } from '@shared/utils/validators';
import { lowerFirst, slice } from 'lodash-es';
import { DateTime } from 'luxon';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { parse } from 'querystring';
import { elementAt, finalize } from 'rxjs/operators';
import * as XLSX from 'xlsx';

@Component({
    selector: 'importFromExcel',
    templateUrl: './importFromExcel.component.html',
    styleUrls: ['./importFromExcel.component.less'],
})
export class ImportFromExcelComponent extends AppComponentBase implements OnInit {
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('submitBtn', { static: false }) submitBtn: ElementRef;
    @ViewChild('imgInput', { static: false }) InputVar: ElementRef;
    @Output() close = new EventEmitter<any>();
    @Output() updateAfterEdit = new EventEmitter<any>();
    gridColDef: CustomColDef[];

    @Input() contractHeaderId = 0;

    createOrEditForm: FormGroup;
    isEditForm: boolean = false;
    isSubmit = false;
    listInventoryGroup: { label: string; value: number | undefined }[] = [];
    fileName: any;
    itemsImport = [];
    data;
    itemDto: ImpInventoryItemPriceDto = new ImpInventoryItemPriceDto();
    listItem: ImpInventoryItemPriceDto[];
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
        private _mstInventoryItemPriceServiceProxy: MstInventoryItemPriceServiceProxy,
        private formBuilder: FormBuilder,
        private dataFormatService: DataFormatService,
        private _serviceProxy: MstInventoryItemsServiceProxy,
        private _fileDownloadService: FileDownloadService,
        private _line: PrcContractLineServiceProxy,
        private _mstInventoryItemsServiceProxy: MstInventoryItemsServiceProxy,
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.buildForm();
        // get list inventory group
        this.gridColDef = [
            {
                headerName: this.l('Remark'),
                field: 'remark',
                width: 400,
                cellStyle: (params) => {
                    if (params.value) {
                        //mark police cells as red
                        return { color: 'yellow', backgroundColor: 'red' };
                    }
                    return null;
                },
            },
            {
                headerName: this.l('PartNo'),
                field: 'itemsCode',
                width: 100,
            },
            {
                headerName: this.l('PartNameSupplier'),
                field: 'partNameSupplier',
                width: 300,
            },
            {
                headerName: this.l('Supplier'),
                field: 'supplierCode',
                width: 100,
                cellClass: ['text-right'],
            },
            {
                headerName: this.l('TaxPriceModal'),
                field: 'taxPrice',
                width: 100,
                cellClass: ['text-right'],
            },
            {
                headerName: this.l('UnitOfMeasure'),
                field: 'unitOfMeasure',
                width: 100,
                cellClass: ['text-right'],
            },
            {
                headerName: this.l('UnitPrice'),
                field: 'unitPrice',
                width: 150,
                cellClass: ['text-right'],
                cellRenderer: (params: ICellRendererParams) => {
                    return params.value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
                },
            },
            {
                headerName: this.l('Currency'),
                field: 'currencyCode',
                width: 50,
                cellClass: ['text-right'],
            },
            {
                headerName: this.l('EffectFrom'),
                field: 'effectiveFrom',
                width: 100,
                cellRenderer: (params: ICellRendererParams) => {
                    return moment(params.value).format('MM/DD/YYYY');
                },

                cellClass: ['text-right'],
            },
            {
                headerName: this.l('EffectTo'),
                field: 'effectiveTo',
                width: 100,
                cellRenderer: (params: ICellRendererParams) => {
                    return moment(params.value).format('MM/DD/YYYY');
                },
                cellClass: ['text-right'],
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
        // console.log('selected row', params);
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
        // console.log(this.createOrEditForm.getRawValue());
    }

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
            this.data = <AOA>XLSX.utils.sheet_to_json(ws, { header: 1 });
            for (var i = 1; i < this.data.length; i++) {

                // // console.log(i)
                // if(typeof(this.data[i][8]) !== undefined){
                //     var dateFrom = this.data[i][8].split('.');
                // }
                // if(typeof(this.data[i][9]) !== undefined){
                //     var dateTo = this.data[i][9].split('.');
                // }
                
                // // create new dates
                // var newDateFrom = new Date(dateFrom[2], dateFrom[1] - 1, dateFrom[0]);
                
                // var newDateTo = new Date(dateTo[2], dateTo[1] - 1, dateTo[0]);
                // this.data[i][8] = newDateFrom;
                // this.data[i][9] = newDateTo;
                // this.itemDto = new ImpInventoryItemPriceDto();
                // this.itemDto.itemsCode = this.data[i][1];
                // this.itemDto.partNameSupplier = this.data[i][2];
                // this.itemDto.supplierCode = this.data[i][3];
                // this.itemDto.taxPrice = this.data[i][4];
                // this.itemDto.unitOfMeasure = this.data[i][5];
                // this.itemDto.unitPrice = this.data[i][6];
                // this.itemDto.currencyCode = this.data[i][7];
                // this.itemDto.effectiveFrom = this.data[i][8];
                // this.itemDto.effectiveTo = this.data[i][9];
                // this.itemsImport.push(this.itemDto);

                // console.log(this.data)
                if(this.data[i].length > 0){
                    // var dateFrom = this.data[i][11]?.split('.');
                    // //create new dates
                    // var newDateFrom = new Date(dateFrom[2], dateFrom[1] - 1, dateFrom[0]);
                    // var dateTo = this.data[i][12]?.split('.');
                    // var newDateTo = new Date(dateTo[2], dateTo[1] - 1, dateTo[0]);
                    // this.data[i][11] = newDateFrom;
                    // this.data[i][12] = newDateTo;
                    this.itemDto = new ImpInventoryItemPriceDto();
                    this.itemDto.itemsCode = this.data[i][1];
                    this.itemDto.partNameSupplier = this.data[i][2];
                    this.itemDto.supplierCode = this.data[i][3];   //Thay doi thanh SupplierName
                    this.itemDto.taxPrice = this.data[i][4];
                    this.itemDto.unitOfMeasure = this.data[i][5];
                    this.itemDto.unitPrice = this.data[i][6];
                    this.itemDto.currencyCode = this.data[i][7];
                    this.itemDto.effectiveFrom = new Date((this.data[i][8]-25569)*86400000).toString();
                    this.itemDto.effectiveTo = new Date((this.data[i][9]-25569)*86400000).toString();
                    // this.itemDto.effectiveFrom = this.data[i][8];
                    // this.itemDto.effectiveTo = this.data[i][9];
                    this.itemsImport.push(this.itemDto);
                }
            }
            this.listItem = this.itemsImport;
            if (this.contractHeaderId != 0 && this.contractHeaderId != null && this.contractHeaderId != undefined) {
                this._line.saveToTempTable(this.listItem).subscribe(res => {
                })
            }
        };
        reader.readAsBinaryString(target.files[0]);

    }

    importExcel() {
        if (this.contractHeaderId != 0 && this.contractHeaderId != null && this.contractHeaderId != undefined){
            this._line.importAndGetData(this.contractHeaderId).subscribe(res => {
                if (!res.some(e => e.remark != "" && e.remark != null && e.remark != undefined)) {
                    this.notify.success(this.l('Import Success'))
                    this.updateAfterEdit.emit(null)
                    this.modal.hide();
                }
                else {
                    this.notify.error(this.l('Import failed ! Please check the error message in the Remark column'));
                    this.gridParams.api.setRowData(res)
                }
            })
        }
        else {
            this._mstInventoryItemPriceServiceProxy.createImpInventoryItemPriceDto(this.itemsImport).subscribe((res) => {
                this.listItem = res;
                // if no remark => import success
                if (this.listItem.filter((x) => x.remark).length === 0) {
                    this.notify.success(this.l('Import Success'));
                    this.updateAfterEdit.emit(null)
                    this.modal.hide();
                } else {
                    this.notify.error(this.l('Import failed ! Please check the error message in the Remark column'));
                }
            });
        }

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
        this._mstInventoryItemsServiceProxy
            .exportTemplate(params)
            .pipe(finalize(() => this.spinnerService.hide()))
            .subscribe((res) => {
                this._fileDownloadService.downloadTempFile(res);
            });
    }
}
