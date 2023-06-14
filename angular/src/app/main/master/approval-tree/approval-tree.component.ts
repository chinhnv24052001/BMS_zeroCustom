import { ICellRendererParams, ValueGetterParams } from '@ag-grid-enterprise/all-modules';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ApprovalTreeOutputSelectDto, MstApprovalTreeServiceProxy } from '@shared/service-proxies/service-proxies';
import { ceil } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import { CreateOrEditApprovalTreeComponent } from './create-or-edit-approval-tree/create-or-edit-approval-tree.component';

@Component({
  selector: 'app-approval-tree',
  templateUrl: './approval-tree.component.html',
  styleUrls: ['./approval-tree.component.less']
})
export class ApprovalTreeComponent extends AppComponentBase implements OnInit {
  @ViewChild('createOrEditApprovalTree', { static: true }) createOrEditApprovalTree: CreateOrEditApprovalTreeComponent;
  approvalTreeForm: FormGroup;
  gridColDef: CustomColDef[];
  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridParams: GridParams | undefined;
  listApprovalTree: ApprovalTreeOutputSelectDto[];
  selectedRow: ApprovalTreeOutputSelectDto = new ApprovalTreeOutputSelectDto();
  listProcessType: { value:  number, label: string,  }[] = [];
  listIventory: { value:  number, label: string,  }[] = [];


  constructor(
    injector: Injector,
    private _mstApprovalTreeServiceProxy: MstApprovalTreeServiceProxy,
    private formBuilder: FormBuilder,
    private dataFormatService : DataFormatService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.buildForm();
    this.selectDropDownProcessType();
    this.selectDropDownIventoryGroup();
    this.gridColDef = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        maxWidth: 50,
        minWidth: 50,
        cellClass: ['text-center'],
      },
      {
        headerName: this.l('ProcessType'),
        headerTooltip: this.l('ProcessType'),
        field: 'processType',
        width: 30,
      },
      {
        headerName: this.l('CurrencyCode'),
        headerTooltip: this.l('CurrencyCode'),
        field: 'currencyName',
        width: 30,
      },
      {
        headerName: this.l('InventoryGroupId'),
        headerTooltip: this.l('InventoryGroupId'),
        field: 'inventoryGroupName',
        width: 50,
      },
      {
        headerName: this.l('AmountFrom'),
        headerTooltip: this.l('AmountFrom'),
        field: 'amountFrom',
        valueGetter: (params: ValueGetterParams) => this.dataFormatService.formatMoney(params.data.amountFrom),
        maxWidth: 100,
        cellClass: ['text-right'],
      },
      {
        headerName: this.l('AmountTo'),
        headerTooltip: this.l('AmountTo'),
        field: 'amountTo',
        valueGetter: (params: ValueGetterParams) => this.dataFormatService.formatMoney(params.data.amountTo),
        maxWidth: 100,
        cellClass: ['text-right'],
      },
      {
        headerName: this.l('CreationTime'),
        headerTooltip: this.l('CreationTime'),
        field: 'creationTime',
        valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.creationTime): "",
        maxWidth: 100,
        cellClass: ["text-format-date-approvaltree text-center"]
      },
      {
        headerName: this.l('Description'),
        headerTooltip: this.l('Description'),
        field: 'description',
        width: 100,
        cellClass: ["text-description-approvaltree"]
      }
    ]
  }

  buildForm() {
    this.approvalTreeForm = this.formBuilder.group({
      processTypeId: [0],
      creationTime: [undefined],
      inventoryGroupId : [0]
    });
    this.searchApprovalTree();
  }

  callBackGrid(params: GridParams) {
    this.gridParams = params;
    params.api.setRowData([]);
  }

  onChangeSelection(params) {
    this.selectedRow =
      params.api.getSelectedRows()[0] ?? new ApprovalTreeOutputSelectDto();
    this.selectedRow = Object.assign({}, this.selectedRow);
  }

  changePaginationParams(paginationParams: PaginationParamsModel) {
    if (!this.listApprovalTree) {
      return;
    }
    this.paginationParams = paginationParams;
    this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
    this.paginationParams.pageSize = paginationParams.pageSize;
    this.searchApprovalTree();
  }

  selectDropDownProcessType() {
    this._mstApprovalTreeServiceProxy.getListProcessType().subscribe((result) => {
      this.listProcessType = [];
      this.listProcessType.push({ value: 0, label: " " });
      result.forEach(ele => {
        this.listProcessType.push({ value: ele.id, label: ele.processName });
      });
    });
  }

  selectDropDownIventoryGroup() {
    this._mstApprovalTreeServiceProxy.getListIventoryGroup().subscribe((result) => {
      this.listIventory = [];
      this.listIventory.push({ value: 0, label: " " });
      result.forEach(ele => {
        this.listIventory.push({ value: ele.id, label: ele.name });
      });
    });
  }

  searchApprovalTree() {
    this.spinnerService.show();
    this._mstApprovalTreeServiceProxy.getAllApproval(this.approvalTreeForm.get('processTypeId').value,
    this.approvalTreeForm.get('creationTime').value,
    this.approvalTreeForm.get('inventoryGroupId').value,
     (this.paginationParams ? this.paginationParams.sorting : ''),
      (this.paginationParams ? this.paginationParams.pageSize : 20),
       (this.paginationParams ? this.paginationParams.skipCount : 1))
       .pipe(finalize(() => {
        this.spinnerService.hide();
    }))
    .subscribe((result) => {
      this.listApprovalTree = result.items;

      this.gridParams.api.setRowData(this.listApprovalTree);
      this.paginationParams.totalCount = result.totalCount;
      this.paginationParams.totalPage = ceil(result.totalCount / this.paginationParams.pageSize);
      this.gridParams.api.sizeColumnsToFit();
    });
  }

  add() {
     this.createOrEditApprovalTree.show();
  }

  edit() {
    if (this.selectedRow.id && this.selectedRow.id > 0) {
      this.createOrEditApprovalTree.show(this.selectedRow.id);
    } else {
      this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Edit))
    }
  }


  delete() {
    if (this.selectedRow.id && this.selectedRow.id > 0) {
      this.message.confirm('', this.l(AppConsts.CPS_KEYS.Are_You_Sure) , (isConfirmed) => {
        if (isConfirmed) {
          this.spinnerService.show();
          this._mstApprovalTreeServiceProxy.delete(this.selectedRow.id).subscribe(val => {
            this.notify.success( this.l(AppConsts.CPS_KEYS.Successfully_Deleted));
            this.searchApprovalTree();
            this.spinnerService.hide();
          });
        }
      });
    } else {
      this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Delete))
    }
  }

}
