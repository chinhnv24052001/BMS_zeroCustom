import { ICellRendererParams } from "@ag-grid-community/core";
import { Component, Injector, OnInit } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import * as moment from "moment";

@Component({
  selector: "app-sourcing-list",
  templateUrl: "./sourcing-list.component.html",
  styleUrls: ["./sourcing-list.component.scss"]
})

export class SourcingListComponent extends AppComponentBase implements OnInit {

    paginationParams = {
        pageNum: 1,
        pageSize: 20,
        totalCount: 0,
        totalPage: 0,
        sorting: '',
        skipCount: 0,
    }

    gridColDef: any;
    rowData = [];
    FilterText = "";

    gridParam: any;

    selectedRow: any;

    inventoryGroupFilterId: any;

    inventoryGroupList: {label:string ,value : number}[] = []

    sourcingCodeFilter = "";
    sourcingNameFilter = "";
    effectiveFromDate = moment().local();
    effectiveToDate = moment().local();

  constructor(injector: Injector) {
    super(injector);

    this.gridColDef = [
        {
            // STT
            headerName: this.l('STT'),
            headerTooltip: this.l('STT'),
            cellRenderer: (params: ICellRendererParams) =>
                (
                    (this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! +
                    params.rowIndex +
                    1
                ).toString(),
            flex: 0.3,
            maxWidth: 30,
        },
        {
            headerName: this.l('SourcingCode'),
            headerTooltip: this.l('SourcingCode'),
            field: 'sourcingCode',
            flex: 1,
        },
        {
            headerName: this.l('SourcingName'),
            headerTooltip: this.l('SourcingName'),
            field: 'sourcingName',
            flex: 1,
        },
        {
            headerName: this.l('InventoryGroup'),
            headerTooltip: this.l('InventoryGroup'),
            field: 'inventoryGroupId',
            flex: 1,
        },

        {
            headerName: this.l('TotalAmount'),
            headerTooltip: this.l('TotalAmount'),
            field: 'totalAmount',
            flex: 1,
        },

        {
            headerName: this.l('EffectiveFromDate'),
            headerTooltip: this.l('EffectiveFromDate'),
            field: 'effectiveFromDate',
            flex: 1,
        },

        {
            headerName: this.l('EffectiveToDate'),
            headerTooltip: this.l('EffectiveToDate'),
            field: 'effectiveToDate',
            flex: 1,
        },

        {
            headerName: this.l('Status'),
            headerTooltip: this.l('Status'),
            field: 'status',
            flex: 1,
        },
    ];
  }

  ngOnInit() {

  }

  callBackGrid(params){
    this.gridParam = params;
  }

  changePaginationParams(params){

  }

  onChangeSelection(params){
    this.selectedRow = params.api.getSelectedRows()[0] ;
    this.selectedRow = Object.assign({}, this.selectedRow);

    // this.searchDetailData(this.selectedRow.id);
  }

  searchData(){

  }

  deleteSourcing(){

  }

  addSourcing(){

  }

  editSourcing(){

  }

}
