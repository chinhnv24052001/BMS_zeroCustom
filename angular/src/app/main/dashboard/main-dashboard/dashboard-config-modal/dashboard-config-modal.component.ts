import { ICellRendererParams, ValueGetterParams } from '@ag-grid-enterprise/all-modules';
import { Component, Injector, ViewChild } from '@angular/core';
import { CustomColDef, GridParams } from '@app/shared/models/base.model';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { GridTableService } from '@app/shared/services/grid-table.service';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GetAllSystemFunctionForViewDto, GetAllUserFunctionsForViewDto, PcsMainDashboardServiceProxy } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'dashboard-config-modal',
    templateUrl: './dashboard-config-modal.component.html',
    styleUrls: ['./dashboard-config-modal.component.less']
})
export class DashboardConfigModalComponent extends AppComponentBase {
    @ViewChild('dashboardConfigModal', { static: true }) modal!: ModalDirective;

    functionColDef: CustomColDef[] = [];
    functionUserColDef: CustomColDef[] = [];
    defaultColDef: CustomColDef;

    functionParams: GridParams;
    userFuncParams: GridParams;

    sysFunctions: GetAllSystemFunctionForViewDto[] = [];
    selectedFunctions: GetAllSystemFunctionForViewDto[] = [];
    userFunctions: GetAllUserFunctionsForViewDto[] = [];
    selectedUserFunctions: GetAllUserFunctionsForViewDto[] = [];

    constructor(
        injector: Injector,
        private _serviceProxy: PcsMainDashboardServiceProxy,
        private _gridTable: GridTableService,
    ) {
        super(injector);
        this.functionColDef = [
            {
                headerName: '',
                headerTooltip: '',
                field: 'checked',
                checkboxSelection: true,
                cellClass: ['text-left', 'check-box-center'],
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,
                flex: 0.1
            },
            {
                headerName: this.l('FunctionName'),
                headerTooltip: this.l('FunctionName'),
                field: 'functionName',
                sortable: true,
                flex: 1,
                valueGetter: (params: ValueGetterParams) => params.data?.functionName ? this.l(params.data?.functionName) : ''
            }
        ];

        this.functionUserColDef = [
            {
                headerName: this.l('FunctionName'),
                headerTooltip: this.l('FunctionName'),
                field: 'functionName',
                sortable: true,
                rowDrag: true,
                flex: 1,
                valueGetter: (params: ValueGetterParams) => params.data?.functionName ? this.l(params.data?.functionName) : ''
            },
        ];
    }

    ngOnInit() {
    }

    show() {
        this.getAllSysFunctions();
        this.getAllUserFunctions();
        this.modal.show();
    }

    close() {
        this.modal.hide();
    }

    getAllSysFunctions() {
        this.sysFunctions = [];
        this.spinnerService.show();
        this._serviceProxy.getAllSysFunc()
            .pipe(finalize(() => this.spinnerService.hide()))
            .subscribe(res => {
                this.sysFunctions = res;
            });
    }

    getAllUserFunctions() {
        this.userFunctions = [];
        this.spinnerService.show();
        this._serviceProxy.getAllUserFunctions()
        .pipe(finalize(() => this.spinnerService.hide()))
            .subscribe(res => {
                this.userFunctions = res;
            });
    }

    callBackFuntionGrid(params) {
        this.functionParams = params;
    }

    callBackUserFuntionGrid(params) {
        this.userFuncParams = params;
    }

    onChangeFunctionSelection(params: GridParams) {
        this.selectedFunctions = params.api?.getSelectedRows() ?? [];
    }

    onChangeUserFunctionSelection(params: GridParams) {
        this.selectedUserFunctions = params.api?.getSelectedRows() ?? [];
    }

    addFunction() {
        this.selectedFunctions.forEach(e => {
            if (this.userFunctions?.filter(o => o.functionName == e.functionName).length == 0) {
                this.userFunctions.push(Object.assign({
                    functionName: e.functionName,
                    functionKey: e.functionKey,
                    functionId: e.id
                }));
            }
        });
        this.userFuncParams.api?.setRowData(this.userFunctions);
    }

    removeFunction() {
        let selectedRows = this.userFuncParams.api?.getSelectedRows();
        selectedRows.forEach(row => {
            this.userFuncParams?.api.applyTransaction({ remove: [row] });
            this.userFunctions.splice(this.userFunctions.findIndex(e => e.id == row.id), 1);
        })
    }

    save() {
        let body = [];
        this.spinnerService.show();
        this.userFunctions?.map((e, index) => {
            body.push(Object.assign({ functionId: e.functionId, ordering: index + 1 }))
        });
        this._serviceProxy.createUserFunctionList(body)
        .pipe(finalize(() => this.spinnerService.hide()))
        .subscribe();
    }

}
