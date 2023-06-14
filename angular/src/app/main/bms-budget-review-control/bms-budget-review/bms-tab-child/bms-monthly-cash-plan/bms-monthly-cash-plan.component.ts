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
  selector: 'app-bms-monthly-cash-plan',
  templateUrl: './bms-monthly-cash-plan.component.html',
  styleUrls: ['./bms-monthly-cash-plan.component.css']
})
export class BmsMonthlyCashPlanComponent extends AppComponentBase implements OnInit {
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
  @Input() tabType;

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
      // {
      //   // STT
      //   headerName: this.l('STT'),
      //   headerTooltip: this.l('STT'),
      //   cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
      //   width: 2,
      // },
      {
        headerName: this.l('Budget Setting'),
        headerTooltip: this.l('Budget Setting'),
        children: [
          {
            headerName: this.l('Description'),
            headerTooltip: this.l('Description'),
            children: [
              {
                // STT
                headerName: this.l('STT'),
                headerTooltip: this.l('STT'),
                cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
                width: 2,
                filter: false
              },
              {
                headerName: this.l('Group'),
                headerTooltip: this.l('Group'),
                field: 'group'
              },
              {
                headerName: this.l('Div.'),
                headerTooltip: this.l('Div.'),
                field: 'division'
              },
              {
                headerName: this.l('Dept.'),
                headerTooltip: this.l('Dept.'),
                field: 'department'
              },
              {
                headerName: this.l('Budget Code'),
                headerTooltip: this.l('Budget Code'),
                field: 'budgetCode'
              },
              {
                headerName: this.l('Activities Name'),
                headerTooltip: this.l('Activities Name'),
                field: 'activitiesName'
              },
            ]
          },
          {
            headerName: this.l('Total'),
            headerTooltip: this.l('Total'),
            children: [
              {
                headerName: this.l('Plan'),
                headerTooltip: this.l('Plan'),
                field: 'planTotal'
              },
            ]
          },
        ]
      },
      {
        headerName: this.l('Cash Setting'),
        headerTooltip: this.l('Cash Setting'),
        children: [
          {
            headerName: this.l('April'),
            headerTooltip: this.l('April'),
            children: [
              {
                headerName: this.l('Plan'),
                headerTooltip: this.l('Plan'),
                field: 'aprilPlan'
              },
              {
                headerName: this.l('Actual'),
                headerTooltip: this.l('Actual'),
                field: 'aprilActual'
              },
            ]
          },
          {
            headerName: this.l('May'),
            headerTooltip: this.l('May'),
            children: [
              {
                headerName: this.l('Plan'),
                headerTooltip: this.l('Plan'),
                field: 'mayPlan'
              },
              {
                headerName: this.l('Actual'),
                headerTooltip: this.l('Actual'),
                field: 'mayActual'
              },
            ]
          },
          {
            headerName: this.l('June'),
            headerTooltip: this.l('June'),
            children: [
              {
                headerName: this.l('Plan'),
                headerTooltip: this.l('Plan'),
                field: 'junePlan'
              },
              {
                headerName: this.l('Actual'),
                headerTooltip: this.l('Actual'),
                field: 'juneActual'
              },
            ]
          },
          {
            headerName: this.l('July'),
            headerTooltip: this.l('July'),
            children: [
              {
                headerName: this.l('Plan'),
                headerTooltip: this.l('Plan'),
                field: 'julyPlan'
              },
              {
                headerName: this.l('Actual'),
                headerTooltip: this.l('Actual'),
                field: 'julyActual'
              },
            ]
          },
          {
            headerName: this.l('August'),
            headerTooltip: this.l('August'),
            children: [
              {
                headerName: this.l('Plan'),
                headerTooltip: this.l('Plan'),
                field: 'augustPlan'
              },
              {
                headerName: this.l('Actual'),
                headerTooltip: this.l('Actual'),
                field: 'augustActual'
              },
            ]
          },
          {
            headerName: this.l('September'),
            headerTooltip: this.l('September'),
            children: [
              {
                headerName: this.l('Plan'),
                headerTooltip: this.l('Plan'),
                field: 'septemberPlan'
              },
              {
                headerName: this.l('Actual'),
                headerTooltip: this.l('Actual'),
                field: 'septemberActual'
              },
            ]
          },
          {
            headerName: this.l('October'),
            headerTooltip: this.l('October'),
            children: [
              {
                headerName: this.l('Plan'),
                headerTooltip: this.l('Plan'),
                field: 'octoberPlan'
              },
              {
                headerName: this.l('Actual'),
                headerTooltip: this.l('Actual'),
                field: 'octoberActual'
              },
            ]
          },
          {
            headerName: this.l('November'),
            headerTooltip: this.l('November'),
            children: [
              {
                headerName: this.l('Plan'),
                headerTooltip: this.l('Plan'),
                field: 'novemberPlan'
              },
              {
                headerName: this.l('Actual'),
                headerTooltip: this.l('Actual'),
                field: 'novemberActual'
              },
            ]
          },
          {
            headerName: this.l('December'),
            headerTooltip: this.l('December'),
            children: [
              {
                headerName: this.l('Plan'),
                headerTooltip: this.l('Plan'),
                field: 'decemberPlan'
              },
              {
                headerName: this.l('Actual'),
                headerTooltip: this.l('Actual'),
                field: 'decemberActual'
              },
            ]
          },
          {
            headerName: this.l('January'),
            headerTooltip: this.l('January'),
            children: [
              {
                headerName: this.l('Plan'),
                headerTooltip: this.l('Plan'),
                field: 'januaryPlan'
              },
              {
                headerName: this.l('Actual'),
                headerTooltip: this.l('Actual'),
                field: 'januaryActual'
              },
            ]
          },
          {
            headerName: this.l('February'),
            headerTooltip: this.l('February'),
            children: [
              {
                headerName: this.l('Plan'),
                headerTooltip: this.l('Plan'),
                field: 'februaryPlan'
              },
              {
                headerName: this.l('Actual'),
                headerTooltip: this.l('Actual'),
                field: 'februaryActual'
              },
            ]
          },
          {
            headerName: this.l('March'),
            headerTooltip: this.l('March'),
            children: [
              {
                headerName: this.l('Plan'),
                headerTooltip: this.l('Plan'),
                field: 'marchPlan'
              },
              {
                headerName: this.l('Actual'),
                headerTooltip: this.l('Actual'),
                field: 'marchActual'
              },
            ]
          },
        ]
      },
      {
        headerName: this.l('Summary'),
        headerTooltip: this.l('Summary'),
        children: [
          {
            headerName: this.l(''),
            headerTooltip: this.l(''),
            children: [
              {
                headerName: this.l('Budget Review'),
                headerTooltip: this.l('Budget Review'),
                field: 'budgetReview'
              },
            ]
          },
          {
            headerName: this.l(''),
            headerTooltip: this.l(''),
            children: [
              {
                headerName: this.l('Actual'),
                headerTooltip: this.l('Actual'),
                field: 'actualSummary'
              },
            ]
          },
        ]
      },
      
