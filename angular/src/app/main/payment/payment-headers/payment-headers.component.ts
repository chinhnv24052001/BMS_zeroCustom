import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TABS } from '@app/shared/constants/tab-keys';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { EventBusService } from '@app/shared/services/event-bus.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import {CfgGenerateReportServiceProxy, CommonGeneralCacheServiceProxy,CreateRequestApprovalInputDto,InputPaymentLinesDto,MstSupplierServiceProxy,PaymentHeadersDto,PaymentHeadersServiceProxy, RequestApprovalTreeServiceProxy, RequestNextApprovalTreeInputDto,} from '@shared/service-proxies/service-proxies';
import { ceil } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import { CreateOrEditPaymentHeadersComponent } from './create-or-edit-payment-headers/create-or-edit-payment-headers.component';
import { saveAs } from 'file-saver';
import { forkJoin } from 'rxjs';
import { ViewListApproveDetailComponent } from '@app/shared/common/view-list-approve-detail/view-list-approve-detail.component';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { AgCellButtonRendererComponent } from '@app/shared/common/grid-input-types/ag-cell-button-renderer/ag-cell-button-renderer.component';

@Component({
    selector: 'payment-header',
    templateUrl: './payment-headers.component.html',
    styleUrls: ['./payment-headers.component.less'],
})
export class PaymentHeadersComponent extends AppComponentBase implements OnInit {
    @ViewChild('createOrEditPaymentRequest', { static: true })
    createOrEditPaymentRequest: CreateOrEditPaymentHeadersComponent;
    @ViewChild('viewDetailApprove', { static: true }) viewDetailApprove: ViewListApproveDetailComponent;
    unitOfMeasureForm: FormGroup;

    gridDetailColDef: CustomColDef[];
    detailList:InputPaymentLinesDto[]=[];
    detailGridParams: GridParams | undefined;

    gridColDef: CustomColDef[];
    paginationParams: PaginationParamsModel = {pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0, };
    gridParams: GridParams | undefined;
    selectedRow: PaymentHeadersDto = new PaymentHeadersDto();
    selectedRows: PaymentHeadersDto[] = [];
    listItem: PaymentHeadersDto[];

    frameworkComponents = {
        agCellButtonRendererComponent: AgCellButtonRendererComponent
      };

    searchForm: FormGroup;
    listSupplier: { label: string, value: string | number }[] = [];
    siteListAll: { supplierId: number, id: number, vendorSiteCode: string }[] = [];
    employeeListAll: { value: number, employeeCode: string, label: string }[] = [];
    countTab: number = 1;

    urlBase: string = AppConsts.remoteServiceBaseUrl;
    isLoading: boolean = false;

    paymentStatusList = [
        {label: "", value : -1},
        {label: "Đã tạo request", value : 0},
        {label: "Đã thanh toán", value : 1},
        {label: "Đã hủy", value : 2},
      ]

    approveStatusList = [
        {label: "", value : -1},
        {label: this.l("New"), value : "NEW"},
        {label: this.l("Approved"), value : "APPROVED"},
        {label: this.l("Pending"), value : "PENDING"},
        {label: this.l("Rejected"), value : "REJECTED"},
        {label: this.l("Returned"), value : "RETURNED"},
      ]
      currentUser = abp.session.userId;

