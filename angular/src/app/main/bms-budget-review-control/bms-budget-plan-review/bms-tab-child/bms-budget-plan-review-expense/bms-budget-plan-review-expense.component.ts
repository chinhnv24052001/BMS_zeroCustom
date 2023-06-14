import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { HttpClient } from '@angular/common/http';
import { Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { BmsMstColumn, BmsPeriodVersionServiceProxy, GetPurchasePurposeDto, InputPurchasePurposeDto, MstPurchasePurposeServiceProxy, MstUnitOfMeasureServiceProxy, UnitOfMeasureDto } from '@shared/service-proxies/service-proxies';
import * as FileSaver from 'file-saver';
import { ceil } from 'lodash-es';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-bms-budget-plan-review-expense',
  templateUrl: './bms-budget-plan-review-expense.component.html',
  styleUrls: ['./bms-budget-plan-review-expense.component.css']
})
export class BmsBudgetPlanReviewExpenseComponent extends AppComponentBase implements OnInit {
  // @ViewChild('createOrEditMstUnitOfMeasure', { static: true }) createOrEditMstUnitOfMeasure: CreateOrEditMstUnitOfMeasureComponent;
  unitOfMeasureForm: FormGroup;
  gridColDef: CustomColDef[];
  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridParams: GridParams | undefined;
  defaultColDef: CustomColDef = {
    filter: false,
    sortable: false,
    suppressMenu: true,
    menuTabs: [],
    floatingFilter: true
  };
  // listGrid: MonthlyBudgetPlanDto[];
  listGrid: any[];
  // selectedRow: MonthlyBudgetPlanDto = new MonthlyBudgetPlanDto();
  selectedRow: any;
  urlBase: string = AppConsts.remoteServiceBaseUrl;
  @Input() tabKey;
  @Input() year;
  @Input() listColumn : any[] = [];
  currentPeriod;
  @Input() versionName = '';
  constructor(
    injector: Injector,
    private _mainServiceProxy: MstUnitOfMeasureServiceProxy,
    private _http: HttpClient,
    private formBuilder: FormBuilder,
    private _bmsPeriodVersionServiceProxy : BmsPeriodVersionServiceProxy
  ) {
    super(injector);
  }

  ngOnInit(): void {
    // this.setDatatableAndColumn();
  }

  showAgain()
  {
    this.setDatatableAndColumn();
  }

  setDatatableAndColumn()
  {
    this.search();
    this.gridColDef = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        maxWidth: 60,
        pinned: 'left',
        filter: false,
        editable: false
      },
      {
        headerName: this.l('Group'),
        headerTooltip: this.l('Group'),
        field: 'group',
        pinned: 'left',
        maxWidth: 100,
        editable: false
      },
      {
        headerName: this.l('Div.'),
        headerTooltip: this.l('Div.'),
        field: 'division',
        pinned: 'left',
        maxWidth: 100,
        editable: false
      },
      {
        headerName: this.l('Dept.'),
        headerTooltip: this.l('Dept.'),
        field: 'department',
        pinned: 'left',
        maxWidth: 100,
        editable: false
      },
      {
        headerName: this.l('Category'),
        headerTooltip: this.l('Category'),
        field: 'category',
        pinned: 'left',
        maxWidth: 100,
        editable: false
      },
      {
        headerName: this.l('Expense Type'),
        headerTooltip: this.l('Expense Type'),
        field: 'expenseType',
        pinned: 'left',
        maxWidth: 100,
        editable: false
      },
      {
        headerName: this.l('Budget name'),
        headerTooltip: this.l('Budget name'),
        field: 'budgetName',
        pinned: 'left',
        maxWidth: 150,
        editable: false
      },
      {
        headerName: this.l('Budget code'),
        headerTooltip: this.l('Budget code'),
        field: 'budgetCode',
        pinned: 'left',
        maxWidth: 150,
        editable: false
      },

