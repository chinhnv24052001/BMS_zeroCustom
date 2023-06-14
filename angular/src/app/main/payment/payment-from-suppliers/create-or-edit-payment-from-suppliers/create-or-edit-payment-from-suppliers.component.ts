import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef,EventEmitter,Injector, Input, OnInit, Output, ViewChild, Renderer2, } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormBuilder } from '@angular/forms';
import { AgCheckboxRendererComponent } from '@app/shared/common/grid-input-types/ag-checkbox-renderer/ag-checkbox-renderer.component';
import { AgDropdownRendererComponent } from '@app/shared/common/grid-input-types/ag-dropdown-renderer/ag-dropdown-renderer.component';
import { TmssSelectGridModalComponent } from '@app/shared/common/grid-input-types/tmss-select-grid-modal/tmss-select-grid-modal.component';
import { AgCellEditorParams, CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { GridTableService } from '@app/shared/services/grid-table.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { PaymentHeadersServiceProxy, PaymentHeadersDto, MstSupplierServiceProxy, InputPaymentLinesDto, InvoiceHeadersDto, GetInvoiceHeadersDto, CommonGeneralCacheServiceProxy, InputPaymentHeadersDto, RcvShipmentAttachmentsDto, PaymentAttachmentsDto, PaymentFromSuppliersServiceProxy, PaymentFromSuppliersDto, InputPaymentFromSuppliersDto, PaymentFromSupplierAttachmentsDto,} from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import * as saveAs from 'file-saver';
import { DateTime } from 'luxon';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FileUpload } from 'primeng/fileupload';
import { forkJoin, Observable } from 'rxjs';
import { elementAt, finalize, mergeMap, tap } from 'rxjs/operators';

@Component({
    selector: 'create-or-edit-payment-from-suppliers',
    templateUrl: './create-or-edit-payment-from-suppliers.component.html',
    styleUrls: ['./create-or-edit-payment-from-suppliers.component.less'],
})
export class CreateOrEditPaymentFromSupliersComponent extends AppComponentBase implements OnInit {
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('submitBtn', { static: false }) submitBtn: ElementRef;
    @ViewChild('listAllInvoices', { static: true }) listAllInvoices!: TmssSelectGridModalComponent;
    @ViewChild('listAllPOs', { static: true }) listAllPOs!: TmssSelectGridModalComponent;
    @ViewChild('imgInput', { static: false }) InputVar: ElementRef;

    @Input() selectedRow: PaymentFromSuppliersDto = new PaymentFromSuppliersDto();
    @Input() listSupplier = [];
    @Input() listPaymentMethod = [];
    @Input() listCurrency = [];
    @Input() siteListAll = [];
    @Input() employeeListAll = [];
    @Input() paymentStatusList = [];
    @Input() approveStatusList = [];
    @Input() currentSupplierId : number;

    @Output() close = new EventEmitter<any>();
    @Output() updateAfterEdit = new EventEmitter<any>();
    gridInvoicesDef: CustomColDef[];
    gridPOsDef: CustomColDef[];
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

    inputPaymentHeadersDto: InputPaymentFromSuppliersDto = new InputPaymentFromSuppliersDto()
    uploadUrl: string = "";
    downloadUrl: string = "";
    removeUrl: string = '';
    formData: FormData = new FormData();
    @Input() uploadData: PaymentFromSupplierAttachmentsDto[] = [];
    fileName: string = "";
    selectedRowAttachment: PaymentFromSupplierAttachmentsDto = null;
    gridParamsAttachment: GridParams | undefined;
    excelFileUpload: FileUpload;
    attColDef: CustomColDef[] = [];

    sourcePaymentStatusList = [
        {label: this.l("Invoices"), value : 0},
        {label: this.l("PurchaseOrder"), value : 1},
      ]

