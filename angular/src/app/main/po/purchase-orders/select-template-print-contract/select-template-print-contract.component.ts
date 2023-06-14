import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CommonGeneralCacheServiceProxy } from '@shared/service-proxies/service-proxies';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import * as saveAs from 'file-saver';
@Component({
  selector: 'select-template-print-contract',
  templateUrl: './select-template-print-contract.component.html',
  styleUrls: ['./select-template-print-contract.component.less']
})
export class SelectTemplatePrintContractComponent extends AppComponentBase implements OnInit {

  urlBase: string = AppConsts.remoteServiceBaseUrl;
  @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
  @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
  @Output() close = new EventEmitter<any>();
  listTemplateContracts: { label: string, value: string | number }[] = [];
  createOrEditForm: FormGroup;
  poId: number = 0;
  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private commonGeneralCacheServiceProxy: CommonGeneralCacheServiceProxy,
    private _http: HttpClient,
    private _fileDownloadService: FileDownloadService
  ) {
    super(injector);
  }

  ngOnInit(): void {

    this.buildForm();
  }

  showModal(invGroupId: number, poId: number) {
    this.poId = poId;
    this.listTemplateContracts = [];
    this.commonGeneralCacheServiceProxy.getTemplateContractByInvGroup(invGroupId ?? 0)
    .subscribe(res => {
      res.forEach(e => this.listTemplateContracts.push({ label: e.templateName, value: e.id }))
    })
    this.modal.show();
  }

  buildForm() {
    this.createOrEditForm = this.formBuilder.group({
      templateContractId: [undefined],
    });
  }

  closeModal() {
    this.modal.hide();
  }

  reset() {

  }

  print() {
      this.spinnerService.show();
      if (this.poId > 0) {
        let body = Object.assign({
          templateContractId: this.createOrEditForm.get('templateContractId').value,
          purchaseOrdersId: this.poId
        });
        this._http
          .post(
            `${this.urlBase}/api/PurchaseOrdersReport/printPurchaseOrdersContract`,
            body,
            {
              responseType: "blob",
            }
          )
          .pipe(finalize(() => (this.spinnerService.hide())))
          .subscribe((blob) => saveAs(blob, "printPurchaseOrdersContract.pdf"));
      }
      else {
        this.notify.warn(this.l('SelectLine'));
      }
  }

}
