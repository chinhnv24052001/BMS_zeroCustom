import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { HttpClient } from '@angular/common/http';
import { Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GetPurchasePurposeDto, InputPurchasePurposeDto, MstPurchasePurposeServiceProxy, MstUnitOfMeasureServiceProxy, UnitOfMeasureDto } from '@shared/service-proxies/service-proxies';
import * as FileSaver from 'file-saver';
import { ceil } from 'lodash-es';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-bms-budget-plan-review-investment',
  templateUrl: './bms-budget-plan-review-investment.component.html',
  styleUrls: ['./bms-budget-plan-review-investment.component.css']
})
export class BmsBudgetPlanReviewInvestmentComponent extends AppComponentBase implements OnInit {
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

  constructor(
    injector: Injector,
    private _mainServiceProxy: MstUnitOfMeasureServiceProxy,
    private _http: HttpClient,
    private formBuilder: FormBuilder,
  ) {
    super(injector);
  }

  ngOnInit(): void {

    this.search();
    this.gridColDef = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        maxWidth: 60,
        pinned: 'left',
        filter: false
      },
      {
        headerName: this.l('Group'),
        headerTooltip: this.l('Group'),
        field: 'group',
        pinned: 'left',
        maxWidth: 100,
      },
      {
        headerName: this.l('Div.'),
        headerTooltip: this.l('Div.'),
        field: 'division',
        pinned: 'left',
        maxWidth: 100,
      },
      {
        headerName: this.l('Dept.'),
        headerTooltip: this.l('Dept.'),
        field: 'department',
        pinned: 'left',
        maxWidth: 100,
      },
      {
        headerName: this.l('Project/Non Project'),
        headerTooltip: this.l('Project/Non Project'),
        field: 'nonProject',
        pinned: 'left',
        maxWidth: 100,
      },
      {
        headerName: this.l('Investment Type'),
        headerTooltip: this.l('Investment Type'),
        field: 'investmentType',
        pinned: 'left',
        maxWidth: 100,
      },
      {
        headerName: this.l('Budget name'),
        headerTooltip: this.l('Budget name'),
        field: 'budgetName',
        pinned: 'left',
        maxWidth: 150,
      },
      {
        headerName: this.l('Budget code'),
        headerTooltip: this.l('Budget code'),
        field: 'budgetCode',
        pinned: 'left',
        maxWidth: 150,
      },

      {
        headerName: this.l('PL No.'),
        headerTooltip: this.l('PL No.'),
        field: 'plNumber',
      },
      {
        headerName: this.l('CarModel'),
        headerTooltip: this.l('CarModel'),
        field: 'carModel',
      },
      {
        headerName: this.l('Project Code'),
        headerTooltip: this.l('Project Code'),
        field: 'projectCode',
      },
      {
        headerName: this.l('TMC Code'),
        headerTooltip: this.l('TMC Code'),
        field: 'tmcCode',
      },
      {
        headerName: this.l('TMC Category Name'),
        headerTooltip: this.l('TMC Category Name'),
        field: 'tmcCategoryName',
      },
      {
        headerName: this.l('PP06'),
        headerTooltip: this.l('PP06'),
        field: 'pp06',
      },
      {
        headerName: this.l('AssetClass'),
        headerTooltip: this.l('Asset Class'),
        field: 'assetClass ',
      },
      {
        headerName: this.l('PR/Ringi issue month'),
        headerTooltip: this.l('PR/Ringi issue month'),
        field: 'issueMonth',
      },
      {
        headerName: this.l('Completion month'),
        headerTooltip: this.l('Completion month'),
        field: 'completionMonth',
      },
      {
        headerName: this.l('Sale to Dlr month'),
        headerTooltip: this.l('Sale to Dlr month'),
        field: 'saleToDlrmonth',
      },
    

      {
        headerName: this.l('FY20 Actual'),
        headerTooltip: this.l('FY20 Actual'),
        field: 'fy20Actual',
      },
      {
        headerName: this.l('FY 21 Actual'),
        headerTooltip: this.l('FY 21 Actual'),
        field: 'fy21Actual',
      },

      //1
      {
        headerName: this.l('FY24 1st cut'),
        headerTooltip: this.l('FY24 1st cut'),
        field: 'fy24_1stCut',
      },

      //2
      {
        headerName: this.l('FY24 financial plan'),
        headerTooltip: this.l('FY24 financial plan'),
        field: 'fy24FinancialPlan',
      },

      //3
      {
        headerName: this.l('FY24 1Q'),
        headerTooltip: this.l('FY24 1Q'),
        field: 'fy24_1q',
      },

      //4
      {
        headerName: this.l('FY24 2Q'),
        headerTooltip: this.l('FY24 2Q'),
        field: 'fy24_2q',
      },

      //5
      {
        headerName: this.l('FY22 3Q'),
        headerTooltip: this.l('FY22 3Q'),
        field: 'fy22_3q',
      },

      //6
      {
        headerName: this.l('FY22 11-1 plan'),
        headerTooltip: this.l('FY22 11-1 plan'),
        field: 'fy22_11Plan',
      },

      {
        headerName: this.l('Financial Plan'),
        headerTooltip: this.l('Financial Plan'),
        field: 'finPlan'
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
