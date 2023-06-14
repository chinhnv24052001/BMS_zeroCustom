import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { HttpClient } from '@angular/common/http';
import { Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { BmsBudgetPlanReviewServiceProxy, BmsMstPeriodServiceProxy, BmsMstSegment1ServiceProxy, BmsMstSegment4GroupServiceProxy, BmsPeriodVersionServiceProxy, BudgetTransferDto, BudgetTransferServiceProxy, ExchangeRateMasterServiceProxy, MstCurrencyServiceProxy, MstExchangeRateDto, MstPeriodServiceProxy, MstSegment1Dto, MstSegment4GroupDto } from '@shared/service-proxies/service-proxies';
import { ceil } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { BmsBudgetPlanReviewExpenseComponent } from './bms-tab-child/bms-budget-plan-review-expense/bms-budget-plan-review-expense.component';
import { BmsBudgetPlanReviewInvestmentComponent } from './bms-tab-child/bms-budget-plan-review-investment/bms-budget-plan-review-investment.component';

@Component({
  selector: 'app-bms-budget-plan-review',
  templateUrl: './bms-budget-plan-review.component.html',
  styleUrls: ['./bms-budget-plan-review.component.css']
})
export class BmsBudgetPlanReviewComponent extends AppComponentBase implements OnInit {
  @ViewChild(' bmsBudgetPlanReviewExpense', { static: true }) bmsBudgetPlanReviewExpense: BmsBudgetPlanReviewExpenseComponent;
  @ViewChild(' bmsBudgetPlanReviewInvestment', { static: true }) bmsBudgetPlanReviewInvestment: BmsBudgetPlanReviewInvestmentComponent;
  gridForm: FormGroup;
  listPertiod: { value: number, label: string, year: number}[] = [];
  listPertiodVersion: { value: number, label: string, }[] = [];
  
  listGroup: { value: number, label: string, }[] = [];
  listDiv: { value: number, label: string, }[] = [];
  listDep: { value: number, label: string, }[] = [];
  tabKey: number = 1;
  isGroupRece: Boolean = false;
  year;
  lisColumn: any[];
  versionName;
  @Input() params: any;

  constructor(
    injector: Injector,
    private _mainComponentServiceProxy: BmsBudgetPlanReviewServiceProxy,
    private _mstPeriodServiceProxy: BmsMstPeriodServiceProxy,
    private formBuilder: FormBuilder,
    private _bmsPeriodVersionServiceProxy: BmsPeriodVersionServiceProxy,
    private dataFormatService: DataFormatService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    if (this.params?.key === 1) {
      this.tabKey = 1;
    }
    else if (this.params?.key === 2) {
      this.tabKey = 2;
    }
    else {
      this.tabKey = 3;
    }

    this.buildForm();
    this.gridForm.get('tabKey').setValue(this.tabKey);
    this.selectDropDownPeriod();
    this.listPertiodVersion = [];
  }

  selectDropDownPeriod() {
    this._mstPeriodServiceProxy.getAllBmsPeriodNoPage('', 0, '', 20, 0).subscribe((result) => {
      this.listPertiod = [];
      this.listPertiod.push({ value: 0, label: " ", year: 0});
      result.forEach(ele => {
        this.listPertiod.push({ value: ele.id, label: ele.periodName, year: ele.periodYear });
      });
    });
  }

  getListVersionByPeriodId(id) {
    this._bmsPeriodVersionServiceProxy.getAllVersionByPeriodIdNoPage(id).subscribe((result) => {
      this.listPertiodVersion = [];
      this.listPertiodVersion.push({ value: 0, label: " " });
      result.forEach(ele => {
        this.listPertiodVersion.push({ value: ele.id, label: ele.versionName });
      });
    });
  }

  buildForm() {
    this.gridForm = this.formBuilder.group({
      periodId: [0],
      periodVersionId: [0],
      tabKey: [0],
      groupId: [0],
      divId: [0],
      depId: [0],
      year: [undefined]
    });
  }

  callBackGrid(params: GridParams) {
    params.api.setRowData([]);
  }

  onchangePeriod(id)
  {
    this.year = this.listPertiod.find(e => e.value == id)?.year;
    this.gridForm.get('year').setValue(this.year);
  }

  onchangePeriodVersion(id)
  {
    this._mainComponentServiceProxy.getAllColumnByVersionId(id).subscribe((result)=> {
      this.lisColumn = result;
      console.log(this.lisColumn)
    });

    this.versionName = this.listPertiodVersion.find(e => e.value == id)?.label;
  }

  search() {
    this.bmsBudgetPlanReviewExpense.showAgain();
    // this.spinnerService.show();
    // this._mainComponentServiceProxy.getAllBudgetTransfer(
    //   this.gridForm.get('periodId').value,
    //   this.gridForm.get('periodVersionId').value,
    //   this.tabKey,
    //   (this.paginationParams ? this.paginationParams.sorting : ''),
    //   (this.paginationParams ? this.paginationParams.pageSize : 20),
    //   (this.paginationParams ? this.paginationParams.skipCount : 1))
    //   .pipe(finalize(() => {
    //     this.spinnerService.hide();
    //   }))
    //   .subscribe((result) => {
    //     this.listGrid = result.items;
    //     this.gridParams.api.setRowData(this.listGrid);
    //     this.paginationParams.totalCount = result.totalCount;
    //     this.paginationParams.totalPage = ceil(result.totalCount / this.paginationParams.pageSize);
    //     this.gridParams.api.sizeColumnsToFit();
    //   });
  }
}