      {
        headerName: this.l('Details Infomation'),
        headerTooltip: this.l('Details Infomation'),
        children: [
          {
            headerName: this.l('Type'),
            headerTooltip: this.l('Type'),
            field: 'type',
            hide: this.tabType != "1"
          },
          {
            headerName: this.l('Category'),
            headerTooltip: this.l('Category'),
            field: 'category',
            hide: this.tabType != "1"
          },
          {
            headerName: this.l('Expense Type'),
            headerTooltip: this.l('Expense Type'),
            field: 'expenseType',
            hide: this.tabType != "1"
          },
          {
            headerName: this.l('CarModel'),
            headerTooltip: this.l('CarModel'),
            field: 'carModel',
            hide: this.tabType != "1"
          },
          {
            headerName: this.l('Project End Date'),
            headerTooltip: this.l('Project End Date'),
            field: 'projectAndDate',
            hide: this.tabType != "1"
          },
          {
            headerName: this.l('PL Code'),
            headerTooltip: this.l('PL Code'),
            field: 'plCode',
            hide: this.tabType != "1"
          },

          //type = 2
          {
            headerName: this.l('TMC Code'),
            headerTooltip: this.l('TMC Code'),
            field: 'tmcCode',
            hide: this.tabType != "2"
          },
          {
            headerName: this.l('TMC Category Name'),
            headerTooltip: this.l('TMC Category Name'),
            field: 'tmcCategoryName',
            hide: this.tabType != "2"
          },
          {
            headerName: this.l('Project Name'),
            headerTooltip: this.l('Project Name'),
            field: 'projectName',
            hide: this.tabType != "2"
          },
          {
            headerName: this.l('Project Code'),
            headerTooltip: this.l('Project Code'),
            field: 'projectCode',
            hide: this.tabType != "2"
          },
          {
            headerName: this.l('Priority'),
            headerTooltip: this.l('Priority'),
            field: 'priority',
            hide: this.tabType != "2"
          },
          {
            headerName: this.l('Asset'),
            headerTooltip: this.l('Asset'),
            field: 'asset',
            hide: this.tabType != "2"
          },
          {
            headerName: this.l('PP 06'),
            headerTooltip: this.l('PP 06'),
            field: 'pp06',
            hide: this.tabType != "2"
          },
          {
            headerName: this.l('Carry Over'),
            headerTooltip: this.l('Carry Over'),
            field: 'plCode',
            hide: this.tabType != "2"
          },
        ]
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
