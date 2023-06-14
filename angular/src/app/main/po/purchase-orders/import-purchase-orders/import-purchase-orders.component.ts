import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { PurchaseOrdersServiceProxy } from '@shared/service-proxies/service-proxies';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FileUpload } from 'primeng/fileupload';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'import-purchase-orders',
  templateUrl: './import-purchase-orders.component.html',
  styleUrls: ['./import-purchase-orders.component.less']
})
export class ImportPurchaseOrdersComponent extends AppComponentBase implements OnInit {

  @ViewChild('imgInput', { static: false }) InputVar: ElementRef;
  @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
  @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
  @ViewChild('ExcelFileUpload', { static: false }) excelFileUpload: FileUpload;
  @Output() close = new EventEmitter<any>();
  createOrEditForm: FormGroup;
  gridColDef: CustomColDef[];
  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridParams: GridParams | undefined;
  selectedRow;
  listRecordImports;
  fileName: string;
  uploadData = [];
  formData: FormData = new FormData();
  processInfo: any[] = [];
  uploadUrl: string;

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private _http: HttpClient,
    private _fileDownloadService: FileDownloadService,
    private purchaseOrdersServiceProxy: PurchaseOrdersServiceProxy,
    private dataFormatService: DataFormatService,
  ) {
    super(injector);
    this.uploadUrl = AppConsts.remoteServiceBaseUrl + '/ImportExcel/ImportPoFromExcel';
  }

  ngOnInit(): void {
    this.gridColDef = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        width: 50,
      },
      {
        headerName: this.l('Remark'),
        headerTooltip: this.l('Remark'),
        field: 'remark',
        cellClass: ['cell-border'],
        width: 350,
      },
      {
        headerName: this.l('ProductCode'),
        headerTooltip: this.l('ProductCode'),
        field: 'productCode',
        cellClass: ['cell-border'],
        width: 150,
      },
      {
        headerName: this.l('ProductName'),
        headerTooltip: this.l('ProductName'),
        field: 'productName',
        cellClass: ['cell-border'],
        width: 150,
      },
      {
        headerName: this.l('Uom'),
        headerTooltip: this.l('Uom'),
        field: 'uom',
        cellClass: ['cell-border'],
        width: 80,
      },
      {
        headerName: this.l('Quantity'),
        headerTooltip: this.l('Quantity'),
        field: 'quantity',
        cellClass: ['cell-border'],
        width: 70,
      },
      {
        headerName: this.l('BudgetCode'),
        headerTooltip: this.l('BudgetCode'),
        field: 'budgetCode',
        cellClass: ['cell-border'],
        width: 200,
      },
      {
        headerName: this.l('UnitPrice'),
        headerTooltip: this.l('UnitPrice'),
        field: 'unitPrice',
        cellClass: ['cell-border'],
        valueFormatter: params => this.dataFormatService.floatMoneyFormat((params.value) ? params.value : 0),
        width: 70,
      },
      {
        headerName: this.l('NeedByDate'),
        headerTooltip: this.l('NeedByDate'),
        field: 'needByPaintSteel',
        cellClass: ['cell-border'],
        width: 100,
      },
      {
        headerName: this.l('VendorName'),
        headerTooltip: this.l('VendorName'),
        field: 'vendorName',
        cellClass: ['cell-border'],
        width: 300,
      },
      {
        headerName: this.l('VendorSite'),
        headerTooltip: this.l('VendorSite'),
        field: 'vendorSiteName',
        cellClass: ['cell-border'],
        width: 150,
      }
    ];
  }

  callBackGrid(params: GridParams) {
    this.gridParams = params;
    params.api.setRowData([]);
  }

  onChangeSelection(params) {
    this.selectedRow =
      params.api.getSelectedRows()[0];
    this.selectedRow = Object.assign({}, this.selectedRow);
  }

  changePaginationParams(paginationParams: PaginationParamsModel) {
    if (!this.listRecordImports) {
      return;
    }
    this.paginationParams = paginationParams;
    this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
    this.paginationParams.pageSize = paginationParams.pageSize;
    // this.searchContractCatalog();
  }

  // buildForm() {
  //   this.createOrEditForm = this.formBuilder.group({
  //     fileName: [undefined]
  //   });
  // }

  exportTemplate() {
    this.spinnerService.show();
    this.purchaseOrdersServiceProxy
      .exportTemplate()
      .pipe(finalize(() => this.spinnerService.hide()))
      .subscribe((res) => {
        this._fileDownloadService.downloadTempFile(res);
      });
  }

  closeModel() {
    this.modal.hide();
  }

  reset() {
    setTimeout(() => {
      this.InputVar.nativeElement.value = "";
      this.fileName = '';
      this.InputVar.nativeElement.click();
    }, 50);
  }

  onUpload(data: { target: { files: Array<any> } }): void {
    if (data?.target?.files.length > 0) {
      this.formData = new FormData();
      const formData: FormData = new FormData();
      const file = data?.target?.files[0];
      this.fileName = file?.name;
      formData.append('file', file, file.name);
      this.formData = formData;
      console.log(this.formData);
    }
  }

  show() {
    this.fileName = '';
    // this.processInfo = [];
    this.uploadData = [];
    this.modal.show();
    this.gridParams.api.setRowData([]);
  }

  save() {
    let warning: boolean = false;
    if (this.uploadData.findIndex(e => e.remark != null) != -1) {
      this.notify.warn(this.l('DataHasErrorPleaseCheckAgain'));
      return warning = true;
    };
    if (warning) return;
    else {
      this.spinnerService.show();
      this.purchaseOrdersServiceProxy.saveDataFromImportData()
        .pipe(finalize(() => {
          this.spinnerService.hide();
        }))
        .subscribe((res) => {
          this.notify.success(this.l('SuccessfullyCreatedPo', res));
          this.modal.hide();
          this.close.emit();
        })
    }
  }

  refresh() {
    this.uploadData = [];
    this.gridParams.api.setRowData([]);
    this.fileName = '';
  }

  downloadTemplate() {

  }

  upload() {
    this.uploadData = [];
    this.processInfo = [];
    // this.isLoading = true;
    this.spinnerService.show();
    this._http
      .post<any>(this.uploadUrl, this.formData)
      .pipe(finalize(() => {
        this.excelFileUpload?.clear();
        this.spinnerService.hide();
      }))
      .subscribe(response => {
        if (response.success && response.result.prs) {
          this.uploadData = response.result.prs;
          this.notify.success('Tải lên tệp thành công');
        } else if (response.error != null || !response.result.prs) {
          this.notify.warn('Dữ liệu không hợp lệ');
        }
        if (this.uploadData?.length < 1) return this.notify.warn('Dữ liệu không hợp lệ');
        this.gridParams.api.setRowData(this.uploadData);
      });
  }
}
