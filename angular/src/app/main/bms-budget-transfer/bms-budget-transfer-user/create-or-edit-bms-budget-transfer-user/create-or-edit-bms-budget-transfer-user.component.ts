import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AgCellButtonRendererComponent } from '@app/shared/common/grid-input-types/ag-cell-button-renderer/ag-cell-button-renderer.component';
import { AgDatepickerRendererComponent } from '@app/shared/common/grid-input-types/ag-datepicker-renderer/ag-datepicker-renderer.component';
import { AgDropdownRendererComponent } from '@app/shared/common/grid-input-types/ag-dropdown-renderer/ag-dropdown-renderer.component';
import { AgCellEditorParams, CustomColDef, GridParams } from '@app/shared/models/base.model';
import { GridTableService } from '@app/shared/services/grid-table.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { ApprovalTransferBudgetDto, BmsMstPairingSegmentServiceProxy, BmsMstPeriodServiceProxy, BmsMstSegment1ServiceProxy, BmsMstSegment1TypeCostServiceProxy, BmsMstSegment3ServiceProxy, BmsMstSegment4GroupServiceProxy, BmsPeriodVersionServiceProxy, BudgetTransferItemDto, BudgetTransferServiceProxy, ExchangeRateMasterServiceProxy, MstCurrencyServiceProxy, MstPeriodServiceProxy, MstPurchasePurposeServiceProxy, MstUnitOfMeasureServiceProxy } from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'create-or-edit-bms-budget-transfer-user',
    templateUrl: './create-or-edit-bms-budget-transfer-user.component.html',
    styleUrls: ['./create-or-edit-bms-budget-transfer-user.component.less']
})
export class CreateOrEditBmsBudgetTransferUserComponent extends AppComponentBase implements OnInit {
    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
    @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
    @ViewChild('imgInput', { static: false }) InputVar: ElementRef;
    @Output() close = new EventEmitter<any>();
    @Input() isMAFin;
    gridColDef: CustomColDef[];
    createOrEditForm: FormGroup;
    isForm = 1;
    isSubmit = false;
    listDep1: { value: number, label: string, }[] = [];
    listDep2: { value: number, label: string, }[] = [];
    listBudget1: { value: number, label: string, name: string, }[] = [];
    listBudget2: { value: number, label: string, name: string, }[] = [];
    listUserToTransfer: { value: number, label: string, email: string }[] = [];
    listTranbudgetItem;
    selectTransferBudgetItem;
    selectedNode;
    selectedRowItem;
    frameworkComponents;
    gridParamsItem: GridParams | undefined;
    displayedData: BudgetTransferItemDto[] = [];
    listTransferCreate = [];
    @Input() tabKey: any;
    @Input() selectRowTransfer: any;
    typeAdd;
    enterAmountBudget;
    file;
    fileName;
    fileSeverName;
    formData;
    firtShow: number = 1;
    status: number;
    rejectOrApproval: number = 1;
    reasonReject: string = '';
    approvalTransferBudgetDto: ApprovalTransferBudgetDto = new ApprovalTransferBudgetDto();
    constructor(
        injector: Injector,
        private _bmsMstPairingSegmentServiceProxy: BmsMstPairingSegmentServiceProxy,
        private _budgetTransferServiceProxy: BudgetTransferServiceProxy,
        private _bmsMstSegment3ServiceProxy: BmsMstSegment3ServiceProxy,
        private formBuilder: FormBuilder,
        private gridTableService: GridTableService,
        private _httpClient: HttpClient,
    ) {
        super(injector);
        this.gridColDef = [
            {
                headerName: this.l('.No'),
                headerTooltip: this.l('.No'),
                cellRenderer: (params) => params.rowIndex + 1,
                width: 70,
                // field: 'lineNum'
            },
            {
                headerName: this.l('Item/Description'),
                headerTooltip: this.l('Item/Description'),
                field: 'description',
                cellClass: ['cell-clickable', 'cell-border'],
                editable: true,
                validators: ['required'],
                width: 500,
            },
            {
                headerName: this.l('Amount'),
                headerTooltip: this.l('Amount'),
                field: 'amount',
                cellClass: ['cell-clickable', 'cell-border'],
                editable: true,
                validators: ['required'],
                width: 200,
            },
            {
                headerName: this.l('Remarks'),
                headerTooltip: this.l('Remarks'),
                field: 'remarks',
                cellClass: ['cell-clickable', 'cell-border'],
                editable: true,
                validators: ['required'],
                width: 300,
            },
        ];
    }

