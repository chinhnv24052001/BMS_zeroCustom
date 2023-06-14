import { DataFormatService } from './../../services/data-format.service';
import { GridTableService } from '@app/shared/services/grid-table.service';
import { HttpClient } from '@angular/common/http';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Component, ElementRef, Injector, Input, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { FileUpload } from 'primeng/fileupload';
import { AppConsts } from '@shared/AppConsts';
import { finalize } from 'rxjs/operators';
import * as FileSaver from 'file-saver';
import { GetAttachFileDto, CommonLookupServiceProxy, PrcContractTemplateServiceProxy } from '@shared/service-proxies/service-proxies';
import * as moment from 'moment';
import { ValueFormatterParams } from '@ag-grid-enterprise/all-modules';
import { AgCellButtonRendererComponent } from '../grid-input-types/ag-cell-button-renderer/ag-cell-button-renderer.component';

@Component({
    selector: "import-attach-file",
    templateUrl: "./import-attach-file.component.html",
    styleUrls: ["./import-attach-file.component.scss"],
    encapsulation: ViewEncapsulation.None,
})

export class ImportAttachFileComponent extends AppComponentBase implements OnInit {

    @Input() viewOnly = false;
    @Input() height: string;

    @ViewChild("FileUpload", { static: false })
    fileUpload: FileUpload;

    @ViewChild('imgInput', { static: false }) InputVar: ElementRef;

    attachFileParams: any | undefined;



    fileColDef: any[] = [];

    fileName: string = "";
    selectedFile: any;
    formData: FormData = new FormData();
    uploadUrl = "";
    downloadUrl = "";
    removeUrl = "";

    fileData: any;

    frameworkComponents: any
    @Input() reqId = 0;
    @Input() attachType = "";

    uploadData: any[] = [];
    deleteData: any[] = [];

    count = 0;
    constructor(injector: Injector,private _annex: PrcContractTemplateServiceProxy, private _http: HttpClient, private _api: CommonLookupServiceProxy,private dataFormatService: DataFormatService, private gridTableService: GridTableService) {
        super(injector);
        this.uploadUrl = `${AppConsts.remoteServiceBaseUrl}/AttachFile/UploadFileToFolder`;
        this.downloadUrl = `${AppConsts.remoteServiceBaseUrl}/AttachFile/GetAttachFileToDownload`;
        this.removeUrl = `${AppConsts.remoteServiceBaseUrl}/AttachFile/RemoveAttachFile`;

        this.frameworkComponents = {
            agCellButtonComponent: AgCellButtonRendererComponent
        };
        this.fileColDef = [
            // {
            //     headerName: this.l('STT'),
            //     headerTooltip: this.l('STT'),
            //     cellRenderer: (params) => params.rowIndex + 1,
            //     cellClass: ['text-center'],
            //     flex: 1,
            // },
            // {
            //     headerName: "File Name",
            //     field: "originalFileName",
            //     flex: 3,
            // },
            {
                headerName: this.l('No.'),
                headerTooltip: this.l('No.'),
                cellRenderer: (params) => params.rowIndex + 1,
                cellClass: ['text-center'],
                flex: 0.1
            },
            {
                headerName: this.l('Download'),
                headerTooltip: this.l('Download'),
                cellClass: ['text-center'],
                cellRenderer: "agCellButtonComponent",
                buttonDef: {
                    iconName: 'fa fa-file-download mr-0',
                    className: 'grid-btn-download btn-outline-success',
                    function: params => this.dowloadAttachment(true, params),
                },
                flex: 0.1
            },
            {
                headerName: this.l('FileName'),
                headerTooltip: this.l('FileName'),
                cellClass: ['text-center'],
                field: 'originalFileName',
                flex: 1
            },
            // {
            //     headerName: this.l('UploadTime'),
            //     headerTooltip: this.l('UploadTime'),
            //     cellClass: ['text-center'],
            //     field: 'uploadTime',
            //     valueFormatter: (params: ValueFormatterParams) => this.dataFormatService.dateFormat(params.value),
            //     flex: 0.7
            // }
        ];
    }

    dowloadAttachment(isCell: boolean, gridParams: any) {
        if (isCell) {
            this.spinnerService.show();
            this._http
                .get(this.downloadUrl, { params: { 'filename': gridParams.data?.originalFileName, 'rootPath': gridParams.data?.rootPath }, responseType: 'blob' })
                .pipe(finalize(() => this.spinnerService.hide()))
                .subscribe(blob => {
                    if (blob == null) this.notify.warn(this.l('AttachmentIsNotExist'));
                    else FileSaver.saveAs(blob, gridParams.data.originalFileName)
                }, err => this.notify.warn(this.l('AttachmentIsNotExist')));
        }

    }


    ngOnInit() {

    }

