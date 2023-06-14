import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GetPurchasePurposeDto, InputPurchasePurposeDto, MstInventoryItemsServiceProxy, MstPurchasePurposeServiceProxy } from '@shared/service-proxies/service-proxies';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { ceil } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import { CreateOrEditMstPurchasePurposeComponent } from './create-or-edit-mst-purchase-purpose/create-or-edit-mst-purchase-purpose.component';
import { ImportPurchasePurposeComponent } from './importPurchasePurpose/importPurchasePurpose.component';

@Component({
  selector: 'app-mst-purchase-purpose',
  templateUrl: './mst-purchase-purpose.component.html',
  styleUrls: ['./mst-purchase-purpose.component.css']
})
export class MstPurchasePurposeComponent extends AppComponentBase implements OnInit {
  @ViewChild('createOrEditMstPurchasePurpose', { static: true }) createOrEditMstPurchasePurpose: CreateOrEditMstPurchasePurposeComponent; 
  @ViewChild('importPurchasePurpose', { static: true }) importExcelPurchasePurpose: ImportPurchasePurposeComponent; 
  purchasePurposeForm: FormGroup;
  gridColDef: CustomColDef[];
  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridParams: GridParams | undefined;
  listPurchasePurpose: GetPurchasePurposeDto[];
  selectedRow: GetPurchasePurposeDto = new GetPurchasePurposeDto();

  constructor(
    injector: Injector,
    private _mstPurchasePurposeServiceProxy: MstPurchasePurposeServiceProxy,
    private formBuilder: FormBuilder,
    private _mstInventoryItemsServiceProxy: MstInventoryItemsServiceProxy,
    private _fileDownloadService: FileDownloadService
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
        maxWidth: 70,
        cellClass: ['text-center'],
      },
      {
        headerName: this.l('PurchasePurposeName'),
        headerTooltip: this.l('PurchasePurposeName'),
        field: 'purchasePurposeName'
      },
      {
        headerName: this.l('PurchasePurposeCode'),
        headerTooltip: this.l('PurchasePurposeCode'),
        field: 'purchasePurposeCode'
      },
      {
        headerName: this.l('BudgetCode'),
        headerTooltip: this.l('BudgetCode'),
        field: 'haveBudgetCode',
        cellRenderer: (params) => params.value ? `<input type="checkbox" class="checkbox" disabled="disabled" checked="checked" />` : `<input type="checkbox" class="checkbox" disabled="disabled" />`,
        cellClass: ['text-center'],
        maxWidth: 120
      },
      {
        headerName: this.l('Status'),
        headerTooltip: this.l('Status'),
        field: 'status',
        cellRenderer: (params) => this.l(params.value),
        cellClass: ['text-center'],
        maxWidth: 120
      },
    ]
  }

  buildForm() {
    this.purchasePurposeForm = this.formBuilder.group({
      purchasePurposeName: [undefined],
    });
    this.searchPurchasePurpose();
  }

  callBackGrid(params: GridParams) {
    this.gridParams = params;
    params.api.setRowData([]);
  }

  onChangeSelection(params) {
    this.selectedRow =
      params.api.getSelectedRows()[0] ?? new GetPurchasePurposeDto();
    this.selectedRow = Object.assign({}, this.selectedRow);
  }

  changePaginationParams(paginationParams: PaginationParamsModel) {
    if (!this.listPurchasePurpose) {
      return;
    }
    this.paginationParams = paginationParams;
    this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
    this.paginationParams.pageSize = paginationParams.pageSize;
    this.searchPurchasePurpose();
  }

  searchPurchasePurpose() {
    this.spinnerService.show();
    this._mstPurchasePurposeServiceProxy.getAllPurchasePurpose(this.purchasePurposeForm.get('purchasePurposeName').value, (this.paginationParams ? this.paginationParams.sorting : ''), (this.paginationParams ? this.paginationParams.pageSize : 20), (this.paginationParams ? this.paginationParams.skipCount : 1))
      .pipe(finalize(() => {
        this.spinnerService.hide();
      }))
      .subscribe((result) => {
        this.listPurchasePurpose = result.items;

        this.gridParams.api.setRowData(this.listPurchasePurpose);
        this.paginationParams.totalCount = result.totalCount;
        this.paginationParams.totalPage = ceil(result.totalCount / this.paginationParams.pageSize);
        this.gridParams.api.sizeColumnsToFit();
      });
    this.spinnerService.hide();
  }

  addPurchasePurpose() {
    this.createOrEditMstPurchasePurpose.show();
  }

  editPurchasePurpose() {
    if (this.selectedRow.id && this.selectedRow.id > 0) {
      this.createOrEditMstPurchasePurpose.show(this.selectedRow.id);
    } else {
      this.notify.warn(this.l('SelectLine'));
    }
  }


  deletePurchasePurpose() {
    if (this.selectedRow.id && this.selectedRow.id > 0) {
      this.message.confirm('', this.l(AppConsts.CPS_KEYS.Are_You_Sure), (isConfirmed) => {
        if (isConfirmed) {
          this.spinnerService.show();
          this._mstPurchasePurposeServiceProxy.deletePurpose(this.selectedRow.id)
            .pipe(finalize(() => {
              this.spinnerService.hide();
            }))
            .subscribe(val => {
              this.notify.success(AppConsts.CPS_KEYS.Successfully_Deleted);
              this.searchPurchasePurpose();
            });
        }
      });
    } else {
      this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Delete))
    }
  }

  

  //Import excel
  importExcel() {
    this.importExcelPurchasePurpose.show();
}

}
