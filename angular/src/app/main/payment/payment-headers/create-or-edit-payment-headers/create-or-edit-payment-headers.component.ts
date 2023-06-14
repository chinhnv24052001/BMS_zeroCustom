import { ICellRendererParams, ValueFormatterParams } from '@ag-grid-enterprise/all-modules';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef,EventEmitter,Injector, Input, OnInit, Output, ViewChild, Renderer2, } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormBuilder } from '@angular/forms';
import { AgCheckboxRendererComponent } from '@app/shared/common/grid-input-types/ag-checkbox-renderer/ag-checkbox-renderer.component';
import { AgDropdownRendererComponent } from '@app/shared/common/grid-input-types/ag-dropdown-renderer/ag-dropdown-renderer.component';
import { TmssSelectGridModalComponent } from '@app/shared/common/grid-input-types/tmss-select-grid-modal/tmss-select-grid-modal.component';
import { ImportAttachFileComponent } from '@app/shared/common/import-attach-file/import-attach-file.component';
import { AgCellEditorParams, CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { GridTableService } from '@app/shared/services/grid-table.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { PaymentHeadersServiceProxy, PaymentHeadersDto, MstSupplierServiceProxy, InputPaymentLinesDto, InvoiceHeadersDto, GetInvoiceHeadersDto, CommonGeneralCacheServiceProxy, InputPaymentHeadersDto, RcvShipmentAttachmentsDto, PaymentAttachmentsDto, MstDocumentServiceProxy, PaymentFromSuppliersServiceProxy, RequestApprovalTreeServiceProxy, RequestNextApprovalTreeInputDto, CreateRequestApprovalInputDto, UrUserRequestManagementServiceProxy,} from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import * as saveAs from 'file-saver';
import { DateTime } from 'luxon';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FileUpload } from 'primeng/fileupload';
import { forkJoin, Observable, pipe } from 'rxjs';
import { elementAt, finalize, mergeMap, tap } from 'rxjs/operators';

@Component({
    selector: 'create-or-edit-payment-headers',
    templateUrl: './create-or-edit-payment-headers.component.html',
    styleUrls: ['./create-or-edit-payment-headers.component.less'],
})
export class CreateOrEditPaymentHeadersComponent extends AppComponentBase implements OnInit {
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('submitBtn', { static: false }) submitBtn: ElementRef;
    @ViewChild('listAllInvoices', { static: true }) listAllInvoices!: TmssSelectGridModalComponent;
    @ViewChild('listPaymentFromSupplier', { static: true }) listPaymentFromSupplier!: TmssSelectGridModalComponent;
    @ViewChild('imgInput', { static: false }) InputVar: ElementRef;
    @ViewChild("attach") attach: ImportAttachFileComponent;

    @Output() approveEvent: EventEmitter<any> = new EventEmitter();
    @Output() rejectEvent: EventEmitter<any> = new EventEmitter();
    @Output() requestMoreInfoEvent: EventEmitter<any> = new EventEmitter();
    @Output() forwardEvent: EventEmitter<any> = new EventEmitter();

    @Input() viewOnly = false;

    @Input() selectedRow: PaymentHeadersDto = new PaymentHeadersDto();
    @Input() listSupplier = [];
    @Input() listPaymentMethod = [];
    @Input() listCurrency = [];
    @Input() siteListAll = [];
    @Input() employeeListAll = [];
    @Input() paymentStatusList = [];
    @Input() approveStatusList = [];

    gridColDefForView: any;

    invoiceList : any[]=[];

    listDocument: { label: string, value: string | number }[] = [];

    @Output() close = new EventEmitter<any>();
    @Output() updateAfterEdit = new EventEmitter<any>();
    gridColDef: CustomColDef[];
    gridInvoicesDef: CustomColDef[];
    displayedData: InputPaymentLinesDto[] = [];
    selectedNode;
    selectedPaymentLine;
    invoiceHeaderList: GetInvoiceHeadersDto[] = [];
    isLoading = false;
    frameworkComponents;

    paginationParams: PaginationParamsModel = {pageNum: 1,pageSize: 20,totalCount: 0, totalPage: 0, sorting: '',skipCount: 0,};
    gridParams: GridParams | undefined;
    createOrEditForm: FormGroup;
    supplierForm: FormGroup;
    isEditForm: boolean = true;
    isSubmit = false;
    // list supplier
    // listSupplier: { label: string; value: number | undefined }[] = [];
    // siteListAll: { supplierId: number, id: number, vendorSiteCode: string }[] = [];
    siteList: { label: string, value: string | number }[] = [];

    inputPaymentHeadersDto: InputPaymentHeadersDto = new InputPaymentHeadersDto();
    uploadUrl: string = "";
    downloadUrl: string = "";
    removeUrl: string = '';
    formData: FormData = new FormData();
    @Input() uploadData: PaymentAttachmentsDto[] = [];
    fileName: string = "";
    selectedRowAttachment: PaymentAttachmentsDto = null;
    gridParamsAttachment: GridParams | undefined;
    excelFileUpload: FileUpload;
    attColDef: CustomColDef[] = [];
    employeeCode ="";

    approvalInfos = [];

    gridPaymentColDef: CustomColDef[] = [];

    approvalColDef: CustomColDef[] = [];