    constructor(
        injector: Injector,
        private _paymentFromSuppliersServiceProxy: PaymentFromSuppliersServiceProxy,
        private formBuilder: FormBuilder,
        private dataFormatService: DataFormatService,
        private _commonService: CommonGeneralCacheServiceProxy,
        private _mstSupplier: MstSupplierServiceProxy,
        private _httpClient: HttpClient,
    ) {
        super(injector);
        this.frameworkComponents = {
            agSelectRendererComponent: AgDropdownRendererComponent,
            agCheckboxRendererComponent: AgCheckboxRendererComponent,
        };

        this.gridInvoicesDef = [
            {
              // STT
              headerName: this.l('STT'),
              headerTooltip: this.l('STT'),
              cellRenderer: (params: ICellRendererParams) => ((this.listAllInvoices.paginationParams.pageNum! - 1) * this.listAllInvoices.paginationParams.pageSize! + params.rowIndex + 1).toString(),

            },
            {
              headerName: this.l('InvoiceNum'),
              field: 'invoiceNum',
            },
            {
              headerName: this.l('InvoiceDate'),
              field: 'invoiceDate',
              valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.invoiceDate) : "",

            },
            {
              headerName: this.l('Vendor'),
              field: 'supplierName',
            },
            {
              headerName: this.l('InvoiceAmount'),
              field: 'invoiceAmount',
              valueFormatter: param => param.data ? this.dataFormatService.moneyFormat(param.data.invoiceAmount) : "",

            },
            {
                headerName: this.l('PreAmount'),
                field: 'preAmount',
                valueFormatter: param => param.data ? this.dataFormatService.moneyFormat(param.data.preAmount) : "",
            },
            {
                headerName: this.l('AvailableAmount'),
                field: 'availableAmount',
                valueFormatter: param => param.data ? this.dataFormatService.moneyFormat(param.data.preAmount) : "",
                hide:true
            },
            {
                headerName: this.l('Currency'),
                field: 'currencyCode',
            },
            {
                headerName: this.l('Description'),
                field: 'description',
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

        this.gridPOsDef = [
            {
              // STT
              headerName: this.l('STT'),
              headerTooltip: this.l('STT'),
              cellRenderer: (params: ICellRendererParams) => ((this.listAllPOs.paginationParams.pageNum! - 1) * this.listAllPOs.paginationParams.pageSize! + params.rowIndex + 1).toString(),
              width: 40,
            },
            {
              headerName: this.l('PoNo'),
              headerTooltip: this.l('PoNo'),
              field: 'poNo',
              width: 100,
            },
            // {
            //   headerName: this.l('ApprovedDate'),
            //   headerTooltip: this.l('ApprovedDate'),
            //   field: 'approvedDate',
            //   valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.approvedDate) : "",
            //   width: 80,
            // },
            {
                headerName: this.l('TotalPrice'),
                field: 'totalPrice',
                valueFormatter:param => param.value ? this.dataFormatService.moneyFormat(param.data.totalPrice) : "",
                sortable: true,
                cellClass:['text-right'],
            },
            {
                headerName: this.l('AvailableAmount'),
                field: 'availableAmount',
                valueFormatter:param => param.value ? this.dataFormatService.moneyFormat(param.data.availableAmount) : "",
                sortable: true,
                cellClass:['text-right'],
            },
            {
              headerName: this.l('VendorName'),
              headerTooltip: this.l('VendorName'),
              field: 'vendorName',
              width: 300,
            },
            {
              headerName: this.l('Vendor'),
              headerTooltip: this.l('Vendor'),
              field: 'vendorId',
              width: 100,
              hide:true
            },
            {
              headerName: this.l('VendorSite'),
              headerTooltip: this.l('VendorSite'),
              field: 'vendorSiteId',
              width: 100,
              hide:true
            },
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
            paymentNo: [undefined,],
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
            invoiceNumber: [undefined],
            invoiceAmount: [undefined],
            invoiceDate: [undefined],
            prepaymentAmount: [undefined],
            poNo: [undefined],
            invoiceId: [undefined],
            creatorUser: [this.appSession.user?.name],
            poHeaderId: [undefined],
            totalPrice: [undefined],
            totalPriceUsd: [undefined],
            sourcePayment: [0],
            availableAmount: [undefined],
        });
        this.setEnableSource(true);//default

        this.createOrEditForm.get("vendorId").valueChanges.subscribe(selectedValue => {
            this.createOrEditForm.get("vendorSiteId").setValue(-1);
            this.getSiteList(selectedValue);
        });

        this.createOrEditForm.get("paymentMethod").valueChanges.subscribe(selectedValue => {
            this.setEnable(selectedValue == "Bank Transfer");
        });

        // this.createOrEditForm.get("prepaymentAmount").valueChanges.subscribe(selectedValue => {
        //     console.log(selectedValue);
        //     // if(selectedValue > this.createOrEditForm.get("availableAmount").value){
        //     //    // return;
        //     //     //this.notify.error(this.l("invalid", this.l("Data")));
        //     //     this.createOrEditForm.get("prepaymentAmount").setValue(0);
        //     //     //return;
        //     // }
        //     this.calculateTotalAmount();
        // });

        // this.createOrEditForm.get("invoiceAmount").valueChanges.subscribe(selectedValue => {
        //     this.calculateTotalAmount();
        // });

        this.createOrEditForm.get("sourcePayment").valueChanges.subscribe(selectedValue => {
            //console.log(selectedValue);
            this.setEnableSource(selectedValue === 0);
        });
    }

