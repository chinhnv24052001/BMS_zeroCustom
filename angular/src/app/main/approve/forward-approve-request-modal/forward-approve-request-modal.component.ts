import { AppComponentBase } from '@shared/common/app-component-base';
import { CommonAllDepartment, CommonGeneralCacheServiceProxy, GetRequesterDto, RequestApprovalServiceProxy } from './../../../../shared/service-proxies/service-proxies';
import { Component, EventEmitter, Injector, Output, ViewChild } from '@angular/core';
import { ForwardInputDto, RequestApprovalTreeServiceProxy } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'forward-approve-request-modal',
  templateUrl: './forward-approve-request-modal.component.html',
  styleUrls: ['./forward-approve-request-modal.component.less']
})
export class ForwardApproveRequestModalComponent extends AppComponentBase {

    @ViewChild('forwardApproveRequestModal', { static: true }) modal!: ModalDirective;

    @Output() modalSave = new EventEmitter<any>();

    forwardInfo: ForwardInputDto = new ForwardInputDto();

    departments: { label: string, value: string }[] = [];
    userCombobox: { label: string, value: number }[] = [];

    users: GetRequesterDto[] = [];
    departmentId: string = '';
    userId: number | undefined;
    forwardEmail: string = '';
    note: string = '';
    requestApprovalStepId: number;

    constructor(
        injector: Injector,
        private _approveService: RequestApprovalTreeServiceProxy,
        private _cacheProxy: CommonGeneralCacheServiceProxy
    ) {
        super(injector);
    }

    ngOnInit() {
        this.getAllDepartments();
        this.getAllUsers();
        this.userCombobox =[];
    }

    show(requestApprovalStepId?: number) {
        // this.userCombobox =[];
        this.userId = undefined;
        this.forwardEmail = '';
        this.note = '';
        this.requestApprovalStepId = requestApprovalStepId;
        this.modal.show();
    }

    close() {
        this.modal.hide();
    }

    forward() {
        this.spinnerService.show();
        let body = Object.assign(new ForwardInputDto, {
            requestApprovalStepId: 0,
            forwardUserId: this.userId,
            note: this.note
        });
        this.modalSave.emit(body);
        this.modal.hide();
        // this._approveService.forward(body)
        // .pipe(finalize(() => {
        //     this.spinnerService.hide();
        //     this.notify.success(this.l('Successfully'))
        //     this.modal.hide();
        // }))
        // .subscribe();
    }

    getAllDepartments() {
        this.spinnerService.show();
        this.departments = [];
        this.departments.unshift({
            label: '',
            value: ''
        });
        this._cacheProxy.getAllDepartments()
            .pipe(finalize(() => this.spinnerService.hide()))
            .subscribe(res => res.map(e => this.departments.push({
                label: e.departmentName,
                value: e.id
            })));
    }

    getAllUsers() {
        this.spinnerService.show();
        this.users = [];
        this._cacheProxy.getAllUsersInfo()
            .pipe(finalize(() => this.spinnerService.hide()))
            .subscribe(res =>{
                this.userCombobox.unshift({
                    label: '',
                    value: undefined
                })
                res.forEach(e => {
                    this.userCombobox.push({
                        label: e.name,
                        value: e.id
                    })
                });
                this.users = res;
            });
    }

    onChangeDepartment(params: any) {
        this.userCombobox = [];
        this.userCombobox.unshift({
            label: '',
            value: undefined
        })
        if (!params || params == ''){
            this.users.forEach(e => {
                this.userCombobox.push({
                    label: e.name,
                    value: e.id
                })
            })
        }
        else {
            this.users.forEach(e => {
                if (e.departmentId == params || params == ''){
                    this.userCombobox.push({
                        label: e.name,
                        value: e.id
                    })
                }
            })
        }

        // this.users.filter(e => e.departmentId == params).map(e => this.userCombobox.push({
        //     label: e.name,
        //     value: e.id
        // }));
        this.userId = undefined;
        this.forwardEmail = '';
    }

    onChangeUser(params: any) {
        this.forwardEmail = this.users.find(e => e.id == params)?.email;
        let departmentId = this.users.find(e => e.id == params)?.departmentId;
        if (departmentId){
            this.departmentId = departmentId;
            this.userCombobox = [];
            this.users.forEach(e => {
                if (e.departmentId == departmentId ){
                    this.userCombobox.push({
                        label: e.name,
                        value: e.id
                    })
                }
            })
        }
        else {
            this.departmentId = '';
        }
        this.departments = [...this.departments] // dùng để reset giá trị trong combobox

    }
}
