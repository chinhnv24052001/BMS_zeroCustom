import { FileDownloadService } from '@shared/utils/file-download.service';
import { ImportUserRequestModalComponent } from './import-user-request-modal/import-user-request-modal.component';
import { ViewUserRequestModalComponent } from './view-user-request-modal/view-user-request-modal.component';
import { CommonGeneralCacheServiceProxy, CreateRequestApprovalInputDto, ExportUserRequestToExcelInput, RequestApprovalTreeServiceProxy, RequestNextApprovalTreeInputDto } from './../../../../shared/service-proxies/service-proxies';
import { ICellRendererParams, ValueGetterParams } from '@ag-grid-enterprise/all-modules';
import { finalize } from 'rxjs/operators';
import { CustomColDef, PaginationParamsModel } from '@app/shared/models/base.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Component, Injector, Input, ViewChild } from '@angular/core';
import { GetAllUserRequestForViewDto, UrUserRequestManagementServiceProxy } from '@shared/service-proxies/service-proxies';
import { ceil } from 'lodash';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { EventBusService } from '@app/shared/services/event-bus.service';
import { TABS } from '@app/shared/constants/tab-keys';
import { ViewListApproveDetailComponent } from '@app/shared/common/view-list-approve-detail/view-list-approve-detail.component';

@Component({
    selector: 'user-request-management',
    templateUrl: './user-request-management.component.html',
    styleUrls: ['./user-request-management.component.less']
})
export class UserRequestManagementComponent extends AppComponentBase {
    @Input() params: any;

    @ViewChild('viewURModal', { static: true }) viewURModal!: ViewUserRequestModalComponent;
    @ViewChild('importUserRequestModal', { static: true }) importUserRequestModal!: ImportUserRequestModalComponent;
    @ViewChild('viewDetailApprove', { static: true }) viewDetailApprove: ViewListApproveDetailComponent;

