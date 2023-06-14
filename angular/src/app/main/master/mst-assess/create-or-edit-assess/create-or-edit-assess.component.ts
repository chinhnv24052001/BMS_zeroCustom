import { ICellRendererParams } from "@ag-grid-enterprise/all-modules";
import { LocationStrategy } from "@angular/common";
import { Component, EventEmitter, Injector, OnInit, Output, ViewChild } from "@angular/core";
import { GridTableService } from "@app/shared/services/grid-table.service";
import { HttpClient } from "@microsoft/signalr";
import { AppConsts } from "@shared/AppConsts";
import { AppComponentBase } from "@shared/common/app-component-base";
import { AssessDetailInfoDto, AssessInfoDto, MstAssessServiceProxy } from "@shared/service-proxies/service-proxies";
import { ModalDirective } from "ngx-bootstrap/modal";
import { finalize } from "rxjs/operators";

@Component({
  selector: "app-create-or-edit-assess",
  templateUrl: "./create-or-edit-assess.component.html",
  styleUrls: ["./create-or-edit-assess.component.scss"]
})

export class CreateOrEditAssessComponent extends AppComponentBase implements OnInit {

    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
    detailColDef:any;
    rowData = [];

    gridParams: any;
    selectedDetail:any;

    selectedNode: any;

    selectedAssess : AssessInfoDto = new AssessInfoDto();


    @Output() modalSave = new EventEmitter<any>();
    constructor(injector: Injector,private _serviceProxy : MstAssessServiceProxy, private gridTableService : GridTableService) {
    super(injector);

    this.detailColDef = [
        {
            // STT
            headerName: this.l('STT'),
            headerTooltip: this.l('STT'),
            cellRenderer: (params: ICellRendererParams) =>
                    (params.rowIndex +
                    1
                ).toString(),
            flex: 0.3,
            maxWidth: 30
        },
        {
            headerName: this.l('AssessItemName'),
            headerTooltip: this.l('AssessItemName'),
            field: 'assessItemName',
            editable: true,
            cellClass: ['cell-clickable'],
            flex: 1,
        },
        {
            headerName: this.l('Description'),
            headerTooltip: this.l('Description'),
            field: 'description',
            cellClass: ['cell-clickable'],
            editable: true,
            flex: 1,
        },
        {
            headerName: this.l('RateValue'),
            headerTooltip: this.l('RateValue'),
            field: 'rateValue',
            cellClass: ['cell-clickable','text-tight'],
            editable: true,
            flex: 1,
        },
    ];
  }



  ngOnInit() {

  }

  reset(){
    this.selectedAssess = new AssessInfoDto();
    // this.selectedAssess.requestExpiredDate = undefined;
  }

  oldMail = "";

  show(params? : any){
    this.selectedAssess = params ?? new AssessInfoDto();
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
    this.selectedAssess.assessDetailList = [];
    this.gridParams.api.forEachNode(e => {
        if (e.data){
            e.data.assessId = this.selectedAssess.id;

            this.selectedAssess.assessDetailList.push(Object.assign(new AssessDetailInfoDto(),e.data))
        }

    })

    if (this.checkValidateInputHasError("app-create-or-edit-assess")) return;
    //this.modalSave.emit(this.selectedAssess);
    this.spinnerService.show();
    this._serviceProxy.createOrEditAssess(this.selectedAssess)
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
    this.selectedAssess.assessDetailList = [];
      this.spinnerService.show()
      this._serviceProxy.getAssessDetailDataInfo(assessId)
      .pipe(finalize(()=>{
          this.spinnerService.hide();
      }))
      .subscribe(res => {
        //   this.rowData = res;
            if(res.length > 0){
                this.selectedAssess.assessDetailList = res ?? [];
            }

      })
  }

  addDetailRow(){
    const newRow = {
    }
    this.gridParams.api.applyTransaction({ add: [newRow] });
    this.selectedAssess.assessDetailList.push(Object.assign(new AssessDetailInfoDto(),newRow))
    const rowIndex = this.gridParams.api.getDisplayedRowCount() - 1;
        setTimeout(() => {
            this.gridParams.api.startEditingCell({ colKey: 'paymentAmount', rowIndex });
            this.selectedNode = this.gridParams.api.getRowNode(`${rowIndex}`);
            this.gridParams.api.getRowNode(`${rowIndex}`)?.setSelected(true);
        }, 400);
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
