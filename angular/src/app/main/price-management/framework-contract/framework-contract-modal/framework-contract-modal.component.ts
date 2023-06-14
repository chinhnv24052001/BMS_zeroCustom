import { ImportAttachFileComponent } from './../../../../shared/common/import-attach-file/import-attach-file.component';
import { FileDto, PrcContractHeaderServiceProxy, GetAttachFileDto, PrcContractLineServiceProxy, PrcContractTemplateServiceProxy, PrcAppendixContractDto } from './../../../../../shared/service-proxies/service-proxies';
import { HttpClient } from '@angular/common/http';
import { AppComponentBase } from 'shared/common/app-component-base';
import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from "@angular/core";
import { GetAllContractHeaderDto } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GridParams, ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';
import { FileUpload } from 'primeng/fileupload';
import { FileDownloadService } from '@shared/utils/file-download.service';
import * as FileSaver from 'file-saver';
import { GridTableService } from '@app/shared/services/grid-table.service';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { ImportFromExcelComponent } from '@app/main/master/mst-inventory-item/importFromExcel/importFromExcel.component';

@Component({
    selector: "app-framework-contract-modal",
    templateUrl: "./framework-contract-modal.component.html",
    styleUrls: ["./framework-contract-modal.component.less"]
})

export class FrameworkContractModalComponent extends AppComponentBase implements OnInit {

    selectedData: PrcAppendixContractDto = new PrcAppendixContractDto();
    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
    @ViewChild("attach", { static: true }) attach: ImportAttachFileComponent;
    @Output() modalSave = new EventEmitter<any>();

    @ViewChild('importFromExcelComponent', { static: true })
    importFromExcelComponent: ImportFromExcelComponent;
    rowDataDetail: any[] = [];
    @Input() uploadData: any[] = [];
    @Input() viewOnly = false;
    @Input() isFrame = false;
    @Output() approveEvent: EventEmitter<any> = new EventEmitter();
    @Output() rejectEvent: EventEmitter<any> = new EventEmitter();
    @Output() requestMoreInfoEvent: EventEmitter<any> = new EventEmitter();
    @Output() forwardEvent: EventEmitter<any> = new EventEmitter();

    fileForDelete = [];
    tempFileList = [];
    gridDetailColDef: any;
    paginationParams = { pageNum: 1, pageSize: 5000, totalCount: 0 };

