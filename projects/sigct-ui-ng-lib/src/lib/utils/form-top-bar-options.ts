export interface Title{
    icon?:string;
}

export interface Action{
    label?:string;
    tooltip?:string;
    icon?:string;
    actionFunction:any;
    compId:string;
    extraClass?:string;
}

export interface FormTopBarOptions {
    label?:string;
    detail?:string;
    title?:Title;
    actions:Action[];
}