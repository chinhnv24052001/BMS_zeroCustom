import { Params } from '@angular/router';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Component, Injector, Input, OnInit } from "@angular/core";
import { DigitalInvoiceServiceProxy } from '@shared/service-proxies/service-proxies';
import { FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { ICellRendererParams } from '@ag-grid-community/core';

@Component({
  selector: "app-compare-invoice",
  templateUrl: "./compare-invoice.component.html",
  styleUrls: ["./compare-invoice.component.scss"]
})

export class CompareInvoiceComponent extends AppComponentBase implements OnInit {

    @Input() params:  any ;
    selectedInvoice: any;

    searchForm: FormGroup;
    gridParams: GridParams | undefined;
    selectedRow: any;
    gridColDef: CustomColDef[];
    rowData = [];


    searchFilter = "";

    matchedStatusList = [
        {label: "", value : -1},
        {label: "New", value : 0},
        {label: "Auto Matched", value : 1},
        {label: "Un Matched", value : 2},
        {label: "ReMatched", value : 3},
    ]

    errorStatusList = [
        {label: " ", value : 0},
        {label: "Không khớp tên", value : 1},
        {label: "Không khớp Amt vói PO", value : 2},
        {label: "Không khớp Qty với Receiving", value : 3},
    ]

  constructor(injector:Injector,private _serviceProxy : DigitalInvoiceServiceProxy) {
    super(injector);

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
            cellRenderer: (params: ICellRendererParams) => ( params.rowIndex + 1).toString(),
            width: 70,
        },
        {
            headerName: 'InvoiceNo',
            field: 'invoiceNum',
            sortable: true,
            width: 150,
        },
        {
            headerName: 'PONum',
            field: 'poNo',
            sortable: true,
            width: 100,
        },
        {
            headerName: 'Status',
            field: 'status',
            valueGetter: params => (params.data ) ? this.matchedStatusList.find(e => e.value == params.data!.status)?.label : "",
            sortable: true,
            width: 200,
        },
        {
            headerName: 'Error',
            field: 'eInvErrorStatus',
            valueGetter: params => (params.data ) ? this.errorStatusList.find(e => e.value == params.data!.status)?.label : "",
            sortable: true,
            width: 300,
        },
        {
            headerName: 'Tên hàng hóa',
            children:[
                {
                    headerName: 'Invoice',
                    field: 'nameOnInvoice',
                    sortable: true,
                    width: 270,
                },
                {
                    headerName: 'NCC',
                    field: 'nameOnSupplier',
                    sortable: true,
                    width: 270,
                },
                {
                    headerName: 'PO',
                    field: 'nameOnPO',
                    sortable: true,
                    width: 270,
                },
            ],
            sortable: true,
        },
        {
            headerName: 'Số lượng',
            children:[
                {
                    headerName: 'OrderedQuantity',
                    field: 'quantityOrdered',
                    sortable: true,
                    width: 150,
                },
                {
                    headerName: 'DeliveriedQty',
                    field: 'quantityShipped',
                    sortable: true,
                    width: 150,
                },
                {
                    headerName: 'ReceivedQty',
                    field: 'quantityReceived',
                    sortable: true,
                    width: 150,
                },
                {
                    headerName: 'BilledQty',
                    field: 'quantityBilled',
                    sortable: true,
                    width: 150,
                },
                {
                    headerName: 'Invoice',
                    field: 'quantityInvoiced',
                    sortable: true,
                    width: 150,
                },
                {
                    headerName: 'Unit',
                    field: 'unitOfMeasure',
                    sortable: true,
                    width: 150,
                }
            ],
            sortable: true,
        },
        {
            headerName: 'Note',
            field: 'note',
            sortable: true,
            width: 150,
            cellClass: ['cell-clickable', 'cell-border'],
            editable: true,
        },
    ]
  }

  ngOnInit() {
    this.selectedInvoice = this.params.selectedInvoice;
    this.searchMatchData();
  }

  getData(){
    return this._serviceProxy.getDigitalInvoiceMatchResults(this.selectedInvoice.id);
  }

  searchMatchData(){
    this.getData().subscribe(res =>{
        this.rowData = res;
    })
  }

  confirmInvoice(){
    var isVendorNull = false; 
    var isItemNull = false; 
    
    this.rowData.forEach((obj) => {
        console.log(obj); 
        
    });

    this.rowData.filter(e => e.check == true).forEach((obj) => {
        console.log(obj.vendorId);
      if(!obj.vendorId){
        isVendorNull = true; 
      }

      if(!obj.itemId){
        isItemNull = true; 
      }

    }); 

    if (isVendorNull){ 
        this.notify.warn('Nhà cung cấp cho hóa đơn chưa được xác nhận!');
        return;
    }

    if (isItemNull){ 
        this.notify.warn('Item cho hóa đơn chưa được xác nhận!');
        return;
    }

    // this._serviceProxy.confirmInvoice(this.rowData).subscribe(res=>{

    // });
  }

  sendErrToSupplier(){

  }

  editReceiveInformation(){

  }

  onChangeSelection(params) {
    this.selectedRow = params.api.getSelectedRows()[0];
     this.selectedRow = Object.assign({}, this.selectedRow);
   }

   callBackGrid(params: GridParams) {
     this.gridParams = params;
    //  params.api.setRowData([]);
   }

}