    setEnableSource(isInvoice) {
        if (isInvoice) {
          this.createOrEditForm.get("invoiceNumber").enable();
          this.createOrEditForm.get("invoiceAmount").enable();

        //   this.createOrEditForm.get("poNo").disable();
        //   //this.createOrEditForm.get("totalPrice").disable();
        //   this.createOrEditForm.get("prepaymentAmount").disable();

        //   this.createOrEditForm.get("poNo").setValue('');
        //   this.createOrEditForm.get("prepaymentAmount").setValue(0);
        //   this.createOrEditForm.get("totalPrice").setValue(0)
        } else {

          this.createOrEditForm.get("invoiceNumber").disable();
          this.createOrEditForm.get("invoiceAmount").disable();

          this.createOrEditForm.get("invoiceNumber").setValue('');
          this.createOrEditForm.get("invoiceDate").setValue(undefined);
          this.createOrEditForm.get("invoiceAmount").setValue(0);

          this.createOrEditForm.get("poNo").enable();
         // this.createOrEditForm.get("totalPrice").enable();
          this.createOrEditForm.get("prepaymentAmount").enable();
        }
        this.calculateTotalAmount();
    }

    setEnable(isEnable) {
        if (isEnable) {
          this.createOrEditForm.get("bankAccountName").enable();
          this.createOrEditForm.get("bankAccountNumber").enable();
          this.createOrEditForm.get("bankName").enable();
          this.createOrEditForm.get("bankBranchName").enable();
        } else {
          this.createOrEditForm.get("bankAccountName").disable();
          this.createOrEditForm.get("bankAccountNumber").disable();
          this.createOrEditForm.get("bankName").disable();
          this.createOrEditForm.get("bankBranchName").disable();
        }
    }

    ngOnInit(): void {
        // get list supplier
        this.buildForm();
       // this.searchSupplier();
    }

    getComboboxList() {
        //this.listSupplier = [{ value: -1, label: 'Tất cả' }];
        //this.employeeListAll = [{ value: -1, employeeCode: '', label: 'Tất cả' }];

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

        // this._mstSupplier.getAllSupplierNotPaged("").subscribe(
        //     res => {
        //           res.forEach(e => this.listSupplier.push({ value: e.id, label: e.supplierName }));
        //       });

        // this._commonService.getAllSupplierSites().subscribe(
        //     res => {
        //         res.forEach(e => this.siteListAll.push({ supplierId: e.supplierId, id: e.id, vendorSiteCode: e.vendorSiteCode }));
        //     });



         this._commonService.getLookupsBy('PAYMENT_METHOD').subscribe(
            res => {
                res.forEach(e =>
                this.listPaymentMethod.push({ value: e.lookupCode, label: e.description }));
         });
         this._commonService.getAllCurrencies().subscribe(
            res => {
                res.forEach(e =>
                this.listCurrency.push({ value: e.currencyCode, label: e.currencyCode }));
        });
      }