    ngOnInit(): void {
        this.enterAmountBudget = true;

        this.frameworkComponents = {
            agDatepickerRendererComponent: AgDatepickerRendererComponent,
            agDropdownRendererComponent: AgDropdownRendererComponent,
            agCellButtonRendererComponent: AgCellButtonRendererComponent
        };
    }

    selectDropDownBudget1() {
        this._bmsMstPairingSegmentServiceProxy.gatAllBugetPlanForUserControl().subscribe((result) => {
            this.listBudget1 = [];
            this.listBudget1.push({ value: 0, label: " ", name: " " });
            result.forEach(ele => {
                this.listBudget1.push({ value: ele.id, label: ele.pairingText, name: ele.name });
            });
        });
    }

    selectDropDownBudget2ToAddition() {
        this._bmsMstPairingSegmentServiceProxy.gatAllBugetPlanForUserControl().subscribe((result) => {
            this.listBudget2 = [];
            this.listBudget2.push({ value: 0, label: " ", name: " " });
            result.forEach(ele => {
                this.listBudget2.push({ value: ele.id, label: ele.pairingText, name: ele.name });
            });
        });
    }

    selectDropDownBudget2() {
        this._bmsMstPairingSegmentServiceProxy.getAllPairingSegmentNoPage().subscribe((result) => {
            this.listBudget2 = [];
            this.listBudget2.push({ value: 0, label: " ", name: " " });
            result.forEach(ele => {
                this.listBudget2.push({ value: ele.id, label: ele.pairingText, name: ele.name });
            });
        });
    }

    selectDropDownUserToTransfer(id) {
        this._budgetTransferServiceProxy.getListUserInfoDtopdownToTransferBudget(id).subscribe((result) => {
            this.listUserToTransfer = [];
            this.listUserToTransfer.push({ value: 0, label: " ", email: " " });
            result.forEach(ele => {
                this.listUserToTransfer.push({ value: ele.id, label: ele.userName, email: ele.userEmail });
            });
        });
    }

    buildForm(type) {
        this.selectDropDownBudget1();
        if (type == 2) {
            this.selectDropDownUserToTransfer(0);
            this.createOrEditForm = this.formBuilder.group({
                id: [0],
                date: [undefined, GlobalValidator.required],
                transferNo: [undefined],
                fromDepId: [undefined],
                fromDepName: [undefined],
                fromPICName: [undefined],
                fromPICNoEmail: [undefined,],
                fromBudgetId: [undefined, GlobalValidator.required],
                budgetName1: [undefined],
                fromRemaining: [0],
                toDepId: [undefined],
                toDepName: [undefined],
                toPICUserId: [0],
                toPICNoEmail: [undefined],
                toBudgetId: [undefined, GlobalValidator.required],
                budgetName2: [undefined],
                toRemaining: [0],
                amountTransfer: [0],
                purpose: [undefined, GlobalValidator.required],
                status: [1],
                type: [2],
                budgetTransferItemDtos: [undefined],
                reasonReject: [undefined]
            });
        }
        else {
            this.selectDropDownBudget2ToAddition();
            this.createOrEditForm = this.formBuilder.group({
                id: [0],
                date: [undefined, GlobalValidator.required],
                transferNo: [undefined],
                toDepId: [undefined],
                toDepName: [undefined],
                toPICName: [undefined],
                toPICNoEmail: [undefined],
                toBudgetId: [undefined, GlobalValidator.required],
                budgetName2: [undefined],
                toRemaining: [0],
                amountTransfer: [0],
                purpose: [undefined, GlobalValidator.required],
                status: [1],
                type: [1],
                budgetTransferItemDtos: [undefined],
                fileName: [undefined],
                fileNameServe: [undefined],
                reasonReject: [undefined]
            });
        }

    }

