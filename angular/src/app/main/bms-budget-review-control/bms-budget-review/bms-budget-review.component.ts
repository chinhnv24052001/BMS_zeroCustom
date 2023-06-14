import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { HttpClient } from '@angular/common/http';
import { Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { BmsMstPeriodServiceProxy, BmsMstSegment1ServiceProxy, BmsMstSegment4GroupServiceProxy, BmsPeriodVersionServiceProxy, BudgetTransferDto, BudgetTransferServiceProxy, ExchangeRateMasterServiceProxy, MstCurrencyServiceProxy, MstExchangeRateDto, MstPeriodServiceProxy, MstSegment1Dto, MstSegment4GroupDto } from '@shared/service-proxies/service-proxies';
import { ceil } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { BmsMonthlyBudgetPlanComponent } from './bms-tab-child/bms-monthly-budget-plan/bms-monthly-budget-plan.component';
import { BmsMonthlyCashPlanComponent } from './bms-tab-child/bms-monthly-cash-plan/bms-monthly-cash-plan.component';

@Component({
  selector: 'app-bms-budget-review',
  templateUrl: './bms-budget-review.component.html',
  styleUrls: ['./bms-budget-review.component.css']
})
export class BmsBudgetReviewComponent extends AppComponentBase implements OnInit {
  @ViewChild(' bmsMonthlyBudgetPlanExpense', { static: true }) bmsMonthlyBudgetPlanExpense: BmsMonthlyBudgetPlanComponent;
  @ViewChild(' bmsMonthlyBudgetPlanInvestment', { static: true }) bmsMonthlyBudgetPlanInvestment: BmsMonthlyBudgetPlanComponent;

  @ViewChild(' bmsMonthlyCashPlanExpense', { static: true }) bmsMonthlyCashPlanExpense: BmsMonthlyCashPlanComponent;
  @ViewChild(' bmsMonthlyCashPlanInvestment', { static: true }) bmsMonthlyCashPlanInvestment: BmsMonthlyCashPlanComponent;
  gridForm: FormGroup;
  gridColDef: CustomColDef[];
  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridParams: GridParams | undefined;
  listGrid: BudgetTransferDto[];
  selectedRow: BudgetTransferDto = new BudgetTransferDto();
  listPertiod: { value: number, label: string, }[] = [];
  listPertiodVersion: { value: number, label: string, }[] = [];
  urlBase: string = AppConsts.remoteServiceBaseUrl;
  tabKey: number = 1;
  isMAFin: Boolean = false;
  disableUSerSubmit: number = 1;
  disableGroupApproval: Boolean = true;
  disableFinApproval: Boolean = true;

  disableGroupReject: Boolean = true;
  disableFinReject: Boolean = true;
  isGroupRece: Boolean = false;
  @Input() params: any;

  constructor(
    injector: Injector,
    private _mainComponentServiceProxy: BudgetTransferServiceProxy,
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
    this.gridColDef = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        maxWidth: 70,
      },
      {
        headerName: this.l('TransferBudgetInfomation'),
        headerTooltip: this.l('TransferBudgetInfomation'),
        children: [
          {
            headerName: this.l('TransferNo'),
            headerTooltip: this.l('TransferNo'),
            field: 'transferNo',
            minWidth: 100
          },
          {
            headerName: this.l('Date'),
            headerTooltip: this.l('Date'),
            field: 'date',
            valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.date) : "",
            minWidth: 100,
            cellClass: ["text-center"]
          },
          {
            headerName: this.l('Amount'),
            headerTooltip: this.l('Amount'),
            field: 'amountTransfer',
            minWidth: 200
          },
          {
            headerName: this.l('Purpose'),
            headerTooltip: this.l('Purpose'),
            field: 'purpose',
            minWidth: 200
          },
        ]
      },
      {
        headerName: this.l('FromBudget'),
        headerTooltip: this.l('FromBudget'),
        children: [
          {
            headerName: this.l('Code'),
            headerTooltip: this.l('Code'),
            field: 'fromBudgetCode',
            minWidth: 300
          },
          {
            headerName: this.l('Name'),
            headerTooltip: this.l('Name'),
            field: 'fromBudgetName',
            minWidth: 200,
          },
          {
            headerName: this.l('Amount'),
            headerTooltip: this.l('Amount'),
            field: 'fromRemaining',
            minWidth: 200
          },
        ]
      },
      {
        headerName: this.l('ToBudget'),
        headerTooltip: this.l('ToBudget'),
        children: [
          {
            headerName: this.l('Code'),
            headerTooltip: this.l('Code'),
            field: 'toBudgetCode',
            minWidth: 300
          },
          {
            headerName: this.l('Name'),
            headerTooltip: this.l('Name'),
            field: 'toBudgetName',
            minWidth: 200,
          },
          {
            headerName: this.l('Amount'),
            headerTooltip: this.l('Amount'),
            field: 'toRemaining',
            minWidth: 200
          },
          {
            headerName: this.l('Type'),
            headerTooltip: this.l('Type'),
            field: 'type',
            minWidth: 200
          },
        ]
      },
      {
        headerName: this.l('Status'),
        headerTooltip: this.l('Status'),
        field: 'status',
        minWidth: 300
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
      tabKey: [0]
    });
  }

  callBackGrid(params: GridParams) {
    this.gridParams = params;
    params.api.setRowData([]);
  }

  onChangeSelection(params) {
    this.selectedRow =
      params.api.getSelectedRows()[0] ?? new BudgetTransferDto();
    this.selectedRow = Object.assign({}, this.selectedRow);

    //disable user PIC submit
    if (this.selectedRow.statusId == 1
      || this.selectedRow.statusId == 3
      || this.selectedRow.statusId == 5
      || this.selectedRow.statusId == 7
      || this.selectedRow.statusId == 9) {
      this.disableUSerSubmit = 0;
    }
    else {
      this.disableUSerSubmit = 1;
    }

    //disable Fin
    if ((this.isMAFin && this.selectedRow.statusId == 8)
        || (!this.isMAFin && this.selectedRow.statusId == 6)) {
      this.disableFinApproval = false;
      this.disableFinReject = false;
    }
    else {
      this.disableFinApproval = true;
      this.disableFinReject = true;
    }
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
    this._mainComponentServiceProxy.getAllBudgetTransfer(
      this.gridForm.get('periodId').value,
      this.gridForm.get('periodVersionId').value,
      this.tabKey,
      (this.paginationParams ? this.paginationParams.sorting : ''),
      (this.paginationParams ? this.paginationParams.pageSize : 20),
      (this.paginationParams ? this.paginationParams.skipCount : 1))
      .pipe(finalize(() => {
        this.spinnerService.hide();
      }))
      .subscribe((result) => {
        this.listGrid = result.items;
        this.gridParams.api.setRowData(this.listGrid);
        this.paginationParams.totalCount = result.totalCount;
        this.paginationParams.totalPage = ceil(result.totalCount / this.paginationParams.pageSize);
        this.gridParams.api.sizeColumnsToFit();
      });
  }

  // add() {
  //   this.createOrEditBmsBudgetTransferUser.show(0, 2, 0);
  // }

  // edit() {
  //   if (this.selectedRow.id && this.selectedRow.id > 0) {
  //     this.createOrEditBmsBudgetTransferUser.show(this.selectedRow.id, this.selectedRow.typeId, 1);
  //   } else {
  //     this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Edit));
  //   }
  // }

  // addition() {
  //   this.bmsBudgetAddition.show();
  // }

  delete() {
    if (this.selectedRow.id && this.selectedRow.id > 0) {
      this.message.confirm('', this.l(AppConsts.CPS_KEYS.Are_You_Sure), (isConfirmed) => {
        if (isConfirmed) {
          this.spinnerService.show();
          this._mainComponentServiceProxy.delete(this.selectedRow.id).subscribe(val => {
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
