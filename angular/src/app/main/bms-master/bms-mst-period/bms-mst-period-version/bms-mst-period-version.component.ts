import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { BmsPeriodVersionDto, BmsPeriodVersionServiceProxy, GetPurchasePurposeDto, InputPurchasePurposeDto, InputSearchMstCurrency, MstCurrencySelectDto, MstCurrencyServiceProxy, MstPurchasePurposeServiceProxy, MstSupplierServiceProxy, SupplierSiteOutputSelectDto } from '@shared/service-proxies/service-proxies';
import { ceil } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import { CreateOrEditBmsMstPeriodVersionComponent } from './create-or-edit-bms-mst-period-version/create-or-edit-bms-mst-period-version.component';
import { HttpClient } from '@angular/common/http';
import * as FileSaver from 'file-saver';

@Component({
    selector: 'app-bms-mst-period-version',
    templateUrl: './bms-mst-period-version.component.html',
    styleUrls: ['./bms-mst-period-version.component.css']
})
export class BmsMstPeriodVersionComponent extends AppComponentBase implements OnInit {
    @ViewChild('createOrEditBmsMstPeriodVersion', { static: true }) createOrEditBmsMstPeriodVersion: CreateOrEditBmsMstPeriodVersionComponent;
    gridColDef: CustomColDef[];
    paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
    gridParams: GridParams | undefined;
    listPeriodVersion: BmsPeriodVersionDto[];
    selectedRow: BmsPeriodVersionDto = new BmsPeriodVersionDto();
    supplierSiteId;
    siteAddress;
    @Input() periodName;
    periodId: number = 0;

    constructor(
        injector: Injector,
        private _bmsPeriodVersionServiceProxy: BmsPeriodVersionServiceProxy,
        private formBuilder: FormBuilder,
        private _http: HttpClient,
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.searchPeriodVersion(0);
        this.gridColDef = [
            {
                // STT
                headerName: this.l('STT'),
                headerTooltip: this.l('STT'),
                cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
                maxWidth: 60,
            },
            {
                headerName: this.l('PeriodName'),
                headerTooltip: this.l('PeriodName'),
                field: 'periodName',
                maxWidth: 300,
            },

            {
                headerName: this.l('VersionName'),
                headerTooltip: this.l('VersionName'),
                field: 'versionName',
                maxWidth: 200,
            },
            {
                headerName: this.l('Description'),
                headerTooltip: this.l('Description'),
                field: 'description',
                maxWidth: 400,
            },
            {
                headerName: this.l('Status'),
                headerTooltip: this.l('Status'),
                field: 'isActive',
                cellRenderer: (params) => params.value ? this.l('Active') : this.l('InActive'),
                maxWidth: 100,
            },
        ]
    }

    callBackGrid(params: GridParams) {
        this.gridParams = params;
        params.api.setRowData([]);
    }

    onChangeSelection(params) {
        this.selectedRow =
            params.api.getSelectedRows()[0] ?? new BmsPeriodVersionDto();
        this.selectedRow = Object.assign({}, this.selectedRow);
    }

    changePaginationParams(paginationParams: PaginationParamsModel) {
        if (!this.listPeriodVersion) {
            return;
        }
        this.paginationParams = paginationParams;
        this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
        this.paginationParams.pageSize = paginationParams.pageSize;
        this.searchPeriodVersion(this.periodId);
    }

    searchPeriodVersion(_periodId) {
        this.spinnerService.show();
        this.periodId = _periodId;
        this._bmsPeriodVersionServiceProxy.getAllVersionByPeriodId(
            _periodId,
            this.paginationParams ? this.paginationParams.sorting : '',
            this.paginationParams ? this.paginationParams.pageSize : 20,
            this.paginationParams ? this.paginationParams.skipCount : 1)
            .pipe(finalize(() => {
                this.spinnerService.hide();
            }))
            .subscribe((result) => {
                this.listPeriodVersion = result.items;
                this.gridParams.api.setRowData(this.listPeriodVersion);
                this.paginationParams.totalCount = result.totalCount;
                this.paginationParams.totalPage = ceil(result.totalCount / this.paginationParams.pageSize);
                this.gridParams.api.sizeColumnsToFit();
            });
        this.spinnerService.hide();
    }

    addVersion() {
        if (this.periodName == undefined) {
            this.notify.warn('Please select a period to add version!');
        }
        else {
            this.createOrEditBmsMstPeriodVersion.show(0, this.periodId);
        }
    }

    editVersion() {
        if (this.selectedRow.id && this.selectedRow.id > 0) {
            this.createOrEditBmsMstPeriodVersion.show(this.selectedRow.id, this.periodId);
        } else {
            this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Edit));
        }
    }

    deleteVersion() {
        if (this.selectedRow.id && this.selectedRow.id > 0) {
            this.message.confirm('', this.l(AppConsts.CPS_KEYS.Are_You_Sure), (isConfirmed) => {
                if (isConfirmed) {
                    this.spinnerService.show();
                    this._bmsPeriodVersionServiceProxy.delete(this.selectedRow.id).subscribe(val => {
                        this.notify.success('Successfully Deleted');
                        this.searchPeriodVersion(this.periodId);
                        this.spinnerService.hide();
                    });
                }
            });
        } else {
            this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Delete))
        }
    }

    urlBase: string = AppConsts.remoteServiceBaseUrl;
    exportExcell() {
        this.spinnerService.show();
        this._http.post(`${this.urlBase}/api/MasterExcelExport/MstPeriodVersionExportExcel`,
            {
                periodId: this.periodId,
                sorting: '',
                maxResultCount: 20,
                skipCount: 1
            },
            { responseType: 'blob' }).pipe(finalize(() => {
                this.spinnerService.hide();
            })).subscribe(blob => {
                FileSaver.saveAs(blob, 'BmsPeriodVersion.xlsx');
            });
    }

    publicToDept() {

    }
}
