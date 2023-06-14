import { ICellRendererParams, ValueGetterParams } from '@ag-grid-enterprise/all-modules';
import { Component, ElementRef, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ApprovalTreeDetailSaveDto, ApprovalTreeSaveDto, MstApprovalTreeServiceProxy, MstPurchasePurposeServiceProxy, MstUnitOfMeasureServiceProxy } from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { GridTableService } from '@app/shared/services/grid-table.service';
import { AgDropdownRendererComponent } from '@app/shared/common/grid-input-types/ag-dropdown-renderer/ag-dropdown-renderer.component';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { AgDataValidateService } from '@app/shared/services/ag-data-validate.service';
import { AgDatepickerRendererComponent } from '@app/shared/common/grid-input-types/ag-datepicker-renderer/ag-datepicker-renderer.component';
import { CreateOrEditApprovalTreeDetailComponent } from './create-or-edit-approval-tree-detail/create-or-edit-approval-tree-detail.component';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';
import { fail } from 'assert';

@Component({
    selector: 'create-or-edit-approval-tree',
    templateUrl: './create-or-edit-approval-tree.component.html',
    styleUrls: ['./create-or-edit-approval-tree.component.less']
})
export class CreateOrEditApprovalTreeComponent extends AppComponentBase implements OnInit {
    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
    @ViewChild('createOrEditApprovalTreeDetail', { static: true }) createOrEditApprovalTreeDetail: CreateOrEditApprovalTreeDetailComponent;
    @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
    @Output() close = new EventEmitter<any>();
    createOrEditForm: FormGroup;
    gridColDefDetail: CustomColDef[];
    paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
    listProcessType: { value: number, label: string, }[] = [];
    listApprovalType: { value: string, key: number }[] = [];
    listHrOrgStructure: { key: string, value: string, }[] = [];
    listTitle: { key: number, value: string, }[] = [];
    listPosition: { key:  number, value: string,  }[] = [];
    listIventory: { value: number, label: string, }[] = [];
    listCurrency: { value: number, label: string, }[] = [];
    listUser: { value: number, label: string, }[] = [];
    isEdit = true;
    isSubmit = false;
    frameworkComponents;
    cellParams;
    amountErr = false;
    amountFromGreaterThan0Val = false;

    gridParamsPrDetail: GridParams | undefined;
    gridParamsPrDetailDistributions: GridParams | undefined;
    displayedData = [];
    selectedRowPrDetailDistributions;
    listApprovalTreeDetail = [];
    sumPrice: number = 0;
    approvalTreeSaveDto: ApprovalTreeSaveDto = new ApprovalTreeSaveDto();
    selectedRow: ApprovalTreeDetailSaveDto = new ApprovalTreeDetailSaveDto();
    string0 =0;
    usdCurrency = 0;

    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private dataFormatService: DataFormatService,
        private gridTableService: GridTableService,
        private _mstApprovalTreeServiceProxy: MstApprovalTreeServiceProxy,
        private agDataValidateService: AgDataValidateService,
    ) {
        super(injector);
        this.frameworkComponents = {
            agDatepickerRendererComponent: AgDatepickerRendererComponent,
            agSelectRendererComponent: AgDropdownRendererComponent,
        };

        this.selectDropDownApprovalType();
        this.selectDropDownHrOrgStructure();
        this.selectDropDownTitle();

        this.gridColDefDetail = [
            {
                // STT
                headerName: this.l('STT'),
                headerTooltip: this.l('STT'),
                cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
                width: 50,
            },
            {
                headerName: this.l('ApprovalType'),
                headerTooltip: this.l('ApprovalType'),
                field: 'approvalTypeId',
                width: 150,

                valueGetter: (params: ValueGetterParams) => {
                    return this.listApprovalType.find(ele => ele.key == params.data.approvalTypeId) != null ?
                        this.listApprovalType.find(ele => ele.key == params.data.approvalTypeId).value : null;
                }
            },
            {
                headerName: this.l('HrOrgStructure'),
                headerTooltip: this.l('HrOrgStructure'),
                field: 'hrOrgStructureId',
                width: 230,
                valueGetter: (params: ValueGetterParams) => {
                    return this.listHrOrgStructure.find(ele => ele.key == params.data.hrOrgStructureId) != null ?
                        this.listHrOrgStructure.find(ele => ele.key == params.data.hrOrgStructureId).value : null;
                }
            },
            // {
            //     headerName: this.l('Title'),
            //     headerTooltip: this.l('Title'),
            //     field: 'titleId',
            //     width: 230,
            //     valueGetter: (params: ValueGetterParams) => {
            //         return this.listTitle.find(ele => ele.key == params.data.titleId) != null ?
            //             this.listTitle.find(ele => ele.key == params.data.titleId).value : null;
            //     }
            // },
            {
                headerName: this.l('PositionModal'),
                headerTooltip: this.l('PositionModal'),
                field: 'positionId',
                width: 230,
                valueGetter: (params: ValueGetterParams) => {
                    return this.listPosition.find(ele => ele.key == params.data.positionId) != null ?
                        this.listPosition.find(ele => ele.key == params.data.positionId).value : null;
                }
            },
            {
                headerName: this.l('ListUserId'),
                headerTooltip: this.l('ListUserId'),
                field: 'listUserId',
                width: 450,
                valueGetter: (params: ValueGetterParams) => {
                    let listUserName = '';
                    if (params.data.listUserId != null) {
                        params.data.listUserId.forEach(element => {
                            let userName = this.listUser.find(ele => ele.value == element) != null ?
                                this.listUser.find(ele => ele.value == element).label : null;
                            if (userName != null) {
                                listUserName += userName + ', ';
                            }
                        });
                    }
                    return listUserName;
                }
            },
            {
                headerName: this.l('DayOfProcess'),
                headerTooltip: this.l('DayOfProcess'),
                field: 'dayOfProcess',
                maxWidth: 80
            },
        ]
    }

    ngOnInit(): void {
        this.selectDropDownProcessType();
        this.selectDropDownCurrency();
        this.selectDropDownApprovalType();
        this.selectDropDownHrOrgStructure();
        this.selectDropDownTitle();
        this.selectDropDownIventoryGroup();
        this.selectDropDownUser();
        this.selectDropDownPosition();
    }

    //drop down approval type