    show(data?: PaymentFromSuppliersDto) {
        if(this.currentSupplierId > 0)
            this.createOrEditForm.get('vendorId').setValue(this.currentSupplierId);

        this.sourcePaymentStatusList = [...this.sourcePaymentStatusList];
        if (data) {
            // this._paymentHeadersServiceProxy.getPaymentById(id).subscribe((res) => {
            //     this.selectedRow = res;
            //     this.createOrEditForm.patchValue(res);
            //     this.isEditForm = true;
            // });
            this.spinnerService.show();
            this.selectedRow = data;
            this.getSiteList(data.vendorId);

            this.createOrEditForm.patchValue(data);
            this.createOrEditForm.get('totalAmount').setValue(this.dataFormatService.formatMoney(data.totalAmount));
            this.isEditForm = true;
            this.listSupplier = [...this.listSupplier];
            this.employeeListAll = [...this.employeeListAll];
            //this.siteListAll = [...this.siteListAll];
            this.siteList = [...this.siteList];
            this.listCurrency = [...this.listCurrency];

            this._paymentFromSuppliersServiceProxy.getAllAttachmentsByHeaderID(data?.id)
            .pipe(finalize(() => this.spinnerService.hide()))
            .subscribe((res) => {
                this.uploadData = res;
                this.gridParamsAttachment.api.setRowData(this.uploadData);
            });
        } else {
            this.isEditForm = false;
        }

        this.sourcePaymentStatusList = [...this.sourcePaymentStatusList];
        this.modal.show();
    }

    getSiteList(supplierIdFilter) {
        //console.log(supplierIdFilter);
        this.siteList = [{ value: -1, label: 'Tất cả' }];
        this.siteListAll.filter(e => e.supplierId == supplierIdFilter)
          .forEach(e => this.siteList.push({ value: e.id, label: e.vendorSiteCode }));

        if (this.siteList != undefined && this.siteList.length == 2){
            this.createOrEditForm.get('vendorSiteId').setValue(this.siteList[1].value);
        }

        // this.mstSupplierServiceProxy.getAllSupplierSiteBySupplierIdNotPaged(supplierIdFilter, "").subscribe(
        //   res => {
        //     res.forEach(e => this.siteList.push({ value: e.id, label: e.vendorSiteCode }));
        //   });
      }

    getAllInvoices(paginationParams: PaginationParamsModel) {
        return this._paymentFromSuppliersServiceProxy.getAllInvoices(
            '',
            this.createOrEditForm.get("vendorId").value,
            this.createOrEditForm.get("vendorSiteId").value,
            "",
            (this.listAllInvoices.paginationParams ? this.listAllInvoices.paginationParams.sorting : ''),
            (this.listAllInvoices.paginationParams ? this.listAllInvoices.paginationParams.pageSize : 100),
            (this.listAllInvoices.paginationParams ? this.listAllInvoices.paginationParams.skipCount : 1)
        )
        .pipe(
           // mergeMap(result => this.invoiceHeaderList = result),
           //tap(val => console.log(val[0])),
           tap(val => this.invoiceHeaderList = val.items),
        );

        //var c = new Observable<GetInvoiceHeadersDto[]>
        // s.subscribe((res)=>{
        //     this.invoiceHeaderList = res;
        //     console.log(this.invoiceHeaderList);
        // });

        //return s;
    }

    patchInvoice(event: any) {
        if (!this.createOrEditForm.get('vendorId').value || this.createOrEditForm.get('vendorId').value == -1){
            this.createOrEditForm.get('vendorId').setValue(event.vendorId);
            this.createOrEditForm.get('vendorSiteId').setValue(event.vendorSiteId);
        }

        this.createOrEditForm.get('invoiceId').setValue(event.id);
        this.createOrEditForm.get('invoiceNumber').setValue(event.invoiceNum);
        this.createOrEditForm.get('invoiceDate').setValue(event.invoiceDate);
        this.createOrEditForm.get('invoiceAmount').setValue(event.invoiceAmount);
        this.createOrEditForm.get('description').setValue(event.description);
        this.createOrEditForm.get('prepaymentAmount').setValue(0);
        this.createOrEditForm.get('currencyCode').setValue(event.currencyCode);

        this.getDisplayedData();
    }
    setLoading(params) {
        this.isLoading = params;
    }

