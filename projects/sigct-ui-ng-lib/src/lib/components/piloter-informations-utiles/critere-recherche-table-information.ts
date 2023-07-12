import { CriteresPagination } from "../table-pagination/criteres-pagination";

export class CritereRechercheTablesInfo {
    public gipp: number = 0; // Par défaut les tables de références, qu'on cherche à lister ne doivent pas appartenir au module GIPP
    public nomDescription: string;
    public criteresPagination: CriteresPagination;
}