    show(id?: number, type?: number, _isForm?: number, _rejectOrApproval?: number) {
        this.reasonReject ='';
        this.typeAdd = type;
        this.rejectOrApproval =_rejectOrApproval;
        this.buildForm(type);
        if (id && id > 0 && _isForm == 1) {
            this.spinnerService.show();
            this.firtShow =1;
            this.isForm = 1; //Edit
            this._budgetTransferServiceProxy.loadById(id).subscribe(val => {
                this.createOrEditForm.patchValue(val);
                this.listTranbudgetItem = val.budgetTransferItemDtos;
                this.getDisplayedData();
                this.spinnerService.hide();
            });
        }
        else if (id && id > 0 && _isForm == 2) {
            this.spinnerService.show();
            this.firtShow =1;
            this.isForm = 2; //Detail
            this._budgetTransferServiceProxy.loadById(id).subscribe(val => {
                this.createOrEditForm.patchValue(val);
                this.listTranbudgetItem = val.budgetTransferItemDtos;
                this.getDisplayedData();
                this.spinnerService.hide();
            });
        }
        else {
            this.isForm = 0;  //Create
            this.firtShow =2;
            this._budgetTransferServiceProxy.genarateTransferNo().subscribe(val => {
                this.createOrEditForm.get('transferNo').setValue(val);
            });
        }
        this.getUserLoginInfo();
        this.modal.show();
    }

    getUserLoginInfo() {
        this._budgetTransferServiceProxy.getUserInfoToTransferBudget().subscribe(val => {
            if (this.typeAdd == 1) {
                this.createOrEditForm.get('toPICName').setValue(val.userName);
                this.createOrEditForm.get('toPICNoEmail').setValue(val.userEmail);
            }
            else {
                this.createOrEditForm.get('fromPICName').setValue(val.userName);
                this.createOrEditForm.get('fromPICNoEmail').setValue(val.userEmail);
            }
        });
    }

    closeModel() {
        this.modal.hide();
    }

    reset() {
        this.createOrEditForm = undefined;
    }

    save() {
        this.isSubmit = true;
        if (this.submitBtn) {
            this.submitBtn.nativeElement.click();
        }
        if (this.createOrEditForm.invalid) {
            return;
        }

        this.createOrEditForm.get('budgetTransferItemDtos').setValue(this.displayedData);
        this.spinnerService.show();
        this._budgetTransferServiceProxy.save(this.createOrEditForm.getRawValue())
            .pipe(finalize(() => {
                this.spinnerService.hide();
            }))
            .subscribe(val => {
                this.notify.success(this.l(AppConsts.CPS_KEYS.Saved_Successfully));
                this.close.emit();
                this.modal.hide();
            });
    }

    //Delete item
    removeSelectedRow() {
        if (!this.selectTransferBudgetItem) {
            this.notify.warn(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Delete);
            return;
        }
        this.gridParamsItem.api.applyTransaction({ remove: [this.selectedNode.data] })
        this.selectTransferBudgetItem = undefined;
        this.getDisplayedData();
    }

    //add a row to table
    addRow(isValidate: boolean) {

        const blankItem = {
            lineNum: this.displayedData.length + 1,
            id: 0,
            description: undefined,
            amount: undefined,
            remarks: undefined,
        }

        this.gridParamsItem?.api.applyTransaction({ add: [blankItem] });
        const rowIndex = this.gridParamsItem?.api.getDisplayedRowCount() - 1;
        setTimeout(() => {
            this.gridParamsItem?.api.startEditingCell({ colKey: 'description', rowIndex });
            this.selectedNode = this.gridParamsItem.api.getRowNode(`${rowIndex}`);
            this.gridParamsItem?.api.getRowNode(`${rowIndex}`).setSelected(true);
        }, 100);
        this.getDisplayedData();
    }

    //Get data from table item
    getDisplayedData() {
        this.displayedData = this.gridTableService.getAllData(this.gridParamsItem);
    }

    //callBack grid
    callBackGrid(params: GridParams) {
        this.gridParamsItem = params;
        this.gridParamsItem?.api.setRowData([]);
        setTimeout(() => {
            if (this.listTransferCreate && this.listTransferCreate.length > 0) {
                this.gridParamsItem?.api.setRowData(this.listTransferCreate);
            }
            //   else if (this.getPoHeadersForEditDto) {
            //     this.gridParamsItem?.api.setRowData(this.getPoHeadersForEditDto.inputPurchaseOrderLinesDtos);
            //   }
            else {
                this.addRow(false);
            }
        });
    }

    onChangeSelectionItem(params: GridParams) {
        const selectedRows = params?.api.getSelectedRows();
        if (selectedRows) {
            this.selectedRowItem = selectedRows[0];
        }
        this.selectedNode = this.gridParamsItem?.api.getSelectedNodes()[0] ?? [];
        this.gridParamsItem?.api.getRowNode(`${this.selectedNode.rowIndex}`)?.setSelected(true);
    }