selectDropDownPosition() {
    this._mstApprovalTreeServiceProxy.getListPosition().subscribe((result) => {
        this.listPosition = [];
        this.listPosition.push({ key: 0, value: " " });
        result.forEach(ele => {
            this.listPosition.push({ key: ele.id, value: ele.positionName });
        });
    });
}

    //drop down user
    selectDropDownUser() {
        this._mstApprovalTreeServiceProxy.getListUser().subscribe((result) => {
            this.listUser = [];
            result.forEach(ele => {
                this.listUser.push({ value: ele.id, label: ele.userName });
            });
        });
    }

    //drop down proccessType
    selectDropDownProcessType() {
        this._mstApprovalTreeServiceProxy.getListProcessType().subscribe((result) => {
            this.listProcessType = [];
            this.listProcessType.push({ value: 0, label: " " });
            result.forEach(ele => {
                this.listProcessType.push({ value: ele.id, label: ele.processName });
            });
        });
    }

    //drop down Iventory
    selectDropDownIventoryGroup() {
        this._mstApprovalTreeServiceProxy.getListIventoryGroup().subscribe((result) => {
            this.listIventory = [];
            this.listIventory.push({ value: 0, label: " " });
            result.forEach(ele => {
                this.listIventory.push({ value: ele.id, label: ele.name });
            });
        });
    }

    //drop down currency
    selectDropDownCurrency() {
        this._mstApprovalTreeServiceProxy.getListCurrency()
        .pipe(finalize(()=>{
            // this.createOrEditForm = this.formBuilder.group({
            //     id: [0],
            //     processTypeId: [undefined, GlobalValidator.required],
            //     currencyId: [this.listCurrency.find(e => e.label?.toUpperCase() == "USD")?.value],
            //     inventoryGroupId: [0],
            //     amountFrom: [undefined, GlobalValidator.required],
            //     amountTo: [undefined, GlobalValidator.required],
            //     description: [undefined],
            // });
        }))
        .subscribe((result) => {
            this.listCurrency = [];
            this.listCurrency.push({ value: 0, label: " " });
            result.forEach(ele => {
                this.listCurrency.push({ value: ele.id, label: ele.name });
            });
        });
    }

    //drop down approval type
    selectDropDownApprovalType() {
        this._mstApprovalTreeServiceProxy.getListApprovalType().subscribe((result) => {
            this.listApprovalType = [];
            this.listApprovalType.push({ value: " ", key: 0 });
            result.forEach(ele => {
                this.listApprovalType.push({ value: ele.approvalTypeName, key: ele.id });
            });
        });
    }

    //drop down Org
    selectDropDownHrOrgStructure() {
        this._mstApprovalTreeServiceProxy.getListHrOrgStructure().subscribe((result) => {
            this.listHrOrgStructure = [];
            this.listHrOrgStructure.push({ key: "", value: " " });
            result.forEach(ele => {
                this.listHrOrgStructure.push({ key: ele.id, value: ele.name });
            });
        });
    }

    //drop down title
    selectDropDownTitle() {
        this._mstApprovalTreeServiceProxy.getListTitle().subscribe((result) => {
            this.listTitle = [];
            this.listTitle.push({ key: 0, value: " " });
            result.forEach(ele => {
                this.listTitle.push({ key: ele.id, value: ele.name });
            });
        });
    }

    buildForm() {
        this.createOrEditForm = this.formBuilder.group({
            id: [0],
            processTypeId: [undefined, GlobalValidator.required],
            currencyId: [0],
            inventoryGroupId: [0],
            amountFrom: [undefined, GlobalValidator.required],
            amountTo: [undefined, GlobalValidator.required],
            description: [undefined],
        });
    }

    show(id?: number) {

        this.buildForm();
// console.log(this.listCurrency)
        // this.listProcessType = [...this.listProcessType]
        this.amountErr = false;
        this.amountFromGreaterThan0Val = false;
        if (id && id > 0) {
            this.spinnerService.show();
            this.isEdit = true;
            this._mstApprovalTreeServiceProxy.loadById(id)
                .pipe(finalize(() => {
                    // this.listProcessType = [...this.listProcessType]
                    // this.listCurrency = [...this.listCurrency]
                    // this.listIventory = [...this.listIventory]
                    this.spinnerService.hide();
                }))
                .subscribe(val => {
                    this.createOrEditForm = this.formBuilder.group({
                        id: val.id,
                        processTypeId: [val.processTypeId, GlobalValidator.required],
                        currencyId: [this.listCurrency.find(e => e.label?.toUpperCase().includes("USD"))?.value],
                        inventoryGroupId: [val.inventoryGroupId],
                        amountFrom: val.amountFrom !=0 ? this.dataFormatService.moneyFormat(val.amountFrom) : 0,
                        amountTo: this.dataFormatService.moneyFormat(val.amountTo),
                        description: [val.description],
                    });
                    this.listCurrency = [...this.listCurrency]
                    this.displayedData = val.listApprovalTreeDetailSave;
                    console.log(val)
                });
        }
        else {
            this.createOrEditForm = this.formBuilder.group({
                id: [0],
                processTypeId: [undefined, GlobalValidator.required],
                currencyId: [this.listCurrency.find(e => e.label?.toUpperCase().includes("USD"))?.value],
                inventoryGroupId: [0],
                amountFrom: [undefined, GlobalValidator.required],
                amountTo: [undefined, GlobalValidator.required],
                description: [undefined],
            });
                    this.listCurrency = [...this.listCurrency]
                    this.isEdit = false;
        }
        this.modal.show();
    }

    closeModel() {
        this.modal.hide();
    }

    reset() {
        this.createOrEditForm = undefined;
        this.displayedData = [];
    }

    save() {
        if (this.validateMoney()) {
            this.isSubmit = true;
            this.displayedData.forEach((element) => {
                element.approvalSeq = this.displayedData.indexOf(element) + 1;
            });
            this.approvalTreeSaveDto = this.createOrEditForm.getRawValue();
            this.approvalTreeSaveDto.listApprovalTreeDetailSave = this.displayedData;
            if (this.submitBtn) {
                this.submitBtn.nativeElement.click();
            }
            if (this.createOrEditForm.invalid) {
                return;
            }

            if (Number(this.createOrEditForm.get('amountFrom').value.toString().replaceAll(",","")) < 0) {
                this.amountFromGreaterThan0Val = true;
                return;
            }
            else {
                this.amountFromGreaterThan0Val = false;
            }

            if (Number(this.createOrEditForm.get('amountFrom').value.toString().replaceAll(",","")) >= Number(this.createOrEditForm.get('amountTo').value.toString().replaceAll(",",""))) {
                this.amountErr = true;
                return;
            }
            else {
                this.amountErr = false;
            }

            this.spinnerService.show();
            this._mstApprovalTreeServiceProxy.save(this.approvalTreeSaveDto)
                .pipe(finalize(() => this.spinnerService.hide()))
                .subscribe(val => {
                    if (val.includes("Error")) {
                        this.notify.error(val.replace("Error: ", ""));
                    }
                    else {
                        this.notify.success(val.replace("Info: ", ""));
                        this.modal.hide();
                        this.close.emit();
                    }
                });
        }

    }

    callBackGridPrDetail(params: GridParams) {
        this.gridParamsPrDetail = params;
        params.api.setRowData([]);
    }

    callBackGridPrDetailDistributions(params: GridParams) {
        this.gridParamsPrDetailDistributions = params;
        params.api.setRowData([]);
    }

    getDisplayedData() {
        this.displayedData = this.gridTableService.getAllData(this.gridParamsPrDetail);

    }

    // validateBeforeAddRow() {
    //   return this.agDataValidateService.validateDataGrid(this.gridParamsPrDetail, this.gridColDefDetail, this.displayedData);
    // }

    add() {
        this.createOrEditApprovalTreeDetail.show();
    }

    edit() {
        if (!this.selectedRow) {
            this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Edit));
            return;
        }
        else {
            this.createOrEditApprovalTreeDetail.show(this.selectedRow);
        }
    }

    addRow(createApprovalDetailDto) {
        const blankProduct = {
            stt: this.displayedData.length + 1,
            approvalTypeId: createApprovalDetailDto.approvalTypeId,
            hrOrgStructureId: createApprovalDetailDto.hrOrgStructureId,
            // titleId: createApprovalDetailDto.titleId,
            positionId: createApprovalDetailDto.positionId,
            listUserId: createApprovalDetailDto.listUserId,
            approvalSeq: this.displayedData.length + 1,
            dayOfProcess: createApprovalDetailDto.dayOfProcess,
        }
        const editProduct = {
            approvalTypeId: createApprovalDetailDto.approvalTypeId,
            hrOrgStructureId: createApprovalDetailDto.hrOrgStructureId,
            // titleId: createApprovalDetailDto.titleId,
            positionId: createApprovalDetailDto.positionId,
            listUserId: createApprovalDetailDto.listUserId,
            approvalSeq: this.displayedData.length,
            dayOfProcess: createApprovalDetailDto.dayOfProcess,
        }
        if (createApprovalDetailDto.check == 0) {
            this.gridParamsPrDetail.api.applyTransaction({ add: [blankProduct] });
            this.getDisplayedData();
        }
        else {
            var indexogf = this.displayedData.indexOf(this.selectedRow);
            var nextCell;
            this.gridTableService.setDataToRow(this.gridParamsPrDetail, indexogf, editProduct, this.displayedData, nextCell);
            this.getDisplayedData();
        }

    }

    removeSelectedRow() {
        if (!this.selectedRow) {
            this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Delete));
            return;
        }
        else {
            this.message.confirm('', this.l(AppConsts.CPS_KEYS.Are_You_Sure), (isConfirmed) => {
                if (isConfirmed) {
                    this.gridTableService.removeSelectedRow(this.gridParamsPrDetail, this.selectedRow);

                    this.selectedRow = undefined;
                    this.notify.success(this.l(AppConsts.CPS_KEYS.Successfully_Deleted));
                    this.getDisplayedData();
                }
            });
        }
    }

    onChangeSelectionDetail(params) {
        const selectedRows = params.api.getSelectedRows();
        if (selectedRows) {
            this.selectedRow = selectedRows[0];
        }
    }

    onChangeSelectionPrDetailDistributions(params) {
        const selectedRows = params.api.getSelectedRows();
        if (selectedRows) {
            this.selectedRowPrDetailDistributions = selectedRows[0];
        }
    }

    changeIndexUp() {
        if (!this.selectedRow) {
            this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_SetUp));
            return;
        }
        var indexogf = this.displayedData.indexOf(this.selectedRow);
        if (indexogf == 0) {
            this.notify.warn(this.l(AppConsts.CPS_KEYS.This_Row_Is_The_First));
            return
        }
        else {
            var tg = this.displayedData[indexogf - 1];
            var nextCell;
            this.gridTableService.setDataToRow(this.gridParamsPrDetail, indexogf - 1, this.selectedRow, this.displayedData, nextCell);
            this.gridTableService.setDataToRow(this.gridParamsPrDetail, indexogf, tg, this.displayedData, nextCell);
            this.getDisplayedData();
        }
    }

    changeIndexDown() {
        if (!this.selectedRow) {
            this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_SetDown));
            return;
        }
        var indexogf = this.displayedData.indexOf(this.selectedRow);
        if (indexogf == this.displayedData.length - 1) {
            this.notify.warn(this.l(AppConsts.CPS_KEYS.This_Row_Is_The_Last));
            return
        }
        else {
            var tg = this.displayedData[indexogf + 1];
            var nextCell;
            this.gridTableService.setDataToRow(this.gridParamsPrDetail, indexogf + 1, this.selectedRow, this.displayedData, nextCell);
            this.gridTableService.setDataToRow(this.gridParamsPrDetail, indexogf, tg, this.displayedData, nextCell);
            this.getDisplayedData();
        }
    }

    onCellValueChanged(params) {
        this.cellParams = params;
        if (this.cellParams.column.colId == "approvalTypeId" && this.cellParams.data.approvalTypeId == 1) {
        }
    }

    validateMoney() {
        const money = this.createOrEditForm.get('amountFrom').value.toString().replaceAll(",","");
        const money1 = this.createOrEditForm.get('amountTo').value.toString().replaceAll(",","");
        // check if money is a number
        if (isNaN(money) || isNaN(money1)) {
            this.notify.error(this.l('Please enter a valid number'));
            return false;
        }
        return true;
    }

}