      {
        headerName: this.l('CarModel'),
        headerTooltip: this.l('CarModel'),
        field: 'carModel',
        // hide: this.tabType != "1"
        editable: false
      },
      {
        headerName: this.l('Project Code'),
        headerTooltip: this.l('Project Code'),
        field: 'projectCode',
        // hide: this.tabType != "2"
        editable: false
      },
      {
        headerName: this.l('PL No.'),
        headerTooltip: this.l('PL No.'),
        field: 'plNumber',
        editable: false
      },

      {
        headerName: 'FY' + (this.year - 2000 - 2).toString() + ' Actual',
        headerTooltip: 'FY' + (this.year - 2000 - 2) + ' Actual',
        field: 'fy20Actual',
        editable: false
      },
      {
        headerName: 'FY' + (this.year - 2000 - 1).toString() + ' Actual',
        headerTooltip: 'FY' + (this.year - 2000 - 1) + ' Actual',
        field: 'fy21Actual',
        editable: false
      },

      //1
      {
        headerName: 'FY' + (this.year - 2000) + ' 1st cut',
        headerTooltip: 'FY' + (this.year - 2000) + ' 1st cut',
        field: 'fy24_1stCut',
        hide: !this.listColumn.some(a => a.columnType === 1 && a.id === BmsMstColumn.OriginalPlan),
        editable: false
      },
      {
         headerName: 'GAP vs. FY' + (this.year - 2000 - 1),
         headerTooltip: 'GAP vs. FY' + (this.year - 2000 - 1),
         hide: !this.listColumn.some(a => a.columnType === 1 && a.id === BmsMstColumn.OriginalPlanGap),
        children: [
          {
            headerName: this.l('Amount'),
            headerTooltip: this.l('Amount'),
            field: 'amount',
            editable: false
          },
          {
            headerName: this.l('Remark'),
            headerTooltip: this.l('Remark'),
            field: 'remark',
            editable: this.versionName === 'Original Plan'
          },
        ]
      },

      //2
      {
        headerName: 'FY' + (this.year - 2000) + ' financial plan',
        headerTooltip: 'FY' + (this.year - 2000) + ' financial plan',
        field: 'fy24FinancialPlan',
        hide: !this.listColumn.some(a => a.columnType === 1 && a.id === BmsMstColumn.FinancialPlan),
        editable: false
      },
      {
        headerName: 'GAP vs. FY' + (this.year - 2000 - 1) + ' FP',
        headerTooltip: 'GAP vs. FY' + (this.year - 2000 - 1) + ' FP',
        hide: !this.listColumn.some(a => a.columnType === 1 && a.id === BmsMstColumn.FinancialPlanGap),
        children: [
          {
            headerName: this.l('Amount'),
            headerTooltip: this.l('Amount'),
            field: 'amount',
            editable: false
          },
          {
            headerName: this.l('Remark'),
            headerTooltip: this.l('Remark'),
            field: 'remark',
            editable: this.versionName === 'Financial Plan'
          },
        ]
      },

      //3
      {
        headerName: 'FY' + (this.year - 2000) + ' 1Q',
        headerTooltip: 'FY' + (this.year - 2000) + ' 1Q',
        field: 'fy24_1q',
        hide: !this.listColumn.some(a => a.columnType === 1 && a.id === BmsMstColumn.P1Q),
        editable: false
      },
      {
        headerName:  'GAP vs. FY' + (this.year - 2000) + ' 1st cut', 
        headerTooltip: 'GAP vs. FY' + (this.year - 2000) + ' 1st cut', 
        hide: !this.listColumn.some(a => a.columnType === 1 && a.id === BmsMstColumn.P1QGap),
        children: [
          {
            headerName: this.l('Amount'),
            headerTooltip: this.l('Amount'),
            field: 'amount',
            editable: false
          },
          {
            headerName: this.l('Remark'),
            headerTooltip: this.l('Remark'),
            field: 'remark',
            editable: this.versionName === '1Q'
          },
        ]
      },

