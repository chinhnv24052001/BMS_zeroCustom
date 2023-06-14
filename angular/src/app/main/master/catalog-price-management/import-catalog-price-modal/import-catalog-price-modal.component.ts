// import { CustomColDef } from './../../../../shared/models/base.model';
// import { ModalDirective } from 'ngx-bootstrap/modal';
// import { AppComponentBase } from '@shared/common/app-component-base';
// import { Component, Injector, ViewChild } from '@angular/core';
// import { FormBuilder, FormGroup } from '@angular/forms';
// import { HttpClient } from '@angular/common/http';
// import { finalize } from 'rxjs/operators';
// import { FileUpload } from 'primeng/fileupload';

// @Component({
//     selector: 'import-catalog-price-modal',
//     templateUrl: './import-catalog-price-modal.component.html',
//     styleUrls: ['./import-catalog-price-modal.component.less']
// })
// export class ImportCatalogPriceModalComponent extends AppComponentBase {
//     @ViewChild('importCatalogModal', { static: true }) modal!: ModalDirective;
//     @ViewChild('ExcelFileUpload', { static: false }) excelFileUpload: FileUpload;

//     importCatalogForm: FormGroup;
//     formData: FormData = new FormData();
//     importColDefs: CustomColDef[] = [];
//     defaultColDefs: CustomColDef;

//     uploadUrl: string;
//     fileName: string = '';

//     uploadData: any[] = [];

//     constructor(
//         injector: Injector,
//         private _formBuilder: FormBuilder,
//         private _http: HttpClient
//     ) {
//         super(injector);
//         this.importColDefs = [
//             {
//                 headerName: 'No.',
//                 headerTooltip: 'No.',
//                 cellClass: ['text-center'],
//                 flex: 0.5,
//             },
//             {
//                 headerName: 'Col1',
//                 headerTooltip: 'Col1.',
//                 cellClass: ['text-center'],
//                 flex: 0.5,
//             },
//             {
//                 headerName: 'Col2',
//                 headerTooltip: 'Col2',
//                 cellClass: ['text-center'],
//                 flex: 0.5,
//             },
//         ]
//     }

//     ngOnInit() {
//     }

//     show() {
//         this.buildForm();
//         this.modal.show();
//     }

//     save() {

//     }

//     buildForm() {
//         this.importCatalogForm = this._formBuilder.group({
//             fileName: ['']
//         })
//     }

//     close() {
//         this.modal.hide();
//     }

//     reset() {
//         this.importCatalogForm = undefined;
//     }

//     onUpload(data: { target: { files: Array<any> } }): void {
//         if (data?.target?.files.length > 0) {
//             this.formData = new FormData();
//             const formData: FormData = new FormData();
//             const file = data?.target?.files[0];
//             this.fileName = file?.name;
//             formData.append('file', file, file.name);
//             this.formData = formData;
//         }
//     }

//     upload() {
//         this.uploadData = [];
//         this._http
//             .post<any>(this.uploadUrl, this.formData)
//             .pipe(finalize(() => {
//                 this.excelFileUpload?.clear();
//             }))
//             .subscribe(response => {
//                 if (response.success && response.result.inrInfos) {
//                     this.uploadData = response.result.inrInfos;
//                     this.notify.success('Tải lên tệp thành công');
//                 } else if (response.error != null || !response.result.inrInfos) {
//                     this.notify.warn('Dữ liệu không hợp lệ');
//                 }
//                 if (this.uploadData?.length < 1) return this.notify.warn('Dữ liệu không hợp lệ');
//             });
//     }
// }
