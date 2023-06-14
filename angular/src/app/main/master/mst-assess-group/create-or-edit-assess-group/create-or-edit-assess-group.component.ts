import { forEach } from 'lodash-es';
import { ICellRendererParams } from "@ag-grid-enterprise/all-modules";
import { LocationStrategy } from "@angular/common";
import { Component, EventEmitter, Injector, OnInit, Output, ViewChild } from "@angular/core";
import { PaginationParamsModel } from "@app/shared/models/base.model";
import { GridTableService } from "@app/shared/services/grid-table.service";
import { HttpClient } from "@microsoft/signalr";
import { AppConsts } from "@shared/AppConsts";
import { AppComponentBase } from "@shared/common/app-component-base";
import { AssessDetailInfoDto, AssessGroupInfoDto, AssessInfoDto, MstAssessServiceProxy } from "@shared/service-proxies/service-proxies";
import { ModalDirective } from "ngx-bootstrap/modal";
import { finalize } from "rxjs/operators";

@Component({
  selector: "app-create-or-edit-assess-group",
  templateUrl: "./create-or-edit-assess-group.component.html",
  styleUrls: ["./create-or-edit-assess-group.component.scss"]
})

export class CreateOrEditAssessGroupComponent extends AppComponentBase implements OnInit {

    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
    @ViewChild("listAssess", { static: true }) listAssess: any;
    detailColDef:any;
    rowData = [];

    gridParams: any;
    selectedDetail:any;

    selectedNode: any;

    selectedAssess : AssessGroupInfoDto = new AssessGroupInfoDto();

    detailSelectColDef: any;

    typeList = [
        {label:"sourcing" , value: "src"}
    ]

    paginationParams:PaginationParamsModel = {
        pageNum: 1,
        pageSize: 20,
        totalCount: 0,
        totalPage: 0,
        sorting: '',
        skipCount: 0,
    };

    @Output() modalSave = new EventEmitter<any>();
    constructor(injector: Injector,private _serviceProxy : MstAssessServiceProxy, private gridTableService : GridTableService) {
    super(injector);

    this.detailColDef = [
        {
            headerName: this.l('AssessName'),
            headerTooltip: this.l('AssessName'),
            field: 'assessName',
            //editable: true,
            // rowGroup: true,
            // hide:true,
            flex: 1,
        },
        // {
        //     headerName: this.l('AssessItemName'),
        //     headerTooltip: this.l('AssessItemName'),
        //     field: 'assessItemName',
        //     // editable: true,
        //     // cellClass: ['cell-clickable'],
        //     flex: 1,
        // },
        // {
        //     headerName: this.l('Description'),
        //     headerTooltip: this.l('Description'),
        //     field: 'description',
        //     // cellClass: ['cell-clickable'],
        //     // editable: true,
        //     flex: 1,
        // },
        {
            headerName: this.l('RateValue'),
            headerTooltip: this.l('RateValue'),
            field: 'rateValue',
            cellClass: ['cell-clickable','text-tight'],
            editable: true,
            flex: 1,
        },
    ];

    this.detailSelectColDef = [
        {
            headerName: "",
            headerTooltip: "",
            field: "checked",
            headerClass: ["align-checkbox-header"],
            cellClass: ["check-box-center"],
            // rowDrag : true,
            checkboxSelection: true,
            headerCheckboxSelection: true,
            headerCheckboxSelectionFilteredOnly: true,
            flex:0.1,
            // rowGroup: true,
            // hide: true,
        },
        {
            headerName: this.l('AssessName'),
            headerTooltip: this.l('AssessName'),
            field: 'assessName',
            // rowGroup: true,
            // hide: true,
            // editable: true,
            //rowGroup: true,
            flex: 1,
        },
        // {
        //     headerName: this.l('AssessItemName'),
        //     headerTooltip: this.l('AssessItemName'),
        //     field: 'assessItemName',
        //     // editable: true,
        //     // cellClass: ['cell-clickable'],
        //     flex: 1,
        // },
        // {
        //     headerName: this.l('Description'),
        //     headerTooltip: this.l('Description'),
        //     field: 'description',
        //     // cellClass: ['cell-clickable'],
        //     // editable: true,
        //     flex: 1,
        // },
        // {
        //     headerName: this.l('RateValue'),
        //     headerTooltip: this.l('RateValue'),
        //     field: 'rateValue',
        //     // cellClass: ['cell-clickable','text-tight'],
        //     // editable: true,
        //     flex: 1,
        // },
    ];
  }

  getAsssessData(params){
    return this._serviceProxy.getAssessDataInfo(
        params,
        this.listAssess.paginationParams ? this.listAssess.paginationParams.sorting : '',
        this.listAssess.paginationParams ? this.listAssess.paginationParams.pageSize : 20,
        this.listAssess.paginationParams ? this.listAssess.paginationParams.skipCount : 1
    );
  }

