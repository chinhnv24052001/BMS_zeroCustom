import { ICellRendererParams, ValueGetterParams } from '@ag-grid-enterprise/all-modules';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AgCheckboxRendererComponent } from '@app/shared/common/grid-input-types/ag-checkbox-renderer/ag-checkbox-renderer.component';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { AppComponentBase } from '@shared/common/app-component-base';
import { InputSearchMstPeriodDto, ListPeriodDto, MstPeriodServiceProxy } from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { ceil, result } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import { CreateOrEditMstPeriodComponent } from './create-or-edit-mst-period/create-or-edit-mst-period.component';

@Component({
  selector: 'mst-period',
  templateUrl: './mst-period.component.html',
  styleUrls: ['./mst-period.component.css']
})
export class MstPeriodComponent extends AppComponentBase implements OnInit {

  @ViewChild('createOrEditMstPeriod', { static: true }) createOrEditVender: CreateOrEditMstPeriodComponent;
  periodForm1;
  gridColDef: CustomColDef[];
  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridParams: GridParams | undefined;
  listPeriod: ListPeriodDto[];
  inputSearchMstPeriodDto: InputSearchMstPeriodDto = new InputSearchMstPeriodDto();
  frameworkComponents;
  constructor(
    injector: Injector,
    private _mstPeriodServiceProxy: MstPeriodServiceProxy,
    private dataFormatService : DataFormatService,
    private formBuilder: FormBuilder
  ) {
    super(injector);
    this.frameworkComponents = {
      agCheckboxRendererComponent: AgCheckboxRendererComponent
    };
    this.gridColDef = [
      {
          // STT
          headerName: this.l('STT'),
          headerTooltip: this.l('STT'),
          cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
          width: 70,
      },
      {
          headerName: this.l('PeriodName'),
          headerTooltip: this.l('PeriodName'),
          field: 'periodName',
          width: 140,
      },
      {

          headerName: this.l('PeriodYear'),
          headerTooltip: this.l('PeriodYear'),
          field: 'periodYear',
          width: 110,
      },
      {
          headerName: this.l('FromDate'),
          headerTooltip: this.l('FromDate'),
          field: 'fromDate',
          width: 100,
          valueGetter: (params: ValueGetterParams) => this.dataFormatService.dateFormat(params.data?.fromDate)
      },
      {
          headerName: this.l('Todate'),
          headerTooltip: this.l('Todate'),
          field: 'todate',
          width: 100,
          valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.todate): ""
      },
      {
          headerName: this.l('Description'),
          headerTooltip: this.l('Description'),
          field: 'description',
          width: 300,
      },
      {
          headerName: this.l('IsCurrent'),
          headerTooltip: this.l('IsCurrent'),
          field: 'isCurrent',
          width: 120,
          data: [true, false],
          disableCheckbox: true,
          cellRenderer: 'agCheckboxRendererComponent'
      },
  ]
  }

  ngOnInit(): void {
    this.buildForm();
    this.searchPeriod();
  }

  searchPeriod() {
    this.spinnerService.show();
      this.inputSearchMstPeriodDto.sorting = this.paginationParams ? this.paginationParams.sorting : '';
      this.inputSearchMstPeriodDto.maxResultCount =  this.paginationParams ? this.paginationParams.pageSize : 20;
      this.inputSearchMstPeriodDto.skipCount = this.paginationParams ? this.paginationParams.skipCount : 1;

      this._mstPeriodServiceProxy.loadAllPeriod(this.inputSearchMstPeriodDto)
      .pipe(finalize(() => {
        this.spinnerService.hide();
    }))
      .subscribe((result) => {
        this.listPeriod = result.items;

        this.gridParams.api.setRowData(this.listPeriod);
        this.paginationParams.totalCount = result.totalCount;
        this.paginationParams.totalPage = ceil(result.totalCount / this.paginationParams.pageSize);
        this.gridParams.api.sizeColumnsToFit();
      });
  }

  callBackGrid(params: GridParams) {
    this.gridParams = params;
    params.api.setRowData([]);
}

changePaginationParams(paginationParams: PaginationParamsModel) {
    if (!this.listPeriod) {
        return;
    }
    this.paginationParams = paginationParams;
    this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
    this.paginationParams.pageSize = paginationParams.pageSize;
    this.searchPeriod();
}

addPeriod() {
  this.createOrEditVender.showModal();
}

buildForm() {
  this.periodForm1 = this.formBuilder.group({
    Keyword: [undefined],
  });
}

}
