import {
  Component,
  EventEmitter,
  Input,
  Optional,
  Output,
  Self,
} from '@angular/core';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';

@Component({
  selector: 'app-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss'],
})
export class ToggleComponent implements ControlValueAccessor {
  isChecked = false;
  selfNgControl = new FormControl('');
  @Input() imageUrl;
  @Input() label = '';
  @Input() toggleId;
  @Output() valueChanged = new EventEmitter();

  constructor(@Self() @Optional() public ngControl: NgControl) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }

    this.selfNgControl.valueChanges.subscribe((value) => {
      this.valueChanged.emit(value);
      this.isChecked = value;
    });
  }

  checked(event) {
    this.valueChanged.emit({
      toggleId: this.toggleId,
    });
  }

  writeValue(obj: any) {}

  registerOnChange(fn: any) {
    this.isChecked = this.ngControl.value;
  }

  registerOnTouched(fn: any) {}

  setDisabledState?(isDisabled: boolean) {}
}
