import {
  Component,
  EventEmitter,
  Input,
  Optional,
  Output,
  Self,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

@Component({
  selector: 'app-radio-button',
  templateUrl: './radio-button.component.html',
  styleUrls: ['./radio-button.component.scss'],
})
export class RadioButtonComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() name = '';
  @Input() value = '';
  @Input() checked = false;
  @Output() onChange = new EventEmitter();

  constructor(@Self() @Optional() public ngControl: NgControl) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  writeValue(obj: any) {}

  registerOnChange(fn: any) {}

  registerOnTouched(fn: any) {}

  setDisabledState?(isDisabled: boolean) {}

  onSelectChange() {
    this.onChange.emit({ value: this.value });
  }
}