    resetFormValue(){
        this.createOrEditForm.get('invoiceNumber').setValue('');
        this.createOrEditForm.get('invoiceDate').setValue('');
        this.createOrEditForm.get('invoiceAmount').setValue(0);
        this.createOrEditForm.get('description').setValue('');
        this.createOrEditForm.get('totalAmount').setValue(0);
        this.createOrEditForm.get('poHeaderId').setValue(0);
        this.createOrEditForm.get('poNo').setValue('');
        this.createOrEditForm.get('totalPrice').setValue(0);
        this.createOrEditForm.get('totalPriceUsd').setValue(0);
        this.createOrEditForm.get('availableAmount').setValue(0);
        this.createOrEditForm.get('prepaymentAmount').setValue(0);
    }

    selectInvoice(){
        //this.createOrEditForm.get('invoiceId').setValue(0);
        this.resetFormValue();
       // this.calculateTotalAmount();
        this.listAllInvoices.show();
    }

    selectPOs(){
        this.resetFormValue();

        this.listAllPOs.show();
    }

    getDisplayedData() {
        this.calculateTotalAmount();
      }

    calculateTotalAmount() {
        let sumTotal = 0;
        sumTotal = Number(this.createOrEditForm.get('invoiceAmount').value) + Number(this.createOrEditForm.get('prepaymentAmount').value);
        this.createOrEditForm.get('totalAmount').setValue(this.dataFormatService.formatMoney(sumTotal));
      }

    setDataRow(rowData: GetInvoiceHeadersDto) {

    }

    searchItems() {}

