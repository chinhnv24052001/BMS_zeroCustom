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
import {CommonGeneralCacheServiceProxy,MstSupplierServiceProxy,PaymentFromSuppliersDto,PaymentFromSuppliersServiceProxy, ProfileServiceProxy,} from '@shared/service-proxies/service-proxies';
import { ceil } from 'lodash-es';
import { catchError, finalize } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import { forkJoin } from 'rxjs';
import { CreateOrEditPaymentFromSupliersComponent } from './create-or-edit-payment-from-suppliers/create-or-edit-payment-from-suppliers.component';

@Component({
    selector: 'payment-from-suppliers.',
    templateUrl: './payment-from-suppliers.component.html',
    styleUrls: ['./payment-from-suppliers.component.css'],
})
export class PaymentFromSuppliersComponent extends AppComponentBase implements OnInit {
    @ViewChild('createOrEditPaymentRequest', { static: true })
    createOrEditPaymentRequest: CreateOrEditPaymentFromSupliersComponent;
    unitOfMeasureForm: FormGroup;
    gridColDef: CustomColDef[];
    paginationParams: PaginationParamsModel = {pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0, };
    gridParams: GridParams | undefined;
    selectedRow: PaymentFromSuppliersDto = new PaymentFromSuppliersDto();
    listItem: PaymentFromSuppliersDto[];
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
        {label: "Đã gửi TMV", value : 1},
        {label: "Đã hủy", value : 2},
        {label: "Đã thanh toán", value : 3},
    ]

    currentSupplierId : number;

    // approveStatusList = [
    //     {label: "", value : -1},
    //     {label: "Approved", value : "APPROVED"},
    //     {label: "Pending", value : "PENDING"},
    //     {label: "Rejected", value : "REJECTED"},
    //     {label: "Returned", value : "RETURNED"},
    //   ]

    constructor(
        injector: Injector,
        private _paymentFromSuppliersServiceProxy: PaymentFromSuppliersServiceProxy,
        private formBuilder: FormBuilder,
        private _mstSupplier: MstSupplierServiceProxy,
        private _dataFormatService: DataFormatService,
        private _commonService: CommonGeneralCacheServiceProxy,
        private http: HttpClient,
        private _profileService: ProfileServiceProxy,
    ) {
        super(injector);
        this.gridColDef = [
            {
                headerName: this.l('PaymentNo'),
                field: 'paymentNo',
                sortable: true,
            },
            {
                headerName: this.l('RequestDate'),
                field: 'requestDate',
                valueFormatter: param => param.data ? this._dataFormatService.dateFormat(param.data.requestDate) : "",
                sortable: true,
            },
            {
                headerName: this.l('RequestDuedate'),
                field: 'requestDuedate',
                valueFormatter: param => param.data ? this._dataFormatService.dateFormat(param.data.requestDuedate) : "",
                sortable: true,
            },
            {
                headerName: this.l('TotalAmount'),
                field: 'totalAmount',
                valueFormatter:param => param.value ? this._dataFormatService.moneyFormat(param.data.totalAmount) : "",
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
                valueFormatter:param => param.value ? this._dataFormatService.moneyFormat(param.data.invoiceAmount) : "",
                sortable: true,
                cellClass:['text-right'],
            },
            {
                headerName: this.l('PoNo'),
                field: 'poNo',
                sortable: true,
            },
            {
                headerName: this.l('Description'),
                field: 'description',
                sortable: true,
            },
            {
                headerName: this.l('CreatorUser'),
                field: 'employeeName',
                sortable: true,
            },
            {
                headerName: this.l('Vendor'),
                field: 'supplierName',
                sortable: true,
            },
            {
                headerName: this.l('Status'),
                field: 'status',
                valueGetter: params => (params.data ) ? this.paymentStatusList.find(e => e.value == params.data!.status)?.label : "",
                sortable: true,
            },
        ];
    }

    buildForm(): void {
        this.searchForm = this.formBuilder.group({
            paymentNo: [undefined],
            requestDateFrom: [undefined],
            requestDateTo: [undefined],
            vendorId: [undefined],
            employeeId: [undefined],
            sStatus: [undefined],
            sApproveStatus: [undefined],
            invoiceNumber: [undefined],
            poNo: [undefined],
        });
    }

    ngOnInit(): void {
        this.getComboboxList();
        this.buildForm();
        //this.getPaymentHeaders();

    }


  getComboboxList() {
    this.spinnerService.show()
    this._profileService.getCurrentUserSupplierId()
    .subscribe((res)=>{
      this.currentSupplierId = res;
      this._mstSupplier.getAllSupplierNotPaged("")
      .pipe(finalize(() => {
        this.spinnerService.hide()
        this.searchForm.get("vendorId").setValue(this.currentSupplierId);
      }))
      .subscribe(
        res => {
            this.listSupplier = [];
            if (this.currentSupplierId != -1) {

                let data = res.find(e => e.id == this.currentSupplierId);
                this.listSupplier.push({ value: data.id, label: data.supplierName })
            }
            else {
                this.listSupplier = this.currentSupplierId != -1 ? []: [{ value: -1, label: 'Tất cả' }];;
                res.filter(e => this.currentSupplierId == -1 || e.id == this.currentSupplierId)
                  .forEach(e => this.listSupplier.push({ value: e.id, label: e.supplierName }));
                  //sites
            }
      });

      this._commonService.getAllSupplierSites()
          .pipe(finalize(() =>{
            //this.getSiteList(this.currentSupplierId) ;
          })).subscribe(
            res => {
              this.siteListAll = [];
              res.forEach(e => this.siteListAll.push({ supplierId: e.supplierId, id: e.id, vendorSiteCode: e.vendorSiteCode }));
            });
    });

    /* this.listSupplier = [{ value: -1, label: 'Tất cả' }];
    this.employeeListAll = [{ value: -1, employeeCode: '', label: 'Tất cả' }];

    let api1 =  this._commonService.getAllSuppliers(); //this._mstSupplier.getAllSupplierNotPaged("")
    let api2 = this._commonService.getAllSupplierSites()
    let api3 = this._profileService.getCurrentUserSupplierId();

    api1.pipe().subscribe(res => console.log(res.length));

    this.spinnerService.show()
    api3.pipe(
        finalize(()=>{
            if (this.currentSupplierId > 0){
                this.searchForm.get('vendorId').setValue(this.currentSupplierId);
                this.listSupplier = this.listSupplier.filter(e => e.value == this.currentSupplierId);
                this.siteListAll = this.siteListAll.filter(e => e.supplierId == this.currentSupplierId);
                this.paymentStatusList = [
                    {label: "Đã gửi TMV", value : 1},
                    {label: "Đã thanh toán", value : 3},
                ]
            }
        })
    ).subscribe(res => {
        this.currentSupplierId = res;
        let api = forkJoin({api1,api2})
        api
        .pipe( finalize(()=>{
            console.log(this.currentSupplierId)
            this.spinnerService.hide()
            if (this.currentSupplierId > 0){
                this.searchForm.get('vendorId').setValue(this.currentSupplierId);
                let newSupplier= []
                this.listSupplier.filter(e => e.value == this.currentSupplierId)
                    .forEach(val => newSupplier.push({ value: val.value, label: val.label }));
                console.log(this.listSupplier);
                //this.listSupplier = [...newSupplier];
                this.siteListAll = this.siteListAll.filter(e => e.supplierId == this.currentSupplierId);
                this.paymentStatusList = [
                    {label: "Đã gửi TMV", value : 1},
                    {label: "Đã thanh toán", value : 3},
                ]
            }
        }))
        .subscribe(res => {
            console.log(res[0])
            res[0]?.forEach(e => this.listSupplier.push({ value: e.id, label: e.supplierName }));
            res[1]?.forEach(e => this.siteListAll.push({ supplierId: e.supplierId, id: e.id, vendorSiteCode: e.vendorSiteCode }));

        })
    }); */

    /* this._mstSupplier.getAllSupplierNotPaged("").subscribe(
       res => {
             res.forEach(e => this.listSupplier.push({ value: e.id, label: e.supplierName }));
         });
 */
    // this._commonService.getAllSupplierSites().subscribe(
    //     res => {
    //             res.forEach(e => this.siteListAll.push({ supplierId: e.supplierId, id: e.id, vendorSiteCode: e.vendorSiteCode }));
    //     });


    // this._paymentHeadersServiceProxy.getTMVUserList().subscribe(
    //     res => {
    //         res.forEach(e =>
    //             this.employeeListAll.push({ value: e.id, employeeCode: e.employeeCode, label: e.name + ' - ' + e.titleCode + ' - ' + e.deptName }));
    //     });
  }

    // get data
    getPaymentHeaders(filter?: string) {
        this.spinnerService.show();
        this.paymentStatusList = [...this.paymentStatusList];
        this._paymentFromSuppliersServiceProxy
            .getAllPayment(
                this.searchForm.get('paymentNo').value,
                this.searchForm.get('requestDateFrom').value,
                this.searchForm.get('requestDateTo').value,
                this.searchForm.get('vendorId').value,
                this.searchForm.get('employeeId').value,
                this.searchForm.get('sStatus').value,
                this.searchForm.get('sApproveStatus').value,
                this.searchForm.get('invoiceNumber').value,
                this.searchForm.get('poNo').value,
                "",
                (this.paginationParams ? this.paginationParams.sorting : ''),
                (this.paginationParams ? this.paginationParams.pageSize : 20),
                (this.paginationParams ? this.paginationParams.skipCount : 1),

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
        this.selectedRow = params.api.getSelectedRows()[0] ?? new PaymentFromSuppliersDto();
        //console.log(this.selectedRow);

        this.selectedRow = Object.assign({}, this.selectedRow);
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
              this._paymentFromSuppliersServiceProxy.delete(this.selectedRow.id)
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
        if (this.selectedRow.status == 1) {
            this.notify.warn("Payment đã được gửi, không thể hủy!");
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
              this._paymentFromSuppliersServiceProxy.cancelPayment(this.selectedRow.id)
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

    sendToTMV() {
        if (this.selectedRow.status == 1) {
            this.notify.warn("Payment đã được gửi, không thể gửi tiếp!");
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
              this._paymentFromSuppliersServiceProxy.sendPaymentToTMV(this.selectedRow.id)
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
        console.log(this.urlBase)
        if (!(this.selectedRow.id && this.selectedRow.id > 0)) {
            this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Edit));
            return;
        }

        this._paymentFromSuppliersServiceProxy.getPaymentReportById(this.selectedRow.id)
        .subscribe( (res) => {
            this.http
                .post(
                    `${this.urlBase}/api/GRReport/ExportPaymentReport`,
                        res,
                    {
                        responseType: "blob",
                    }
                )
                .pipe(finalize(() => (this.isLoading = false)))
                .subscribe((blob) => saveAs(blob, "PaymentRequest.pdf"));
        });
    }

    // search data
    search() {
        this.getPaymentHeaders();
    }

}
