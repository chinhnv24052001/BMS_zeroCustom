import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ImportAttachFileComponent } from '@app/shared/common/import-attach-file/import-attach-file.component';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CommonGeneralCacheServiceProxy, CommonLookupServiceProxy, GetAttachFileDto, MstContractTemplateServiceProxy } from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FileUpload } from 'primeng/fileupload';
import { finalize } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import * as FileSaver from 'file-saver';
import * as moment from 'moment';

@Component({
  selector: 'create-or-edit-frameword-contract-catalog',
  templateUrl: './create-or-edit-frameword-contract-catalog.component.html',
  styleUrls: ['./create-or-edit-frameword-contract-catalog.component.less']
})
export class CreateOrEditFramewordContractCatalogComponent extends AppComponentBase implements OnInit {

  @ViewChild("attach", { static: true }) attach: ImportAttachFileComponent;
  @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
  @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
  @Output() close = new EventEmitter<any>();
  @Input() uploadData: any[] = [];
  @Input() viewOnly = false;
  createOrEditForm: FormGroup;
  formData: FormData = new FormData();
  isEdit = false;
  isSubmit = false;
  duplicateCode;
  listStatus: { value: string, label: string; }[] = [{ value: 'Active', label: this.l('Active') }, { value: 'InActive', label: this.l('InActive') }];
  selectedData;
  listInventoryGroups: { label: string, value: string | number }[] = [];

  //File
  uploadUrl = "";
  downloadUrl = "";
  removeUrl = "";
  @ViewChild("FileUpload", { static: false })
  fileUpload: FileUpload;
  @ViewChild('imgInput', { static: false }) InputVar: ElementRef;
  fileName: string = "";
  fileData: any;
  attachFileParams: any | undefined;
  selectedFile: GetAttachFileDto = new GetAttachFileDto();
  deleteData: any[] = [];
  _formData: FormData;
  reqId;

