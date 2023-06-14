import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { GridParams, PaginationParamsModel } from './../../../shared/models/base.model';
import { Component, Injector, OnInit } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { AssessDetailInfoDto, AssessInfoDto, MstAssessServiceProxy } from '@shared/service-proxies/service-proxies';
import { ceil } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import { GridTableService } from '@app/shared/services/grid-table.service';

@Component({
  selector: "app-mst-assess",
  templateUrl: "./mst-assess.component.html",
  styleUrls: ["./mst-assess.component.scss"]
})

export class MstAssessComponent extends AppComponentBase implements OnInit {


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
    selectedRow: any;

    gridDetailParam: GridParams;
    selectedDetailRow : any;
    rowDataDetail = [];
    FilterText = "";


  constructor(injector: Injector,private _serviceProxy : MstAssessServiceProxy,private gridTableService: GridTableService) {
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
            flex: 0.2,
            maxWidth: 30,
        },
        {
            headerName: this.l('AssessName'),
            headerTooltip: this.l('AssessName'),
            field: 'assessName',
            flex: 1,
        },
    ];

    this.gridDetailColDef = [
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
    this._serviceProxy.getAssessDataInfo(
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

  searchDetailData(assessId)
    {
        this.spinnerService.show()
        this._serviceProxy.getAssessDetailDataInfo(assessId)
        .pipe(finalize(()=>{
            this.spinnerService.hide();
        }))
        .subscribe(res => {
            this.rowDataDetail = res;
            this.gridTableService.selectFirstRow(this.gridDetailParam.api);
        })
    }
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
    this.selectedRow = params.api.getSelectedRows()[0] ?? new AssessInfoDto();
    this.selectedRow = Object.assign({}, this.selectedRow);

    this.searchDetailData(this.selectedRow.id);
  }

    callBackDetailGrid(params){
    this.gridDetailParam = params;
  }

  onChangeDetailSelection(params){
    this.selectedDetailRow = params.api.getSelectedRows()[0] ?? new AssessDetailInfoDto();
    this.selectedDetailRow = Object.assign({}, this.selectedDetailRow);
  }

  deleteAssess(){
    this.message.confirm(
        this.l('DeleteThisAssess'),
        this.l('AreYouSure'),
        isConfirmed => {
            if (isConfirmed) {
                this.spinnerService.show();
                this._serviceProxy.deleteAssess(this.selectedRow.id)
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
                    this.searchDetailData(this.selectedRow.id);
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
        this.searchDetailData(this.selectedRow.id);
    }))
    .subscribe(res => {
        this.notify.success("SavedSuccessfully")
    })
  }

}