    agKeyUp(event: KeyboardEvent) {
        event.stopPropagation();
        if (event.key === 'ArrowDown') this.addRow(true);
    }

    onchangeFromBudget(id) {

        if (this.tabKey === 3) {
            this.selectDropDownBudget2();
        }
        else {
            this.selectDropDownBudget2();   // Phai hoi de lm lai
        }

        if (this.firtShow > 1) {
            this._bmsMstPairingSegmentServiceProxy.getDepartmentInfoByBudgetPlan(id).subscribe(val => {
                this.createOrEditForm.get('fromDepId').setValue(val.id);
                this.createOrEditForm.get('fromDepName').setValue(val.name);
            });

            const budget = this.listBudget1.find(element => element.value == id);
            if (budget != undefined) {
                this.createOrEditForm.get('budgetName1').setValue(budget.name);
            }
            this.createOrEditForm.get('toBudgetId').setValue(0);
            this.createOrEditForm.get('budgetName2').setValue('');
            this.createOrEditForm.get('toDepName').setValue('');
            this.createOrEditForm.get('toDepId').setValue(0);
            this.createOrEditForm.get('toPICUserId').setValue('');
            this.createOrEditForm.get('toPICNoEmail').setValue('');
        }

    }

    onchangeToBudget(id) {
        this.selectDropDownUserToTransfer(id);
        if (this.firtShow > 1) {
            this._bmsMstPairingSegmentServiceProxy.getDepartmentInfoByBudgetPlan(id).subscribe(val => {
                this.createOrEditForm.get('toDepId').setValue(val.id);
                this.createOrEditForm.get('toDepName').setValue(val.name);
            });

            const budget = this.listBudget2.find(element => element.value == id);
            if (budget != undefined) {
                this.createOrEditForm.get('budgetName2').setValue(budget.name);
            }

            if (this.typeAdd == 2) {
                this.createOrEditForm.get('toPICUserId').setValue('');
                this.createOrEditForm.get('toPICNoEmail').setValue('');
            }
        }
        else
        {
            setTimeout(() => {
                this.firtShow = 2;
            }, 1000);
        }
    }

    onchangeToUserInfo(id) {
        const user = this.listUserToTransfer.find(element => element.value == id);
        if (user != undefined) {
            this.createOrEditForm.get('toPICNoEmail').setValue(user.email);
        }
    }

    onUpload(evt: any): void {
        const formData: FormData = new FormData();
        const file = evt.target.files[0];
        formData.append('file', file);
        let serverName = 'ATB_' + Date.now().toString() + '_' + file.name;
        this.file = formData;
        this.fileName = file.name;
        this.fileSeverName = serverName;
        this.createOrEditForm.get('fileName').setValue(file.name);
        this.createOrEditForm.get('fileNameServe').setValue(serverName);
    }

    resetAttachment() {
        setTimeout(() => {
            this.InputVar.nativeElement.value = "";
            this.InputVar.nativeElement.click();
        }, 500);
    }

    approvalAndSubmit() {
        this.message.confirm('', this.l(AppConsts.CPS_KEYS.Are_You_Sure), (isConfirmed) => {
            if (isConfirmed) {
              this.spinnerService.show();
                this.approvalTransferBudgetDto.transferBudgetId = this.createOrEditForm.get('id').value;
              this._budgetTransferServiceProxy.approvalAndSubmit(this.approvalTransferBudgetDto).subscribe(val => {
                this.notify.success('Successfully submit');
                this.spinnerService.hide();
                this.close.emit();
                this.closeModel();
              });
            }
          });
    }

    reject() {
        this.message.confirm('', this.l(AppConsts.CPS_KEYS.Are_You_Sure), (isConfirmed) => {
            if (isConfirmed) {
              this.spinnerService.show();
                this.approvalTransferBudgetDto.transferBudgetId = this.createOrEditForm.get('id').value; 
                this.approvalTransferBudgetDto.reasonReject = this.createOrEditForm.get('reasonReject').value;
              this._budgetTransferServiceProxy.reject(this.approvalTransferBudgetDto).subscribe(val => {
                this.notify.success('Successfully reject');
                this.spinnerService.hide();
                this.close.emit();
                this.closeModel();
              });
            }
          });
    }
}
