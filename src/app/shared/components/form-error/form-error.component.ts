import { Component, OnInit, Input } from '@angular/core';
import { NgControl, RequiredValidator } from '@angular/forms';

@Component({
  selector: 'app-form-error',
  templateUrl: './form-error.component.html',
  styleUrls: ['./form-error.component.scss']
})
export class FormErrorComponent implements OnInit {
  @Input() ngControl: NgControl;
  constructor() {}

  ngOnInit() {}
}
