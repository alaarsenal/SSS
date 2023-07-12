import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sigctSeparateurDecimal'
})
export class SigctSeparateurDecimalPipe implements PipeTransform {

  transform(value: string, separateurDecimal: string): string {
    if (value) {
      if (separateurDecimal === ",") {
        return value.replace(".",",");
      } else {
        return value.replace(",",".");
      }
    }else {
      return null;
    }
  }

}