  fileForDelete = [];
  tempFileList = [];

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private _cacheProxy: CommonGeneralCacheServiceProxy,
    private mstContractTemplateServiceProxy: MstContractTemplateServiceProxy,
    private _http: HttpClient,
    private _api: CommonLookupServiceProxy
  ) {
    super(injector);
    this.uploadUrl = `${AppConsts.remoteServiceBaseUrl}/AttachFile/UploadFileToFolder`;
    this.downloadUrl = `${AppConsts.remoteServiceBaseUrl}/AttachFile/GetAttachFileToDownload`;
    this.removeUrl = `${AppConsts.remoteServiceBaseUrl}/AttachFile/RemoveAttachFile`;
    // this.removeUrl = `${AppConsts.remoteServiceBaseUrl}/AttachFile/DeleteAttachFile`;
  }

  ngOnInit(): void {
    this.listInventoryGroups = [];
    this._cacheProxy.getAllInventoryGroups().subscribe((e) => {
      e.forEach((element) => {
        this.listInventoryGroups.push({ label: element.productGroupName, value: element.id });
      });
    })
  }

  buildForm() {
    this.createOrEditForm = this.formBuilder.group({
      id: [0],
      templateCode: [undefined, GlobalValidator.required],
      templateName: [undefined, GlobalValidator.required], 
      inventoryGroupId: [undefined, GlobalValidator.required],
      description: [undefined],
      isActive: ['Y'],
      attachmentFileName: [undefined],
    });
  }

  show(id?: number) {
    this.buildForm();
    this.selectedFile = new GetAttachFileDto();
    this.fileForDelete = [];
    this.tempFileList = [];
    if (id && id > 0) {
      // this.attach.setData(id, "TC");
      this.reqId = id;
      this.isEdit = true;
      this.spinnerService.show();
      this.mstContractTemplateServiceProxy.loadById(id).subscribe(val => {
        this.selectedFile.serverFileName = val.attachmentFileName;
        this.selectedFile.rootPath =val.rootPath;
        this.createOrEditForm.patchValue(val);
        this.spinnerService.hide();
      });
    }
    else {
      // this.attach.setData(0, "TC");
      this.isEdit = false;
      this.reqId = 0;
    }
    this.modal.show();
  }

  save() {
    this.isSubmit = true;
    if (this.submitBtn) {
      this.submitBtn.nativeElement.click();
    }
    if (this.createOrEditForm.invalid) {
      return;
    }

    this.spinnerService.show();
    this.mstContractTemplateServiceProxy.save(this.createOrEditForm.getRawValue())
      .pipe(finalize(() => {
        this.uploadData = [];
        this.close.emit();
      }))
      .subscribe(val => {
        this.mstContractTemplateServiceProxy.deleteAttachment(this.reqId)
          .pipe(finalize(() => {
            this.spinnerService.hide();
          }))
          .subscribe(valDelete => {
            this.saveUpload(val);
          });

        this.notify.success(this.l(AppConsts.CPS_KEYS.Saved_Successfully));
        this.modal.hide();
      });
  }

  closeModel() {
    this.uploadData = [];
    this.modal.hide();
  }

  reset() {
    this.createOrEditForm = undefined;
  }

  //File
  chooseFile() {
    setTimeout(() => {
      this.InputVar.nativeElement.value = "";
      this.fileName = '';
      this.InputVar.nativeElement.click();
    }, 500);
  }

  deleteFile() {
    this.message.confirm('', this.l(AppConsts.CPS_KEYS.Are_You_Sure), (isConfirmed) => {
      if (isConfirmed) {
        this.spinnerService.show();
        this.createOrEditForm.get('attachmentFileName').setValue("");
        this.createOrEditForm.get('attachmentFileName').value 
        this._formData = new FormData;
        this.mstContractTemplateServiceProxy.deleteAttachment(this.reqId)
          .pipe(finalize(() => {
            this.spinnerService.hide();
          }))
          .subscribe(val => {
          });
      }
    });


  }

  downloadFile() {
    if (!this.selectedFile.rootPath || this.selectedFile?.rootPath.trim() == "") 
    return this.notify.warn("File này chưa được lưu trên server - không thể tải xuống");
    this._http.get(this.downloadUrl, { params: { 'filename': this.selectedFile.serverFileName, 'rootPath': this.selectedFile.rootPath }, responseType: 'blob' })
      .subscribe(blob => {
        FileSaver.saveAs(blob, this.selectedFile.originalFileName)
      });
  }

  onUpload(data: { target: { files: Array<any> } }): void {
    if (data?.target?.files.length > 0) {
      this.formData = new FormData();
      this._formData = new FormData();
      const file = data?.target?.files[0];
      this.fileName = file?.name;

      this.createOrEditForm.get('attachmentFileName').setValue(file?.name);

      //File chua dc luu tren serve
      this.selectedFile = new GetAttachFileDto();

      let fileName = `${(this.fileName.split('.'))[0]}.${(this.fileName.split('.'))[1]}`;
      this._formData.append('file', file, fileName);

      // this.formData = Object.assign(formData);
      this.fileData = {
        // formData: this.formData,
        type: 'TC',
        fileName: this.fileName,
        originalFileName: this.fileName,
        serverFileName: `${(this.fileName.split('.'))[0]}${moment().unix().toString()}.${(this.fileName.split('.'))[1]}`,
        // headerId: this.reqId,
      }
    }
  }

  saveUpload(_reqId: any) {
    this._http
      .post<any>(this.uploadUrl, this._formData, {
        params: {
          type: this.fileData.type,
          serverFileName: this.fileData.serverFileName,
          headerId: _reqId,
          originalFileName: this.fileName
        }
      })
      .subscribe((response) => {
        this.fileName = "";
        this.close.emit();
      });
  }

  setAttachmentData(reqId: any, attachType: any) {
    this.reqId = reqId;
    this.spinnerService.show();
    this._api.getAttachFileData(reqId, attachType)
      .pipe(finalize(() => {
        this.spinnerService.hide();
      }))
      .subscribe(res => {
        // this.createOrEditForm.get('attachment').setValue(res.serverFileName);
      })
    this.deleteData = [];
  }
}
