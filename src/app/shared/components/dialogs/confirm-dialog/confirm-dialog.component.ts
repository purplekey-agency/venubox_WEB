import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { DialogRef } from "../../../../core/dialog/dialog-ref";
import { DialogConfig } from "../../../../core/dialog/dialog.service";

@Component({
  selector: "app-confirm-dialog",
  templateUrl: "./confirm-dialog.component.html",
  styleUrls: ["./confirm-dialog.component.scss"],
})
export class ConfirmDialogComponent {
  dialogTitle: string;
  dialogMessage: string;

  constructor(
    private dialogConfig: DialogConfig,
    private dialogRef: DialogRef,
    private t: TranslateService
  ) {
    const config = this.dialogConfig;

    this.dialogTitle =
      (config.data && config.data.title) || this.t.instant("areYouSure");

    this.dialogMessage =
      (config.data && config.data.message) ||
      this.t.instant("notAbleToUndoThisAction");
  }

  close(confirmed?: boolean) {
    this.dialogRef.close({ confirmed });
  }
}
