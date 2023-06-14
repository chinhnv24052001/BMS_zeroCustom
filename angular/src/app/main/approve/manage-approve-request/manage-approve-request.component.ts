import { NoteModalComponent } from './note-modal/note-modal.component';
import { CreateOrEditPurchaseOrdersComponent } from './../../po/purchase-orders/create-or-edit-purchase-orders/create-or-edit-purchase-orders.component';
import { ViewPurchaseRequestComponent } from './../../pr/purchase-request/view-purchase-request/view-purchase-request.component';
import { ViewUserRequestModalComponent } from './../../user-request/user-request-management/view-user-request-modal/view-user-request-modal.component';
import { FrameworkContractModalComponent } from './../../price-management/framework-contract/framework-contract-modal/framework-contract-modal.component';
import { DataFormatService } from './../../../shared/services/data-format.service';
import { ForwardInputDto, FowardApproveInputDto, GetAllContractHeaderDto, GetAllUserRequestForViewDto, MstProcessTypeServiceProxy, PaymentHeadersServiceProxy, PrcAppendixContractDto, PrcContractHeaderServiceProxy, PrcContractTemplateServiceProxy, UserServiceProxy } from './../../../../shared/service-proxies/service-proxies';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Component, Injector, Input, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { ApproveOrRejectInputDto, RequestApprovalHistoryOutputDto, RequestApprovalSearchInputDto, RequestApprovalSearchOutputDto, RequestApprovalServiceProxy, RequestApprovalTreeServiceProxy, MstSupplierRequestServiceProxy, MstContractTemplateServiceProxy } from '@shared/service-proxies/service-proxies';
import { ceil } from 'lodash';
import { ViewApprovalHistoryModalComponent } from '../view-approval-history-modal/view-approval-history-modal.component';
import { ForwardApproveRequestModalComponent } from '../forward-approve-request-modal/forward-approve-request-modal.component';
import { ViewDetailPurchaseOrdersComponent } from '@app/main/po/purchase-orders/view-detail-purchase-orders/view-detail-purchase-orders.component';
import { CreateOrEditAppendixContractComponent } from '@app/main/price-management/framework-contract/create-or-edit-appendix-contract/create-or-edit-appendix-contract.component';
import { CreateOrEditPaymentHeadersComponent } from '@app/main/payment/payment-headers/create-or-edit-payment-headers/create-or-edit-payment-headers.component';
import { ViewListApproveDetailComponent } from '@app/shared/common/view-list-approve-detail/view-list-approve-detail.component';
import { ViewSupplierRequestInfoModalComponent } from '@app/main/master/mst-supplier-request/view-supplier-request-info-modal/view-supplier-request-info-modal.component';

@Component({
    selector: "manage-approve-request",
    templateUrl: "./manage-approve-request.component.html",
    styleUrls: ["./manage-approve-request.component.less"]
})

export class ManageApproveRequestComponent extends AppComponentBase {
    @Input() params: any;

    selectedAnnex : PrcAppendixContractDto = new PrcAppendixContractDto();

    @ViewChild('viewApprovalHistoryModal', { static: true }) viewApprovalHistoryModal!: ViewApprovalHistoryModalComponent;
    @ViewChild('forwardApproveRequestModal', { static: true }) forwardApproveRequestModal!: ForwardApproveRequestModalComponent;

    @ViewChild('note', { static: true }) note!: NoteModalComponent
    @ViewChild('requetMoreInfo', { static: true }) requetMoreInfo!: NoteModalComponent

    @ViewChild('pcModal', { static: true }) pcModal!: CreateOrEditAppendixContractComponent;
    @ViewChild('urModal', { static: true }) urModal!: ViewUserRequestModalComponent;
    @ViewChild('prModal', { static: true }) prModal!: ViewPurchaseRequestComponent;
    @ViewChild('poModal', { static: true }) poModal!: ViewDetailPurchaseOrdersComponent;
    @ViewChild('pmModal', { static: true }) pmModal!: CreateOrEditPaymentHeadersComponent;
    @ViewChild('srModal', { static: true }) srModal!: ViewSupplierRequestInfoModalComponent;

    // @ViewChild('forwardApproveRequestModal', { static: true }) forwardApproveRequestModal!: ForwardApproveRequestModalComponent;
    // @ViewChild('forwardApproveRequestModal', { static: true }) forwardApproveRequestModal!: ForwardApproveRequestModalComponent;

    tabKey: number = 1;
    searchForm: FormGroup;
    paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
    gridParams: GridParams | undefined;

    selectedRequest: RequestApprovalSearchOutputDto[]=[];
    requestColDef: CustomColDef[];

