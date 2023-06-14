import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { HttpClient } from '@angular/common/http';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { BmsMstPeriodServiceProxy, BmsMstSegment1ServiceProxy, BmsMstSegment2ProjectTypeServiceProxy, MstPeriodServiceProxy, MstSegment1Dto, ProjectTypeDto } from '@shared/service-proxies/service-proxies';
import { ceil } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import { BmsImportSegmentComponent } from '../bms-import-segment/import-segment.component';
import { CreateOrEditBmsMstSegment2ProjectTypeComponent } from './create-or-edit-bms-mst-segment2-project-type/create-or-edit-bms-mst-segment2-project-type.component';

@Component({
  selector: 'app-bms-mst-segment2-project-type',
  templateUrl: './bms-mst-segment2-project-type.component.html',
  styleUrls: ['./bms-mst-segment2-project-type.component.css']
})
export class BmsMstSegment2ProjectTypeComponent extends AppComponentBase implements OnInit {
  @ViewChild(' createOrEditBmsMstSegment2ProjectType', { static: true })  createOrEditBmsMstSegment2ProjectType: CreateOrEditBmsMstSegment2ProjectTypeComponent;
  segment2ProjectTypeForm: FormGroup;
  gridColDef: CustomColDef[];
  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridParams: GridParams | undefined;
  listProjectType: ProjectTypeDto[];
  selectedRow: ProjectTypeDto = new ProjectTypeDto();
  urlBase: string = AppConsts.remoteServiceBaseUrl;

  constructor(
    injector: Injector,
    private _msMstSegment2ProjectTypeServiceProxy: BmsMstSegment2ProjectTypeServiceProxy,
    private formBuilder: FormBuilder,
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
      },
      {
        headerName: this.l('ProjectTypeName'),
        headerTooltip: this.l('ProjectTypeName'),
        field: 'projectTypeName', 
        maxWidth: 200
      },
      {
        headerName: this.l('Description'),
        headerTooltip: this.l('Description'),
        field: 'description',
        maxWidth: 400
      },
    ]
  }

  buildForm() {
    this.segment2ProjectTypeForm = this.formBuilder.group({
      projectTypeName: [undefined],
    });
    this.search();
  }

  callBackGrid(params: GridParams) {
    this.gridParams = params;
    params.api.setRowData([]);
  }

  onChangeSelection(params) {
    this.selectedRow =
      params.api.getSelectedRows()[0] ?? new ProjectTypeDto();
    this.selectedRow = Object.assign({}, this.selectedRow);
  }

  changePaginationParams(paginationParams: PaginationParamsModel) {
    if (!this.listProjectType) {
      return;
    }
    this.paginationParams = paginationParams;
    this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
    this.paginationParams.pageSize = paginationParams.pageSize;
    this.search();
  }

  search() {
    this.spinnerService.show();
    this._msMstSegment2ProjectTypeServiceProxy.getAllProjectType(
      this.segment2ProjectTypeForm.get('projectTypeName').value,
      (this.paginationParams ? this.paginationParams.sorting : ''),
      (this.paginationParams ? this.paginationParams.pageSize : 20),
      (this.paginationParams ? this.paginationParams.skipCount : 1))
      .pipe(finalize(() => {
        this.spinnerService.hide();
      }))
      .subscribe((result) => {
        this.listProjectType = result.items;
        this.gridParams.api.setRowData(this.listProjectType);
        this.paginationParams.totalCount = result.totalCount;
        this.paginationParams.totalPage = ceil(result.totalCount / this.paginationParams.pageSize);
        this.gridParams.api.sizeColumnsToFit();
      });
  }

  add() {
    this.createOrEditBmsMstSegment2ProjectType.show();
  }

  edit() {
    if (this.selectedRow.id && this.selectedRow.id > 0) {
      this.createOrEditBmsMstSegment2ProjectType.show(this.selectedRow.id);
    } else {
      this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Edit));
    }
  }

  delete() {
    if (this.selectedRow.id && this.selectedRow.id > 0) {
      this.message.confirm('', this.l(AppConsts.CPS_KEYS.Are_You_Sure), (isConfirmed) => {
        if (isConfirmed) {
          this.spinnerService.show();
          this._msMstSegment2ProjectTypeServiceProxy.delete(this.selectedRow.id).subscribe(val => {
            this.notify.success('Successfully Deleted');
            this.search();
            this.spinnerService.hide();
          });
        }
      });
    } else {
      this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Delete))
    }
  }

}
