import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { HttpClient } from '@angular/common/http';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { BmsMstPairingSegmentDto, BmsMstPairingSegmentServiceProxy, BmsMstPeriodServiceProxy, BmsMstSegment1ServiceProxy, BmsMstSegment4GroupServiceProxy, MstPeriodServiceProxy, MstSegment1Dto, MstSegment4GroupDto } from '@shared/service-proxies/service-proxies';
import { ceil } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import { BmsImportSegmentComponent } from '../bms-import-segment/import-segment.component';
import { CreateOrEditBmsMstPairingSegmentGroupComponent } from './create-or-edit-bms-mst-pairing-segment/create-or-edit-bms-mst-pairing-segment.component';

@Component({
  selector: 'app-bms-mst-pairing-segment',
  templateUrl: './bms-mst-pairing-segment.component.html',
  styleUrls: ['./bms-mst-pairing-segment.component.css']
})
export class BmsMstPairingSegmentComponent extends AppComponentBase implements OnInit {
  @ViewChild(' createOrEditBmsMstPairingSegmentGroup', { static: true })  createOrEditBmsMstPairingSegmentGroup: CreateOrEditBmsMstPairingSegmentGroupComponent;
  pairingSegmentForm: FormGroup;
  gridColDef: CustomColDef[];
  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridParams: GridParams | undefined;
  listPairingSegment: BmsMstPairingSegmentDto[];
  selectedRow: BmsMstPairingSegmentDto = new BmsMstPairingSegmentDto();
  @ViewChild('bmsImportSegment', { static: true }) bmsImportSegment: BmsImportSegmentComponent; 

  constructor(
    injector: Injector,
    private _bmsMstPairingSegmentServiceProxy: BmsMstPairingSegmentServiceProxy,
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
        headerName: this.l('Period'),
        headerTooltip: this.l('Period'),
        field: 'periodName', 
        minWidth: 200 
      },
      {
        headerName: this.l('Version'),
        headerTooltip: this.l('Version'),
        field: 'periodVersionName', 
        minWidth: 100
      },
      {
        headerName: this.l('Segment1Name'),
        headerTooltip: this.l('Segment1Name'),
        field: 'segment1Name', 
        minWidth: 200
      },
      {
        headerName: this.l('Segment2Name'),
        headerTooltip: this.l('Segment2Name'),
        field: 'segment2Name',
        minWidth: 200
      },
      {
        headerName: this.l('Segment3Name'),
        headerTooltip: this.l('Segment3Name'),
        field: 'segment3Name',
        minWidth: 200
      },
      {
        headerName: this.l('Segment4Name'),
        headerTooltip: this.l('Segment4Name'),
        field: 'segment4Name',
        minWidth: 200
      },
      {
        headerName: this.l('Segment5Name'),
        headerTooltip: this.l('Segment5Name'),
        field: 'segment5Name',
        minWidth: 200
      },
      {
        headerName: this.l('PairingText'),
        headerTooltip: this.l('PairingText'),
        field: 'pairingText',
        minWidth: 500
      },
      {
        headerName: this.l('Name'),
        headerTooltip: this.l('Name'),
        field: 'name',
        minWidth: 250
      },
      {
        headerName: this.l('Type'),
        headerTooltip: this.l('Type'),
        field: 'type',
        minWidth: 100,
        cellClass: 'text-center',
      },
      {
        headerName: this.l('Description'),
        headerTooltip: this.l('Description'),
        field: 'description',
        minWidth: 400
      },
      {
        headerName: this.l('Status'),
        headerTooltip: this.l('Status'),
        field: 'isActive',
        cellRenderer: (params) => params.value ? this.l('Active') : this.l('InActive'),
        minWidth: 100,
    },
    ]
  }

  buildForm() {
    this.pairingSegmentForm = this.formBuilder.group({
      fillterText: [undefined]
    });
    this.search();
  }

  callBackGrid(params: GridParams) {
    this.gridParams = params;
    params.api.setRowData([]);
  }

  onChangeSelection(params) {
    this.selectedRow =
      params.api.getSelectedRows()[0] ?? new BmsMstPairingSegmentDto();
    this.selectedRow = Object.assign({}, this.selectedRow);
    
  }

  changePaginationParams(paginationParams: PaginationParamsModel) {
    if (!this.listPairingSegment) {
      return;
    }
    this.paginationParams = paginationParams;
    this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
    this.paginationParams.pageSize = paginationParams.pageSize;
    this.search();
  }

  search() {
    this.spinnerService.show();
    this._bmsMstPairingSegmentServiceProxy.getAllPairingSegment(
      this.pairingSegmentForm.get('fillterText').value,
      (this.paginationParams ? this.paginationParams.sorting : ''),
      (this.paginationParams ? this.paginationParams.pageSize : 20),
      (this.paginationParams ? this.paginationParams.skipCount : 1))
      .pipe(finalize(() => {
        this.spinnerService.hide();
      }))
      .subscribe((result) => {
        this.listPairingSegment = result.items;
        this.gridParams.api.setRowData(this.listPairingSegment);
        this.paginationParams.totalCount = result.totalCount;
        this.paginationParams.totalPage = ceil(result.totalCount / this.paginationParams.pageSize);
        this.gridParams.api.sizeColumnsToFit();
      });
  }

  add() {
    this.createOrEditBmsMstPairingSegmentGroup.show();
  }

  edit() {
    if (this.selectedRow.id && this.selectedRow.id > 0) {
      this.createOrEditBmsMstPairingSegmentGroup.show(this.selectedRow.id);
    } else {
      this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Edit));
    }
  }

  delete() {
    if (this.selectedRow.id && this.selectedRow.id > 0) {
      this.message.confirm('', this.l(AppConsts.CPS_KEYS.Are_You_Sure), (isConfirmed) => {
        if (isConfirmed) {
          this.spinnerService.show();
          this._bmsMstPairingSegmentServiceProxy.delete(this.selectedRow.id).subscribe(val => {
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

   //Import excel
   importExcel() {
    this.bmsImportSegment.show(12345);
}
}
