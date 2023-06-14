import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { GridTableService } from '@app/shared/services/grid-table.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { BmsBudgetUserControlServiceProxy, BmsMstPeriodServiceProxy, BmsMstSegment1ServiceProxy, BmsMstSegment1TypeCostServiceProxy, BmsMstSegment2ServiceProxy, BmsMstSegment4GroupServiceProxy, BmsPeriodVersionServiceProxy, ExchangeRateMasterServiceProxy, MstCurrencyServiceProxy, MstPeriodServiceProxy, MstPurchasePurposeServiceProxy, MstSegment1Dto, MstSegment2Dto, MstUnitOfMeasureServiceProxy, ProjectCodeServiceProxy, UserBudgetControlDto } from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { log } from 'console';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'add-bms-user-budget-control',
    templateUrl: './add-bms-user-budget-control.component.html',
    styleUrls: ['./add-bms-user-budget-control.component.less']
})
export class AddBmsUserBudgetControlComponent extends AppComponentBase implements OnInit {
    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
    @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
    @Output() close = new EventEmitter<any>();
    userId;
    managerType;
    createOrEditForm: FormGroup;
    isSubmit = false;
    listPertiod: { value: number, label: string, }[] = [];
    listPertiodVersion: { value: number, label: string, }[] = [];
    listSegment1: { value: number, label: string, code: string }[] = [];
    valSeg1Required;
    projectCodeArray: string[] = [];
    gridColDef: CustomColDef[];
    gridColDefOther: CustomColDef[];

    defaultColDef: CustomColDef = {
        filter: false,
        sortable: false,
        suppressMenu: true,
        menuTabs: [],
        floatingFilter: true
    };

    defaultColDefOther: CustomColDef = {
        filter: false,
        sortable: false,
        suppressMenu: true,
        menuTabs: [],
        floatingFilter: true
    };

    gridParams: GridParams | undefined;
    gridParamsOther: GridParams | undefined;
    selectedRow: UserBudgetControlDto = new UserBudgetControlDto();
    selectedRowOther: UserBudgetControlDto = new UserBudgetControlDto();
    selectedRows: UserBudgetControlDto[] = [];
    selectedRowOthers: UserBudgetControlDto[] = [];
    rowData: any[] = [];
    rowDataOther: any[] = [];
    constructor(
        injector: Injector,
        private _mainComponentServiceProxy: ProjectCodeServiceProxy,
        private _mstPeriodServiceProxy: BmsMstPeriodServiceProxy,
        private _bmsPeriodVersionServiceProxy: BmsPeriodVersionServiceProxy,
        private _bmsBudgetUserControlServiceProxy: BmsBudgetUserControlServiceProxy,
        private _bmsMstSegment2ServiceProxy: BmsMstSegment2ServiceProxy,
        private gridTableService: GridTableService,
        private formBuilder: FormBuilder
    ) {
        super(injector);
    }

    ngOnInit(): void {
        // this.getAllRowData();
        this.selectDropDownPeriod();
        this.listPertiodVersion = [];
        this.gridColDef = [
            {
                headerName: "",
                headerTooltip: "",
                field: "isCheck_TEM",
                headerClass: ["align-checkbox-header"],
                cellClass: ["check-box-center"],
                checkboxSelection: true,
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,
                maxWidth: 40,
                filter: false
            },
            {
                headerName: this.l('Budget-Code'),
                headerTooltip: this.l('BudgetCode'),
                field: 'budgetCode',
                minWidth: 300
            },
            {
                headerName: this.l('Department'),
                headerTooltip: this.l('Department'),
                field: 'department',
                minWidth: 200
            },
            {
                headerName: this.l('Division'),
                headerTooltip: this.l('Division'),
                field: 'division',
                minWidth: 200
            },
        ];

        this.gridColDefOther = [
            {
                headerName: "",
                headerTooltip: "",
                field: "isCheck_TEM",
                headerClass: ["align-checkbox-header"],
                cellClass: ["check-box-center"],
                checkboxSelection: true,
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,
                maxWidth: 40,
                filter: false
            },
            {
                headerName: this.l('Budget-Code'),
                headerTooltip: this.l('BudgetCode'),
                field: 'budgetCode',
                minWidth: 300
            },
            {
                headerName: this.l('Department'),
                headerTooltip: this.l('Department'),
                field: 'department',
                minWidth: 200
            },
            {
                headerName: this.l('Division'),
                headerTooltip: this.l('Division'),
                field: 'division',
                minWidth: 200
            },
        ];
    }