    reset() {
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
            invoiceNumber: [undefined],
            invoiceAmount: [undefined],
            invoiceDate: [undefined],
            prepaymentAmount: [undefined],
            poNo: [undefined],
            invoiceId: [undefined],
            creatorUser: [this.appSession.user?.name],
            poHeaderId: [undefined],
            totalPrice: [undefined],
            totalPriceUsd: [undefined],
            sourcePayment: [0],
            availableAmount: [undefined],
        });

        //this.setEnableSource(true);//default

        this.listSupplier = [...this.listSupplier];
        this.siteList = [...this.siteList];
        this.sourcePaymentStatusList = [...this.sourcePaymentStatusList];

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


    save() {
        if (this.createOrEditForm.get('status').value == 1) {
            this.notify.warn("Payment đã được gửi, không thể cập nhật!");
            return;
        }

        if (this.createOrEditForm.get('status').value == 2) {
            this.notify.warn("Payment đã được hủy, không thể cập nhật!");
            return;
        }

        this.isSubmit = true;
        if (this.submitBtn) {
             console.log('check');
             this.submitBtn.nativeElement.click();
        }
        if (this.createOrEditForm.invalid) {

           if (!this.createOrEditForm.get('employeeId').value){
                this.notify.warn("Người tạo không được bỏ trống!");
                return;
           }
           if (!this.createOrEditForm.get('vendorId').value){
                this.notify.warn("Nhà cung cấp không được bỏ trống!");
                return;
            }
            // if (!this.createOrEditForm.get('vendorSiteId').value){
            //     this.notify.warn("Chi nhánh nhà cung cấp không được bỏ trống!");
            //     return;
            // }
            return;
        }

        this.inputPaymentHeadersDto = Object.assign(this.createOrEditForm.getRawValue(), {
            attachments: this.uploadData
        });

        var requestDate = moment(this.inputPaymentHeadersDto.requestDate, 'day');
        var today = moment().startOf('day');
        var duedate = moment(this.inputPaymentHeadersDto.requestDuedate, 'day');
        if (!this.isEditForm && requestDate.diff(today, 'days') < 0) {
            this.notify.warn(this.l('IsInvalid', 'RequestDate'));
            return;
        }

        if (this.inputPaymentHeadersDto.requestDuedate == null){
            this.notify.warn(this.l('IsInvalid', 'RequestDuedate'));
            return;
        }

        if (this.inputPaymentHeadersDto.currencyCode == null){
            this.notify.warn(this.l('IsInvalid', 'Currency'));
            return;
        }

        console.log(requestDate);
        console.log(duedate);
        console.log(requestDate.diff(duedate, 'days') );

        if (this.inputPaymentHeadersDto.prepaymentAmount > this.inputPaymentHeadersDto.availableAmount) {
            this.notify.warn(this.l('IsInvalid', 'Khoản thanh toán trước'));
            return;
        }

        if (this.inputPaymentHeadersDto.requestDuedate != null && requestDate.diff(duedate, 'days') > 0){
            this.notify.warn(this.l('IsInvalid', 'RequestDuedate'));
            return;
        }

        if (this.inputPaymentHeadersDto.invoiceNumber == null && this.inputPaymentHeadersDto.poNo == null){
            this.notify.warn("Cần nhập giá trị cho Invoice hoặc PO");
            return;
        }

        if (this.inputPaymentHeadersDto.totalAmount == null || this.inputPaymentHeadersDto.totalAmount ==0 ){
            this.notify.warn("Cần nhập giá trị cho Amount cho Payment");
            return;
        }

        this.spinnerService.show();
        this._paymentFromSuppliersServiceProxy.createOrEditPayment(this.inputPaymentHeadersDto)
        .pipe(finalize(() => {
            this.spinnerService.hide();
        }))
        .subscribe(val => {
            this.notify.success(this.l(AppConsts.CPS_KEYS.Saved_Successfully));
            this.modal.hide();
            this.close.emit();
        });
    }

    setTotalAmount($event){
        //alert($event);
        // if (this.createOrEditForm.get('PrepaymentAmount').value > this.createOrEditForm.get('availableAmount').value) {
        //     this.createOrEditForm.get('PrepaymentAmount').setValue(0);
        // }
        this.calculateTotalAmount();
    }

    cancel() {
        if (this.createOrEditForm.get('status').value == 1) {
            this.notify.warn("Payment đã được gửi, không thể hủy!");
            return;
        }

        if (this.createOrEditForm.get('status').value == 2) {
            this.notify.warn("Payment đã được hủy!");
            return;
        }

        if (this.createOrEditForm.get('id').value > 0) {
          this.message.confirm('', this.l(AppConsts.CPS_KEYS.Are_You_Sure), (isConfirmed) => {
            if (isConfirmed) {
              this.spinnerService.show();
              this._paymentFromSuppliersServiceProxy.cancelPayment(this.createOrEditForm.get('id').value)
              .pipe(finalize(() => {
                    this.spinnerService.hide();
                    this.modal.hide();
                })).subscribe(val => {
                    this.notify.success(this.l(AppConsts.CPS_KEYS.Saved_Successfully));
                    this.close.emit();
                });
            }
          });
        } else {
          this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Edit))
        }
    }

    sendToTMV() {
        if (this.createOrEditForm.get('status').value == 1) {
            this.notify.warn("Payment đã được gửi, không thể gửi tiếp!");
            return;
        }

        if (this.createOrEditForm.get('status').value == 2) {
            this.notify.warn("Payment đã được hủy!");
            return;
        }

        if (this.createOrEditForm.get('id').value > 0) {
            this.message.confirm('', this.l(AppConsts.CPS_KEYS.Are_You_Sure), (isConfirmed) => {
              if (isConfirmed) {
                this.spinnerService.show();
                this._paymentFromSuppliersServiceProxy.sendPaymentToTMV(this.createOrEditForm.get('id').value)
                .pipe(finalize(() => {
                      this.spinnerService.hide();
                      this.modal.hide();
                  })).subscribe(val => {
                      this.notify.success(this.l(AppConsts.CPS_KEYS.Saved_Successfully));
                      this.close.emit();
                  });
              }
            });
          } else {
            this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Edit))
          }
    }


    onUpload(data: { target: { files: Array<any> } }): void {

        if (data?.target?.files.length > 0) {
            this.formData = new FormData();
            const formData: FormData = new FormData();
            const file = data?.target?.files[0];
            this.fileName = file?.name;
            this.createOrEditForm.get('fileName').setValue(file?.name);
            let fileName = `${(this.fileName.split('.'))[0]}_${this.selectedNode?.paymentNo ?? ''}_${(new Date()).getTime()}.${(this.fileName.split('.'))[1]}`;
            formData.append('file', file, fileName);
            this.formData = formData;
        }
    }

    downloadFile() {
        this._httpClient.get(this.downloadUrl, { params: { 'filename': this.selectedRowAttachment.serverFileName }, responseType: 'blob' })
        .subscribe(blob => {
            saveAs(blob, this.selectedRowAttachment.serverFileName);
        });
    }

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

    upload() {
      //this.uploadData = [];
      //this.objEdit?.attachments?.map(e => this.uploadData.push(Object.assign(new RcvShipmentAttachmentsDto(), e)));
      this._httpClient
          .post<any>(this.uploadUrl, this.formData)
          .pipe(finalize(() => {this.excelFileUpload?.clear(); this.createOrEditForm.get('fileName').setValue('');}))
          .subscribe((response) => {
              this.fileName = "";
              if (response.success) {
                      this.uploadData.push(Object.assign(new PaymentAttachmentsDto(),{
                        serverFileName: response.result.attachComplainMgmts?.attachName,
                        serverLink: response.result.attachComplainMgmts?.attachFile,
                        step: 0,
                      }));
                      console.log(this.uploadData);
                      //this.attachments = this.uploadData;
                      this.gridParamsAttachment?.api.setRowData(this.uploadData);
                      this.notify.success("Tải tệp lên thành công");

              } else if (response.error != null) {
                  this.notify.error(this.l("invalid", this.l("Data")));
              }
              if (this.uploadData?.length < 1)
                  return this.notify.error(this.l("invalid", this.l("Data")));
          });
    }

    deleteAttachFile() {
        var fileName = this.selectedRowAttachment.serverLink;
        console.log(this.selectedNode)
        const index = this.uploadData.findIndex((e: { serverLink: any; }) => e.serverLink === fileName);

        this.uploadData.splice(index, 1);
        this.gridParamsAttachment.api.setRowData(this.uploadData);
        this.selectedRowAttachment = undefined;

      }

    resetAttachment() {
        setTimeout(() => {
            this.InputVar.nativeElement.value = "";
            this.createOrEditForm.get('fileName').setValue('');
            this.InputVar.nativeElement.click();
        }, 500);
    }

    patchPO(event: any) {
        if (event.poNo){
          this.createOrEditForm.get("poNo").setValue(event.poNo);
          this.createOrEditForm.get("vendorId").setValue(event.vendorId);
          this.createOrEditForm.get("vendorSiteId").setValue(event.vendorSiteId);
          this.createOrEditForm.get("poHeaderId").setValue(event.poHeaderId);
          this.createOrEditForm.get("totalPrice").setValue(event.totalPrice);
          this.createOrEditForm.get("availableAmount").setValue(event.availableAmount);
          //this.search(false);
        }
      }

    getAllPOs(suplierName: any, paginationParams: PaginationParamsModel) {
        return this._paymentFromSuppliersServiceProxy.getPOsForPaymentRequestFromNCC(
        this.createOrEditForm.get("poNo").value,
        this.createOrEditForm.get("vendorId").value,
        this.createOrEditForm.get("vendorSiteId").value,
        -1,
        (this.listAllPOs.paginationParams ? this.listAllPOs.paginationParams.sorting : ''),
        (this.listAllPOs.paginationParams ? this.listAllPOs.paginationParams.pageSize : 100),
        //1,
        (this.listAllPOs.paginationParams ? this.listAllPOs.paginationParams.skipCount : 1)
        );
    }
}
