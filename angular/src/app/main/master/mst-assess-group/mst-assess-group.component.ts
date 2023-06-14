import {  ICellRendererParams } from "@ag-grid-enterprise/all-modules";
import { Component, Injector, OnInit } from "@angular/core";
import { GridParams, PaginationParamsModel } from "@app/shared/models/base.model";
import { GridTableService } from "@app/shared/services/grid-table.service";
import { AppComponentBase } from "@shared/common/app-component-base";
import { AssessGroupInfoDto, MstAssessServiceProxy } from "@shared/service-proxies/service-proxies";
import { ceil } from "lodash-es";
import { finalize } from "rxjs/operators";

@Component({
  selector: "app-mst-assess-group",
  templateUrl: "./mst-assess-group.component.html",
  styleUrls: ["./mst-assess-group.component.scss"]
})

export class MstAssessGroupComponent extends AppComponentBase implements OnInit {


    gridColDef: any;
    gridDetailColDef: any;


    paginationParams:PaginationParamsModel = {
        pageNum: 1,
        pageSize: 20,
        totalCount: 0,
        totalPage: 0,
        sorting: '',
        skipCount: 0,
    };
    rowData = [];
    gridParam: GridParams;
    selectedRow: AssessGroupInfoDto = new AssessGroupInfoDto();

    gridDetailParam: GridParams;
    selectedDetailRow : any;
    rowDataDetail = [];
    FilterText = "";


  constructor(injector: Injector,private _serviceProxy : MstAssessServiceProxy,private gridTableService: GridTableService) {
    super(injector);

    this.gridColDef = [
        {
            headerName: '',
            headerTooltip: '',
            headerClass: ['align-checkbox-header'],
            cellClass: ['check-box-center'],
            checkboxSelection: true,
            headerCheckboxSelection: true,
            headerCheckboxSelectionFilteredOnly: true,
            flex: 0.5,
            maxWidth: 30,
        },
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
            flex: 0.2,
            maxWidth: 30,
        },
        {
            headerName: this.l('AssessGroupType'),
            headerTooltip: this.l('AssessGroupType'),
            field: 'assessGroupType',
            flex: 0.5,
        },
        {
            headerName: this.l('AssessGroupCode'),
            headerTooltip: this.l('AssessGroupCode'),
            field: 'assessGroupCode',
            flex: 0.8,
        },
        {
            headerName: this.l('AssessGroupName'),
            headerTooltip: this.l('AssessGroupName'),
            field: 'assessGroupName',
            flex: 1.3,
        },
        {
            headerName: this.l('Description'),
            headerTooltip: this.l('Description'),
            field: 'description',
            flex: 2,
        },
    ];

    this.gridDetailColDef = [

        {
            headerName: this.l('AssessName'),
            headerTooltip: this.l('AssessName'),
            field: 'assessName',
            rowGroup: true,
            hide: true,
            flex: 1,
        },
        {
            headerName: this.l('AssessItemName'),
            headerTooltip: this.l('AssessItemName'),
            field: 'assessItemName',
            flex: 1,
        },
        {
            headerName: this.l('Description'),
            headerTooltip: this.l('Description'),
            field: 'description',
            flex: 1,
        },
        {
            headerName: this.l('RateValue'),
            headerTooltip: this.l('RateValue'),
            field: 'rateValue',
            flex: 1,
        },
    ];

  }



  ngOnInit() {
    this.paginationParams = {
        pageNum: 1,
        pageSize: 20,
        totalCount: 0,
        totalPage: 0,
        sorting: '',
        skipCount: 0,
    }
    this.searchData();
  }

  searchData(){
    this.spinnerService.show()
    this._serviceProxy.getAssessGroupDataInfo(
        this.FilterText,
        this.paginationParams ? this.paginationParams.sorting : '',
        this.paginationParams ? this.paginationParams.pageSize : 20,
        this.paginationParams ? this.paginationParams.skipCount : 1
    )
    .pipe(finalize(()=>{
        this.spinnerService.hide();
    }))
    .subscribe(res => {
        this.rowData = res.items;
        this.gridParam.api.setRowData(this.rowData);
        this.gridTableService.selectFirstRow(this.gridParam.api);
        this.paginationParams.totalCount = res.totalCount;
        this.paginationParams.totalPage = ceil(res.totalCount / this.paginationParams.pageSize);
    })
  }

//   searchDetailData(assessId)
//     {
//         this.spinnerService.show()
//         this._serviceProxy.getAssessDetailDataInfo(assessId)
//         .pipe(finalize(()=>{
//             this.spinnerService.hide();
//         }))
//         .subscribe(res => {
//             this.rowDataDetail = res;
//             this.gridTableService.selectFirstRow(this.gridDetailParam.api);
//         })
//     }
  callBackGrid(params){
    this.gridParam = params;
  }

  changePaginationParams(paginationParams){
    this.paginationParams = paginationParams;
    this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
    this.paginationParams.pageSize = paginationParams.pageSize;
    this.searchData()
  }

  onChangeSelection(params){
    this.selectedRow = params.api.getSelectedRows()[0] ?? new AssessGroupInfoDto();
    this.selectedRow = Object.assign({}, this.selectedRow);

    //this.searchDetailData(this.selectedRow.id);
  }

    callBackDetailGrid(params){
    this.gridDetailParam = params;
  }

  onChangeDetailSelection(params){
    this.selectedDetailRow = params.api.getSelectedRows()[0] ;
    this.selectedDetailRow = Object.assign({}, this.selectedDetailRow);
  }

  deleteAssessGroup(){
    this.message.confirm(
        this.l('DeleteThisAssess'),
        this.l('AreYouSure'),
        isConfirmed => {
            if (isConfirmed) {
                this.spinnerService.show();
                this._serviceProxy.deleteAssessGroup(this.selectedRow.id)
                .pipe(finalize(()=>{
                    this.spinnerService.hide();
                    this.searchData();
                }))
                .subscribe(res => {
                    this.notify.success("DeletedSuccessfully")
                });
            }
        }
    );

  }

  deleteAssessDetail(){
    this.message.confirm(
        this.l('DeleteThisAssessItem'),
        this.l('AreYouSure'),
        isConfirmed => {
            if (isConfirmed) {
                this.spinnerService.show();
                this._serviceProxy.deleteAssessDetail(this.selectedDetailRow.id)
                .pipe(finalize(()=>{
                    this.spinnerService.hide();
                    //this.searchDetailData(this.selectedRow.id);
                }))
                .subscribe(res => {
                    this.notify.success("DeletedSuccessfully")
                });
            }
        }
    );
  }

  saveAssess(params){
    this.spinnerService.show();
    this._serviceProxy.createOrEditAssess(params)
    .pipe(finalize(()=>{
        this.spinnerService.hide();
        this.searchData();

    }))
    .subscribe(res => {
        this.notify.success("SavedSuccessfully")
    })
  }

  saveAssessDetail(params){
    this.spinnerService.show();
    params.assessId = this.selectedRow.id;
    this._serviceProxy.createOrEditAssessDetail(params)
    .pipe(finalize(()=>{
        this.spinnerService.hide();
        //this.searchDetailData(this.selectedRow.id);
    }))
    .subscribe(res => {
        this.notify.success("SavedSuccessfully")
    })
  }

}
