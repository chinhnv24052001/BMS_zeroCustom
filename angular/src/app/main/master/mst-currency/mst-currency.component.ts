import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GetPurchasePurposeDto, InputPurchasePurposeDto, InputSearchMstCurrency, MstCurrencySelectDto, MstCurrencyServiceProxy, MstPurchasePurposeServiceProxy } from '@shared/service-proxies/service-proxies';
import { ceil } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import { CreateOrEditMstCurrencyComponent } from './create-or-edit-mst-currency/create-or-edit-mst-currency.component';

@Component({
  selector: 'app-mst-currency',
  templateUrl: './mst-currency.component.html',
  styleUrls: ['./mst-currency.component.css']
})
export class MstCurrencyComponent extends AppComponentBase implements OnInit {
  currencyForm: FormGroup;
  gridColDef: CustomColDef[];
  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridParams: GridParams | undefined;
  listCurrency: MstCurrencySelectDto[];
  selectedRow: MstCurrencySelectDto = new MstCurrencySelectDto();
  inputSearchMstCurrency: InputSearchMstCurrency = new InputSearchMstCurrency();
  @ViewChild('createOrEditMstCurrency', { static: true }) createOrEditMstCurrency: CreateOrEditMstCurrencyComponent;

  constructor(
    injector: Injector,
    private _mstCurrencyServiceProxy: MstCurrencyServiceProxy,
    private formBuilder: FormBuilder
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
        maxWidth: 60,
      },
      {
        headerName: this.l('CurrencyName'),
        headerTooltip: this.l('CurrencyName'),
        field: 'name'
      },
      {
        headerName: this.l('CurrencyCode'),
        headerTooltip: this.l('CurrencyCode'),
        field: 'currencyCode'
      },
      {
        headerName: this.l('DescriptionEnglish'),
        headerTooltip: this.l('DescriptionEnglish'),
        field: 'descriptionEnglish',
        maxWidth: 300
      },
      {
        headerName: this.l('DescriptionVetNamese'),
        headerTooltip: this.l('DescriptionVetNamese'),
        field: 'descriptionVetNamese',
        maxWidth: 300
      },
      {
        headerName: this.l('Status'),
        headerTooltip: this.l('Status'),
        field: 'status',
        cellRenderer: (params) =>  this.l(params.value),
        cellClass: ['text-center'],
        maxWidth: 120
      },

    ]
  }

  buildForm() {
    this.currencyForm = this.formBuilder.group({
      currencyName: [undefined],
      currencyCode: [undefined],
    });
    this.searchCurrency();
  }

  callBackGrid(params: GridParams) {
    this.gridParams = params;
    params.api.setRowData([]);
  }

  onChangeSelection(params) {
    this.selectedRow =
      params.api.getSelectedRows()[0] ?? new MstCurrencySelectDto();
    this.selectedRow = Object.assign({}, this.selectedRow);
  }

  changePaginationParams(paginationParams: PaginationParamsModel) {
    if (!this.listCurrency) {
      return;
    }
    this.paginationParams = paginationParams;
    this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
    this.paginationParams.pageSize = paginationParams.pageSize;
    this.searchCurrency();
  }

  searchCurrency() {
    this.spinnerService.show();
    this.inputSearchMstCurrency.currencyCode = this.currencyForm.get('currencyCode').value;
    this.inputSearchMstCurrency.name = this.currencyForm.get('currencyName').value;
    this.inputSearchMstCurrency.sorting = this.paginationParams ? this.paginationParams.sorting : '';
    this.inputSearchMstCurrency.maxResultCount= this.paginationParams ? this.paginationParams.pageSize : 20;
    this.inputSearchMstCurrency.skipCount = this.paginationParams ? this.paginationParams.skipCount : 1;
    this._mstCurrencyServiceProxy.loadAllCurrency(this.inputSearchMstCurrency)
    .pipe(finalize(() => {
      this.spinnerService.hide();
  }))
    .subscribe((result) => {
      this.listCurrency = result.items;
      this.gridParams.api.setRowData(this.listCurrency);
      this.paginationParams.totalCount = result.totalCount;
      this.paginationParams.totalPage = ceil(result.totalCount / this.paginationParams.pageSize);
      this.gridParams.api.sizeColumnsToFit();
      this.inputSearchMstCurrency = new InputSearchMstCurrency();
    });
  }

  add() {
    this.createOrEditMstCurrency.show();
  }

  edit() {
    if (this.selectedRow.id && this.selectedRow.id > 0) {
      this.createOrEditMstCurrency.show(this.selectedRow.id);
    } else {
      this.notify.warn(this.l('SelectLine'));
    }
  }


  delete() {
    if (this.selectedRow.id && this.selectedRow.id > 0) {
      this.message.confirm('', this.l(AppConsts.CPS_KEYS.Are_You_Sure), (isConfirmed) => {
        if (isConfirmed) {
          this.spinnerService.show();
          this._mstCurrencyServiceProxy.delete(this.selectedRow.id)
            .pipe(finalize(() => {
              this.spinnerService.hide();
            }))
            .subscribe(val => {
              this.notify.success(AppConsts.CPS_KEYS.Successfully_Deleted);
              this.searchCurrency();
            });
        }
      });
    } else {
      this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Delete))
    }
  }
}