    setData(reqId: any, attachType: any) {
        this.reqId = reqId;
        this.attachType = attachType;
        this.spinnerService.show();
        this._api.getListAttachFileData(reqId, attachType)
            .pipe(finalize(() => {
                this.spinnerService.hide();
                // this.gridTableService.selectFirstRow(this.attachFileParams.api)
            }))
            .subscribe(res => {
                this.uploadData = res;
                this.attachFileParams!.api.setRowData(this.uploadData);
            })
        if(this.attachType == 'CONTRACT'){
            this._annex.getPrcContractTemplateSearchAppendix(
                undefined,
                undefined,
                undefined,
                undefined,
                "",
                "",
                true,
                "",
                -1,
                -1,
                -1,
                '',
                undefined,
                undefined,

            )
                .pipe(finalize(() => {
                    this.spinnerService.hide();
                    // this.paginationParamsDetail.totalCount = this.appendixFilter.length;
                    // this.paginationParamsDetail.totalPage = ceil(this.appendixFilter.length / this.paginationParamsDetail.pageSize);
                }))
                .subscribe(res => {
                    res.filter(e => e.contractId == reqId).forEach(e => {
                        this._api.getListAttachFileData(e.id, "ANNEX")
                        .pipe(finalize(() => {
                            this.spinnerService.hide();
                            // this.gridTableService.selectFirstRow(this.attachFileParams.api)
                        }))
                        .subscribe(res => {
                            res.forEach(e => {
                                this.uploadData.push(e);
                            })

                            this.attachFileParams!.api.setRowData(this.uploadData);
                        })
                    });
                });

        }
        this.deleteData = [];
        // this.reqId = reqId;
        // this.attachType = attachType;
    }

    chooseFile() {
        setTimeout(() => {
            this.InputVar.nativeElement.value = "";
            this.fileName = '';
            this.InputVar.nativeElement.click();
        }, 500);
    }

    uploadList = [];
    fileNameList = "";
    onUpload(data: { target: { files: Array<any> } }): void {
        console.log(data?.target?.files)
        this.uploadList =[];
        this.fileNameList = "";
        if (data?.target?.files.length > 0) {
            this.formData = new FormData();
            const formData: FormData = new FormData();
            // const file = data?.target?.files[0];
            for(var i = 0 ;i < data?.target?.files.length; i++){
                const file = data?.target?.files[i];
                this.fileName = file?.name;
                this.fileNameList += (this.fileName + ";");
                let fileName = `${(this.fileName.split('.'))[0]}.${(this.fileName.split('.'))[1]}`;
                let contentType = this.attachType;
                formData.append('file', file, fileName);
                this.formData = Object.assign(formData);
                this.fileData = {
                    formData: this.formData,
                    type: this.attachType,
                    fileName: file?.name,
                    originalFileName: file?.name,
                    serverFileName: `${(file?.name.split('.'))[0]}${moment().unix().toString()}.${(file?.name.split('.'))[1]}`,
                    headerId: this.reqId ?? 0,
                }
                this.uploadList.push(this.fileData);
            }

        }
    }

    upload() {
        setTimeout(() => {
            this.InputVar.nativeElement.value = "";
            this.fileName = '';
            // this.InputVar.nativeElement.click();
        }, 500);
        if (!this.formData || !this.fileData) return this.notify.warn("Vui lòng chọn file");
        this.uploadList.forEach(fileData => {
            this.uploadData.push(fileData)

        })
        this.attachFileParams!.api.setRowData(this.uploadData);
            this.notify.success("Tải tệp lên thành công");
            this.fileUpload?.clear()
            this.formData = undefined;
            this.fileData = undefined;
            this.selectedFile = undefined;
            this.fileNameList = undefined;
            this.uploadList =[];
        // this.uploadData = [];
        // this._http
        //     .post<any>(this.uploadUrl, this.formData,{ params : {
        //         type : this.attachType
        //     }})
        //     .pipe(finalize(() => this.fileUpload?.clear()))
        //     .subscribe((response) => {
        //         this.fileName = "";
        //         if (response.success) {
        //             if (this.uploadData.some(e => e.serverFileName == (response.result.contractAttachFile.serverFileName)))
        //                 return this.notify.error(this.l("invalid", this.l("Data")));
        //             else {
        //                 this.uploadData.push(response.result.contractAttachFile);
        //                 // this.selectedData?.attachFiles?.push(Object.assign(new GetAttachFileDto() , {
        //                 //     originalFileName : response.result.contractAttachFile.originalFileName,
        //                 //     serverFileName : response.result.contractAttachFile.serverFileName,
        //                 // }));
        //                 // this.claim.attachFiles = this.uploadData;
        //                 this.attachFileParams!.api.setRowData(this.uploadData);
        //                 this.notify.success("Tải tệp lên thành công");
        //             }
        //         } else if (response.error != null) {
        //             this.notify.error(this.l("invalid", this.l("Data")));
        //         }
        //         if (this.uploadData?.length < 1)
        //             return this.notify.error(this.l("invalid", this.l("Data")));
        //     });
    }