    constructor(
        injector: Injector,
        private _paymentHeadersServiceProxy: PaymentHeadersServiceProxy,
        private _paymentFromSupServiceProxy: PaymentFromSuppliersServiceProxy,
        private _mstSupplierServiceProxy: MstSupplierServiceProxy,
        private formBuilder: FormBuilder,
        private renderer: Renderer2,
        private dataFormatService: DataFormatService,
        private gridTableService: GridTableService,
        private _commonService: CommonGeneralCacheServiceProxy,
        private _mstSupplier: MstSupplierServiceProxy,
        private _httpClient: HttpClient,
        private _mstDocument: MstDocumentServiceProxy,
        private _approvalProxy: RequestApprovalTreeServiceProxy,
        private _urProxy: UrUserRequestManagementServiceProxy,
    ) {
        super(injector);
        this.frameworkComponents = {
            agSelectRendererComponent: AgDropdownRendererComponent,
            agCheckboxRendererComponent: AgCheckboxRendererComponent,
        };
        this.gridColDef = [
            {
                headerName: this.l('InvoiceNum'),
                field: 'invoiceNumber',
                sortable: true,
                cellClass: [ 'cell-border'],
                // editable: true,
            },
            {
                headerName: this.l('PoNo'),
                field: 'poNo',
                sortable: true,
                cellClass: [ 'cell-border'],
                // editable: true,
            },
            {
                headerName: this.l('PaymentAmount'),
                field: 'paymentAmount',
                sortable: true,
                valueFormatter: param => param.data ? this.dataFormatService.moneyFormat(param.data.paymentAmount) : "",
                cellClass: ['cell-clickable', 'cell-border', 'text-right'],
                // editable: true,
            },
            {
                headerName: this.l('InvoiceAmount'),
                field: 'invoiceAmount',
                valueFormatter: param => param.data ? this.dataFormatService.moneyFormat(param.data.invoiceAmount) : "",
                sortable: true,
                cellClass: ['text-right'],
            },
            {
                headerName: this.l('PreAmount'),
                field: 'prepaymentAmount',
                valueFormatter: param => param.data ? this.dataFormatService.moneyFormat(param.data.prepaymentAmount) : "",
                cellClass: ['text-right'],
                // editable: true,
                // cellClass: ['cell-clickable', 'cell-border'],
            },
            {
                headerName: this.l('AvailableAmount'),
                field: 'availableAmount',
                valueFormatter: param => param.data ? this.dataFormatService.moneyFormat(param.data.availableAmount) : "",
                hide: true,
                cellClass: ['text-right'],
            },
            {
                headerName: this.l('InvoiceDate'),
                field: 'invoiceDate',
                valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.invoiceDate) : "",
                sortable: true,
            },
            {
                headerName: this.l('IsAdjustmentInvoice'),
                field: 'isAdjustmentInvoice',
                cellRenderer: 'agCheckboxRendererComponent',
                data: [true, false],
                sortable: true,
                editable: false,
            },
            {
                headerName: 'InvoiceId',
                field: 'invoiceId',
                hide: true
            },
        ];

