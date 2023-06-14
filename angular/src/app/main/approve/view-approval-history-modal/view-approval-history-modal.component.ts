import { DataFormatService } from './../../../shared/services/data-format.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CustomColDef } from '@app/shared/models/base.model';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Component, Injector, ViewChild } from '@angular/core';
import { RequestApprovalHistoryOutputDto } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'view-approval-history',
    templateUrl: './view-approval-history-modal.component.html',
    styleUrls: ['./view-approval-history-modal.component.less']
})
export class ViewApprovalHistoryModalComponent extends AppComponentBase {
    @ViewChild('viewApprovalHistoryModal', { static: true }) modal!: ModalDirective;

    approvalHisColDefs: CustomColDef[] = [];
    defaultColDef: CustomColDef = {
        suppressMenu: true
    };

    approvalHistories: RequestApprovalHistoryOutputDto[] = [];

    constructor(
        injector: Injector,
        private format : DataFormatService
    ) {
        super(injector);
        this.approvalHisColDefs = [
            {
                headerName: this.l('Approval FullName '),
                headerTooltip: this.l('RequestType'),
                field: 'approvalFullName',
                flex:4,
            },
            {
                headerName: this.l('Approval Status'),
                field: 'approvalStatus',
                //valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.receivedDate): "",
                flex:2,
            },
            {
                headerName: this.l('Approval Date'),
                field: 'approvalDate',
                valueGetter: params => params.data ? this.format.dateFormat(params.data.approvalDate) : "",
                //valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.receivedDate): "",
                flex:2,
            },
            {
                headerName: this.l('Request Date'),
                field: 'requestDate',
                valueGetter: params => params.data ? this.format.dateFormat(params.data.requestDate) : "",
                //valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.receivedDate): "",
                flex:2,
            },
            {
                headerName: this.l('Deadline Date'),
                field: 'deadlineDate',
                //valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.receivedDate): "",
                valueGetter: params => params.data ? this.format.dateFormat(params.data.deadlineDate) : "",
                flex:2,
            },
            {
                headerName: 'Note',
                field: 'note',
                //valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.receivedDate): "",
                flex:4,
            },
        ];
    }

    ngOnInit() {
    }

    show(params: RequestApprovalHistoryOutputDto[]) {
        this.approvalHistories = params;
        this.modal.show();
    }

    close() {
        this.modal.hide();
    }

}
