import { finalize } from 'rxjs/operators';
import { DigitalInvoiceServiceProxy } from './../../../../shared/service-proxies/service-proxies';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Component, Injector, OnInit } from "@angular/core";
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { FormGroup } from '@angular/forms';
import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { EventBusService } from '@app/shared/services/event-bus.service';
import { TABS } from '@app/shared/constants/tab-keys';
import { ceil } from 'lodash-es';

@Component({
  selector: "app-digital-invoice",
  templateUrl: "./digital-invoice.component.html",
  styleUrls: ["./digital-invoice.component.less"]
})

export class DigitalInvoiceComponent extends AppComponentBase implements OnInit {


    searchForm: FormGroup;
    paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
    gridParams: GridParams | undefined;
    selectedRow: any;
    gridColDef: CustomColDef[];

    invoiceNum = "";
    serialNo = "";
    supplierNo = "";
     statusFilter = -1;
     invoiceStatusList = [
         {label: "", value : -1},
         {label: "Not Matching", value : 0},
         {label: "Matched", value : 1},
         {label: "Paid", value : 2},
         {label: "Cancel", value : 3},
     ]
    rowData: any[]=[];

   countTab = 0;


  constructor(injector: Injector,private dataFormat : DataFormatService,private eventBus: EventBusService,private _serviceProxy : DigitalInvoiceServiceProxy) {
    super(injector)

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
            headerName: this.l('InvoiceNo'),
            field: 'invoiceNum',
            sortable: true,
        },
        {
            headerName: this.l('SerialNo'),
            field: 'serialNo',
            sortable: true,
        },
        {
            headerName: this.l('SupplierName'),
            field: 'supplierName',
            minWidth: 150,
            sortable: true,
        },
        {
            headerName: this.l('InvoiceDate'),
            field: 'invoiceDate',
            valueGetter:param => param.data ? this.dataFormat.dateFormat(param.data.invoiceDate) : "",
            sortable: true,
        },
        {
            headerName: this.l('Status'),
            field: 'status',
            valueGetter: params => (params.data ) ? this.invoiceStatusList.find(e => e.value == params.data!.status)?.label : "",
            sortable: true,
        },
        {
            headerName: this.l('TotalAmountWithVAT'),
            field: '',
            sortable: true,
            minWidth: 150
        },
        // {
        //     headerName: this.l('Amount'),
        //     field: 'amount',
        //     sortable: true,
        // },
        // {
        //     headerName: this.l('VatAmount'),
        //     field: 'vatAmount',
        //     sortable: true,
        // },
        // {
        //     headerName: this.l('DistAmount'),
        //     field: 'distAmount',
        //     sortable: true,
        // },
        // {
        //     headerName: this.l('SellerTaxCode'),
        //     field: 'sellerTaxCode',
        //     sortable: true,
        // },
        {
            headerName: this.l('PoNo'),
            field: 'poNo',
            sortable: true,
        },
        // {
        //     headerName: 'Amount Deducted',
        //     field: 'amountDeducted',
        //     sortable: true,
        // },


    ]
  }


  ngOnInit() {
    // this.rowData.push({});
    this.searchData();
  }

  onChangeSelection(params) {
    this.selectedRow = params.api.getSelectedRows()[0];
     this.selectedRow = Object.assign({}, this.selectedRow);
   }

   callBackGrid(params: GridParams) {
     this.gridParams = params;
    //  params.api.setRowData([]);
   }

   changePaginationParams(paginationParams: PaginationParamsModel) {
     if (!this.rowData) {
       return;
     }
     this.paginationParams = paginationParams;
     this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
     this.paginationParams.pageSize = paginationParams.pageSize;
     this.searchData();
   }



    getList(){
        return this._serviceProxy.getAllDigitalInvoiceInfo(
            this.invoiceNum,
            this.serialNo,
            this.supplierNo,
            this.statusFilter,
            (this.paginationParams ? this.paginationParams.sorting : ''),
            (this.paginationParams ? this.paginationParams.pageSize : 20),
            (this.paginationParams ? this.paginationParams.skipCount : 1)
        );
    }

   searchData(){
    this.spinnerService.show();
    this.getList()
    .pipe(finalize(()=> {
        this.spinnerService.hide();
    }))
    .subscribe(res => {
        this.rowData = res.items;
        this.gridParams.api.setRowData(this.rowData);
        this.paginationParams.totalCount = res.totalCount;
        this.paginationParams.totalPage = ceil(res.totalCount / this.paginationParams.pageSize);
        this.gridParams.api.sizeColumnsToFit();
    })
   }

   viewInvoice(){

    this.eventBus.emit({
        type: 'openComponent',
        functionCode: TABS.DIGITAL_INVOICE_DETAIL,
        tabHeader: this.l('InvoiceDetail') + '-' + this.selectedRow.invoiceNum,

        params: {
            data: {
                selectedInvoice : this.selectedRow,

                countTab: this.countTab.toString(),
                editId: this.selectedRow.id
            }
        }
    });
    this.countTab += 1;



   }

   editInvoice(){

   }

   deleteInvoice(){

   }

   changeInvoiceStatus(){

   }

   downloadTemp(){

   }

   uploadInvoice(){

   }

   compareInvoice(){

   }
}