      //4
      {
        headerName: 'FY' + (this.year - 2000) + ' 2Q',
        headerTooltip: 'FY' + (this.year - 2000) + ' 2Q',
        field: 'fy24_2q',
        hide: !this.listColumn.some(a => a.columnType === 1 && a.id === BmsMstColumn.P2Q),
        editable: false
      },
      {
        headerName: 'GAP vs. FY' + (this.year - 2000) + ' 1Q review', 
        headerTooltip: 'GAP vs. FY' + (this.year - 2000) + ' 1Q review', 
        hide: !this.listColumn.some(a => a.columnType === 1 && a.id === BmsMstColumn.P2QGap),
        children: [
          {
            headerName: this.l('Amount'),
            headerTooltip: this.l('Amount'),
            field: 'amount',
            editable: false
          },
          {
            headerName: this.l('Remark'),
            headerTooltip: this.l('Remark'),
            field: 'remark',
            editable: this.versionName === '2Q'
          },
        ]
      },

      //5
      {
        headerName: 'FY' + (this.year - 2000-2) + ' 3Q',
        headerTooltip: 'FY' + (this.year - 2000-2) + ' 3Q',
        field: 'fy22_3q',
        hide: !this.listColumn.some(a => a.columnType === 1 && a.id === BmsMstColumn.P3Q),
        editable: false
      },
      {
        headerName: 'GAP vs. FY' + (this.year - 2000 - 2) + ' 1Q review',
        headerTooltip: 'GAP vs. FY' + (this.year - 2000 - 2) + ' 1Q review',
        hide: !this.listColumn.some(a => a.columnType === 1 && a.id === BmsMstColumn.P3QGap),
        children: [
          {
            headerName: this.l('Amount'),
            headerTooltip: this.l('Amount'),
            field: 'amount',
            editable: false
          },
          {
            headerName: this.l('Remark'),
            headerTooltip: this.l('Remark'),
            field: 'remark',
            editable: this.versionName === '3Q'
          },
        ]
      },

      //6
      {
        headerName: 'FY' + (this.year - 2000-2) + ' 11-1 plan',
        headerTooltip:  'FY' + (this.year - 2000-2) + ' 11-1 plan',
        field: 'fy22_11Plan',
        hide: !this.listColumn.some(a => a.columnType === 1 && a.id === BmsMstColumn.P11P1),
        editable: false
      },
      {
        headerName: 'GAP vs. FY' + (this.year - 2000 - 2) + ' 3Q review', 
        headerTooltip: 'GAP vs. FY' + (this.year - 2000 - 2) + ' 3Q review', 
        hide: !this.listColumn.some(a => a.columnType === 1 && a.id === BmsMstColumn.P11P1Gap),
        children: [
          {
            headerName: this.l('Amount'),
            headerTooltip: this.l('Amount'),
            field: 'amount',
            editable: false
          },
          {
            headerName: this.l('Remark'),
            headerTooltip: this.l('Remark'),
            field: 'remark',
            editable: this.versionName === 'Plan 11+1'
          },
        ]
      },