    constructor(
        injector: Injector,
        private _http: HttpClient,
        private _fileDownloadService: FileDownloadService,
        private _serviceProxy: PrcContractHeaderServiceProxy,
        private gridTableService: GridTableService,
        private _annex: PrcContractTemplateServiceProxy,
        private _lineApi: PrcContractLineServiceProxy,
        private format: DataFormatService,) {
        super(injector);


        this.gridDetailColDef = [
            {
                headerName: this.l('STT'),
                headerTooltip: this.l('STT'),
                cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
                width: 60,
                cellClass: 'text-center',
            },
            {
                headerName: this.l("InventoryGroup"),
                headerTooltip: this.l("InventoryGroup"),
                field: "invetoryGroupName",
                width: 130,
                cellClass: ["text-left"],
            },
            {
                headerName: this.l("CatalogName"),
                headerTooltip: this.l("CatalogName"),
                field: "catalogName",
                width: 130,
                cellClass: ["text-left"],
            },
            {
                headerName: this.l("PartNo"),
                headerTooltip: this.l("PartNo"),
                field: "partNo",
                width: 130,
                cellClass: ["text-left"],
            },
            {
                headerName: this.l("PartName"),
                headerTooltip: this.l("PartName"),
                field: "partName",
                width: 130,
                cellClass: ["text-left"],
            },
            {
                headerName: this.l("UnitOfMeasure"),
                headerTooltip: this.l("UnitOfMeasure"),
                field: "unitOfMeasure",
                width: 130,
                cellClass: ["text-left"],
            },
            {
                headerName: this.l("Qty"),
                headerTooltip: this.l("Qty"),
                field: "qtyStr",
                width: 130,
                cellClass: ["text-right"],
                valueFormatter: params => params.data ? this.format.moneyFormat(params.value) : "",
            },
            {
                headerName: this.l("UnitPrice"),
                headerTooltip: this.l("UnitPrice"),
                field: "unitPriceStr",
                width: 130,
                cellClass: ["text-right"],
                valueFormatter: params => params.data ? this.format.moneyFormat(params.value) : "",
            },
            {
                headerName: this.l("TaxPrice"),
                headerTooltip: this.l("TaxPrice"),
                field: "taxPriceStr",
                width: 130,
                cellClass: ["text-right"],
            },
            {
                headerName: this.l("TotalPrice"),
                headerTooltip: this.l("TotalPrice"),
                field: "salesAmount",
                width: 100,
                cellClass: ["text-right"],
                valueFormatter: params => params.data ? this.format.moneyFormat(params.value) : "",
            },
            {
                headerName: this.l("Description"),
                headerTooltip: this.l("Description"),
                field: "description",
                width: 150,
                cellClass: ["text-left"],
            },
            {
                headerName: this.l("Length"),
                headerTooltip: this.l("Length"),
                field: "length",
                width: 90,
                cellClass: ["text-left"],
                valueFormatter: params => params.data ? this.format.moneyFormat(params.value) : "",
            },
            {
                headerName: this.l("UnitLength"),
                headerTooltip: this.l("UnitLength"),
                field: "unitLength",
                width: 120,
                cellClass: ["text-left"],
            },
            {
                headerName: this.l("Width"),
                headerTooltip: this.l("Width"),
                field: "width",
                width: 100,
                cellClass: ["text-left"],
                valueFormatter: params => params.data ? this.format.moneyFormat(params.value) : "",
            },
            {
                headerName: this.l("UnitWidth"),
                headerTooltip: this.l("UnitWidth"),
                field: "unitWidth",
                width: 120,
                cellClass: ["text-left"],
            },
            {
                headerName: this.l("Height"),
                headerTooltip: this.l("Height"),
                field: "height",
                width: 100,
                cellClass: ["text-left"],
                valueFormatter: params => params.data ? this.format.moneyFormat(params.value) : "",
            },
            {
                headerName: this.l("UnitHeight"),
                headerTooltip: this.l("UnitHeight"),
                field: "unitHeight",
                width: 120,
                cellClass: ["text-left"],
            },
            {
                headerName: this.l("Weight"),
                headerTooltip: this.l("Weight"),
                field: "weight",
                width: 90,
                cellClass: ["text-left"],
                valueFormatter: params => params.data ? this.format.moneyFormat(params.value) : "",
            },
            {
                headerName: this.l("UnitWeight"),
                headerTooltip: this.l("UnitWeight"),
                field: "unitWeight",
                width: 120,
                cellClass: ["text-left"],
            },
            {
                headerName: this.l("Material"),
                headerTooltip: this.l("Material"),
                field: "material",
                width: 120,
                cellClass: ["text-left"],
            },
            {
                headerName: this.l("COO"),
                headerTooltip: this.l("COO"),
                field: "coo",
                width: 120,
                cellClass: ["text-left"],
            },
            {
                headerName: this.l("UnitOfProduct"),
                headerTooltip: this.l("UnitOfProduct"),
                field: "unitOfProduct",
                width: 120,
                cellClass: ["text-left"],
            },
            {
                headerName: this.l("UnitOfExchangeProduct"),
                headerTooltip: this.l("UnitOfExchangeProduct"),
                field: "unitOfExchangeProduct",
                width: 120,
                cellClass: ["text-left"],
            },
            {
                headerName: this.l("Producer"),
                headerTooltip: this.l("Producer"),
                field: "producer",
                width: 120,
                cellClass: ["text-left"],
            },
        ]
    }

    ngOnInit() {

    }
    show(id) {
        console.log(id);
        this.fileForDelete = [];
        this.tempFileList = [];
        this.spinnerService.show();
        this._annex.getAppendixDataById(id)
            .pipe(finalize(() => {
                this.spinnerService.hide()
            }))
            .subscribe(res => {
                this.rowDataDetail = res.listItems;
                this.selectedData = res.dtoAppendix;
            })

        this.modal.show();
    }
    close() {
        this.uploadData = [];
        this.modal.hide();
    }
}
