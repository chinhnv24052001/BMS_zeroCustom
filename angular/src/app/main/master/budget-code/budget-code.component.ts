import { AppComponentBase } from '@shared/common/app-component-base';
import { GridParams, ICellRendererParams } from "@ag-grid-enterprise/all-modules";
import { Component, Injector, OnInit } from "@angular/core";
import { PaginationParamsModel } from "@app/shared/models/base.model";
import { DataFormatService } from "@app/shared/services/data-format.service";
import { MstCurrencyServiceProxy, MstGlCodeCombinationServiceProxy, MstGlExchangeRateServiceProxy } from '@shared/service-proxies/service-proxies';
import { finalize } from 'rxjs/operators';
import { ceil } from 'lodash-es';

@Component({
  selector: "app-budget-code",
  templateUrl: "./budget-code.component.html",
  styleUrls: ["./budget-code.component.scss"]
})

export class BudgetCodeComponent extends AppComponentBase implements OnInit {

    cfilterText  ="";
    tabKey: number = 1;
    paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
    gridParams: any | undefined;
    selectedRow: any;
    gridColDef: any[];

    requestTypeList: any[]=[];
    filterText = "";

    fromDate;
    toDate;

    rowData: any[]=[];
  constructor(injector: Injector,private dataFormatService : DataFormatService,private _serviceProxy :MstGlCodeCombinationServiceProxy,private _curency :MstCurrencyServiceProxy) {
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
            headerName: this.l('BudgetCode'),
            field: 'concatenatedSegments',
            flex:1,
          },
          {
            headerName: this.l('ButgetName'),
            field: 'budgetName',
            flex:1,
          },
    ];
  }



  ngOnInit() {

  }

  getData(){

    return this._serviceProxy.getAllData(
        this.filterText,
        (this.paginationParams ? this.paginationParams.sorting : ''),
        (this.paginationParams ? this.paginationParams.pageSize : 20),
        (this.paginationParams ? this.paginationParams.skipCount : 1)
    );
  }

  searchData(){
    this.spinnerService.show();
    this.getData()
    .pipe(finalize(()=>{
        this.spinnerService.hide();
    }))
    .subscribe(val => {
        this.rowData = val.items;
        this.gridParams.api.setRowData(this.rowData);
        this.paginationParams.totalCount = val.totalCount;
        this.paginationParams.totalPage = ceil(val.totalCount / this.paginationParams.pageSize);

        // this.gridParams.api.sizeColumnsToFit();
    });
  }

  onChangeSelection(params) {
    // this.selectedRow =
    //    params.api.getSelectedRows()[0] ?? new SupplierRequestInfoDto();
    //  this.selectedRow = Object.assign({}, this.selectedRow);
   }

   callBackGrid(params: any) {
     this.gridParams = params;
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
