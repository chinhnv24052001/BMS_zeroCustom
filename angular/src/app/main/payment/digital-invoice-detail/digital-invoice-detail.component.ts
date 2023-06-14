import { AgCellButtonRendererComponent } from './../../../shared/common/grid-input-types/ag-cell-button-renderer/ag-cell-button-renderer.component';
import { AppConsts } from './../../../../shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Component, Injector, Input, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { CustomColDef, GridParams, PaginationParamsModel } from "@app/shared/models/base.model";
import { DataFormatService } from "@app/shared/services/data-format.service";
import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { DigitalInvoiceInfoDto, DigitalInvoiceServiceProxy, InvoiceAkabotFileDto } from '@shared/service-proxies/service-proxies';
import { finalize } from 'rxjs/operators';
import { TABS } from '@app/shared/constants/tab-keys';
import { EventBusService } from '@app/shared/services/event-bus.service';
import { HttpClient } from '@angular/common/http';
import * as FileSaver from 'file-saver';

@Component({
  selector: "app-digital-invoice-detail",
  templateUrl: "./digital-invoice-detail.component.html",
  styleUrls: ["./digital-invoice-detail.component.less"]
})

export class DigitalInvoiceDetailComponent extends AppComponentBase implements OnInit {

    invoiceStatusList: any[] =[];
    searchForm: FormGroup;
    paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
    gridParams: GridParams | undefined;
    selectedRow: any;
    gridColDef: CustomColDef[];
    debtColDef: CustomColDef[];
    taxColDef: CustomColDef[];

    attachColDef:CustomColDef[];

    rowData: any[]=[{}];
    countTab = 0;

    @Input() params : any;

    digitalInvoiceDetail : any[]=[];
    selectedInvoice: DigitalInvoiceInfoDto = new DigitalInvoiceInfoDto();

    debtData = [];
    taxData = [];
    attachFileList : InvoiceAkabotFileDto[] = [];

    selectAttachFile: InvoiceAkabotFileDto = new InvoiceAkabotFileDto();
    attachFileParams : any;
    downloadUrl: string = '';
    frameworkComponents: any;

  constructor(
    injector: Injector,
    private dataFormat : DataFormatService,
    private _serviceProxy : DigitalInvoiceServiceProxy,
    private eventBus: EventBusService,
    private _http: HttpClient
 ) {
    super(injector);
    this.downloadUrl = AppConsts.remoteServiceBaseUrl + '/AttachFile/GetAttachFileToDownload';
    this.frameworkComponents = {
        agCellButtonComponent : AgCellButtonRendererComponent
    }
    this.gridColDef = [
        {
            headerName: '',
            headerTooltip: '',
            field: 'check',
            headerCheckboxSelection: true,
            headerCheckboxSelectionFilteredOnly: true,
            checkboxSelection: true,
            pinned: true,
            cellClass: ['check-box-center'],
            width: 20,
        },

        {
            // STT
            headerName: this.l('STT'),
            headerTooltip: this.l('STT'),
            pinned: true,
            cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
            width: 70,
        },
        {
            headerName: this.l('PoNo'),
            field: 'poNo',
            sortable: true,
        },
        {
            headerName: this.l('GoodName'),
            field: 'distDescription',
            sortable: true,
            flex:4
        },
        {
            headerName: this.l('Qty'),
            field: 'quantityInvoiced',
            sortable: true,
            flex:1,
            minWidth: 120
        },
        {
            headerName: this.l('Unit'),
            field: 'unitOfMeasure',
            sortable: true,
            flex:1,
        },
        {
            headerName: this.l('Price'),
            field: 'unitPrice',
            valueFormatter:param => param.value ? this.dataFormat.moneyFormat(param.value) : "",
            sortable: true,
            flex:1.5,
        },
        {
            headerName: this.l('Cost'),
            field: 'distAmount',
            valueFormatter:param => param.value ? this.dataFormat.moneyFormat(param.value) : "",
            sortable: true,
            flex:2,
        },
        {
            headerName: this.l('Tax Rate'),
            field: 'vatRate',
            sortable: true,
        },
        // {
        //     headerName: 'VAT',
        //     field: 'vat',
        //     valueFormatter:param => param.value ? this.dataFormat.moneyFormat(param.value) : "",
        //     sortable: true,
        // },
        // {
        //     headerName: 'TotalPay',
        //     field: '',
        //     valueFormatter:param => param.value ? this.dataFormat.moneyFormat(param.value) : "",
        //     sortable: true,
        // },
        // {
        //     headerName: 'Amount Deducted',
        //     field: 'amountDeducted',
        //     sortable: true,
        // },


    ];

    this.attachColDef = [
        {
            headerName: this.l('No.'),
            headerTooltip: this.l('No.'),
            cellRenderer: (params) => params.rowIndex + 1,
            cellClass: ['text-center'],
            flex: 0.1
        },
        {
            headerName: this.l('Download'),
            headerTooltip: this.l('Download'),
            cellClass: ['text-center'],
            cellRenderer: "agCellButtonComponent",
            buttonDef: {
                iconName: 'fa fa-file-download mr-0',
                className: 'grid-btn',
                function: params => this.dowloadAttachment(params),
            },
            flex: 0.2
        },
        {
            headerName: this.l('FileName'),
            headerTooltip: this.l('FileName'),
            cellClass: ['text-center'],
            field: 'originalFileName',
            flex: 1
        },
    ]


    this.taxColDef = [
        {
            // STT
            headerName: this.l('ExportTax'),
            field: '',
            flex:1,
        },
        {
            headerName: this.l('TaxMoney'),
            field: '',
            sortable: true,
            flex:2,
        },
    ]

    this.debtColDef = [
        {
            // STT
            headerName: this.l('Description'),
            field: '',
            flex:1,
        },
        {
            headerName: this.l('Money'),
            field: '',
            sortable: true,
            flex:2,
        },
    ]
  }


