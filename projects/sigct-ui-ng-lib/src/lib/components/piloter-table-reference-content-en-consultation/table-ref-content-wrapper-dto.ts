import { TableRefContentDTO } from "./table-ref-content-dto";

export class TableRefContentWrapperDTO {
    public nomTableRef: string;
    public tableRefContentDTOs: TableRefContentDTO[];
    public totalElements: number;
    public tableHeadsLabelsCode: string[]; // les codes de titres des entêtes de la table sur le composant table pagination
    public paginationTableHeadsLabelsByCode: Map<string, string>; // les titres des entêtes de la table sur le composant table pagination
    public propertiesNonStandardsWithEllipsisAndTitleAttribute: string[];
}
