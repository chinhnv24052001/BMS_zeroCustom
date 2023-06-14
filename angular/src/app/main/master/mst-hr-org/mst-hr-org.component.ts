import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { AppComponentBase } from '@shared/common/app-component-base';
import { MstHrOrgStructureOutputSelectDto, MstSupplierServiceProxy, PersonnelServiceProxy, SupplierOutputSelectDto } from '@shared/service-proxies/service-proxies';
import { ceil } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import { MstPersonnelComponent } from './mst-personnel/mst-personnel.component';

@Component({
  selector: 'app-mst-supplier',
  templateUrl: './mst-hr-org.component.html',
  styleUrls: ['./mst-hr-org.component.css']
})
export class MstHrOrgComponent extends AppComponentBase implements OnInit {
  @ViewChild('mstPersonnel', { static: true }) mstPersonnel: MstPersonnelComponent;
  hrOrgForm: FormGroup;
  gridColDef: CustomColDef[];
  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridParams: GridParams | undefined;
  listHrOrgStructure: MstHrOrgStructureOutputSelectDto[];
  selectedRow: MstHrOrgStructureOutputSelectDto = new MstHrOrgStructureOutputSelectDto();
  supplierId: number=0;
  supplierName;

  constructor(
    injector: Injector,
    private _personnelServiceProxy: PersonnelServiceProxy,
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
        headerName: this.l('DepartmentName'),
        headerTooltip: this.l('DepartmentName'),
        field: 'name'
      },
      {
        headerName: this.l('OrgStructureTypeCode'),
        headerTooltip: this.l('OrgStructureTypeCode'),
        field: 'orgStructureTypeCode'
      },
      {
        headerName: this.l('OrgStructureTypeName'),
        headerTooltip: this.l('OrgStructureTypeName'),
        field: 'orgStructureTypeName'
      },
      {
        headerName: this.l('Description'),
        headerTooltip: this.l('Description'),
        field: 'description'
      },
    ]
  }

  buildForm() {
    this.hrOrgForm = this.formBuilder.group({
      name: [undefined],
      persionalName: [undefined],
    });
    this.searchHrOrg();
  }

  callBackGrid(params: GridParams) {
    this.gridParams = params;
    params.api.setRowData([]);
  }

  onChangeSelection(params) {
    this.selectedRow =
      params.api.getSelectedRows()[0] ?? new MstHrOrgStructureOutputSelectDto();
    this.selectedRow = Object.assign({}, this.selectedRow);
    this.mstPersonnel.searchPersionnel(this.selectedRow.id,this.hrOrgForm.get('persionalName').value);
  }

  changePaginationParams(paginationParams: PaginationParamsModel) {
    if (!this.listHrOrgStructure) {
      return;
    }
    this.paginationParams = paginationParams;
    this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
    this.paginationParams.pageSize = paginationParams.pageSize;
    this.searchHrOrg();
  }

  searchHrOrg() {
    this.spinnerService.show();
    this._personnelServiceProxy.getAllHrOrgStructure(
    this.hrOrgForm.get('name').value,
    this.hrOrgForm.get('persionalName').value,
     (this.paginationParams ? this.paginationParams.sorting : ''),
      (this.paginationParams ? this.paginationParams.pageSize : 20),
       (this.paginationParams ? this.paginationParams.skipCount : 1))
       .pipe(finalize(() => {
        this.spinnerService.hide();
    }))
       .subscribe((result) => {
      this.listHrOrgStructure = result.items;
      this.gridParams.api.setRowData(this.listHrOrgStructure);
      this.paginationParams.totalCount = result.totalCount;
      this.paginationParams.totalPage = ceil(result.totalCount / this.paginationParams.pageSize);
      this.gridParams.api.sizeColumnsToFit();
    });
    this.spinnerService.hide();
  }

}