    searchForm: FormGroup;
    urColDefs: CustomColDef[] = [];
    defaultColDefs: CustomColDef = {
        filter: false,
        sortable: false,
        suppressMenu: true,
        menuTabs: []
    };
    paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, skipCount: 0, sorting: '', totalPage: 0 };

    userRequests: GetAllUserRequestForViewDto[] = [];
    summaryUR: GetAllUserRequestForViewDto[] = [];
    selectedUserRequest: GetAllUserRequestForViewDto = new GetAllUserRequestForViewDto();
    picUsers: any[] = [];

    approvalStatus: { label: string, value: string }[] = [
        { label: this.l('All'), value: undefined },
        { label: this.l('New'), value: 'NEW' },
        { label: this.l('Pending'), value: 'PENDING' },
        { label: this.l('Approved'), value: 'APPROVED' },
        { label: this.l('Rejected'), value: 'REJECT' }
    ];
    inventoryGroups: { label: string, value: number }[] = [];
    buyerColDef:any;

    currentUserId: number = abp.session.userId;
    isIncludeDetail: boolean = false;

    constructor(
        injector: Injector,
        private _formBuilder: FormBuilder,
        private _serviceProxy: UrUserRequestManagementServiceProxy,
        private _dataFormatService: DataFormatService,
        private eventBus: EventBusService,
        private _cacheProxy: CommonGeneralCacheServiceProxy,
        private _approvalProxy: RequestApprovalTreeServiceProxy,
        private _fileDownloadService: FileDownloadService
    ) {
        super(injector);

        this.buyerColDef = [
            {
                // STT
                headerName: this.l('STT'),
                headerTooltip: this.l('STT'),
                cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
                flex:1,
                cellClass: ['text-center', 'cell-border'],
              },
              {
                headerName: this.l('UserName'),
                headerTooltip: this.l('UserName'),
                field: 'userName',
                flex:2,
                cellClass: ['text-center', 'cell-border'],
              },
              {
                headerName: this.l('Name'),
                headerTooltip: this.l('Name'),
                field: 'name',
                flex:3,
              },
        ]

        this.urColDefs = [
            {
                headerName: this.l('No.'),
                headerTooltip: this.l('No.'),
                cellRenderer: (params) => params.rowIndex + 1 + ((this.paginationParams.pageNum ?? 1) - 1) * (this.paginationParams.pageSize ?? 20),
                cellClass: ['text-center'],
                width: 60
            },
            {
                headerName: this.l('URNumber'),
                headerTooltip: this.l('URNumber'),
                cellClass: ['text-center'],
                field: 'userRequestNumber',
                width: 100
            },
            {
                headerName: this.l('URName'),
                headerTooltip: this.l('URName'),
                cellClass: ['text-center'],
                field: 'userRequestName',
                width: 200
            },
            {
                headerName: this.l('InventoryGroup'),
                headerTooltip: this.l('InventoryGroup'),
                cellClass: ['text-left'],
                field: 'productGroupName',
                width: 100
            },
            {
                headerName: this.l('RequestUser'),
                headerTooltip: this.l('RequestUser'),
                cellClass: ['text-left'],
                field: 'requestUser',
                width: 150
            },
            {
                headerName: this.l('RequestDate'),
                headerTooltip: this.l('RequestDate'),
                cellClass: ['text-center'],
                field: 'requestDate',
                valueGetter: (params: ValueGetterParams) => params.data ? _dataFormatService.dateFormat(params.data?.requestDate) : '',
                width: 100
            },
            {
                headerName: this.l('Department'),
                headerTooltip: this.l('Department'),
                cellClass: ['text-center'],
                field: 'departmentName',
            },
            {
                headerName: this.l('TotalPrice'),
                headerTooltip: this.l('TotalPrice'),
                cellClass: ['text-right'],
                valueGetter: (params: ValueGetterParams) => params.data ? _dataFormatService.moneyFormat(params.data?.totalPrice) : 0,
                width: 120
            },
            {
                headerName: this.l('Currency'),
                headerTooltip: this.l('Currency'),
                cellClass: ['text-center'],
                field: 'currencyCode',
                width: 100
            },
            {
                headerName: this.l('RequestNote'),
                headerTooltip: this.l('RequestNote'),
                field: 'requestNote',
            },
            {
                headerName: this.l('ReplyNote'),
                headerTooltip: this.l('ReplyNote'),
                field: 'replyNote',
            },
            {
                headerName: this.l('StatusApproval'),
                headerTooltip: this.l('Status'),
                cellClass: ['text-left'],
                field: 'approvalStatus',
                valueGetter: (params: ValueGetterParams) => params.data ? this.handleStatus(params.data?.approvalStatus, params.data?.departmentApprovalName) : '',
                maxWidth: 120
            },
            {
                headerName: this.l('Note'),
                headerTooltip: this.l('Note'),
                cellClass: ['text-center'],
                field: 'note',
            },
        ];
    }

    ngOnInit() {
        this.getAllInventoryGroup();
        this.getAllUsers();
        this.buildForm();
        if (this.params?.userRequest != null) {
            this.searchForm.get('urNumber')?.setValue(this.params?.userRequest);
            this.searchForm.get('status')?.setValue(undefined);
        }
        this.search();
    }

    buildForm() {
        this.searchForm = this._formBuilder.group({
            urNumber: [''],
            fromDate: [undefined],
            toDate: [undefined],
            inventoryGroup: [undefined],
            status: ['NEW'],
            picUserId: [undefined]
        })
    }

    search() {
        this.getAllUserRequest(this.paginationParams);
    }

    getAllUserRequest(paginationParams: PaginationParamsModel) {
        this.spinnerService.show();
        this._serviceProxy.getAllUserRequests(
            this.searchForm.get('urNumber')?.value ?? '',
            this.searchForm.get('inventoryGroup')?.value ?? undefined,
            this.searchForm.get('status').value ?? '',
            this.searchForm.get('fromDate')?.value ?? undefined,
            this.searchForm.get('toDate')?.value ?? undefined,
            this.searchForm.get('picUserId')?.value ?? undefined,
            paginationParams ? paginationParams.sorting : '',
            paginationParams ? paginationParams.pageSize : 20,
            paginationParams ? paginationParams.skipCount : 0
        )
            .pipe(finalize(() => this.spinnerService.hide()))
            .subscribe(res => {
                this.userRequests = res.items ?? [];
                this.paginationParams.totalCount = res.totalCount;
                this.paginationParams.totalPage = ceil(
                    res.totalCount / (this.paginationParams.pageSize ?? 0)
                );
            })
    }

    getAllUsers() {
        this.picUsers = [];
        this._serviceProxy.getAllUserForCombobox().subscribe(res => {
            res.map(e => {
                this.picUsers.push({
                    label: e.userNameAndEmail,
                    value: e.id
                })
            })
        })
    }

    onChangeURSelection(params: any) {
        this.selectedUserRequest = params.api?.getSelectedRows()[0] ?? new GetAllUserRequestForViewDto();
    }

    changePaginationParams(paginationParams: PaginationParamsModel) {
        this.paginationParams = paginationParams;
        this.paginationParams.pageNum = paginationParams.pageNum;
        this.paginationParams.skipCount =
            ((paginationParams.pageNum ?? 1) - 1) * (paginationParams.pageSize ?? 20);
        this.paginationParams.pageSize = paginationParams.pageSize;

        this.getAllUserRequest(this.paginationParams);
    }

    addUR(event: boolean) {
        this.eventBus.emit({
            type: 'openComponent',
            functionCode: TABS.UR_CREATE_USER_REQUEST,
            tabHeader: this.l('UserRequest'),
        });
    }

    getAllInventoryGroup() {
        this.spinnerService.show();
        this.inventoryGroups = [];
        this.inventoryGroups.unshift({
            label: '',
            value: undefined
        });
        this._cacheProxy.getAllInventoryGroups()
            .pipe(finalize(() => this.spinnerService.hide()))
            .subscribe(res => res.map(e => this.inventoryGroups.push({
                label: e.productGroupName,
                value: e.id
            })));
    }

    sendRequest() {
        if (this.selectedUserRequest ) {

            this.viewDetailApprove.showModal(this.selectedUserRequest.id, 'UR');
          } else {
            this.notify.warn(this.l('SelectLine'));
          }

    }


      confirmRequest(){
        let body = Object.assign(new RequestNextApprovalTreeInputDto(), {
            reqId: this.selectedUserRequest.id,
            processTypeCode: 'UR'
        })
        this.message.confirm(this.l('AreYouSure'), this.l('SendRequestApprove'), (isConfirmed) => {
            if (isConfirmed) {
                this.spinnerService.show();
                // let body = Object.assign(new RequestNextApprovalTreeInputDto(), {
                //     reqId: this.selectedUR.id,
                //     processTypeCode: 'UR'
                // })

                this.spinnerService.show();
                this._approvalProxy.requestNextApprovalTree(body)
                    .pipe(finalize(() => {
                        this.spinnerService.hide();
                    }))
                    .subscribe(res => this.notify.success(this.l('Successfully')))
                // this._approvalProxy.createRequestApprovalTree(body)
                //     .pipe(finalize(() => {
                //         this.spinnerService.hide();
                //         this.search();
                //     }))
                //     .subscribe(res => this.notify.success(this.l('Successfully')))
            }
        })
      }

    delete() {
        this.message.confirm(this.l('DeleteThisSelection'), this.l('AreYouSure'), (isConfirmed) => {
            if (isConfirmed) {
                this.spinnerService.show();
                this._serviceProxy.delete(this.selectedUserRequest.id)
                .pipe(finalize(() => {
                    this.spinnerService.hide();
                    this.search();
                }))
                .subscribe(res => this.notify.success(this.l('Successfully')))
            }
        })
    }

    handleStatus(status: string, department: string) {
        switch(status) {
            case 'NEW':
                return this.l('New') + (department ? ` - ${department}` : '');
            case 'INCOMPLETE':
                return this.l('New') + (department ? ` - ${department}` : '');
            case 'PENDING':
                return this.l('Pending') + (department ? ` - ${department}` : '');
            case 'WAITTING':
                return this.l('Approved') + (department ? ` - ${department}` : '');
            case 'APPROVED':
                return this.l('Approved') + (department ? ` - ${department}` : '');
            case 'REJECTED':
                return this.l('Rejected') + (department ? ` - ${department}` : '');
        }
    }

    export() {
        this.spinnerService.show();
        let body = new ExportUserRequestToExcelInput();
        body = Object.assign({
            isIncludeDetail: this.isIncludeDetail,
            userId: abp.session.userId,
            inventoryGroupId: this.searchForm.get('inventoryGroup')?.value ?? undefined,
            status: this.searchForm.get('status').value ?? '',
            fromDate: this.searchForm.get('fromDate')?.value ?? undefined,
            toDate: this.searchForm.get('toDate')?.value ?? undefined
        });

        this._serviceProxy.exportUserRequestToExcel(body)
        .pipe(finalize(() => {
            this.spinnerService.hide();
        }))
        .subscribe(blob => {
            this._fileDownloadService.downloadTempFile(blob);
            this.notify.success(this.l('SuccessfullyExported'));
        });

    }

    undoRequest() {
        if (this.selectedUserRequest && this.selectedUserRequest.id > 0) {
          this.message.confirm(this.l('AreYouSure'), this.l('UndoRequest'), (isConfirmed) => {
            if (isConfirmed) {
              this.spinnerService.show();

              this.spinnerService.show();
              this._approvalProxy.undoRequest(
                this.selectedUserRequest.id,
                "UR"
              ).pipe(finalize(() => {
                this.spinnerService.hide();
                this.search();
              }))
                .subscribe(res => this.notify.success(this.l('UndoSuccessfully')))

            }
          })
        }  else {
          this.notify.warn(this.l('SelectLine'));
      }

    }

    assignJob(params){
        this.spinnerService.show();
        this._approvalProxy.assignJobToOtherBuyer("UR",this.selectedUserRequest.id,params.id)
        .pipe(finalize(()=>{
            this.spinnerService.hide();
            this.search()
        }))
        .subscribe(res => {
            this.notify.success("AsignedSuccessfully")
        })
    }

    getAllBuyer(name){
        return this._approvalProxy.getAllBuyerInfo(name)
    }
}
