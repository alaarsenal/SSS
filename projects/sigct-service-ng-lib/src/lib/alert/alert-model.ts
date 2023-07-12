export class AlertModel{
    public title:string;
    public type:AlertType;
    public messages:string[];
}

export enum AlertType{
    ERROR="ERROR",SUCCESS="SUCCESS", WARNING="WARNING", WARNING_FINAL="WARNING_FINAL"
}