    //buget of user
    onChangeSelection(params) {
        this.selectedRow = params.api.getSelectedRows()[0] ?? new UserBudgetControlDto();
        this.selectedRow = Object.assign({}, this.selectedRow);
        this.selectedRows = params.api.getSelectedRows();
        //  var _listBudgetId: any[]=[];
        //  this.selectedRows.forEach(element => {
        //     _listBudgetId.push(element.id);
        //  });
        //  this.createOrEditForm.get('listBudgetId').setValue(_listBudgetId);
    }

    onChangeSelectionOther(params) {
        this.selectedRowOther = params.api.getSelectedRows()[0] ?? new UserBudgetControlDto();
        this.selectedRowOther = Object.assign({}, this.selectedRowOther);
        this.selectedRowOthers = params.api.getSelectedRows();
    }

    callBackGrid(params: GridParams) {
        this.gridParams = params;
    }

    callBackGridOther(params: GridParams) {
        this.gridParamsOther = params;
    }

    getAllRowData() {
        this.rowData = [];
        this.rowDataOther = [];
        this.spinnerService.show();
        this._bmsBudgetUserControlServiceProxy.getAllBudgetForUserCheckBudget(this.userId, this.managerType)
            .pipe(finalize(() => {
                this.spinnerService.hide();
            }))
            .subscribe((result) => {
                //  this.rowData = result;
                this.rowData = result.listLeft;
                this.rowDataOther = result.listRight;
            });
        this.setValueForListBudgetId();
    }

    setValueForListBudgetId() {
        var _listBudgetId: any[] = [];
        this.rowData.forEach(element => {
            _listBudgetId.push(element.id);
        });
        this.createOrEditForm.get('listBudgetId').setValue(_listBudgetId);
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
        this.createOrEditForm = this.formBuilder.group({
            id: [0],
            // periodVersionId: [undefined, GlobalValidator.required],
            // periodId: [undefined],
            userId: [undefined],
            manageType: [undefined],
            listBudgetId: [undefined],
        });
    }

    show(id?: number, type?: number) {
        this.buildForm();
        this.userId =id;
        this.managerType = type;
        this.getAllRowData();
        this.modal.show();
    }

    closeModel() {
        this.modal.hide();
    }

    pushToLeft() {
        this.selectedRowOthers.forEach(element => {
            this.addRowLeft(element);
            this.removeSelectedRowInRight(element);
        });
        this.getDisplayedLeftData();
        this.getDisplayedDataRight();
    }

    pushToRight() {
        this.selectedRows.forEach(element => {
            this.addRowRight(element);
            this.removeSelectedRowInLeft(element);
        });
        this.getDisplayedLeftData();
        this.getDisplayedDataRight();
    }

    removeSelectedRowInLeft(row) {
        this.gridParams.api.applyTransaction({ remove: [row] })
    }

    //add a row to table left
    addRowLeft(row) {
        const blankItem = {
            id: row.id,
            budgetCode: row.budgetCode,
            division: row.division,
            department: row.department,
            isCheck: row.isCheck,
        }

        this.gridParams?.api.applyTransaction({ add: [blankItem] });
        const rowIndex = this.gridParams?.api.getDisplayedRowCount() - 1;
        setTimeout(() => {
            this.gridParams?.api.getRowNode(`${rowIndex}`).setSelected(true);
        }, 100);
    }

    //Get data from table left
    getDisplayedLeftData() {
        this.rowData = this.gridTableService.getAllData(this.gridParams);
    }

    removeSelectedRowInRight(row) {
        this.gridParamsOther.api.applyTransaction({ remove: [row] })
    }

    //add a row to table right
    addRowRight(row) {
        const blankItem = {
            id: row.id,
            budgetCode: row.budgetCode,
            division: row.division,
            department: row.department,
            isCheck: row.isCheck,
        }

        this.gridParamsOther?.api.applyTransaction({ add: [blankItem] });
        const rowIndex = this.gridParamsOther?.api.getDisplayedRowCount() - 1;
        setTimeout(() => {
            this.gridParamsOther?.api.getRowNode(`${rowIndex}`).setSelected(true);
        }, 100);
    }

    getDisplayedDataRight() {
        this.rowDataOther = this.gridTableService.getAllData(this.gridParamsOther);
    }

    reset() {
        this.createOrEditForm = undefined;
    }

    save() {
        this.spinnerService.show();
        this.createOrEditForm.get('userId').setValue(this.userId);
        this.createOrEditForm.get('manageType').setValue(this.managerType);
        this.setValueForListBudgetId();
        this._bmsBudgetUserControlServiceProxy.setUserControlBudget(this.createOrEditForm.getRawValue())
            .pipe(finalize(() => {
                this.spinnerService.hide();
            }))
            .subscribe(val => {
                this.closeModel();
                this.notify.success(this.l(AppConsts.CPS_KEYS.Saved_Successfully));
            });
    }
}