        this.gridPaymentColDef = [
            {
                headerName: '',
                headerTooltip: '',
                headerClass: ['align-checkbox-header'],
                cellClass: ['check-box-center'],
                checkboxSelection: true,
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,
                flex: 0.3,
            },
            {
                headerName: this.l('PaymentNo'),
                field: 'paymentNo',
                sortable: true,
            },
            {
                headerName: this.l('RequestDate'),
                field: 'requestDate',
                valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.requestDate) : "",
                sortable: true,
            },
            {
                headerName: this.l('RequestDuedate'),
                field: 'requestDuedate',
                valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.requestDuedate) : "",
                sortable: true,
            },
            {
                headerName: this.l('TotalAmount'),
                field: 'totalAmount',
                valueFormatter:param => param.value ? this.dataFormatService.moneyFormat(param.data.totalAmount) : "",
                sortable: true,
                cellClass:['text-right'],
            },

            {
                headerName: this.l('InvoiceNum'),
                field: 'invoiceNumber',
                sortable: true,
            },
            {
                headerName: this.l('InvoiceAmount'),
                field: 'invoiceAmount',
                valueFormatter:param => param.value ? this.dataFormatService.moneyFormat(param.data.invoiceAmount) : "",
                sortable: true,
                cellClass:['text-right'],
            },
            {
                headerName: this.l('PoNo'),
                field: 'poNo',
                sortable: true,
            },
        ];

        const newLocal = this;
        newLocal.gridColDefForView = [

            {
                headerName: this.l('InvoiceNum'),
                field: 'invoiceNumber',
                sortable: true,
                cellClass: [ 'cell-border'],
            },
            {
                headerName: this.l('PoNo'),
                field: 'poNo',
                sortable: true,
                cellClass: [ 'cell-border'],
            },
            {
                headerName: this.l('PaymentAmount'),
                field: 'paymentAmount',
                sortable: true,
                valueFormatter: param => param.data ? this.dataFormatService.moneyFormat(param.data.paymentAmount) : "",
                cellClass: ['text-right'],
            },
            {
                headerName: this.l('InvoiceAmount'),
                field: 'invoiceAmount',
                valueFormatter: param => param.data ? this.dataFormatService.moneyFormat(param.data.invoiceAmount) : "",
                sortable: true,
                cellClass: ['text-right'],
            },
            {
                headerName: this.l('PreAmount'),
                field: 'prepaymentAmount',
                valueFormatter: param => param.data ? this.dataFormatService.moneyFormat(param.data.prepaymentAmount) : "",
                cellClass: ['text-right'],

            },
            {
                headerName: this.l('AvailableAmount'),
                field: 'availableAmount',
                valueFormatter: param => param.data ? this.dataFormatService.moneyFormat(param.data.availableAmount) : "",
                hide: true,
                cellClass: ['text-right'],
            },
            {
                headerName: this.l('InvoiceDate'),
                field: 'invoiceDate',
                valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.invoiceDate) : "",
                sortable: true,
            },
            {
                headerName: this.l('IsAdjustmentInvoice'),
                field: 'isAdjustmentInvoice',
                cellRenderer: 'agCheckboxRendererComponent',
                data: [true, false],
                sortable: true,
            },
            {
                headerName: 'InvoiceId',
                field: 'invoiceId',
                hide: true
            },
        ];

        this.gridInvoicesDef = [
            {
                headerName: '',
                headerTooltip: '',
                headerClass: ['align-checkbox-header'],
                cellClass: ['check-box-center'],
                checkboxSelection: true,
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,
                flex: 0.3,
            },
            {
              // STT
              headerName: this.l('STT'),
              headerTooltip: this.l('STT'),
              cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
              flex: 0.5,
            },
            {
              headerName: this.l('InvoiceNum'),
              field: 'invoiceNum',
              flex: 1,
            },
            {
              headerName: this.l('InvoiceDate'),
              field: 'invoiceDate',
              valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.invoiceDate) : "",
              flex: 1,
            },
            {
              headerName: this.l('Vendor'),
              field: 'supplierName',
              flex: 1.5,
            },
            {
              headerName: this.l('InvoiceAmount'),
              field: 'invoiceAmount',
              valueFormatter: param => param.data ? this.dataFormatService.moneyFormat(param.data.invoiceAmount) : "",
              flex: 1,
            },
            {
                headerName: this.l('PreAmount'),
                field: 'preAmount',
                valueFormatter: param => param.data ? this.dataFormatService.moneyFormat(param.data.preAmount) : "",
                flex: 1,
            },
            {
                headerName: this.l('AvailableAmount'),
                field: 'availableAmount',
                valueFormatter: param => param.data ? this.dataFormatService.moneyFormat(param.data.preAmount) : "",
                hide:true,
                flex: 1,
            },
            {
                headerName: this.l('Currency'),
                field: 'currencyCode',
                flex: 0.8,
            },
            {
                headerName: this.l('Description'),
                field: 'description',
                flex: 2,
            },

        ];

        this.approvalColDef = [
            {
                // STT
                headerName: this.l('No.'),
                headerTooltip: this.l('No.'),
                cellRenderer: (params) => params.rowIndex + 1,
                cellClass: ['cell-border', 'text-center'],
                width: 50,
            },
            {
                headerName: this.l('Step'),
                headerTooltip: this.l('Step'),
                field: 'approvalSeq',
                cellClass: ['cell-border', 'custom-grid-text', 'custom-grid-cbb-text', 'text-center'],
                width: 60,
            },
            {
                headerName: this.l('UserApprove'),
                headerTooltip: this.l('UserApprove'),
                field: 'approvalUserName',
                cellClass: ['cell-border', 'text-left'],
                width: 140,
            },
            {
                headerName: this.l('Department'),
                headerTooltip: this.l('Department'),
                field: 'approvalUserDepartment',
                cellClass: ['cell-border', 'text-left'],
                width: 150,
            },
            {
                headerName: this.l('Titles'),
                headerTooltip: this.l('Titles'),
                field: 'approvalUserTitle',
                cellClass: ['cell-border', 'text-left'],
                width: 150,
            },
            {
                headerName: this.l('LeadTime'),
                headerTooltip: this.l('LeadTime'),
                field: 'leadTime',
                valueFormatter: (params: ValueFormatterParams) => this.dataFormatService.dateFormat(params.value),
                cellClass: ['cell-border', 'text-left'],
                width: 120,
            },
            {
                headerName: this.l('ApproveDate'),
                headerTooltip: this.l('ApproveDate'),
                field: 'approvalDate',
                valueFormatter: (params: ValueFormatterParams) => this.dataFormatService.dateFormat(params.value),
                cellClass: ['cell-border', 'text-left'],
                width: 120,
            },
            {
                headerName: this.l('RejectDate'),
                headerTooltip: this.l('RejectDate'),
                field: 'rejectDate',
                valueFormatter: (params: ValueFormatterParams) => this.dataFormatService.dateFormat(params.value),
                cellClass: ['cell-border', 'text-left'],
                width: 120,
            },
            {
                headerName: this.l('Status'),
                headerTooltip: this.l('Status'),
                field: 'approvalStatus',
                cellClass: ['cell-border', 'text-center'],
                valueFormatter: (params) => params.data ? this.handleStatus(params.data?.approvalStatus) : '',
                width: 100,
            },
            {
                headerName: this.l('Remark'),
                headerTooltip: this.l('Remark'),
                field: 'note',
                cellClass: ['cell-border', 'text-left'],
                width: 200,
            },
        ];

        this.attColDef = [
            {
                headerName: this.l('STT'),
                headerTooltip: this.l('STT'),
                cellRenderer: (params) => params.rowIndex + 1,
                cellClass: ['text-center'],
                flex: 1,
            },
            {
                headerName: "Tập tin",
                headerTooltip: "Tập tin",
                field: "serverFileName",
                flex: 3,
            }
        ];

        this.uploadUrl = `${AppConsts.remoteServiceBaseUrl}/UploadGr/UploadPaymentFileToFolder`;
        this.downloadUrl = `${AppConsts.remoteServiceBaseUrl}/DownloadFile/GetPaymentAttachFileToDownload`;
        this.removeUrl = `${AppConsts.remoteServiceBaseUrl}/RemoveAttachFile/RemovePaymentAttachFile`;

        this.getComboboxList();
    }

    buildForm() {
        this.supplierForm = this.formBuilder.group({
            filter: [undefined],
        });
        // if payemnt is not null, set value for form

        this.createOrEditForm = this.formBuilder.group({
            // form of PaymentHeadersDto
            id: [0],
            paymentNo: [undefined],
            requestDate: [new Date()],
            requestDuedate: [undefined],
            description: [undefined],
            employeeId: [abp.session.userId],
            vendorId: [undefined, GlobalValidator.required],
            vendorSiteId: [undefined],
            currencyCode: ['VND'],
            totalAmount: [undefined],
            supplierId: [undefined],
            employeeCode: [undefined],
            status: [undefined],
            authorizationStatus: [undefined],
            fileName: [undefined],
            paymentMethod: [undefined],
            bankAccountName: [undefined],
            bankAccountNumber: [undefined],
            bankName: [undefined],
            bankBranchName: [undefined],
            documentId: [undefined],
        });


        // this.createOrEditForm.get("vendorId").valueChanges.subscribe(selectedValue => {

        //     this.createOrEditForm.get("vendorSiteId").setValue(-1);
        //     this.getSiteList(selectedValue);
        //   });

        // this.createOrEditForm.get("employeeId").valueChanges.subscribe(selectedValue => {
        //     this.employeeListAll.filter(e => e.value == selectedValue)?.forEach((obj)=>{
        //         this.createOrEditForm.get("employeeCode").setValue(obj.employeeCode);
        //     });
        // });
    }

    handleStatus(status: string) {
        switch (status) {
            case 'NEW':
                return this.l('New');
            case 'PENDING':
                return this.l('');
            case 'APPROVED':
                return this.l('Approved');
            case 'REJECTED':
                return this.l('Rejected');
            case 'WAITTING':
                return this.l('Waitting');
            case 'FORWARD':
                return this.l('Forward') ;
        }
    }

    getBankInfo(params, type){
        this.spinnerService.show();
        this._paymentHeadersServiceProxy.getSupplierBankAccountInfo(
            type ==1 ? params :  this.selectedRow.vendorId,
            type ==2 ? params :this.selectedRow.vendorSiteId,
            type ==3 ? params :this.selectedRow.currencyCode
        )
        .pipe(finalize(()=>{
            this.spinnerService.hide();
        }))
        .subscribe(res => {
            this.selectedRow.bankAccountName = res.bankAccountName;
            this.selectedRow.bankAccountNumber = res.bankAccountNum;
            this.selectedRow.bankName = res.bankName;
        });
    }

    selectPaymentsFromSupplier(){
        if ((!this.selectedRow.vendorId || this.selectedRow.vendorId == -1)
        // && (!this.createOrEditForm.get('vendorSiteId').value || this.createOrEditForm.get('vendorSiteId').value == -1)
        ){
            return this.notify.warn("Vui lòng chọn nhà cung cấp trước khi chọn");
        }
      this.listPaymentFromSupplier.show();
    }

    selectInvoice(){
        if ((!this.selectedRow.vendorId || this.selectedRow.vendorId == -1)
        // && (!this.createOrEditForm.get('vendorSiteId').value || this.createOrEditForm.get('vendorSiteId').value == -1)
        ){
            return this.notify.warn("Vui lòng chọn nhà cung cấp trước khi chọn hóa đơn");
        }
      this.listAllInvoices.show();
    }

    getAllPaymentsFromSupplier(){
        return this._paymentHeadersServiceProxy.getAllPaymentFromSupplier(
            undefined,
            undefined,
            undefined,
            this.selectedRow.vendorId,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            this.selectedRow.currencyCode,
            undefined,
            undefined,
            undefined,
        );
    }

    ngOnInit(): void {
        // get list supplier
        this.buildForm();
       // this.searchSupplier();
    }

    getComboboxList() {
        // this.listSupplier = [{ value: -1, label: 'Tất cả' }];
        this.employeeListAll = [{ value: -1, employeeCode: '', label: 'Tất cả' }];

        /* let api1 = this._mstSupplier.getAllSupplierNotPaged("")
        let api2 = this._commonService.getAllSupplierSites()
        let api3 = this._paymentHeadersServiceProxy.getTMVUserList()
        let api4 = this._commonService.getAllCurrencies();
        let api5 = this._commonService.getLookupsBy('PAYMENT_METHOD');

        this.spinnerService.show()
        let api = forkJoin({api1, api2, api3, api4, api5})
        api
        .pipe(finalize(()=>{
            this.spinnerService.hide()
            // this.listSupplier =[...this.listSupplier]
            // this.siteListAll =[...this.siteListAll]
            // this.employeeListAll =[...this.employeeListAll]
            console.log(this.listCurrency)
        }))
        .subscribe(res => {
            res[0]?.forEach(e => this.listSupplier.push({ value: e.id, label: e.supplierName }));
            res[1]?.forEach(e => this.siteListAll.push({ supplierId: e.supplierId, id: e.id, vendorSiteCode: e.vendorSiteCode }));
            res[2]?.forEach(e =>
                this.employeeListAll.push({ value: e.id, employeeCode: e.employeeCode, label: e.name + ' - ' + e.titleCode + ' - ' + e.deptName }));
            res[3]?.forEach(e => this.listCurrency.push({ value: e.currencyCode, label: e.currencyCode }));
            res[4]?.forEach(e => this.listPaymentMethod.push({ value: e.lookupCode, label: e.description }));
        }) */
        this.listPaymentMethod = [];
        this._commonService.getLookupsBy("PO_TERMS_PAIR_BY").subscribe(res =>{
            res.forEach(e => this.listPaymentMethod.push({ value: e.id, label: e.displayedField }));
        });

        this._mstSupplier.getAllSupplierNotPaged("").subscribe(
            res => {
                  res.forEach(e => this.listSupplier.push({ value: e.id, label: e.supplierName }));
              });

        this._commonService.getAllSupplierSites().subscribe(
            res => {
                res.forEach(e => this.siteListAll.push({ supplierId: e.supplierId, id: e.id, vendorSiteCode: e.vendorSiteCode }));
            });

        this._paymentHeadersServiceProxy.getTMVUserList().subscribe(
             res => {
                 res.forEach(e =>
                 this.employeeListAll.push({ value: e.id, employeeCode: e.employeeCode, label: e.name + ' - ' + e.titleCode + ' - ' + e.deptName }));
                // var current  = res.find(e => e.id == abp.session.userId);
                // if (current) this.employeeListAll.push(current);

          });
          this._commonService.getAllCurrencies().subscribe(
            res => {
                res.forEach(e =>
                this.listCurrency.push({ value: e.currencyCode, label: e.currencyCode }));
         });

         this._commonService.getLookupsBy('PAYMENT_METHOD').subscribe(
            res => {
                res.forEach(e =>
                this.listPaymentMethod.push({ value: e.lookupCode, label: e.description }));
         });

         this._commonService.getDocumentByProcessType('PM').subscribe(
            res => {
                res.forEach(e =>
                this.listDocument.push({ value: e.id, label: e.documentCode + '-' + e.documentName }));
         });

      }

    show(data?: PaymentHeadersDto) {

        if (data && data.id) {
            // this._paymentHeadersServiceProxy.getPaymentById(id).subscribe((res) => {
            //     this.selectedRow = res;
            //     this.createOrEditForm.patchValue(res);
            //     this.isEditForm = true;
            // });

            this.selectedRow = data ?? new PaymentHeadersDto();
            //set user hiện tại
            this.selectedRow.employeeId = this.selectedRow.employeeId;
            this.employeeCode = this.employeeListAll.find(e => e.value == this.selectedRow.employeeId)?.employeeCode;
            this.employeeListAll  = this.employeeListAll.filter(e => e.value == this.selectedRow.employeeId);


            this.employeeListAll.filter;
            this.spinnerService.show();
            // this.selectedRow = data;
            this.getSiteList(data.vendorId);
            this.getApprovalInfos();

            this.createOrEditForm.patchValue(data);
            this.selectedRow.totalAmount = data.totalAmount;
            this.isEditForm = true;
            this.listSupplier = [...this.listSupplier];
            this.employeeListAll = [...this.employeeListAll];
            //this.siteListAll = [...this.siteListAll];
            this.siteList = [...this.siteList];
            this.listCurrency = [...this.listCurrency];

            this.attach.setData(this.selectedRow?.id,"PAYMENTREQUEST");

            this._paymentHeadersServiceProxy.getAllPaymentLineByHeaderID(data?.id)
            .pipe(finalize(() => this.spinnerService.hide()))
            .subscribe((res) => {
                this.displayedData = res.items;
                //console.log(res.items);
                //this.gridParams.api.refreshCells();
                this.gridParams.api.setRowData(this.displayedData);
            });

            // this._paymentHeadersServiceProxy.getAllAttachmentsByHeaderID(data?.id)
            // .pipe(finalize(() => this.spinnerService.hide()))
            // .subscribe((res) => {
            //     this.uploadData = res;
            //     this.gridParamsAttachment.api.setRowData(this.uploadData);
            // });
        } else {
            this.isEditForm = false;
            this.selectedRow = new PaymentHeadersDto();
            this.selectedRow.requestDate = DateTime.local();

            //set user hiện tại
            this.selectedRow.employeeId = abp.session.userId;
            this.employeeCode = this.employeeListAll.find(e => e.value == abp.session.userId)?.employeeCode;
            this.employeeListAll  = this.employeeListAll.filter(e => e.value == abp.session.userId);

            this.selectedRow.currencyCode = "VND";
            this.selectedRow.status = 0 ; // đã tạo request
            this.selectedRow.authorizationStatus = "NEW";
            this.selectedRow.paymentMethod = this.listPaymentMethod.find(e => e.label.includes("Tele transfer"))?.value;
            this.attach.setData(this.selectedRow?.id,"PAYMENTREQUEST");
        }

        this.modal.show();
    }

    getApprovalInfos() {
        this.approvalInfos = [];
        this.spinnerService.show();
        this._urProxy.getAllApprovalInfo(this.selectedRow.id, "PM")
            .pipe(finalize(() => this.spinnerService.hide()))
            .subscribe(res => this.approvalInfos = res);
    }

    getSiteList(supplierIdFilter) {
        //console.log(supplierIdFilter);
        this.siteList = [];
        // this.siteList = [{ value: -1, label: 'Tất cả' }];
        this.siteListAll.filter(e => e.supplierId == supplierIdFilter)
          .forEach(e => this.siteList.push({ value: e.id, label: e.vendorSiteCode }));

        if (this.siteList != undefined && this.siteList.length == 2){
            this.selectedRow.vendorSiteId = Number(this.siteList[1].value);
        }

        // this.mstSupplierServiceProxy.getAllSupplierSiteBySupplierIdNotPaged(supplierIdFilter, "").subscribe(
        //   res => {
        //     res.forEach(e => this.siteList.push({ value: e.id, label: e.vendorSiteCode }));
        //   });
      }

    getAllInvoices(suplierName: any, paginationParams: PaginationParamsModel) {
        var s = this._paymentHeadersServiceProxy.getAllInvoices(
            "",
            this.selectedRow.vendorId,
            -1,
            this.selectedRow.currencyCode,
            (this.paginationParams ? this.paginationParams.sorting : ''),
            (this.paginationParams ? this.paginationParams.pageSize : 100),
            (this.paginationParams ? this.paginationParams.skipCount : 1),

        ).pipe(
           // mergeMap(result => this.invoiceHeaderList = result),
           //tap(val => console.log(val[0])),
           tap(val => this.invoiceHeaderList = val.items),
        );

        //var c = new Observable<GetInvoiceHeadersDto[]>
        // s.subscribe((res)=>{
        //     this.invoiceHeaderList = res;
        //     console.log(this.invoiceHeaderList);
        // });

        return s;
    }

    patchInvoice(event: any) {
        this.setDataRow(event);
    }
    setLoading(params) {
        this.isLoading = params;
    }

    // selectInvoice(){
    //     if ((!this.selectedRow.vendorId || this.selectedRow.vendorId == -1)
    //     // && (!this.createOrEditForm.get('vendorSiteId').value || this.createOrEditForm.get('vendorSiteId').value == -1)
    //     ){
    //         return this.notify.warn("Vui lòng chọn nhà cung cấp trước khi chọn hóa đơn");
    //     }
    //   this.listAllInvoices.show();
    // }

    changeEmp(params){
        this.employeeListAll.filter(e => e.value == params)?.forEach((obj)=>{
            this.employeeCode = obj.employeeCode;
        });
    }

    changeVendor(params){
        let oldSupplierValue = this.selectedRow.vendorId;
        let oldSupplierSiteValue = this.selectedRow.vendorSiteId;
        this.selectedRow.vendorSiteId = -1;
        // this.siteList = [];
        this.getSiteList(params);
        this.getBankInfo(params,1);
        if (this.displayedData && this.displayedData.length > 0 ){
            this.message.confirm('Đang tồn tại dữ liệu hóa đơn, chọn lại nhà cung cấp sẽ xóa đi dữ liệu hóa đơn', this.l(AppConsts.CPS_KEYS.Are_You_Sure), (isConfirmed) => {
                if (isConfirmed) {
                    this.displayedData = [];

                }
                else {
                    // console.log(oldSupplierValue)
                    setTimeout(()=>{
                        this.selectedRow.vendorId = oldSupplierValue;
                        this.selectedRow.vendorSiteId= oldSupplierSiteValue;

                        this.listSupplier =[...this.listSupplier];
                        this.siteList =[...this.siteList];
                    },100);
                    // console.log(this.createOrEditForm.get('vendorId').value)
                }

              });
        }
    }

    getDisplayedData() {
        this.displayedData = this.gridTableService.getAllData(this.gridParams);
        this.calculateTotalAmount();
      }

    calculateTotalAmount() {
        let sumTotal = 0;
        this.gridTableService.getAllData(this.gridParams).forEach((val) => {
            sumTotal += Number(val.paymentAmount);
            this.selectedRow.totalAmount = sumTotal;
        });
      }

    setDataRow(rowDatas: any[]) {
        // console.log(rowDatas);
        rowDatas.forEach(rowData => {
            var isExistsInvoice = false;
            this.gridTableService.getAllData(this.gridParams).forEach((val) => {
                if(val.invoiceId == rowData.id) isExistsInvoice = true;
            });

            if (isExistsInvoice) {
                this.notify.warn("Invoice đã tồn tại");
                return;
            }

            //add invoice do hoac invoice dieu chinh cho no
            if (this.invoiceHeaderList && this.invoiceHeaderList.length > 0){
                // console.log('case 1')
                let rowNum = this.displayedData.length;
                this.invoiceHeaderList
                .filter(e => e.id == rowData.id || e.adjustmentForInvoiceId == rowData.id)
                .forEach((obj) => {
                    rowNum = rowNum + 1;
                    const newRow = {
                        stt: rowNum,
                        id: 0,
                        invoiceId: obj.id,
                        invoiceNumber: obj.invoiceNum,
                        invoiceDate: obj.invoiceDate,
                        invoiceAmount: obj.invoiceAmount,
                        paymentAmount: obj.availableAmount,
                        prepaymentAmount: obj.preAmount,
                        availableAmount: obj.availableAmount,
                        isAdjustmentInvoice: obj.isAdjustmentInvoice,
                        vendorId: obj.vendorId,
                        vendorSiteId: obj.vendorSiteId,
                        poNo: obj?.poNo ?? ""
                    };
                    this.gridParams.api.applyTransaction({ add: [newRow] });
                    this.displayedData.push(Object.assign(new InputPaymentLinesDto(),newRow));
                });
            }else{
                // console.log('case 2')
                const newRow = {
                    stt: this.displayedData.length + 1,
                    id: 0,
                    invoiceId: rowData.id,
                    invoiceNumber: rowData.invoiceNum,
                    invoiceDate: rowData.invoiceDate,
                    invoiceAmount: rowData.invoiceAmount,
                    paymentAmount: rowData.availableAmount,
                    prepaymentAmount: rowData.preAmount,
                    availableAmount: rowData.availableAmount,
                    isAdjustmentInvoice: rowData.isAdjustmentInvoice,
                    vendorId: rowData.vendorId,
                    vendorSiteId: rowData.vendorSiteId,
                    poNo: rowData?.poNo ?? ""
                };
                this.gridParams.api.applyTransaction({ add: [newRow] });
                this.displayedData.push(Object.assign(new InputPaymentLinesDto(),newRow));
            }

            //console.log(newRow);
            //console.log(this.createOrEditForm.get('vendorId').value)
            if (!this.selectedRow.vendorId || this.selectedRow.vendorId == -1){
                this.selectedRow.vendorId=rowData.vendorId;
                this.selectedRow.vendorSiteId=rowData.vendorSiteId;
            }

        });

        const rowIndex = this.gridParams.api.getDisplayedRowCount() - 1;
        setTimeout(() => {
            this.gridParams.api.startEditingCell({ colKey: 'paymentAmount', rowIndex });
            this.selectedNode = this.gridParams.api.getRowNode(`${rowIndex}`);
            this.gridParams.api.getRowNode(`${rowIndex}`)?.setSelected(true);
        }, 100);
        this.getDisplayedData();
    }

    setDataRowFromPayment(rowDatas: any[]) {
        //console.log(rowDatas);
        rowDatas.forEach(rowData => {
            var isExistsInvoice = false;
            if (rowData.invoiceId && rowData.invoiceId != 0) {
                this._paymentHeadersServiceProxy.getAllInvoices(
                    "",
                    this.selectedRow.vendorId,
                    this.selectedRow.vendorSiteId,
                    this.selectedRow.currencyCode,
                    (this.paginationParams ? this.paginationParams.sorting : ''),
                    (this.paginationParams ? this.paginationParams.pageSize : 100),
                    (this.paginationParams ? this.paginationParams.skipCount : 1)
                )
                .pipe(finalize(()=>{
                    this.gridTableService.getAllData(this.gridParams).forEach((val) => {
                        if(val?.invoiceId == rowData?.id) isExistsInvoice = true;
                    });

                    if (isExistsInvoice) {
                        this.notify.warn("Invoice đã tồn tại");
                        return;
                    }

                    //add invoice do hoac invoice dieu chinh cho no
                    if (this.invoiceHeaderList && this.invoiceHeaderList.length > 0 && this.invoiceHeaderList.some(e => e?.id == rowData?.id || e.adjustmentForInvoiceId == rowData?.id)){
                        console.log('case 1');
                        let rowNum = this.displayedData.length;
                        this.invoiceHeaderList
                        .filter(e => e?.id == rowData?.id || e.adjustmentForInvoiceId == rowData?.id)
                        .forEach((obj) => {
                            rowNum = rowNum + 1;
                            const newRow = {
                                stt: rowNum,
                                id: 0,
                                invoiceId: obj?.id,
                                invoiceNumber: obj?.invoiceNum,
                                invoiceDate: obj?.invoiceDate,
                                invoiceAmount: obj?.invoiceAmount,
                                paymentAmount: obj?.availableAmount,
                                prepaymentAmount: obj?.preAmount,
                                availableAmount: obj?.availableAmount,
                                isAdjustmentInvoice: obj?.isAdjustmentInvoice,
                                vendorId: obj?.vendorId,
                                vendorSiteId: obj?.vendorSiteId,
                                poNo: rowData?.poNo ?? ""
                            };
                            this.gridParams.api.applyTransaction({ add: [newRow] });
                            this.displayedData.push(Object.assign(new InputPaymentLinesDto(),newRow));
                        });
                    }else{
                        console.log('case 2');
                        const newRow = {
                            stt: this.displayedData.length + 1,
                            id: 0,
                            invoiceId: rowData?.id,
                            invoiceNumber: rowData?.invoiceNum,
                            invoiceDate: rowData?.invoiceDate,
                            invoiceAmount: rowData?.invoiceAmount,
                            paymentAmount: rowData?.availableAmount,
                            prepaymentAmount: rowData?.preAmount,
                            availableAmount: rowData?.availableAmount,
                            isAdjustmentInvoice: rowData?.isAdjustmentInvoice,
                            vendorId: rowData?.vendorId,
                            vendorSiteId: rowData?.vendorSiteId,
                            poNo: rowData?.poNo ?? ""
                        };
                        this.gridParams.api.applyTransaction({ add: [newRow] });
                        this.displayedData.push(Object.assign(new InputPaymentLinesDto(),newRow));
                    }

                    //console.log(newRow);
                    //console.log(this.createOrEditForm.get('vendorId').value)
                    if (!this.selectedRow.vendorId || this.selectedRow.vendorId == -1){
                        this.selectedRow.vendorId=rowData.vendorId;
                        this.selectedRow.vendorSiteId=rowData.vendorSiteId;
                    }
                }))
                .subscribe(res => {
                    if(res.items.length > 0){
                        let data = res.items.find(e => e?.id == rowData?.invoiceId);
                        if (!data) {
                            let oldData = rowData;
                            rowData = Object.assign(new GetInvoiceHeadersDto(),rowData);
                            rowData.id= oldData?.invoiceId;
                            rowData.invoiceNum= oldData?.invoiceNumber;
                            rowData.availableAmount= (oldData?.paymentAmount == 0  || !oldData?.paymentAmount ) ? oldData.invoiceAmount - (oldData.prepaymentAmount?? 0) : oldData?.paymentAmount;
                            rowData.preAmount= oldData?.prepaymentAmount;

                        }
                        else rowData = data;
                    }
                    else return this.notify.warn("Không tìm thấy hóa đơn");
                });
            }
            else {
                this.gridTableService.getAllData(this.gridParams).forEach((val) => {
                    if(val.invoiceId == rowData?.id) isExistsInvoice = true;
                });

                if (isExistsInvoice) {
                    this.notify.warn("Invoice đã tồn tại");
                    return;
                }

                    console.log('case 2');
                    const newRow = {
                        stt: this.displayedData.length + 1,
                        id: 0,
                        invoiceId: 0,
                        invoiceNumber: rowData?.invoiceNum,
                        invoiceDate: rowData?.invoiceDate,
                        invoiceAmount: rowData?.invoiceAmount,
                        paymentAmount: rowData?.availableAmount,
                        prepaymentAmount: rowData?.preAmount,
                        availableAmount: rowData?.availableAmount,
                        isAdjustmentInvoice: rowData?.isAdjustmentInvoice,
                        vendorId: rowData?.vendorId,
                        vendorSiteId: rowData?.vendorSiteId,
                        poNo: rowData?.poNo
                    };
                    this.gridParams.api.applyTransaction({ add: [newRow] });
                    this.displayedData.push(Object.assign(new InputPaymentLinesDto(),newRow));


                //console.log(newRow);
                //console.log(this.createOrEditForm.get('vendorId').value)
                if (!this.selectedRow.vendorId || this.selectedRow.vendorId == -1){
                    this.selectedRow.vendorId=rowData.vendorId;
                    this.selectedRow.vendorSiteId=rowData.vendorSiteId;
                }
            }

        });

        const rowIndex = this.gridParams.api.getDisplayedRowCount() - 1;
        setTimeout(() => {
            this.gridParams.api.startEditingCell({ colKey: 'paymentAmount', rowIndex });
            this.selectedNode = this.gridParams.api.getRowNode(`${rowIndex}`);
            this.gridParams.api.getRowNode(`${rowIndex}`)?.setSelected(true);
        }, 400);
        this.getDisplayedData();
    }

    cellValueChanged(params: AgCellEditorParams) {
        const field = params.colDef.field;
        const rowIndex = this.gridParams.api.getDisplayedRowCount() - 1;
        this.selectedNode = params.node;
        switch (field) {
          case 'paymentAmount':
            //console.log(params.data['invoiceId']);
            //console.log(params.data['availableAmount']);
            if (params.data['paymentAmount'] < 0) {

                this.notify.warn(this.l('AmountGreaterThan0'));
                if(params.data['invoiceId'] != undefined)
                    params.data['paymentAmount'] = params.data['availableAmount'];
                else params.data['paymentAmount'] = 0;
            }else
            if (params.data['invoiceId'] != undefined && params.data['paymentAmount'] > params.data['availableAmount']) {
                this.notify.warn(this.l('IsInvalid', 'Amount'));
                params.data['paymentAmount'] = params.data['availableAmount'];
            }
            break;
        }
        this.getDisplayedData();
        //this.calculateTotalAmount();
        this.gridParams.api.refreshCells();
      }


    searchItems() {}

    reset() {
        this.createOrEditForm = this.formBuilder.group({
            // form of PaymentHeadersDto
            id: [0],
            paymentNo: [undefined],
            requestDate: [new Date(), GlobalValidator.required],
            requestDuedate: [undefined, GlobalValidator.required],
            description: [undefined],
            employeeId: [abp.session.userId, GlobalValidator.required],
            vendorId: [undefined, GlobalValidator.required],
            vendorSiteId: [undefined, GlobalValidator.required],
            currencyCode: [undefined],
            totalAmount: [undefined],
            employeeCode: [undefined],
            status:[undefined],
            authorizationStatus: [undefined],
            fileName: [undefined],
            documentId: [undefined],
        });
        this.selectedRow = new PaymentHeadersDto();
        this.displayedData = [];
        this.gridParams.api.setRowData(this.displayedData);
        this.listSupplier = [...this.listSupplier];
        this.siteList = [...this.siteList];
        this.selectedRow.employeeId = undefined;
        this.approvalInfos = [];
        //  this.selectedRow. = undefined;

        this.uploadData = [];
        this.gridParamsAttachment.api.setRowData(this.uploadData);
    }
    closeModel() {
        this.modal.hide();
    }
    callBackGrid(params: GridParams) {
        this.gridParams = params;
        params.api.setRowData([]);
    }
    changePaginationParams(paginationParams: PaginationParamsModel) {
        this.paginationParams = paginationParams;
        this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
        this.paginationParams.pageSize = paginationParams.pageSize;
    }

    onChangeSelection(params) {
        const selectedRows = params.api.getSelectedRows();
        if (selectedRows) {
          this.selectedPaymentLine = selectedRows[0];
        }
        this.selectedNode = this.gridParams.api.getSelectedNodes()[0] ?? [];
        this.gridParams.api.getRowNode(`${this.selectedNode.rowIndex}`)?.setSelected(true);
    }


    addRow() {
        const blankRow = {
          stt: this.displayedData.length + 1,
          id: 0,
          paymentAmount: 0,
          invoiceId: undefined,
          invoiceDate: undefined,
          invoiceNumber: undefined,
          invoiceAmount: 0,
          isAdjustmentInvoice: false,
          preAmount: 0,
          availableAmount: 0,
          poNo: undefined,
        };

        this.gridParams.api.applyTransaction({ add: [blankRow] });
        const rowIndex = this.gridParams.api.getDisplayedRowCount() - 1;
        setTimeout(() => {
          this.gridParams.api.startEditingCell({ colKey: 'invoiceNumber', rowIndex });
          this.selectedNode = this.gridParams.api.getRowNode(`${rowIndex}`);
          this.gridParams.api.getRowNode(`${rowIndex}`).setSelected(true);
        }, 100);
        this.getDisplayedData();
    }

    removeSelectedRow() {
        if (!this.selectedPaymentLine) {
            this.notify.warn(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Delete);
            return;
        }
        this.gridParams.api.applyTransaction({ remove: [this.selectedNode.data] });
        this.selectedPaymentLine = undefined;
        this.getDisplayedData();
    }


    save() {

        if (this.selectedRow.authorizationStatus == "APPROVED") {
            this.notify.warn("Payment đã được duyệt, không thể cập nhật!");
            return;
        }

        if (this.selectedRow.status == 2) {
            this.notify.warn("Payment đã được hủy, không thể cập nhật!");
            return;
        }

        this.isSubmit = true;
        if (this.submitBtn) {
             console.log('check');
             this.submitBtn.nativeElement.click();
        }

        if (!this.selectedRow.employeeId || this.selectedRow.employeeId == 0 || this.selectedRow.employeeId == -1){
            this.notify.warn("Người tạo không được bỏ trống!");
            return;
        }
        if (!this.selectedRow.vendorId || this.selectedRow.vendorId == 0 || this.selectedRow.vendorId == -1){
            this.notify.warn("Nhà cung cấp không được bỏ trống!");
            return;
        }
        // if (!this.createOrEditForm.get('vendorSiteId').value){
        //     this.notify.warn("Chi nhánh nhà cung cấp không được bỏ trống!");
        //     return;
        // }
        // return;

        if(this.displayedData.length == 0){
            this.notify.warn(this.l('IsInvalid', 'Dữ liệu invoices'));
            return;
        }

        this.inputPaymentHeadersDto = Object.assign(new InputPaymentHeadersDto() ,this.selectedRow, {
            inputPaymentLinesDto: [] ,
            attachments: []
        });

        this.uploadData.forEach(e => {
            this.inputPaymentHeadersDto.attachments.push(Object.assign(new PaymentAttachmentsDto() , e));
        });
        this.displayedData.forEach(e => {
            this.inputPaymentHeadersDto.inputPaymentLinesDto.push(Object.assign(new InputPaymentLinesDto() , e));
        });


        var requestDate = moment(this.inputPaymentHeadersDto.requestDate).startOf('day');
        var today = moment().startOf('day');
        var duedate = moment(this.inputPaymentHeadersDto.requestDuedate).startOf('day');
        if (!this.isEditForm && requestDate < today) {
            this.notify.warn(this.l('IsInvalid', this.l('RequestDate')));
            return;
        }

        if (this.inputPaymentHeadersDto.requestDuedate == null || (this.inputPaymentHeadersDto.requestDuedate != null && requestDate > duedate)){
            this.notify.warn(this.l('IsInvalid', this.l('RequestDuedate')));
            return;
        }

        if (this.inputPaymentHeadersDto.currencyCode == null){
            this.notify.warn(this.l('IsInvalid', 'Currency'));
            return;
        }

        // console.log(requestDate);
        // console.log(duedate);
        // console.log(requestDate.diff(duedate, 'days') );

        // if (this.inputPaymentHeadersDto.requestDuedate != null && requestDate.diff(duedate, 'days') > 0){
        //     this.notify.warn(this.l('IsInvalid', ('RequestDuedate')));
        //     return;
        // }

        this.spinnerService.show();
        this._paymentHeadersServiceProxy.createOrEditPayment(this.inputPaymentHeadersDto)
        .pipe(finalize(() => {
            this.spinnerService.hide();

            // this._approvalProxy.createRequestApprovalTree(body)
            //     .pipe(finalize(() => {
            //         this.spinnerService.hide();
            //         this.search();
            //     }))
            //     .subscribe(res => this.notify.success(this.l('Successfully')))

        }))
        .subscribe(res => {
            this.attach.saveAttachFile(res);
            if(!this.selectedRow.id){
                let body = Object.assign(new CreateRequestApprovalInputDto(), {
                    reqId: res,
                    processTypeCode: 'PM'
                });

                this.spinnerService.show();
                this._approvalProxy.createRequestApprovalTree(body)
                    .pipe(finalize(() => {
                        this.spinnerService.hide();
                    }))
                    .subscribe(res => this.notify.success(this.l('Successfully')));
            }


            this.notify.success(this.l(AppConsts.CPS_KEYS.Saved_Successfully));
            this.modal.hide();
            this.close.emit();
        });
    }

    cancel() {
        if (this.selectedRow.authorizationStatus == "APPROVED") {
            this.notify.warn("Payment đã được duyệt, không thể hủy!");
            return;
        }

        if (this.selectedRow.status == 2) {
            this.notify.warn("Payment đã được hủy!");
            return;
        }

        if (this.selectedRow.id > 0) {
          this.message.confirm('', this.l(AppConsts.CPS_KEYS.Are_You_Sure), (isConfirmed) => {
            if (isConfirmed) {
              this.spinnerService.show();
              this._paymentHeadersServiceProxy.cancelPayment(this.selectedRow.id)
              .pipe(finalize(() => {
                    this.spinnerService.hide();

                })).subscribe(val => {
                    this.notify.success(this.l(AppConsts.CPS_KEYS.Saved_Successfully));
                    this.modal.hide();
                    this.close.emit();
                });
            }
          });
        } else {
          this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Edit));
        }
    }


    // onUpload(data: { target: { files: Array<any> } }): void {

    //     if (data?.target?.files.length > 0) {
    //         this.formData = new FormData();
    //         const formData: FormData = new FormData();
    //         const file = data?.target?.files[0];
    //         this.fileName = file?.name;
    //         this.fileName = file?.name;
    //         let fileName = `${(this.fileName.split('.'))[0]}_${this.selectedNode?.paymentNo ?? ''}_${(new Date()).getTime()}.${(this.fileName.split('.'))[1]}`;
    //         formData.append('file', file, fileName);
    //         this.formData = formData;
    //     }
    // }

    // downloadFile() {
    //     this._httpClient.get(this.downloadUrl, { params: { 'filename': this.selectedRowAttachment.serverFileName }, responseType: 'blob' })
    //     .subscribe(blob => {
    //         saveAs(blob, this.selectedRowAttachment.serverFileName);
    //     });
    // }

    callBackGridAttachment(params: GridParams) {
        this.gridParamsAttachment = params;
        this.gridParamsAttachment.api.setRowData(this.uploadData);
    }

    onChangeSelectionAttachment(params: GridParams) {
        const selectedRows = params.api.getSelectedRows();
        if (selectedRows) {
            this.selectedRowAttachment = selectedRows[0];
        }
        //this.attachFileParams.api.forEachNode((node: RowNode) => { if (node.isSelected()) this.selectedNodeAttachment = node; });
    }

    // upload() {
    //   //this.uploadData = [];
    //   //this.objEdit?.attachments?.map(e => this.uploadData.push(Object.assign(new RcvShipmentAttachmentsDto(), e)));
    //   this._httpClient
    //       .post<any>(this.uploadUrl, this.formData)
    //       .pipe(finalize(() => {this.excelFileUpload?.clear(); this.fileName ='';}))
    //       .subscribe((response) => {
    //           this.fileName = "";
    //           if (response.success) {
    //                   this.uploadData.push(Object.assign(new PaymentAttachmentsDto(),{
    //                     serverFileName: response.result.attachComplainMgmts?.attachName,
    //                     serverLink: response.result.attachComplainMgmts?.attachFile,
    //                     step: 0,
    //                   }));
    //                 //   console.log(this.uploadData);
    //                   //this.attachments = this.uploadData;
    //                   this.gridParamsAttachment?.api.setRowData(this.uploadData);
    //                   this.notify.success("Tải tệp lên thành công");

    //           } else if (response.error != null) {
    //               this.notify.error(this.l("invalid", this.l("Data")));
    //           }
    //           if (this.uploadData?.length < 1)
    //               return this.notify.error(this.l("invalid", this.l("Data")));
    //       });
    // }

    // deleteAttachFile() {
    //     var fileName = this.selectedRowAttachment.serverLink;
    //     console.log(this.selectedNode)
    //     const index = this.uploadData.findIndex((e: { serverLink: any; }) => e.serverLink === fileName);

    //     this.uploadData.splice(index, 1);
    //     this.gridParamsAttachment.api.setRowData(this.uploadData);
    //     this.selectedRowAttachment = undefined;

    //   }

    //   resetAttachment() {
    //     setTimeout(() => {
    //         this.InputVar.nativeElement.value = "";
    //         this.fileName = '';
    //         this.InputVar.nativeElement.click();
    //     }, 500);
    //   }
}
