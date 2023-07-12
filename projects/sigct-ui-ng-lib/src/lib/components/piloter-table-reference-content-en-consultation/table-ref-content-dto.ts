import { ListeAvertissementDTO } from "projects/sigct-service-ng-lib/src/lib/models/liste-avertissement-dto";
import { InputOptionCollection } from "./input-option-collection";
import { TablePropertiesTypes } from "./table-properties-types";

export class TableRefContentDTO extends ListeAvertissementDTO {

    public id: number;
    public actif: any;
    public code: string;
    public codeCn: string;
    public dateCreation: any;
    public dateModification: any;
    public description: string;
    public referenceSysteme: string;
    public referenceCentreActivite: string;
    public defaut: any;
    public nom: string;
    public style: string;
    public tri: number;
    public url: string;
    public userCreationUsername: string;
    public userModificationUsername: string;
    public objectProps: Map<String, any>;
    public props: Map<any, TablePropertiesTypes>;
    public inputOptionCollectionsByComplexeFieldName: Map<String, InputOptionCollection>;
    public validationStatusOfRequiredByNonStandardPropertyName: Map<String, boolean> ; 
    public comparisonFieldRelationShip: Map<String, Map<String, String>>;
}
