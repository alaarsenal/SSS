export class AutoCompleteResponse {
    constructor(public id: string, public name: string) {}
  }

  export interface IAutoCompleteResponse {
    total: number;
    results: AutoCompleteResponse[];
  }