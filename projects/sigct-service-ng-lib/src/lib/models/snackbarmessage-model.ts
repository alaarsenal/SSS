import { MatSnackBarConfig } from '@angular/material/snack-bar';

export class SnackBarMessage {
    public message: string;
    public action: string = "X";
    public config: MatSnackBarConfig = null;
}