import { Pipe, PipeTransform } from '@angular/core';
import TelephoneUtils from 'projects/sigct-service-ng-lib/src/lib/utils/telephone-utils';

@Pipe({
  name: 'telephonePipe'
})
export class TelephonePipe implements PipeTransform {

  transform(value: string, showPoste: boolean = true): string {
    return TelephoneUtils.formatTelephoneAvecPoste(value, showPoste);
  }
}
