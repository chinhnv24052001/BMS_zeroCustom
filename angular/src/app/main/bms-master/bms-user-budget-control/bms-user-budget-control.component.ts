import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { HttpClient } from '@angular/common/http';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { BmsBudgetUserControlServiceProxy, BmsMstPeriodServiceProxy, BmsMstProjectCodeDto, BmsMstSegment1ServiceProxy, BmsMstSegment4GroupServiceProxy, ExchangeRateMasterServiceProxy, InputSetUserControlBudgetDto, MstCurrencyServiceProxy, MstExchangeRateDto, MstPeriodServiceProxy, MstSegment1Dto, MstSegment4GroupDto, ProjectCodeServiceProxy, UserChechBudgetDto } from '@shared/service-proxies/service-proxies';
import { ceil } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import { BmsImportSegmentComponent } from '../bms-import-segment/import-segment.component';
import { AddBmsUserBudgetControlComponent } from './add-bms-user-budget-control/add-bms-user-budget-control.component';

@Component({
  selector: 'app-bms-user-budget-control',
  templateUrl: './bms-user-budget-control.component.html',
  styleUrls: ['./bms-user-budget-control.component.css']
})
export class BmsUserbudgetControlComponent extends AppComponentBase implements OnInit {
  @ViewChild('addBmsUserBudgetControl', { static: true }) addBmsUserBudgetControl: AddBmsUserBudgetControlComponent;
  gridForm: FormGroup;
  gridColDef: CustomColDef[];
  defaultColDef: CustomColDef = {
    filter: false,
    sortable: false,
    suppressMenu: true,
    menuTabs: [],
    floatingFilter: true
  };
  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridParams: GridParams | undefined;
  listGrid: UserChechBudgetDto[];
  selectedRow: UserChechBudgetDto = new UserChechBudgetDto();
  listPertiod: { value: number, label: string, }[] = [];
  listCurrency: { value: number, label: string, }[] = [];
  urlBase: string = AppConsts.remoteServiceBaseUrl;
  isSelect;
  inputSetUserControlBudgetDto: InputSetUserControlBudgetDto = new InputSetUserControlBudgetDto();

  constructor(
    injector: Injector,
    private _mstPeriodServiceProxy: BmsMstPeriodServiceProxy,
    private formBuilder: FormBuilder,
    private _bmsBudgetUserControlServiceProxy: BmsBudgetUserControlServiceProxy,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.isSelect = true;
    this.buildForm();
    // this.selectDropDownPeriod();
    this.gridColDef = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        maxWidth: 60,
        filter: false
      },
      {
        headerName: this.l('UserName'),
        headerTooltip: this.l('UserName'),
        field: 'userName',
        minWidth: 150
      },
      // {
      //   headerName: this.l('UserFullName'),
      //   headerTooltip: this.l('UserFullName'),
      //   field: 'userFullName', 
      //   minWidth: 100
      // },
      {
        headerName: this.l('DepartmentName'),
        headerTooltip: this.l('DepartmentName'),
        field: 'departmentName',
        minWidth: 200
      },
      {
        headerName: this.l('DivisionName'),
        headerTooltip: this.l('DivisionName'),
        field: 'divisionName',
        minWidth: 200
      },
      {
        headerName: this.l('GroupName'),
        headerTooltip: this.l('GroupName'),
        field: 'groupName',
        minWidth: 200
      },

    ]
  }

  selectDropDownPeriod() {
    this._mstPeriodServiceProxy.getAllBmsPeriodNoPage('', 0, '', 20, 0).subscribe((result) => {
      this.listPertiod = [];
      this.listPertiod.push({ value: 0, label: " " });
      result.forEach(ele => {
        this.listPertiod.push({ value: ele.id, label: ele.periodName });
      });
    });
  }

  buildForm() {
    this.gridForm = this.formBuilder.group({
      userId: [0],
      userName: [undefined],
      fullName: [undefined],
      isFinanceMA: [false],
      isGroupManageRight: [false],
    });
    this.search();
  }

  callBackGrid(params: GridParams) {
    this.gridParams = params;
    params.api.setRowData([]);
  }

  onChangeSelection(params) {
    this.selectedRow =
      params.api.getSelectedRows()[0] ?? new UserChechBudgetDto();
    this.selectedRow = Object.assign({}, this.selectedRow);
    this.gridForm.get('userId').setValue(this.selectedRow.userId);
    this.gridForm.get('userName').setValue(this.selectedRow.userName);
    this.gridForm.get('fullName').setValue(this.selectedRow.userFullName);
    this.gridForm.get('isFinanceMA').setValue(this.selectedRow.isFinanceMA);
    this.gridForm.get('isGroupManageRight').setValue(this.selectedRow.isGroupManageRight);
    this.isSelect = false;
  }

  changePaginationParams(paginationParams: PaginationParamsModel) {
    if (!this.listGrid) {
      return;
    }
    this.paginationParams = paginationParams;
    this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
    this.paginationParams.pageSize = paginationParams.pageSize;
    this.search();
  }

  search() {
    this.spinnerService.show();
    this._bmsBudgetUserControlServiceProxy.getAllUserNoPage()
      .pipe(finalize(() => {
        this.spinnerService.hide();
      }))
      .subscribe((result) => {
        this.listGrid = result;
        this.gridParams.api.setRowData(this.listGrid);
        this.gridParams.api.sizeColumnsToFit();
      });
  }

  userManagement() {
    if (this.selectedRow.userId && this.selectedRow.userId > 0) {
      this.addBmsUserBudgetControl.show(this.selectedRow.userId, 0);
    } else {
      this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line));
    }
  }

  groupManagement() {
    if (this.selectedRow.userId && this.selectedRow.userId > 0) {
      this.addBmsUserBudgetControl.show(this.selectedRow.userId, 1);
    } else {
      this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line));
    }
  }

  save() {
    this.spinnerService.show();
    if (this.selectedRow.userId && this.selectedRow.userId > 0) {
      this._bmsBudgetUserControlServiceProxy.saveUser(this.gridForm.getRawValue())
      .pipe(finalize(() => {
        this.spinnerService.hide();
      }))
      .subscribe(val => {
        this.buildForm();
        this.notify.success(this.l(AppConsts.CPS_KEYS.Saved_Successfully));
      });
    } else {
      this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line));
    }
    
  }

}
