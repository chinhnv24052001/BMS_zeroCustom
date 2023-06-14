import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { AppComponentBase } from '@shared/common/app-component-base';
import { PersonnelOutputSelectDto, PersonnelServiceProxy } from '@shared/service-proxies/service-proxies';
import { ceil } from 'lodash-es';

@Component({
  selector: 'app-mst-personnel',
  templateUrl: './mst-personnel.component.html',
  styleUrls: ['./mst-personnel.component.css']
})
export class MstPersonnelComponent extends AppComponentBase implements OnInit {
  gridColDef: CustomColDef[];
  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridParams: GridParams | undefined;
  listPersonnel: PersonnelOutputSelectDto[];
  selectedRow: PersonnelOutputSelectDto = new PersonnelOutputSelectDto();

  constructor(
    injector: Injector,
    private _personnelServiceProxy: PersonnelServiceProxy,
    private formBuilder: FormBuilder
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.searchPersionnel();
    this.gridColDef = [
      {
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        maxWidth: 60
      },
      {
        headerName: this.l('EmployeesCode'),
        headerTooltip: this.l('EmployeesCode'),
        field: 'employeesCode',
        maxWidth: 120,
      },
      {
        headerName: this.l('FullName'),
        headerTooltip: this.l('FullName'),
        field: 'name',
        width: 50,
      },

      {
        headerName: this.l('EmailAddress'),
        headerTooltip: this.l('EmailAddress'),
        field: 'emailAddress',
        width: 80,
      },
      {
        headerName: this.l('Position'),
        headerTooltip: this.l('Position'),
        field: 'position',
        maxWidth: 250,
      },
      {
        headerName: this.l('Title'),
        headerTooltip: this.l('Title'),
        field: 'title',
        maxWidth: 250,
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

  callBackGrid(params: GridParams) {
    this.gridParams = params;
    params.api.setRowData([]);
  }

  onChangeSelection(params) {
    this.selectedRow =
      params.api.getSelectedRows()[0] ?? new PersonnelOutputSelectDto();
    this.selectedRow = Object.assign({}, this.selectedRow);
  }

  changePaginationParams(paginationParams: PaginationParamsModel) {
    this.paginationParams = paginationParams;
    this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
    this.paginationParams.pageSize = paginationParams.pageSize;
    this.searchPersionnel();
  }

  searchPersionnel(hrOrgId?,name?) {
    this.spinnerService.show();
    this._personnelServiceProxy.getAllPersonnelByHrOrgStructureId(hrOrgId,name,
      this.paginationParams ? this.paginationParams.sorting : '',
      this.paginationParams ? this.paginationParams.pageSize : 20,
      this.paginationParams ? this.paginationParams.skipCount : 1)
      .subscribe((result) => {
      this.listPersonnel = result.items;
      this.gridParams.api.setRowData(this.listPersonnel);
      this.paginationParams.totalCount = result.totalCount;
      this.paginationParams.totalPage = ceil(result.totalCount / this.paginationParams.pageSize);
      this.gridParams.api.sizeColumnsToFit();
    });
    this.spinnerService.hide();
  }

}