    requestTypeList: any[] = [];

    requestList: any[] = [];

    approveHistories: RequestApprovalHistoryOutputDto[] = [];

    approvalStatus: any;
    annex;
    listAnnexItems;
    approvalStatusList = [
        {label: 'Tất cả' , value : ''},
        {label: 'Chờ duyệt' , value : 'WAITTING'},
        {label: 'Đã duyệt' , value : 'APPROVED'},
        {label: 'Từ chối' , value : 'REJECTED'},
    ]

    currentUser: any


    constructor(
        injector: Injector,
        private formBuilder: FormBuilder,
        private _serviceProxy: RequestApprovalServiceProxy,
        private _approvalProxy: RequestApprovalTreeServiceProxy,
        private _processType : MstProcessTypeServiceProxy,
        private _pc: PrcContractHeaderServiceProxy,
        private _annex: PrcContractTemplateServiceProxy,
        private format : DataFormatService,
        private _paymentHeadersServiceProxy: PaymentHeadersServiceProxy,
        private userServiceProxy : UserServiceProxy,
        private _supplierRequestServiceProxy : MstSupplierRequestServiceProxy,
    ) {
        super(injector);

        this.requestColDef = [
            {
                headerName: '',
                headerTooltip: '',
                headerClass: ['align-checkbox-header'],
                cellClass: ['check-box-center'],
                checkboxSelection: true,
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,
                flex: 0.5,
            },
            {
                // STT
                headerName: this.l('STT'),
                headerTooltip: this.l('STT'),
                cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
                flex:0.5,
            },
            {
                headerName: this.l('RequestType'),
                headerTooltip: this.l('RequestType'),
                field: 'requestType',
                flex: 3,
            },
            {
                headerName: this.l('URNumber'),
                headerTooltip: this.l('URNumber'),
                field: 'requestNo',
                //valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.receivedDate): "",
                flex: 3
            },
            {
                headerName: this.l('Requester'),
                headerTooltip: this.l('Requester'),
                field: 'requestPersonName',
                flex: 4
            },
            {
                headerName: this.l('RequestDate'),
                headerTooltip: this.l('RequestDate'),
                field: 'requestDate',
                valueGetter: params => params.data ? this.format.dateFormat(params.data.requestDate) : "",
                flex: 2
            },
            {
                headerName: this.l('ApprovalStatus'),
                headerTooltip: this.l('Status'),
                field: 'approvalStatus',
                valueGetter: (params: any) => this.handleStatus(params.data?.approvalStatus, params.data?.departmentApprovalName),
                flex: 3.5
            },
            {
                headerName: this.l('RequestNote'),
                headerTooltip: this.l('RequestNote'),
                field: 'requestNote',
                flex: 3
            },
            {
                headerName: this.l('ReplyNote'),
                headerTooltip: this.l('ReplyNote'),
                field: 'replyNote',
                flex: 3
            },
            {
                headerName: this.l('Description'),
                headerTooltip: this.l('Description'),
                field: 'description',
                flex: 3
            },

        ];

        this._approvalProxy.getUserById(abp.session.userId)
        .pipe(finalize(()=>{
            //return this.currentUser;
        }))
        .subscribe(res => {
            this.currentUser = res
            // console.log(res);
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
                return this.l('Waitting') + (department ? ` - ${department}` : '');
            case 'APPROVED':
                return this.l('Approved') + (department ? ` - ${department}` : '');
            case 'REJECTED':
                return this.l('Rejected') + (department ? ` - ${department}` : '');
            case 'FORWARD':
                return this.l('Forward') + (department ? ` - ${department}` : '');
        }
    }

    buildForm() {
        this.searchForm = this.formBuilder.group({
            requestNo: [undefined],
            requestType: [undefined],
            approvalStatus: ['WAITTING'],
            fromDate: [],
            toDate: [],
        });
    }

    ngOnInit() {
        this.requestTypeList = [];
        this._processType.getAll(true).subscribe(res => {
            res.forEach(e => {
                this.requestTypeList.push({
                    label : e.processTypeName,
                    value: e.id
                })
            })
        })
        this.buildForm();
        if (this.params?.requisitionNo != null) {
            this.searchForm.get('requestNo').setValue(this.params?.requisitionNo);
            this.searchForm.get('approvalStatus').setValue(undefined);
        }
        this.searchData(this.paginationParams);
    }

    searchData(paginationParams: PaginationParamsModel) {
        let body = Object.assign(new RequestApprovalSearchInputDto, {
            approvalUserId: abp.session.userId,
            approvalStatus: this.searchForm.get('approvalStatus').value ?? '',
            requestNo: this.searchForm.get('requestNo').value ?? '',
            requestTypeId: this.searchForm.get('requestType').value ?? 0,
            sendDateFrom: this.searchForm.get('fromDate').value ?? undefined,
            sendDateTo: this.searchForm.get('toDate').value ?? undefined,
            sorting: paginationParams.sorting ?? '',
            skipCount: paginationParams.skipCount ?? 0,
            maxResultCount: paginationParams.pageSize,
        });

        this._serviceProxy.search(body).subscribe(res => {
            this.requestList = res.items;
            this.paginationParams.totalCount = res.totalCount;
            this.paginationParams.totalPage = ceil(
                res.totalCount / (this.paginationParams.pageSize ?? 0)
            );
        });
    }

    onChangeSelection(params: GridParams) {
        this.selectedRequest = params.api?.getSelectedRows()
    }

    callBackGrid(params: GridParams) {
        this.gridParams = params;
    }

    changePaginationParams(paginationParams: PaginationParamsModel) {
        this.paginationParams = paginationParams;
        this.paginationParams.pageNum = paginationParams.pageNum;
        this.paginationParams.skipCount =
            ((paginationParams.pageNum ?? 1) - 1) * (paginationParams.pageSize ?? 20);
        this.paginationParams.pageSize = paginationParams.pageSize;
        this.searchData(this.paginationParams);
    }

    checkHistory() {
        this.spinnerService.show();
        this._approvalProxy.getApprovalRequestHistory(this.selectedRequest[0].reqId, this.selectedRequest[0].processTypeCode)
            .pipe(finalize(() => {
                this.spinnerService.hide();
                this.viewApprovalHistoryModal.show(this.approveHistories);
            }))
            .subscribe(res => this.approveHistories = res)
    }

    approveOrReject(params) {
        // this.message.confirm(this.l('AreYourSure'), this.l('ApproveThisSelection'), (isConfirmed) => {

        // })
        //this.approveOrReject(params.isApprove, params.note);
        let isApproval = params.isApprove;
        let note = params.note;
        this.selectedRequest.forEach(selectedRequest => {
            let body = Object.assign(new ApproveOrRejectInputDto, {
                requestApprovalStepId: selectedRequest.requestApprovalStepId,
                reqId: selectedRequest.reqId,
                processTypeCode: selectedRequest.processTypeCode,
                note: note ?? "",
                approvalUserId: abp.session.userId,
                isApproved: isApproval,
                createSupplierAccountUrl: location.origin ,
            });
            this.spinnerService.show();
            this._approvalProxy.approveOrReject(body)
                .pipe(finalize(() =>{
                     this.spinnerService.hide();
                     this.note.close()
                     this.searchData(this.paginationParams);
                    }))
                .subscribe(res =>{
                    if (isApproval) this.notify.success(this.l('Approved'))
                    else this.notify.success(this.l('Rejected'))
                })
        })

    }

    viewDetail(){
        // console.log(this.selectedRequest)
        if (this.selectedRequest[0]?.processTypeCode?.trim() == 'AN'){
            this.spinnerService.show();
            this._annex.getAppendixDataById(this.selectedRequest[0]?.reqId)
            .pipe(finalize(()=>{
                this.pcModal.edit(this.selectedAnnex.supplierId,this.selectedAnnex.contractNo,this.selectedAnnex.supplierName);
            }))
            .subscribe(res => {
                this.selectedAnnex = res.dtoAppendix;
            })

            this.spinnerService.hide();
        }
        else if (this.selectedRequest[0]?.processTypeCode?.trim() == 'UR'){
            let data = Object.assign({},new GetAllUserRequestForViewDto())
            data.id = this.selectedRequest[0].reqId;
            this.urModal.show(data);
        }
        else if (this.selectedRequest[0]?.processTypeCode?.trim() == 'PR'){
            this.prModal.show(this.selectedRequest[0].reqId ?? 0, false);
        }
        else if (this.selectedRequest[0]?.processTypeCode?.trim() == 'PO'){

            this.poModal.show(this.selectedRequest[0].reqId ?? 0, false);
        }
        else if (this.selectedRequest[0]?.processTypeCode?.trim() == 'PM'){

            this._paymentHeadersServiceProxy.getPaymentById(this.selectedRequest[0].reqId ?? 0).subscribe(res => {
                if(res && res.id && res.id != 0 ) this.pmModal.show(res);
                else this.notify.warn("Không tìm thấy thông tin yêu cầu thanh toán");
            })

        }
        else if (this.selectedRequest[0]?.processTypeCode?.trim() == 'SR'){

            this._supplierRequestServiceProxy.getSupplierRequestById(this.selectedRequest[0].reqId ?? 0).subscribe(res => {
                if(res && res.id && res.id != 0 ) this.srModal.show(res);
                else this.notify.warn("Không tìm thấy thông tin yêu cầu thanh toán");
            })

        }
    }

    approveReject(params){
        //this.approveOrReject(params.isApprove, params.note);
        if (params.userId || params.userId != 0 ){
            let data = new FowardApproveInputDto();
            data.requestApprovalStepId = this.selectedRequest[0].requestApprovalStepId;
            data.note = params.note;
            data.nextApproveUserId = params.userId;
            this.spinnerService.show();
            this._approvalProxy.forwardAndApprove(data)
            .pipe(finalize(()=>{
                this.spinnerService.hide();
            }))
            .subscribe(res => {
                this.searchData(this.paginationParams);
                this.notify.success("Approved Successfully");
            })
        }
    }

    forward(params) {
        this.selectedRequest.forEach(e => {
            params.requestApprovalStepId = e.requestApprovalStepId
            this.spinnerService.show();
            this._approvalProxy.forward(params)
            .pipe(finalize(() => {
                this.spinnerService.hide();
            }))
            .subscribe();
        })

    }

    approveMultiRequest(params){
        let inputs = [];
        this.spinnerService.show();
        if (this.selectedRequest.some(e => e.processTypeCode != this.selectedRequest[0].processTypeCode)){
            return this.notify.warn("Không thể duyệt cùng lúc 2 yêu cầu khác loại nhau");
        }
        this.selectedRequest.forEach(e => {
            let input = new ApproveOrRejectInputDto();
            input.note = params.note;
            input.processTypeCode = e.processTypeCode;
            input.reqId = e.reqId;
            input.requestApprovalStepId = e.requestApprovalStepId;
            input.isApproved = true;
            input.approvalUserId = abp.session.userId;
            inputs.push(input);
        })

        this._approvalProxy.approveOrRejectMUltipleHeader(inputs)
        .pipe(finalize(()=>{
            this.spinnerService.hide();
            this.searchData(this.paginationParams);

        }))
        .subscribe(res => {
            this.notify.success("Approved Successfully");
        })

    }

    requestMoreInfo(params){
        this._serviceProxy.requestOrReplyInfo(this.selectedRequest[0].requestApprovalStepId ?? 0 , params.note, undefined)
        .pipe(finalize(()=>{
            // this.pcModal.selectedData.requestNote = note;
            this.urModal.selectedUR.requestNote = this.selectedRequest[0].requestNote;
            this.prModal.prDetail.requestNote = this.selectedRequest[0].requestNote;
            this.poModal.poDetail.requestNote = this.selectedRequest[0].requestNote;
        }))
        .subscribe(res => {
            this.selectedRequest[0].requestNote = res;
            this.gridParams.api.redrawRows();
            this.notify.success("Requested Successfully");
        })
    }

    // @ViewChild('pcModal', { static: true }) pcModal!: FrameworkContractModalComponent;
    // @ViewChild('urModal', { static: true }) urModal!: ViewUserRequestModalComponent;
    // @ViewChild('prModal', { static: true }) prModal!: ViewPurchaseRequestComponent;
    // @ViewChild('poModal', { static: true }) poModal!: ViewDetailPurchaseOrdersComponent;
    requestMoreInformation(){
        // console.log(this.selectedRequest.requestNote);
        let name = "";
        if((this.selectedRequest[0].requestNote ?? "").split(":").length >1) name = (this.selectedRequest[0].requestNote ?? "").split(":")[0] ;
        let note = (this.selectedRequest[0].requestNote ?? "").slice(name.length >= 1 ? name.length + 1 : 0,(this.selectedRequest[0].requestNote ?? "").length);
        // console.log(note);
        // console.log(name);
        this.requetMoreInfo.show(true,false,0,'',note)

    }


    forwardFromModal(){
        if(this.selectedRequest[0].approvalStatus == 'WAITTING') this.forwardApproveRequestModal.show();
        else this.notify.warn("Không thể chuyển tiếp");
    }

    approveFromModal(){
        this.note.show(true,true,this.selectedRequest[0].reqId,this.selectedRequest[0].processTypeCode);
    }



    rejectFromModal(){
        if(this.selectedRequest[0].approvalStatus != 'APPROVED') this.note.show(false,false)
        else this.notify.warn("Yêu cầu đã được duyệt");
    }
}