  ngOnInit() {
    this.selectedInvoice = this.params.selectedInvoice ??  new DigitalInvoiceInfoDto();
    // console.log(this.selectedInvoice)
    // console.log(this.selectedInvoice.status>=1);
    // console.log(this.selectedInvoice.status!=1);
    this.searchData();
  }

  callBackAttachGrid(params){
    this.attachFileParams = params;
  }

  onChangeAttachSelection(params){
    this.selectAttachFile = params.api.getSelectedRows()[0];
    this.selectAttachFile = Object.assign({}, this.selectAttachFile);
  }

  dowloadAttachment(params: any){
    console.log(params);
    this.spinnerService.show();
    this._http
        .get(this.downloadUrl, { params: { 'filename': params.data?.originalFileName, 'rootPath': params.data?.rootPath }, responseType: 'blob' })
        .pipe(finalize(() => this.spinnerService.hide()))
        .subscribe(blob => {
            if (blob == null) this.notify.warn(this.l('AttachmentIsNotExist'));
            else FileSaver.saveAs(blob, params.data.originalFileName)
        }, err => this.notify.warn(this.l('AttachmentIsNotExist')));
  }

  onChangeSelection(params) {
    // this.selectedRow =
     //   params.api.getSelectedRows()[0] ?? new InputRcvShipmentHeadersDto();
     // this.selectedRow = Object.assign({}, this.selectedRow);
   }

   callBackGrid(params: GridParams) {
     this.gridParams = params;
    //  params.api.setRowData([]);
   }

   searchData(){
    this.spinnerService.show();
    this._serviceProxy.getAllDigitalInvoiceDetailInfo(this.selectedInvoice.id)
    .pipe(finalize(()=> {
        this._serviceProxy.getAttachFile(this.selectedInvoice.id).subscribe(res => {
            this.attachFileList = res;
        })
        this.spinnerService.hide();

    }))
    .subscribe(res => {
        this.digitalInvoiceDetail = res

    })
   }

   compareInvoice(){
    this.eventBus.emit({
        type: 'openComponent',
        functionCode: TABS.COMPARE_INVOICE,
        tabHeader: this.l('CompareInvoice') + '-' + this.selectedInvoice.invoiceNum,
        params: {
            data: {
                selectedInvoice : this.selectedInvoice
            }
        }
    });
   }

   unMatchInvoice(){
    if (this.selectedInvoice.status != 1){
        this.notify.warn("Inv chưa đc match hoặc đã làm payment ko thể unmatch");
        return;
    }
    this._serviceProxy.unMatchInvoice(this.selectedInvoice.id)
    .pipe(finalize(()=> {
        this.spinnerService.hide();
    }))
    .subscribe((res) => {

    });
   }

   matchInvoice(){
    if (this.selectedInvoice.status > 0){
        this.notify.warn("Unmatch invoice trước khi xử lý tiếp");
        return;
    }
    this._serviceProxy.matchInvoice(this.selectedInvoice.id)
    .pipe(finalize(()=> {
        this.spinnerService.hide();
    }))
    .subscribe((res) => {
        this.eventBus.emit({
            type: 'openComponent',
            functionCode: TABS.COMPARE_INVOICE,
            tabHeader: this.l('CompareInvoice') + '-' + this.selectedInvoice.invoiceNum,

            params: {
                data: {
                    selectedInvoice : this.selectedInvoice
                }
            }
        });
    })
   }


   updatePoNo(){this.spinnerService.show();
    this._serviceProxy.updatePoNo(this.selectedInvoice.id, this.selectedInvoice.poNo)
    .pipe(finalize(()=> {
        this.spinnerService.hide();
    }))
    .subscribe((res) => {
        this.selectedInvoice = res;

        this.digitalInvoiceDetail.forEach(e => {
            e.poNo = this.selectedInvoice.poNo;
        });

        this.gridParams.api.refreshCells();
    })
   }

}