      {
        headerName: this.l('Plan by month'),
        headerTooltip: this.l('Plan by month'),
        children: [
          {
            headerName: 'APR_' + (this.year -1), 
            headerTooltip:  'APR_' + (this.year -1), 
            field: 'aprPlan',
            hide: !this.listColumn.some(a => a.columnType == 0 && a.id == BmsMstColumn.Apr),
          },
          {
            headerName:  'APR_' + (this.year -1), 
            headerTooltip:  'APR_' + (this.year -1), 
            field: 'aprActual', 
            editable: false,
            hide: this.listColumn.some(a => a.columnType == 0 && a.id == BmsMstColumn.Apr)
          },

          {
            headerName: 'MAY_' + (this.year -1),   
            headerTooltip: 'MAY_' + (this.year -1), 
            field: 'mayPlan',
            hide: !this.listColumn.some(a => a.columnType == 0 && a.id == BmsMstColumn.May)
          },
          {
            headerName:  'MAY_' + (this.year -1), 
            headerTooltip:  'MAY_' + (this.year -1), 
            field: 'mayActual',
            editable: false, 
            hide: this.listColumn.some(a => a.columnType == 0 && a.id == BmsMstColumn.May)
          },

          {
            headerName: 'JUN_' + (this.year -1),
            headerTooltip: 'JUN_' + (this.year -1),
            field: 'junPlan',
            hide: !this.listColumn.some(a => a.columnType == 0 && a.id == BmsMstColumn.Jun)
          },
          {
            headerName:  'JUN_' + (this.year -1),
            headerTooltip:  'JUN_' + (this.year -1),
            field: 'junActual',
            editable: false, 
            hide: this.listColumn.some(a => a.columnType == 0 && a.id == BmsMstColumn.Jun)
          },

          {
            headerName: 'JUL_' + (this.year -1),
            headerTooltip: 'JUL_' + (this.year -1),
            field: 'julPlan',
            hide: !this.listColumn.some(a => a.columnType == 0 && a.id == BmsMstColumn.Jul)
          },
          {
            headerName:  'JUL_' + (this.year -1),
            headerTooltip:  'JUL_' + (this.year -1),
            field: 'mayActual',
            editable: false, 
            hide: this.listColumn.some(a => a.columnType == 0 && a.id == BmsMstColumn.Jul)
          },

          {
            headerName: 'AUG_' + (this.year -1),
            headerTooltip: 'AUG_' + (this.year -1),
            field: 'augPlan',
            hide: !this.listColumn.some(a => a.columnType == 0 && a.id == BmsMstColumn.Aug)
          },
          {
            headerName:  'AUG_' + (this.year -1), 
            headerTooltip:  'AUG_' + (this.year -1), 
            field: 'augActual',
            editable: false, 
            hide: this.listColumn.some(a => a.columnType == 0 && a.id == BmsMstColumn.Aug)
          },

          {
            headerName:'SEP_' + (this.year -1),
            headerTooltip: 'SEP_' + (this.year -1),
            field: 'sepPlan',
            hide: !this.listColumn.some(a => a.columnType == 0 && a.id == BmsMstColumn.Sep)
          },
          {
            headerName:  'SEP_' + (this.year -1),
            headerTooltip:  'SEP_' + (this.year -1),
            field: 'sepActual',
            editable: false, 
            hide: this.listColumn.some(a => a.columnType == 0 && a.id == BmsMstColumn.Sep)
          },

          {
            headerName: 'OCT_' + (this.year -1),
            headerTooltip: 'OCT_' + (this.year -1),
            field: 'octPlan',
            hide: !this.listColumn.some(a => a.columnType == 0 && a.id == BmsMstColumn.Oct)
          },
          {
            headerName:  'OCT_' + (this.year -1),
            headerTooltip:  'OCT_' + (this.year -1),
            field: 'octActual',
            editable: false, 
            hide: this.listColumn.some(a => a.columnType == 0 && a.id == BmsMstColumn.Oct)
          },

          {
            headerName: 'NOV_' + (this.year -1),
            headerTooltip: 'NOV_' + (this.year -1),
            field: 'novPlan',
            hide: !this.listColumn.some(a => a.columnType == 0 && a.id == BmsMstColumn.Nov)
          },
          {
            headerName:  'NOV_' + (this.year -1),
            headerTooltip:  'NOV_' + (this.year -1),
            field: 'novActual',
            editable: false, 
            hide: this.listColumn.some(a => a.columnType == 0 && a.id == BmsMstColumn.Nov)
          },

          {
            headerName: 'DEC_' + (this.year -1),
            headerTooltip: 'DEC_' + (this.year -1),
            field: 'decPlan',
            hide: !this.listColumn.some(a => a.columnType == 0 && a.id == BmsMstColumn.Dec)
          },
          {
            headerName: 'DEC_' + (this.year -1),
            headerTooltip: 'DEC_' + (this.year -1),
            field: 'decActual',
            editable: false, 
            hide: this.listColumn.some(a => a.columnType == 0 && a.id == BmsMstColumn.Dec)
          },

          {
            headerName: 'JAN_' + (this.year),
            headerTooltip: 'JAN_' + (this.year),
            field: 'janPlan',
            hide: !this.listColumn.some(a => a.columnType == 0 && a.id == BmsMstColumn.Jan)
          },
          {
            headerName:  'JAN_' + (this.year),
            headerTooltip:  'JAN_' + (this.year),
            field: 'janActual',
            editable: false, 
            hide: this.listColumn.some(a => a.columnType == 0 && a.id == BmsMstColumn.Jan)
          },

          {
            headerName: 'FEB_' + (this.year),
            headerTooltip: 'FEB_' + (this.year),
            field: 'febPlan',
            hide: !this.listColumn.some(a => a.columnType == 0 && a.id == BmsMstColumn.Feb)
          },
          {
            headerName:  'FEB_' + (this.year),
            headerTooltip:  'FEB_' + (this.year),
            field: 'febActual',
            editable: false, 
            hide: this.listColumn.some(a => a.columnType == 0 && a.id == BmsMstColumn.Feb)
          },

          {
            headerName: 'MAR_' + (this.year),
            headerTooltip: 'MAR_' + (this.year),
            field: 'marPlan',
            hide: !this.listColumn.some(a => a.columnType == 0 && a.id == BmsMstColumn.Mar)
          },
          {
            headerName:  'MAR_' + (this.year), 
            headerTooltip:  'MAR_' + (this.year), 
            field: 'marActual',
            editable: false, 
            hide: this.listColumn.some(a => a.columnType == 0 && a.id == BmsMstColumn.Mar)
          },
        ]
      },
      {
        headerName: this.l('Currency'),
        headerTooltip: this.l('Currency'),
        field: 'currency'
      },
    ]
  }

  callBackGrid(params: GridParams) {
    this.gridParams = params;
    params.api.setRowData([]);
      let lmao = BmsMstColumn;
  }

  onChangeSelection(params) {
    this.selectedRow =
      params.api.getSelectedRows()[0] ?? new UnitOfMeasureDto(); //Dto
    this.selectedRow = Object.assign({}, this.selectedRow);
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

    // var currentPeriod = this.listGrid.find(a => a.periodVersionId === 1);
    // this.spinnerService.show();
    // this._mainServiceProxy.getAllMeasureDto(
    //   this.unitOfMeasureForm.get('unitOfMeasure').value,
    //   this.unitOfMeasureForm.get('uOMCode').value,
    //   this.unitOfMeasureForm.get('uOMClass').value,
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

  // addUnitOfMeasure() {
  //   this.createOrEditMstUnitOfMeasure.show();
  // }

  // editUnitOfMeasure() {
  //   if (this.selectedRow.id && this.selectedRow.id > 0) {
  //     this.createOrEditMstUnitOfMeasure.show(this.selectedRow.id);
  //   } else {
  //     this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Edit));
  //   }
  // }


  // deleteUnitOfMeasure() {
  //   if (this.selectedRow.id && this.selectedRow.id > 0) {
  //     this.message.confirm('', this.l(AppConsts.CPS_KEYS.Are_You_Sure), (isConfirmed) => {
  //       if (isConfirmed) {
  //         this.spinnerService.show();
  //         this._mstUnitOfMeasureServiceProxy.delete(this.selectedRow.id).subscribe(val => {
  //           this.notify.success('Successfully Deleted');
  //           this.searchUnitOfMeasure();
  //           this.spinnerService.hide();
  //         });
  //       }
  //     });
  //   } else {
  //     this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Delete))
  //   }
  // }

  exportExcell() {
    this.spinnerService.show();
    this._http.post(`${this.urlBase}/api/MasterExcelExport/MstOUMExportExcel`,
      {
        UnitOfMeasure: this.unitOfMeasureForm.value.unitOfMeasure,
        UOMCode: this.unitOfMeasureForm.value.uOMCode,
        UOMClass: this.unitOfMeasureForm.value.uOMClass,

      },
      { responseType: 'blob' }).pipe(finalize(() => {
        this.spinnerService.hide();
      })).subscribe(blob => {
        FileSaver.saveAs(blob, 'MstOUMExportExcel.xlsx');
      });
  }

}
