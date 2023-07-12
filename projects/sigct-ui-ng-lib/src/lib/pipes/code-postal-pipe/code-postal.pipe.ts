import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'codePostalPipe'
})
export class CodePostalPipe implements PipeTransform {

  transform(value: string): string {
    if (value) {
      if (value.trim().indexOf(" ") > 0) {
        return value;
      } else {
        return value.substring(0, 3).toUpperCase() + " " + value.substring(3).toUpperCase();
      }
    } else {
      return "";
    }
  }
}
