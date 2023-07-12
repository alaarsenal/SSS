import { GroupeAgeOptions } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-groupe-age/sigct-group-age.options';

export interface BaseUsagerDTO {
  id: number;
  groupeAgeOptions: GroupeAgeOptions;
  /**En consultation, si consulterUsagerHisto est vrai, donc
   *  l'attribut id se réfère à US_USAGER_IDENT_HISTO */
  consulterUsagerHisto?: boolean;
}