    constructor(
        injector: Injector,
        private _paymentHeadersServiceProxy: PaymentHeadersServiceProxy,
        private formBuilder: FormBuilder,
        private _mstSupplier: MstSupplierServiceProxy,
        private _dataFormatService: DataFormatService,
        private eventBus: EventBusService,
        private _commonService: CommonGeneralCacheServiceProxy,
        private http: HttpClient,
        private _approvalProxy: RequestApprovalTreeServiceProxy,
        private dataFormatService: DataFormatService,
        private genReport : CfgGenerateReportServiceProxy,
    ) {
        super(injector);
        this.gridColDef = [
            {
                headerName: "",
                headerTooltip: "",
                field: "checked",
                headerClass: ["align-checkbox-header"],
                cellClass: ["check-box-center"],
                // rowDrag : true,
                checkboxSelection: true,
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,
                flex:0.1,
                maxWidth: 30
            },
            {
                headerName: this.l('PaymentNo'),
                field: 'paymentNo',
                sortable: true,
                width: 180
            },
            // {
            //     headerName: this.l('InvoiceNo'),
            //     field: 'invoiceNo',
            //     sortable: true,
            //     width: 150
            // },
            {
                headerName: this.l('RequestDate'),
                field: 'requestDate',
                valueFormatter: param => param.data ? this._dataFormatService.dateFormat(param.data.requestDate) : "",
                sortable: true,
                width: 120
            },
            {
                headerName: this.l('RequestDuedate'),
                field: 'requestDuedate',
                valueFormatter: param => param.data ? this._dataFormatService.dateFormat(param.data.requestDuedate) : "",
                sortable: true,
                width: 120
            },
            {
                headerName: this.l('TotalAmount'),
                field: 'totalAmount',
                valueFormatter:param => param.value ? this._dataFormatService.moneyFormat(param.data.totalAmount) : "",
                sortable: true,
                cellClass:['text-right'],
                width: 100
            },
            // {
            //     headerName: 'CurrencyCode',
            //     field: 'currencyCode',
            //     sortable: true,
            // },
            {
                headerName: this.l('Description'),
                field: 'description',
                sortable: true,
                width: 220
            },
            {
                headerName: this.l('CreatorUser'),
                field: 'employeeName',
                sortable: true,
                width: 150
            },
            {
                headerName: this.l('Vendor'),
                field: 'supplierName',
                sortable: true,
                width: 220
            },
            {
                headerName: this.l('Site'),
                field: 'vendorSiteCode',
                sortable: true,
                width: 130
            },
            {
                headerName: this.l('ApproveStatus'),
                field: 'authorizationStatus',
                valueGetter: (params: any) => this.handleStatus(params.data?.authorizationStatus, params.data?.departmentApprovalName),
                sortable: true,
                width: 130
            },
            {
                headerName: this.l('Status'),
                field: 'status',
                valueGetter: params => (params.data ) ? this.paymentStatusList.find(e => e.value == params.data!.status)?.label : "",
                sortable: true,
                width: 130
            },
        ];

        this.gridDetailColDef = [
            {
                headerName: this.l('Detail'),
                field: 'Detail',
                sortable: true,
                // cellRenderer: params => {
                //     return `<a href="javascript:;" >${params.data.invoiceNumber}</a>`;
                // },
                cellRenderer: 'agCellButtonRendererComponent',
                buttonDef: {
                    iconName: "fa fa-eye",
                    className: 'btn btn-outline-primary',
                    //disabled: params => params.data.approvalSeq == 1,
                    function: this.openInvoiceComponent.bind(this),
                  },
                cellClass: [ 'cell-border'],
                maxWidth: 90
            },
            {
                headerName: this.l('InvoiceNum'),
                field: 'invoiceNumber',
                sortable: true,
                // cellRenderer: params => {
                //     return `<a href="javascript:;" >${params.data.invoiceNumber}</a>`;
                // },
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

    }

    openInvoiceComponent(params){
        let tabs = TABS.INVOICE;
        this.eventBus.emit({
            type: 'openComponent',
            functionCode: tabs,
            tabHeader: this.l('Invoices'),
            params: {
                data: {
                    invoiceNumFilter: params.data.invoiceNumber.split('-').length == 2 ? params.data.invoiceNumber.split('-')[1] : params.data.invoiceNumber.split('-')[0],
                    invoiceSymbolFilter: params.data.invoiceNumber.split('-').length == 2 ? params.data.invoiceNumber.split('-')[0] : ""
                }
            }
        });
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

    buildForm(): void {
        this.searchForm = this.formBuilder.group({
            paymentNo: [undefined],
            invoiceNo: [undefined],
            poNo: [undefined],
            requestDateFrom: [undefined],
            requestDateTo: [undefined],
            vendorId: [undefined],
            employeeId: [undefined],
            sStatus: [undefined],
            sApproveStatus: [undefined],
        });
    }

    ngOnInit(): void {
        this.getComboboxList();
        this.buildForm();
        //this.getPaymentHeaders();

    }


  getComboboxList() {
    this.listSupplier = [{ value: -1, label: 'Tất cả' }];
    this.employeeListAll = [{ value: -1, employeeCode: '', label: 'Tất cả' }];

    // let api1 = this._mstSupplier.getAllSupplierNotPaged("")
    // let api2 = this._commonService.getAllSupplierSites()
    // let api3 = this._paymentHeadersServiceProxy.getTMVUserList()

    // this.spinnerService.show()
    // let api = forkJoin({api1,api2,api3})
    // api
    // .pipe(finalize(()=>{
    //     this.spinnerService.hide()
    //     // console.log(this.listSupplier)
    //     this.listSupplier =[...this.listSupplier]
    //     this.siteListAll =[...this.siteListAll]
    //     this.employeeListAll =[...this.employeeListAll]
    // }))
    // .subscribe(res => {
    //     console.log(res[0])
    //     console.log(res[1])
    //     console.log(res[2])
    //     console.log(res[3])
    //     res[0]?.forEach(e => this.listSupplier.push({ value: e.id, label: e.supplierName }));
    //     res[1]?.forEach(e => this.siteListAll.push({ supplierId: e.supplierId, id: e.id, vendorSiteCode: e.vendorSiteCode }));
    //     res[2]?.forEach(e =>
    //         this.employeeListAll.push({ value: e.id, employeeCode: e.employeeCode, label: e.name + ' - ' + e.titleCode + ' - ' + e.deptName }));

    // })
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
        });
  }

  searchData(){
    this.paginationParams =  {pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0, };
    this.getPaymentHeaders();
  }
    // get data
    getPaymentHeaders(filter?: string) {
        // this.paginationParams =  {pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0, };
        this.spinnerService.show();
                this.detailList = []
                this.listItem =[];
                this.paymentStatusList = [...this.paymentStatusList];
        this._paymentHeadersServiceProxy
            .getAllPayment(
                this.searchForm.get('paymentNo').value,
                this.searchForm.get('invoiceNo').value,
                this.searchForm.get('poNo').value,
                this.searchForm.get('requestDateFrom').value,
                this.searchForm.get('requestDateTo').value,
                this.searchForm.get('vendorId').value,
                this.searchForm.get('employeeId').value,
                this.searchForm.get('sStatus').value,
                this.searchForm.get('sApproveStatus').value,
                (this.paginationParams ? this.paginationParams.sorting : ''),
                (this.paginationParams ? this.paginationParams.pageSize : 20),
                (this.paginationParams ? this.paginationParams.skipCount : 1)
            ).pipe(finalize(()=> {
                this.spinnerService.hide();
            })).subscribe((res) => {
                //console.log(res);
                this.listItem = res.items;
                this.paginationParams.totalCount = res.totalCount;
                this.paginationParams.totalPage = ceil(
                    this.paginationParams.totalCount / this.paginationParams.pageSize
                );
            });
    }
    changePaginationParams(paginationParams: PaginationParamsModel) {
        if (!this.listItem) {
            return;
        }
        this.paginationParams = paginationParams;
        this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
        this.paginationParams.pageSize = paginationParams.pageSize;
        this.getPaymentHeaders();
    }
    callBackGrid(params: GridParams) {
        this.gridParams = params;
        params.api.setRowData([]);
    }
    onChangeSelection(params) {
        this.selectedRow = params.api.getSelectedRows()[0] ?? new PaymentHeadersDto();

        this.selectedRows = params.api.getSelectedRows();
        //console.log(this.selectedRow);

        this.selectedRow = Object.assign({}, this.selectedRow);

        this._paymentHeadersServiceProxy.getAllPaymentLineByHeaderID(this.selectedRow?.id)
            .pipe(finalize(() => this.spinnerService.hide()))
            .subscribe((res) => {
                this.detailList = res.items;
                //console.log(res.items);
                //this.gridParams.api.refreshCells();
                this.detailGridParams.api.setRowData(this.detailList);
            });
    }

    undoRequest(){
        this.message.confirm(this.l('AreYouSure'), this.l('UndoRequest'), (isConfirmed) => {
            if (isConfirmed) {
                this.spinnerService.show();

                this.spinnerService.show();
                this._approvalProxy.undoRequest(
                    this.selectedRow.id,
                    "PM"
                ).pipe(finalize(() => {
                        this.spinnerService.hide();
                        this.searchData();
                    }))
                    .subscribe(res => this.notify.success(this.l('UndoSuccessfully') ))

            }
        })
      }

    callBackDetailGrid(params: GridParams) {
        this.detailGridParams = params;
        params.api.setRowData([]);
    }
    onChangeDetailSelection(params) {
        // this.selectedRow = params.api.getSelectedRows()[0] ?? new PaymentHeadersDto();
        // //console.log(this.selectedRow);

        // this.selectedRow = Object.assign({}, this.selectedRow);

        // this._paymentHeadersServiceProxy.getAllPaymentLineByHeaderID(this.selectedRow?.id)
        //     .pipe(finalize(() => this.spinnerService.hide()))
        //     .subscribe((res) => {
        //         this.detailList = res.items;
        //         //console.log(res.items);
        //         //this.gridParams.api.refreshCells();
        //         this.detailGridParams.api.setRowData(this.detailList);
        //     });
    }


    add() {
        // show modal
        this.createOrEditPaymentRequest.show();
    }

    edit() {
        if (!this.selectedRow.id) {
            // show notification select row
            this.notify.error(this.l('Please Select Row'));
        } else {
            this.createOrEditPaymentRequest.show(this.selectedRow);
        }
    }

    delete() {
        if (this.selectedRow.id && this.selectedRow.id > 0) {
          this.message.confirm('', this.l(AppConsts.CPS_KEYS.Are_You_Sure), (isConfirmed) => {
            if (isConfirmed) {
              this.spinnerService.show();
              this._paymentHeadersServiceProxy.delete(this.selectedRow.id)
              .pipe(finalize(() => this.spinnerService.hide())).subscribe(val => {
                this.notify.success('Successfully Deleted');
                this.search();
              });
            }
          });
        } else {
          this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Delete))
        }
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

