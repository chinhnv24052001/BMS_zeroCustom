import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Component, Input, forwardRef, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
    selector: 'tmss-combobox',
    templateUrl: './tmss-combobox.component.html',
    styleUrls: ['./tmss-combobox.component.less'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TmssComboboxComponent),
            multi: true,
        },
    ],
})
export class TmssComboboxComponent implements ControlValueAccessor {
    @ViewChild('ngSelectComponent') ngSelectComponent: any
    @Input() className: string = '';
    @Input() value: any;
    // @Input() items: any[] = [];
    @Input() text: string = '';
    @Input() isRequired: boolean = false;
    @Input() isValidate: boolean = false;
    @Input() isDisabled: boolean = false;
    @Input() selectedItem: any;
    @Input() label: string = 'label';
    @Input() inputLabel: string = '';
    @Input() key: string = 'value';
    @Input() type: string = 'text';
    @Input() placeholder: string = '';
    @Input() hasFilter= true;


    _items: any[] = [];

    @Input() set items(value: any[]) {

       this._items = value;
       this.setItemListForCbb();

    }

    get items(): any[] {

        return this._items;

    }

    @Output() onChangeValue = new EventEmitter();
    @ViewChild('input', { static: false }) input!: ElementRef;

    private onChange: Function = new Function();

    constructor(private cd : ChangeDetectorRef) {}

    // ngAfterViewInit(params : any) {
    //     // this.setData();
    //     this.setItemListForCbb();
    // }

    setItemListForCbb(){
        var myInterval = setInterval(()=>{
            if (this.items.length > 0){
                // console.log(1)
                this.cd.markForCheck();
                this.cd.detectChanges();
                this.inputLabel = this.items.find(e => e.value == this.value)?.label;
                // this.items = [...this.items];
                this.cd.markForCheck();
                this.cd.detectChanges();
                clearInterval(myInterval)

                setTimeout(()=>{
                    this.items = this.items
                    this._items = this.items;
                },100)


            }
        },100)
    }

    // ngOnChanges(changes: SimpleChanges) {
    //     this.setItemListForCbb();
    // }

    writeValue(val: any): void {
        this.value = val ?? '';
        // console.log(this.ngSelectComponent)
        // this.ngSelectComponent?.select(this.value)
    }
    registerOnChange(fn: any): void {
        this.onChange = fn;
    }
    registerOnTouched(fn: any): void {}

    setDisabledState(isDisabled: boolean): void {
        this.isDisabled = isDisabled;
    }

    changeValue(e: any) {

        if (!isNaN(e.target.value) && this.type === 'number') {
            this.value = Number(e.target.value);
            if (typeof this.onChange === 'function') {
                this.onChange(Number(e.target.value));
            }
            this.onChangeValue.emit(Number(e.target.value));
        } else {
            if (isNaN(e.target.value) && (e.target.value == 'undefined' || e.target.value == 'null' || !e.target.value))
                this.value = undefined;
            //if (isNaN(e.target.value)) this.value = undefined;
            else this.value = e.target.value;
            if (typeof this.onChange === 'function') {
                this.onChange(this.value);
            }
            this.onChangeValue.emit(this.value);
        }
    }

    setData(){
        // console.log(this.value)
        // console.log(this.items)
        // setTimeout(()=>{
        //     console.log(this.items.find(e => e.value == this.value)?.label)
        //     return this.items.find(e => e.value == this.value)?.label;
        // },100)


    }

    changeValueFilterCbb(e: any){
        // console.log(e)
        // this.items = [...this.items]
        if (!isNaN(e) && this.type === 'number') {
            this.cd.markForCheck();
            this.value = Number(e);
            if (typeof this.onChange === 'function') {
                this.onChange(Number(e));
            }
            this.onChangeValue.emit(Number(e));
            // console.log(this.value)

            this.cd.markForCheck();
                this.cd.detectChanges();
                this.inputLabel = this.items.find(e => e.value == this.value)?.label;
                this.cd.markForCheck();
                this.cd.detectChanges();

        } else {
            if ( isNaN(e) &&(e == 'undefined' || e == 'null' || !e))
                this.value = undefined;
            //if (isNaN(e.target.value)) this.value = undefined;
            else this.value = e;
            if (typeof this.onChange === 'function') {
                this.onChange(this.value);
            }
            this.onChangeValue.emit(this.value);

            this.cd.markForCheck();
                this.cd.detectChanges();

                this.inputLabel = this.items.find(e => e.value == this.value)?.label;
                this.cd.markForCheck();
                this.cd.detectChanges();

            // console.log(this.value)
        }
    }

   
}
