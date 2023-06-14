import { Component, Injector, ViewChild, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { AuditLogDetailModalComponent } from '@app/admin/audit-logs/audit-log-detail-modal.component';
import { EntityChangeDetailModalComponent } from '@app/shared/common/entityHistory/entity-change-detail-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { AuditLogListDto, AuditLogServiceProxy, EntityChangeListDto, NameValueDto } from '@shared/service-proxies/service-proxies';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { DateTime } from 'luxon';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { PrimengTableHelper } from 'shared/helpers/PrimengTableHelper';
import { DateTimeService } from '@app/shared/common/timing/date-time.service';
import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import ceil from 'lodash-es/ceil';

@Component({
    templateUrl: './audit-logs.component.html',
    styleUrls: ['./audit-logs.component.less'],
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class AuditLogsComponent extends AppComponentBase implements AfterViewInit {

    @ViewChild('auditLogDetailModal', { static: true }) auditLogDetailModal: AuditLogDetailModalComponent;
    @ViewChild('entityChangeDetailModal', { static: true }) entityChangeDetailModal: EntityChangeDetailModalComponent;
    @ViewChild('dataTableAuditLogs', { static: true }) dataTableAuditLogs: Table;
    @ViewChild('dataTableEntityChanges', { static: true }) dataTableEntityChanges: Table;
    @ViewChild('paginatorAuditLogs', { static: true }) paginatorAuditLogs: Paginator;
    @ViewChild('paginatorEntityChanges', { static: true }) paginatorEntityChanges: Paginator;

    //Filters
    public dateRange: DateTime[] = [this._dateTimeService.getStartOfDay(), this._dateTimeService.getEndOfDay()];

    public usernameAuditLog: string;
    public usernameEntityChange: string;
    public serviceName: string;
    public methodName: string;
    public browserInfo: string;
    public hasException: boolean = undefined;
    public minExecutionDuration: number;
    public maxExecutionDuration: number;
    public entityTypeFullName: string;
    public objectTypes: NameValueDto[];

    primengTableHelperAuditLogs = new PrimengTableHelper();
    primengTableHelperEntityChanges = new PrimengTableHelper();
    advancedFiltersAreShown = false;

    gridList;
    gridColDef: CustomColDef[];
    paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
    gridParams: GridParams | undefined;

    constructor(
        injector: Injector,
        private _auditLogService: AuditLogServiceProxy,
        private _fileDownloadService: FileDownloadService,
        private _dateTimeService: DateTimeService
    ) {
        super(injector);
        this.gridColDef = [
            {
                // STT
                headerName: this.l('STT'),
                headerTooltip: this.l('STT'),
                cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
                width: 70,
            },
            {
                // Vinno
                headerName: this.l('User Name'),
                headerTooltip: this.l('User Name'),
                field: 'userName',
                width: 140,
            },
            {
                // Đại lý yêu cầu
                headerName: 'Service',
                headerTooltip: 'Service',
                field: 'serviceName',
                width: 110,
            },
            {
                // Ngày gửi
                headerName: this.l('Action'),
                headerTooltip: this.l('Action'),
                field: 'methodName',
                width: 100,
            },
            {
                // Tên chiến dịch
                headerName: this.l('Duration'),
                headerTooltip: this.l('Duration'),
                field: 'executionDuration',
                width: 250,
            },
            {
                // Mã công việc
                headerName: this.l('Ip Address'),
                headerTooltip: this.l('Ip Address'),
                field: 'clientIpAddress',
                width: 300,
            },
            {
                // Ngày mở lệnh
                headerName: 'Client',
                headerTooltip: 'Client',
                field: 'clientName',
                width: 100,
            },
            {
                // Lệnh sửa chữa
                headerName: this.l('Browser'),
                headerTooltip: this.l('Browser'),
                field: 'browserInfo',
                width: 120,
            },
        ]
    }

    ngAfterViewInit(): void {
        this.primengTableHelper.adjustScroll(this.dataTableAuditLogs);
        this.primengTableHelper.adjustScroll(this.dataTableEntityChanges);
    }

    showAuditLogDetails(record: AuditLogListDto): void {
        this.auditLogDetailModal.show(record);
    }

    showEntityChangeDetails(record: EntityChangeListDto): void {
        this.entityChangeDetailModal.show(record);
    }

    getAuditLogs(event?: LazyLoadEvent) {
        // if (this.primengTableHelperAuditLogs.shouldResetPaging(event)) {
        //     this.paginatorAuditLogs.changePage(0);

        //     return;
        // }

        this.primengTableHelperAuditLogs.showLoadingIndicator();

        this._auditLogService.getAuditLogs(
            this._dateTimeService.getStartOfDayForDate(this.dateRange[0]),
            this._dateTimeService.getEndOfDayForDate(this.dateRange[1]),
            this.usernameAuditLog,
            this.serviceName,
            this.methodName,
            this.browserInfo,
            this.hasException,
            this.minExecutionDuration,
            this.maxExecutionDuration,
            this.paginationParams ? this.paginationParams.sorting : '',
            this.paginationParams ? this.paginationParams.pageSize : 20,
            this.paginationParams ? this.paginationParams.skipCount : 1
        ).subscribe((result) => {
            this.primengTableHelperAuditLogs.totalRecordsCount = result.totalCount;
            this.gridList = result.items;

            this.gridParams.api.setRowData(this.gridList);
            this.paginationParams.totalCount = result.totalCount;
            this.paginationParams.totalPage = ceil(result.totalCount / this.paginationParams.pageSize);
            // this.primengTableHelperAuditLogs.hideLoadingIndicator();
        });
    }

    getEntityChanges(event?: LazyLoadEvent) {
        this._auditLogService.getEntityHistoryObjectTypes()
            .subscribe((result) => {
                this.objectTypes = result;
            });

        if (this.primengTableHelperEntityChanges.shouldResetPaging(event)) {
            this.paginatorEntityChanges.changePage(0);

            return;
        }

        this.primengTableHelperEntityChanges.showLoadingIndicator();

        this._auditLogService.getEntityChanges(
            this._dateTimeService.getStartOfDayForDate(this.dateRange[0]),
            this._dateTimeService.getEndOfDayForDate(this.dateRange[1]),
            this.usernameEntityChange,
            this.entityTypeFullName,
            this.primengTableHelperEntityChanges.getSorting(this.dataTableEntityChanges),
            this.primengTableHelperEntityChanges.getMaxResultCount(this.paginatorEntityChanges, event),
            this.primengTableHelperEntityChanges.getSkipCount(this.paginatorEntityChanges, event)
        ).subscribe((result) => {
            this.primengTableHelperEntityChanges.totalRecordsCount = result.totalCount;
            this.primengTableHelperEntityChanges.records = result.items;
            this.primengTableHelperEntityChanges.hideLoadingIndicator();
        });
    }

    exportToExcelAuditLogs(): void {
        const self = this;
        self._auditLogService.getAuditLogsToExcel(
            this._dateTimeService.getStartOfDayForDate(self.dateRange[0]),
            this._dateTimeService.getEndOfDayForDate(self.dateRange[1]),
            self.usernameAuditLog,
            self.serviceName,
            self.methodName,
            self.browserInfo,
            self.hasException,
            self.minExecutionDuration,
            self.maxExecutionDuration,
            undefined,
            1,
            0)
            .subscribe(result => {
                self._fileDownloadService.downloadTempFile(result);
            });
    }

    exportToExcelEntityChanges(): void {
        const self = this;
        self._auditLogService.getEntityChangesToExcel(
            this._dateTimeService.getStartOfDayForDate(self.dateRange[0]),
            self._dateTimeService.getEndOfDayForDate(self.dateRange[1]),
            self.usernameEntityChange,
            self.entityTypeFullName,
            undefined,
            1,
            0)
            .subscribe(result => {
                self._fileDownloadService.downloadTempFile(result);
            });
    }

    truncateStringWithPostfix(text: string, length: number): string {
        return abp.utils.truncateStringWithPostfix(text, length);
    }

    callBackGrid(params: GridParams) {
        this.gridParams = params;
        params.api.setRowData([]);
    }

    changePaginationParams(paginationParams: PaginationParamsModel) {
        if (!this.gridList) {
            return;
        }
        this.paginationParams = paginationParams;
        this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
        this.paginationParams.pageSize = paginationParams.pageSize;
        this.getAuditLogs();
    }
}
