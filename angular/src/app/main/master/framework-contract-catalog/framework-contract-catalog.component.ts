import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { MstContractTemplateServiceProxy } from '@shared/service-proxies/service-proxies';
import { ceil } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import { CreateOrEditFramewordContractCatalogComponent } from './create-or-edit-frameword-contract-catalog/create-or-edit-frameword-contract-catalog.component';

@Component({
  selector: 'app-framework-contract-catalog',
  templateUrl: './framework-contract-catalog.component.html',
  styleUrls: ['./framework-contract-catalog.component.less']
})
export class FrameworkContractCatalogComponent extends AppComponentBase implements OnInit {
  @ViewChild('createOrEditMstContractCatalog', { static: true }) createOrEditMstContractCatalog: CreateOrEditFramewordContractCatalogComponent;
  contractForm: FormGroup;
  gridColDef: CustomColDef[];
  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridParams: GridParams | undefined;
  listContractCatalog;
  selectedRow;

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private mstContractTemplateServiceProxy: MstContractTemplateServiceProxy
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
        headerName: this.l('CodeContractCatalog'),
        headerTooltip: this.l('CodeContractCatalog'),
        field: 'templateCode',
        maxWidth: 120
      },
      {
        headerName: this.l('ContractCatalog'), //Them trong DB =>
        headerTooltip: this.l('ContractCatalog'),
        field: 'templateName',
        maxWidth: 120
      },
      {
        headerName: this.l('InventoryGroup'),
        headerTooltip: this.l('InventoryGroup'),
        field: 'inventoryGroupName',
      },
      {
        headerName: this.l('Attachments'),
        headerTooltip: this.l('Attachments'),
        field: 'attachments',
      },
      {
        headerName: this.l('Description'),
        headerTooltip: this.l('Description'),
        field: 'description'
      },
      {
        headerName: this.l('Status'),
        headerTooltip: this.l('Status'),
        field: 'isActive',
        cellRenderer: (params) => this.l(params.value),
        cellClass: ['text-center'],
        maxWidth: 130
      },
    ];
  }


  buildForm() {
    this.contractForm = this.formBuilder.group({
      keyword: [undefined],
    });
    this.searchContractCatalog();
  }

  searchContractCatalog() {
    this.spinnerService.show()
    this.mstContractTemplateServiceProxy.getAllContractTemplate(this.contractForm.get('keyword').value, (this.paginationParams ? this.paginationParams.sorting : ''), (this.paginationParams ? this.paginationParams.pageSize : 20), (this.paginationParams ? this.paginationParams.skipCount : 1))
      .subscribe((result) => {
        this.listContractCatalog = result.items;

        this.gridParams.api.setRowData(this.listContractCatalog);
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
    if (!this.listContractCatalog) {
      return;
    }
    this.paginationParams = paginationParams;
    this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
    this.paginationParams.pageSize = paginationParams.pageSize;
    this.searchContractCatalog();
  }

  addContractCatalog() {
    this.createOrEditMstContractCatalog.show();
  }

  editContractCatalog() {
    if (this.selectedRow.id && this.selectedRow.id > 0) {
      this.createOrEditMstContractCatalog.show(this.selectedRow.id);
    } else {
      this.notify.warn(this.l('SelectLine'));
    }

  }

  deleteContractCatalog() {
    if (this.selectedRow.id && this.selectedRow.id > 0) {
      this.message.confirm('', this.l(AppConsts.CPS_KEYS.Are_You_Sure), (isConfirmed) => {
        if (isConfirmed) {
          this.spinnerService.show();
          this.mstContractTemplateServiceProxy.deleteContractTemplate(this.selectedRow.id)
            .pipe(finalize(() => {
              this.spinnerService.hide();
            }))
            .subscribe(val => { 
              this.notify.success(AppConsts.CPS_KEYS.Successfully_Deleted);
              this.searchContractCatalog();
            });
        }
      });
    } else {
      this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Delete))
    }
  }

}

