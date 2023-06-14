import { DataFormatService } from '@app/shared/services/data-format.service';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Component, Input, Output, EventEmitter, forwardRef, ViewChild, ElementRef } from '@angular/core';

@Component({
    selector: 'tmss-text-input',
    templateUrl: './tmss-text-input.component.html',
    styleUrls: ['./tmss-text-input.component.less'],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => TmssTextInputComponent),
        multi: true
    }]
})
export class TmssTextInputComponent implements ControlValueAccessor {
    @Input() hasCheck = false;
    @Input() value;
    @Input() className: string = '';
    @Input() addOnMinWidth: string = '';
    @Input() text: string = '';
    @Input() isRequired: boolean = false;
    @Input() isValidate: boolean = false;
    @Input() placeholder: string = '';
    @Input() disable: boolean = false;
    @Input() hideInput: boolean = false;
    @Input() showSearch: boolean = false;
    @Input() rows: any;
    @Input() showModal: boolean = false;
    @Input() isReadonly: boolean = false;
    @Input() isDisabled: boolean = false;
    @Input() showCaret: boolean = false;
    @Input() showTrash: boolean = false;
    @Input() showUpload: boolean = false;
    @Input() showPhone: boolean = false;
    @Input() type: string = 'text';
    @Input() maxLength: number = 0;
    @Input() textRight: string = '';
    @Input() min: number;
    @Input() max: number;

    errorMessage = "This field is required";
    @Input() inputType = "text";

    //   This field is required


    @Output() onSearch = new EventEmitter();
    @Output() onChoose = new EventEmitter();
    @Output() onRefresh = new EventEmitter();
    @Output() onClickToCall = new EventEmitter();
    @Output() onClickInput = new EventEmitter();
    @Output() keyup = new EventEmitter();
    private onChange: Function = new Function();
    @ViewChild('input') input!: ElementRef;
    constructor(
        private dataFormatService: DataFormatService,
    ) {
        this.value = '';
    }

    //   triggerErrorMessage(){
    //     this.errorMessage = 'This field is required';
    //   }

    // addEvent(element, eventName, callback) {
    //     if (element.addEventListener) {
    //         element.addEventListener(eventName, callback, false);
    //     } else if (element.attachEvent) {
    //         element.attachEvent("on" + eventName, callback);
    //     } else {
    //         element["on" + eventName] = callback;
    //     }
    // }

    changeValue(event: any) {
        const value = event ? (event.target as HTMLInputElement).value : null;
        if (event.key === 'Enter') this.onClickInput.emit(value);

        if (value === '') {
            this.value = '';
        } else {
            this.value = value ?? '';
        }

        if (typeof this.onChange === 'function') {
            this.onChange(value ?? '');
        }

        if (this.type == "number" && parseInt(value) < this.min) {
            this.value = this.min;
        }

        if (this.type == "number" && parseInt(value) > this.max) {
            this.value = this.max;
        }
        if (this.type == "money") {
            const newvalue = this.value?.replaceAll(',', '');
            if (parseInt(value) < this.min) {
                this.value = this.min;
            }
            this.value = this.dataFormatService?.moneyFormat(Number(newvalue) ?? 0);
        }
    }

    writeValue(val: any) {
        this.value = val ?? '';
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
    }

    openModal(event: any) {
        const value = event ? (event.target as HTMLInputElement).value : null;
        if (event.key === 'Enter') this.onClickInput.emit(value);
    }

    setDisabledState?(isDisabled: boolean): void {
        this.isDisabled = isDisabled;
    }

    search() {
        this.onSearch.emit(this.value);
    }

    onClickInputValue() {
        this.onClickInput.emit('');
    }

    refresh() {
        this.onRefresh.emit();
    }
    clickToCall() {
        this.onClickToCall.emit();
    }

    chooseFile() {
        this.onChoose.emit();
    }

    validateInput(){
        if ((this.value != null && this.value != undefined &&  this.value.toString().trim() != '') && this.inputType.split(',')[0]=="email") {
            if(!this.dataFormatService.emailValidate(this.value)){
                this.errorMessage = "Email invalid";
                return true ;
            }
            else return false ;
        }
        return false
    }
}