    saveAttachFile(reqId: any) {
        this.deleteData?.forEach(e => {
            if (e){
                this._api.deleteAttachFile(e.id)
                .subscribe(res => {
                    this._http.get(this.removeUrl, {
                        params: { "attachFile": e.serverFileName, "rootPath": e.rootPath }, responseType: 'blob'
                    }).pipe(finalize(() => {

                        //if (e?.id) this._serviceProxy.deleteContractAttachFile(e?.id).toPromise();
                        // this.selectedFile = new GetListAttachFileDto();
                    })).subscribe(() => {
                        // this.uploadData.map((e, i) => {
                        //     if (e.serverFileName == this.selectedFile.serverFileName) {
                        //         this.uploadData.splice(i, 1);
                        //     }
                        // });
                        // this.claim.attachFiles = this.uploadData;
                        this.attachFileParams!.api.setRowData(this.uploadData);
                    });
                })
            }

        })

        this.saveUpload(this.uploadData,reqId);
        this.fileUpload?.clear();

        // this.setData(this.reqId,this.attachType)
    }



    saveUpload(params: any[],reqId : any){
        this.spinnerService.show();
        var e = this.uploadData.find((e,i) => i == this.count )
        if(e){
            if (e.id == 0 || !e.id) {
                e.headerId = reqId
                this._http
                    .post<any>(this.uploadUrl, e.formData, {
                        params: {
                            type: this.attachType,
                            serverFileName: e.serverFileName,
                            headerId: e.headerId,
                            originalFileName : e.originalFileName,
                        }
                    })
                    .pipe(finalize(() =>{
                        this.count++;
                        this.saveUpload(params,reqId);
                    } ))
                    .subscribe((response) => {
                        this.fileNameList = "";
                        // if (response.success) {
                        //     if (this.uploadData.some(e => e.serverFileName == (response.result.contractAttachFile.serverFileName)))
                        //         return this.notify.error(this.l("invalid", this.l("Data")));
                        //     else {
                        //         // this.uploadData.push(response.result.contractAttachFile);
                        //         // this.selectedData?.attachFiles?.push(Object.assign(new GetAttachFileDto() , {
                        //         //     originalFileName : response.result.contractAttachFile.originalFileName,
                        //         //     serverFileName : response.result.contractAttachFile.serverFileName,
                        //         // }));
                        //         // this.claim.attachFiles = this.uploadData;
                        //         // this.attachFileParams!.api.setRowData(this.uploadData);
                        //         // this.notify.success("Tải tệp lên thành công");
                        //     }
                        // } else if (response.error != null) {
                        //     this.notify.error(this.l("invalid", this.l("Data")));
                        // }
                        // if (this.uploadData?.length < 1)
                        //     return this.notify.error(this.l("invalid", this.l("Data")));
                    });
            }
            else {
                this.count++;
                this.saveUpload(params,reqId);
            }
        }
        else {
            this.spinnerService.hide();
            this.count = 0;
        }
    }

    deleteAttachFileList(params) {
        params.forEach(e => {
            this._http.get(this.removeUrl, {
                params: { "attachFile": e.serverFileName }, responseType: 'blob'
            }).pipe(finalize(() => {
                //if (e?.id) this._serviceProxy.deleteContractAttachFile(e?.id).toPromise();
                // this.selectedFile = new GetListAttachFileDto();
            })).subscribe(() => {
                // this.uploadData.map((e, i) => {
                //     if (e.serverFileName == this.selectedFile.serverFileName) {
                //         this.uploadData.splice(i, 1);
                //     }
                // });
                // this.claim.attachFiles = this.uploadData;
                this.attachFileParams!.api.setRowData(this.uploadData);
                this.notify.success(this.l('Removed Successfully'));
            });
        })

    }

    deleteFile() {
        this.deleteData.push(this.uploadData.find(e => e.id && e.serverFileName == this.selectedFile.serverFileName))
        this.uploadData.splice(this.uploadData.findIndex(e => e.serverFileName == this.selectedFile.serverFileName), 1);

        this.attachFileParams!.api.setRowData(this.uploadData);
        this.selectedFile = undefined;

    }

    downloadFile() {
        if (!this.selectedFile.rootPath || this.selectedFile?.rootPath.trim() == "") return this.notify.warn("File này chưa được lưu trên server - không thể tải xuống");
        this._http.get(this.downloadUrl, { params: { 'filename': this.selectedFile.serverFileName, 'rootPath': this.selectedFile.rootPath }, responseType: 'blob' })
            .subscribe(blob => {
                FileSaver.saveAs(blob, this.selectedFile.originalFileName)
            });
    }

    callBackAttachFileGrid(params: any) {
        this.attachFileParams = params;
        params.api.setRowData([]);
    }

    onChangeAttachFileSelection(params: any) {
        this.selectedFile = params.api.getSelectedRows()[0] ?? new GetAttachFileDto();
        // console.log(this.selectedFile)
    }

}
