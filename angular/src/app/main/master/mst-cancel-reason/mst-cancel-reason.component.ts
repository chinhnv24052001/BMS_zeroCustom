import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { MstCancelReasonServiceProxy } from '@shared/service-proxies/service-proxies';
import { ceil } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import { CreateOrEditFramewordContractCatalogComponent } from '../framework-contract-catalog/create-or-edit-frameword-contract-catalog/create-or-edit-frameword-contract-catalog.component';
import { CreateOrEditCancelReasonComponent } from './create-or-edit-cancel-reason/create-or-edit-cancel-reason.component';

@Component({
  selector: 'app-mst-cancel-reason',
  templateUrl: './mst-cancel-reason.component.html',
  styleUrls: ['./mst-cancel-reason.component.less']
})
export class MstCancelReasonComponent extends AppComponentBase implements OnInit {

  @ViewChild('createOrEditReason', { static: true }) createOrEditReason: CreateOrEditCancelReasonComponent;
  reasonForm: FormGroup;
  gridColDef: CustomColDef[];
  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridParams: GridParams | undefined;
  listReason;
  selectedRow;

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    // private a: 
    private mstCancelReasonServiceProxy: MstCancelReasonServiceProxy
  ) { 
    super(injector);
  }

  ngOnInit(): void {
    this.buildForm();
    this.gridColDef = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        maxWidth: 50,
      },
      {
        headerName: this.l('TransactionType'),
        headerTooltip: this.l('TransactionType'),
        field: 'type',
        maxWidth: 120
      },
      {
        headerName: this.l('Code'),
        headerTooltip: this.l('Code'),
        field: 'code'
      },
      {
        headerName: this.l('CancelReason'),
        headerTooltip: this.l('CancelReason'),
        field: 'name',
      },
      {
        headerName: this.l('Description'),
        headerTooltip: this.l('Description'),
        field: 'description',
      },
    ];
  }

  buildForm() {
    this.reasonForm = this.formBuilder.group({
      keyword: [undefined],
    });
    this.searchReason();
  }


  searchReason() {
    this.spinnerService.show()
    this.mstCancelReasonServiceProxy.getAllCancelReason(this.reasonForm.get('keyword').value, (this.paginationParams ? this.paginationParams.sorting : ''), (this.paginationParams ? this.paginationParams.pageSize : 20), (this.paginationParams ? this.paginationParams.skipCount : 1))
      .subscribe((result) => {
        this.listReason = result.items;

        this.gridParams.api.setRowData(this.listReason);
        this.paginationParams.totalCount = result.totalCount;
        this.paginationParams.totalPage = ceil(result.totalCount / this.paginationParams.pageSize);
        this.gridParams.api.sizeColumnsToFit();
        this.spinnerService.hide()
      });
  }

  callBackGrid(params: GridParams) {
    this.gridParams = params;
    params.api.setRowData([]);
  }

  onChangeSelection(params) {
    this.selectedRow =
      params.api.getSelectedRows()[0];
    this.selectedRow = Object.assign({}, this.selectedRow);
  }

  changePaginationParams(paginationParams: PaginationParamsModel) {
    if (!this.listReason) {
      return;
    }
    this.paginationParams = paginationParams;
    this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
    this.paginationParams.pageSize = paginationParams.pageSize;
    this.searchReason();
  }

  addReason() {
    this.createOrEditReason.show();
  }

  editReason() {
    if (this.selectedRow.id && this.selectedRow.id > 0) {
      this.createOrEditReason.show(this.selectedRow.id);
    } else {
      this.notify.warn(this.l('SelectLine'));
    }
  }

  deleteReason() {
    if (this.selectedRow.id && this.selectedRow.id > 0) {
      this.message.confirm('', this.l(AppConsts.CPS_KEYS.Are_You_Sure), (isConfirmed) => {
        if (isConfirmed) {
          this.spinnerService.show();
          this.mstCancelReasonServiceProxy.deleteCancelReason(this.selectedRow.id)
            .pipe(finalize(() => {
              this.spinnerService.hide();
            }))
            .subscribe(val => {
              this.notify.success(AppConsts.CPS_KEYS.Successfully_Deleted);
              this.searchReason();
            });
        }
      });
    } else {
      this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Delete))
    }
  }

  
}