  patchData(params){

      params.forEach(e => {
        if (!this.rowData.some(p => p.id == e.id)){
            this.gridParams.api.applyTransaction({ add: [e] });
            const rowIndex = this.gridParams.api.getDisplayedRowCount() - 1;
            setTimeout(() => {
                this.gridParams.api.startEditingCell({ colKey: 'quantityShipped', rowIndex });
                this.selectedNode = this.gridParams.api.getRowNode(`${rowIndex}`);
                this.gridParams.api.getRowNode(`${rowIndex}`).setSelected(true);
            }, 100);
        }

        })
  }

  ngOnInit() {

  }

  reset(){
    this.selectedAssess = new AssessGroupInfoDto();
    // this.selectedAssess.requestExpiredDate = undefined;
  }

  setLoading(params){
    if(params) return this.spinnerService.show();
    else return this.spinnerService.hide();
  }

  oldMail = "";

  show(params? : any){
    this.selectedAssess = params ?? new AssessGroupInfoDto();
    console.log(this.selectedAssess)
    this.rowData = this.selectedAssess.assessList ?? [];
    if(this.selectedAssess.id && this.selectedAssess.id != 0){
        this.searchDetailData(this.selectedAssess.id);
    }

    this.modal.show();
  }

  close() {
    this.modal.hide();
    // this.selectedAssess.requestBaseUrl = location.origin + '/app/main/add-supplier' + '?uniqueRequest=' + encodeURI("lmao")
    // window.open(this.selectedAssess.requestBaseUrl , '_blank');
  }

  save() {
    this.selectedAssess.assessList = [];

    this.gridParams.api.forEachNode(e => {
        if (e.data){
            // e.data.assessGroupId = this.selectedAssess.id;
            this.selectedAssess.assessList.push(Object.assign(new AssessInfoDto(),e.data))
        }

    })

    // console.log(this.rowData)
    // console.log(this.selectedAssess.assessList)

    if (this.checkValidateInputHasError("app-create-or-edit-assess-group")) return;
    if (!this.selectedAssess.assessGroupType || this.selectedAssess.assessGroupType == "") return this.notify.warn("Vui lòng chọn loại cho bộ tiêu chí")
    //this.modalSave.emit(this.selectedAssess);
    this.spinnerService.show();
    this._serviceProxy.createOrEditAssessGroup(this.selectedAssess)
    .pipe(finalize(()=>{
        this.spinnerService.hide();

    }))
    .subscribe(res => {
        this.notify.success("SavedSuccessfully");
        this.modalSave.emit(this.selectedAssess);
        this.modal.hide();
    })

  }

  callBackDetailGrid(params){
    this.gridParams = params
  }

  onChangeDetailSelection(params){
    this.selectedDetail = params.api.getSelectedRows()[0] ?? new AssessDetailInfoDto();

    this.selectedNode = this.gridParams.api.getSelectedNodes()[0] ?? [];
        this.gridParams.api.getRowNode(`${this.selectedNode.rowIndex}`)?.setSelected(true);
  }

  searchDetailData(assessId)
  {
    // this.selectedAssess.assessDetailList = [];
    //   this.spinnerService.show()
    //   this._serviceProxy.getAssessDetailDataInfo(assessId)
    //   .pipe(finalize(()=>{
    //       this.spinnerService.hide();
    //   }))
    //   .subscribe(res => {
    //     //   this.rowData = res;
    //         if(res.length > 0){
    //             this.selectedAssess.assessDetailList = res ?? [];
    //         }

    //   })
  }

  addDetailRow(){
    // const newRow = {
    // }
    // this.gridParams.api.applyTransaction({ add: [newRow] });
    // this.selectedAssess.assessDetailList.push(Object.assign(new AssessDetailInfoDto(),newRow))
    // const rowIndex = this.gridParams.api.getDisplayedRowCount() - 1;
    //     setTimeout(() => {
    //         this.gridParams.api.startEditingCell({ colKey: 'paymentAmount', rowIndex });
    //         this.selectedNode = this.gridParams.api.getRowNode(`${rowIndex}`);
    //         this.gridParams.api.getRowNode(`${rowIndex}`)?.setSelected(true);
    //     }, 400);
  }

  removeRow(){
    if (!this.selectedDetail) {
        this.notify.warn(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Delete);
        return;
    }
    this.gridParams.api.applyTransaction({ remove: [this.selectedNode.data] })
    this.selectedDetail = undefined;
    this.gridTableService.getAllData(this.gridParams);
  }

}
