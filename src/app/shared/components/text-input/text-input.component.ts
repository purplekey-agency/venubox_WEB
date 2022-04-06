import { Component, Input, OnChanges, Optional, Self } from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';

@Component({
  selector: 'app-text-input',
  templateUrl: './text-input.component.html',
  styleUrls: ['./text-input.component.scss'],
})
export class TextInputComponent implements ControlValueAccessor, OnChanges {
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() inputName = `input-${Math.floor(Math.random() * 1000 + 1)}`;
  @Input() readonly = false;
  @Input() value = null;
  @Input() maxlength;
  @Input() min;

  dummyFormControl = new FormControl();

  constructor(@Self() @Optional() public ngControl: NgControl) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    } else if (this.value) {
      this.dummyFormControl.patchValue(this.value);
    }
  }

  ngOnChanges() {
    if (this.value !== this.dummyFormControl.value) {
      this.dummyFormControl.patchValue(this.value);
    }
  }

  // ControlValueAccessor interface
  writeValue(obj: any) {}

  registerOnChange(fn: any) {}

  registerOnTouched(fn: any) {}

  setDisabledState?(isDisabled: boolean) {}
}
