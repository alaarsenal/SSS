import { TableRefContentDTO } from "../piloter-table-reference-content-en-consultation/table-ref-content-dto";

export class TableRefItemDTO {
    public idTableRef: number;
    public descriptionTableRef: string;
    public tableRefContentDTO: TableRefContentDTO = new TableRefContentDTO();
}