        if (this.selectedRow.id && this.selectedRow.id > 0) {
          this.message.confirm('', this.l(AppConsts.CPS_KEYS.Are_You_Sure), (isConfirmed) => {
            if (isConfirmed) {
              this.spinnerService.show();
              this._paymentHeadersServiceProxy.cancelPayment(this.selectedRow.id)
              .pipe(finalize(() => this.spinnerService.hide()))
              .subscribe(val => {
                this.notify.success('Successfully Canceled');
                this.search();
              });
            }
          });
        } else {
          this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Edit))
        }
    }



    print(){
        // console.log(this.urlBase)
        if (!(this.selectedRow.id && this.selectedRow.id > 0)) {
            this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Edit));
            return;
        }
        this.spinnerService.show();
        this._paymentHeadersServiceProxy.getDataForPrint(this.selectedRow.id)
        .pipe(finalize(()=>{
            this.spinnerService.hide();
        }))
        .subscribe(res => {
            let blob = this.base64ToArrayBuffer(res);
            this.saveByteArray( "PaymentRequest.pdf",blob);

        })
        // this._paymentHeadersServiceProxy.getPaymentReportById(this.selectedRow.id)
        // .subscribe( (res) => {
        //     this.genReport.createReport("PAYMENTREQUEST",res).subscribe(result => {

        //     })
        //     // this.http
        //     //     .post(
        //     //         `${this.urlBase}/api/GRReport/ExportPaymentReport`,
        //     //             res,
        //     //         {
        //     //             responseType: "blob",
        //     //         }
        //     //     )
        //     //     .pipe(finalize(() => (this.isLoading = false)))
        //     //     .subscribe((blob) => saveAs(blob, "PaymentRequest.pdf"));
        // });
    }

     saveByteArray(fileName, byte) {
        const blob = new Blob([byte], { type: "application/pdf" });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
      };

    base64ToArrayBuffer(base64){
        const binaryString = window.atob(base64);
        const binaryLen = binaryString.length;
        const bytes = new Uint8Array(binaryLen);
        for (let i = 0; i < binaryLen; i++) {
          const ascii = binaryString.charCodeAt(i);
          bytes[i] = ascii;
        }
        return bytes;
      };

    // print() {
    //     this.spinnerService.show();
    //     if (this.selectedRow && this.selectedRow.id > 0) {
    //       this.http
    //         .post(
    //           `${this.urlBase}/api/PurchaseOrdersReport/printPurchaseOrdersSingle`,
    //           this.selectedRow.id,
    //           {
    //             responseType: "blob",
    //           }
    //         )
    //         .pipe(finalize(() => (this.spinnerService.hide())))
    //         .subscribe((blob) => saveAs(blob, "PrintPurchaseOrders.pdf"));
    //     }
    //     else {
    //       this.notify.warn(this.l('SelectLine'));
    //     }
    //   }

    // search data
    search() {
        this.getPaymentHeaders();
    }

    sendRequest() {
        if (this.selectedRow.authorizationStatus == "APPROVED") {
        this.notify.warn("Payment đã được duyệt, không thể gửi!");
        return;
        }

        if (this.selectedRow.status == 2) {
        this.notify.warn("Payment đã được hủy, không thể gửi!");
        return;
        }

        if (this.selectedRows.length > 0){
            this._approvalProxy.checkRequestNextMultipleApprovalTree('PM',this.selectedRows.map(e => e.id)).subscribe(res => {
                this.viewDetailApprove.showModal(this.selectedRows[0].id, 'PM',this.selectedRows.map(e => e.id));
            })

        }
        else {
            this.notify.warn(this.l('SelectLine'));
        }

        // if (this.selectedRow.id && this.selectedRow.id > 0) {
        //     this.viewDetailApprove.showModal(this.selectedRow.id, 'PM');
        // } else {
        //   this.notify.warn(this.l('SelectLine'));
        // }
      }


      confirmRequest(){
        let body = Object.assign(new RequestNextApprovalTreeInputDto(), {
            reqId: this.selectedRow.id,
            processTypeCode: 'PM'
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
}
