import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { AppComponentBase } from '@shared/common/app-component-base';
import { MstSupplierServiceProxy, SupplierOutputSelectDto } from '@shared/service-proxies/service-proxies';
import { ceil } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import { MstSupplierSiteComponent } from './mst-supplier-site/mst-supplier-site.component';
import { GridTableService } from '@app/shared/services/grid-table.service';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { CreateOrEditMstSupplierComponent } from './create-or-edit-mst-supplier/create-or-edit-mst-supplier.component';
import { AppConsts } from '@shared/AppConsts';

@Component({
    selector: 'app-mst-supplier',
    templateUrl: './mst-supplier.component.html',
    styleUrls: ['./mst-supplier.component.less'],
})
export class MstSupplierComponent extends AppComponentBase implements OnInit {
    @ViewChild('mstSupplierSite', { static: true }) mstSupplierSite: MstSupplierSiteComponent;
    @ViewChild('createOrEditMstSupplier', { static: true }) createOrEditMstSupplier: CreateOrEditMstSupplierComponent;
    supplierForm: FormGroup;
    gridColDef: CustomColDef[];
    paginationParams: PaginationParamsModel = {
        pageNum: 1,
        pageSize: 20,
        totalCount: 0,
        totalPage: 0,
        sorting: '',
        skipCount: 0,
    };
    gridParams: GridParams | undefined;
    listSupplier: SupplierOutputSelectDto[];
    selectedRow: SupplierOutputSelectDto = new SupplierOutputSelectDto();
    supplierId: number = 0;
    supplierName;
    supplierNumber;
    _params;
    indexOfRowSelect;
    pagedSaleRowData;
    defaultColDef: CustomColDef = {
        filter: false,
        sortable: false,
        suppressMenu: true,
        menuTabs: [],
        floatingFilter: true
    };
    constructor(
        injector: Injector,
        private _mstSupplierServiceProxy: MstSupplierServiceProxy,
        private formBuilder: FormBuilder,
        private gridTableService: GridTableService,
        private dataFormatService : DataFormatService,
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
                cellRenderer: (params: ICellRendererParams) =>
                    (
                        (this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! +
                        params.rowIndex +
                        1
                    ).toString(),
                maxWidth: 60,
            },
            {
                headerName: this.l('SupplierName'),
                headerTooltip: this.l('SupplierName'),
                field: 'supplierName',
            },
            {
                headerName: this.l('AbbreviateName'),
                field: 'abbreviateName',
            },
            {
                headerName: this.l('SupplierNumber'),
                headerTooltip: this.l('SupplierNumber'),
                field: 'supplierNumber',
                maxWidth: 110,
            },
            {
                headerName: this.l('VatRegistrationNum'),
                headerTooltip: this.l('VatRegistrationNum'),
                field: 'vatRegistrationNum',
            },
            {
                headerName: this.l('VatRegistrationInvoice'),
                headerTooltip: this.l('VatRegistrationInvoice'),
                field: 'vatRegistrationInvoice',
            },
            // {
            //     headerName: this.l('TaxPayerId'),
            //     headerTooltip: this.l('TaxPayerId'),
            //     field: 'taxPayerId',
            // },
            {
                headerName: this.l('StartDateActive'),
                headerTooltip: this.l('StartDateActive'),
                field: 'startDateActive',
                valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.startDateActive): "",
                maxWidth: 120,
                cellClass: ["text-format-date-approvaltree"]
              },
              {
                headerName: this.l('EndDateActive'),
                headerTooltip: this.l('EndDateActive'),
                field: 'endDateActive',
                valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.endDateActive): "",
                maxWidth: 120,
                cellClass: ["text-format-date-approvaltree "]
              },
        ];
    }

    buildForm() {
        this.supplierForm = this.formBuilder.group({
            supplierName: [undefined],
            vatRegistrationNum: [undefined],
            vatRegistrationInvoice: [undefined],
            supplierNumber: [undefined],
        });
        this.searchSupplier();
    }

    callBackGrid(params: GridParams) {
        this.gridParams = params;
        params.api.setRowData([]);
    }

    onChangeSelection(params) {
        this.selectedRow = params.api.getSelectedRows()[0] ?? new SupplierOutputSelectDto();
        this.selectedRow = Object.assign({}, this.selectedRow);
        // this.indexOfRowSelect = this.pagedSaleRowData.indexOf(this.selectedRow);
        this.supplierId= this.selectedRow.id;
        this.supplierName = this.selectedRow.supplierName;
        this.supplierNumber = this.selectedRow.supplierNumber;
        this.mstSupplierSite.searchSupplierSite(this.selectedRow.id);
        this.mstSupplierSite.setlistSupplierContactNull();
    }

    changePaginationParams(paginationParams: PaginationParamsModel) {
        if (!this.listSupplier) {
            return;
        }
        this.paginationParams = paginationParams;
        this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
        this.paginationParams.pageSize = paginationParams.pageSize;
        this.mstSupplierSite.searchSupplierSite(0);
        this.mstSupplierSite.setlistSupplierContactNull();
        this.searchSupplier();
    }

    searchSupplier() {
        this.spinnerService.show();
        this._mstSupplierServiceProxy
            .getAllSupplier(
                this.supplierForm.get('supplierName').value,
                this.supplierForm.get('vatRegistrationNum').value,
                this.supplierForm.get('vatRegistrationInvoice').value,
                this.supplierForm.get('supplierNumber').value,
                this.paginationParams ? this.paginationParams.sorting : '',
                this.paginationParams ? this.paginationParams.pageSize : 20,
                this.paginationParams ? this.paginationParams.skipCount : 1
            )
            .subscribe((result) => {
                this.listSupplier = result.items;
                this.gridParams.api.setRowData(this.listSupplier);
                this.paginationParams.totalCount = result.totalCount;
                this.paginationParams.totalPage = ceil(result.totalCount / this.paginationParams.pageSize);
                this.gridParams.api.sizeColumnsToFit();
                this.spinnerService.hide();
            });
    }

  add() {
    this.createOrEditMstSupplier.show();
  }

  edit() {
    if (this.selectedRow.id && this.selectedRow.id > 0) {
      this.createOrEditMstSupplier.show(this.selectedRow.id);
    } else {
      this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Edit));
    }
  }

  delete() {
    if (this.selectedRow.id && this.selectedRow.id > 0) {
      this.message.confirm('', this.l(AppConsts.CPS_KEYS.Are_You_Sure), (isConfirmed) => {
        if (isConfirmed) {
          this.spinnerService.show();
          this._mstSupplierServiceProxy.deleteSupplier(this.selectedRow.id).subscribe(val => {
            this.notify.success('Successfully Deleted');
            this.searchSupplier();
            this.mstSupplierSite.searchSupplierSite(0);
             this.mstSupplierSite.setlistSupplierContactNull();
            this.spinnerService.hide();
          });
        }
      });
    } else {
      this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Delete))
    }
  }
}
