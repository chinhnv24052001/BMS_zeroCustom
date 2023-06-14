import { MstCatalogServiceProxy, MstInventoryGroupServiceProxy } from './../../../../shared/service-proxies/service-proxies';
import { ICellRendererParams } from "@ag-grid-enterprise/all-modules";
import { Component, Injector, OnInit } from "@angular/core";
import { GridParams, PaginationParamsModel } from "@app/shared/models/base.model";
import { DataFormatService } from "@app/shared/services/data-format.service";
import { AppComponentBase } from "@shared/common/app-component-base";
import { MstCurrencyServiceProxy, MstGlExchangeRateServiceProxy, SearchCatalogOutputDto, SearchOutputDto } from "@shared/service-proxies/service-proxies";
import { ceil } from "lodash-es";
import { finalize } from "rxjs/operators";

@Component({
  selector: "app-mst-catalog",
  templateUrl: "./mst-catalog.component.html",
  styleUrls: ["./mst-catalog.component.scss"]
})

export class MstCatalogComponent extends AppComponentBase implements OnInit {

    currencyValue = undefined;
    currencyList : any[] = [];
    tabKey: number = 1;
    paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
    gridParams: GridParams | undefined;
    selectedRow: SearchCatalogOutputDto = new SearchCatalogOutputDto();
    gridColDef: any[];

    requestTypeList: any[]=[];
    filterText = "";

    fromDate;
    toDate;

    rowData: any[]=[];
  constructor(injector: Injector,private dataFormatService : DataFormatService,private _serviceProxy :MstCatalogServiceProxy,private _curency :MstCurrencyServiceProxy,private inventoryGroup: MstInventoryGroupServiceProxy) {
    super(injector);
    this.gridColDef = [
        {
            // STT
            headerName: this.l('STT'),
            headerTooltip: this.l('STT'),
            cellRenderer: (params: ICellRendererParams) => ( params.rowIndex + 1).toString(),
            cellClass: ['text-center'],
            flex:0.2,
          },
          {
            headerName: this.l('CatalogCode'),
            field: 'catalogCode',
            flex:1,
          },
          {
            headerName: this.l('CatalogName'),
            field: 'catalogName',
            flex:1,
          },
          {
            headerName: this.l('InventoryGroup'),
            field: 'inventoryGroupId',
            valueFormatter: params => params.data ? this.inventoryGroupList.find(e => e.value == params.data.inventoryGroupId)?.label : "",
            flex:1,
          },
          {
            headerName: this.l('Status'),
            field: 'isActive',
            valueGetter : params => params.data && params.data.isActive == true ? this.l('Active') : this.l('InActive'),
            cellClass: ['text-center'],
            flex:1,
          },
    ]
  }

  inventoryGroupList: any[]=[];

  ngOnInit() {
    this.searchData();
    this.inventoryGroupList = [];
    this.spinnerService.show();
    this.inventoryGroup.getAllInventoryGroup()
    .pipe(finalize(()=>{
        this.spinnerService.hide();
    }))
    .subscribe(res => {
        res.forEach(e => {
            this.inventoryGroupList.push({
                label: e.productGroupName,
                value : e.id
            })
        })
    })

  }

  // getData(){

  //   return this._serviceProxy.getAllData(
  //       this.filterText,
  //       (this.paginationParams ? this.paginationParams.sorting : ''),
  //       (this.paginationParams ? this.paginationParams.pageSize : 20),
  //       (this.paginationParams ? this.paginationParams.skipCount : 1)
  //   )
  // }

  // searchData(){
  //   this.spinnerService.show();
  //   this.getData()
  //   .pipe(finalize(()=>{
  //       this.spinnerService.hide();
  //       this.selectedRow = new SearchCatalogOutputDto();
  //   }))
  //   .subscribe(val => {
  //       this.rowData = val.items;
  //       this.gridParams.api.setRowData(this.rowData);
  //       this.paginationParams.totalCount = val.totalCount;
  //       this.paginationParams.totalPage = ceil(val.totalCount / this.paginationParams.pageSize);

  //       // this.gridParams.api.sizeColumnsToFit();
  //   })
  // }

  searchData() {
    this.spinnerService.show();
    this._serviceProxy.getAllData(
      this.filterText,
      (this.paginationParams ? this.paginationParams.sorting : ''),
      (this.paginationParams ? this.paginationParams.pageSize : 20),
      (this.paginationParams ? this.paginationParams.skipCount : 1))
      .pipe(finalize(() => {
        this.spinnerService.hide();
      }))
      .subscribe((result) => {
        this.rowData = result.items;
        this.gridParams.api.setRowData(this.rowData);
        this.paginationParams.totalCount = result.totalCount;
        this.paginationParams.totalPage = ceil(result.totalCount / this.paginationParams.pageSize);
        this.gridParams.api.sizeColumnsToFit();
      });
  }

  onChangeSelection(params) {
    this.selectedRow =
       params.api.getSelectedRows()[0] ?? new SearchCatalogOutputDto();
     this.selectedRow = Object.assign({}, this.selectedRow);
   }

   callBackGrid(params: GridParams) {
    this.gridParams = params;
    params.api.setRowData([]);
  }

   deleteRow(){
    this.spinnerService.show();
    this._serviceProxy.delete(this.selectedRow.id)
    .pipe(finalize(()=>{
        this.searchData()
        this.spinnerService.hide();
    }))
    .subscribe(res => {
        this.notify.success("Deleted Successfully")
    });
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
   
}
