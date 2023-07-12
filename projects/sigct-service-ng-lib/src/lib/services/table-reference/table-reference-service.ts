import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { CritereRechercheTableRefContent } from 'projects/sigct-ui-ng-lib/src/lib/components/piloter-table-reference-content-en-consultation/critere-recherche-table-ref-content';
import { TableRefContentWrapperDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/piloter-table-reference-content-en-consultation/table-ref-content-wrapper-dto';
import { TableRefItemDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/piloter-table-reference-content-item-en-modification/table-ref-item-DTO';
import { CritereRechercheTablesRef } from 'projects/sigct-ui-ng-lib/src/lib/components/piloter-tables-references/critere-recherche-table-reference';
import { TableRefWrapperDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/piloter-tables-references/table-ref-wrapper-dto';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TableReferenceService {

    constructor(
        private http: HttpClient,
        private httpErrorHandler: HttpErrorHandler) {
        this.httpErrorHandler.createHandleError('TableReferenceService');
    }

    public getTablesReferences(critereRechercheTablesRef: CritereRechercheTablesRef): Observable<TableRefWrapperDTO> {
        const urlBase = this.getUrlBasedOnModuleNom();

        return this.http.post<TableRefWrapperDTO>(urlBase + "rechercher/", JSON.stringify(critereRechercheTablesRef), {
            headers: new HttpHeaders().set('Content-Type', 'application/json'),
        });
    }

    public obtainTableRefContent(critereRechercheTableRefContent: CritereRechercheTableRefContent): Observable<TableRefContentWrapperDTO> {
        const urlBase = this.getUrlBasedOnModuleNom();
        return this.http.post<TableRefContentWrapperDTO>(urlBase + "rechercher/contents/", JSON.stringify(critereRechercheTableRefContent), {
            headers: new HttpHeaders().set('Content-Type', 'application/json'),
        });
    }

    public obtainTableRefContentItem(idTableRef: number, idContent: number): Observable<TableRefItemDTO> {
        const urlBase = this.getUrlBasedOnModuleNom();
        return this.http.get<TableRefItemDTO>(urlBase + idTableRef + "/contents/" + idContent);
    }

    public obtainTableRefEmptyContentToPrepareNewAdd(idTableRef: number): Observable<TableRefItemDTO> {
        const urlBase = this.getUrlBasedOnModuleNom();
        return this.http.get<TableRefItemDTO>(urlBase + idTableRef + "/contents");
    }

    public updateOrSaveTableRefContent(tableRefItemDTO: TableRefItemDTO): Observable<TableRefItemDTO> {
        const urlBase = this.getUrlBasedOnModuleNom();
        return this.http.post<TableRefItemDTO>(urlBase + tableRefItemDTO.idTableRef + "/contents", JSON.stringify(tableRefItemDTO), {
            headers: new HttpHeaders().set('Content-Type', 'application/json'),
        });
    }

    private getUrlBasedOnModuleNom(): string {
        let appName: string = window["env"].appName;
        let urlBase: string;
        if (appName == "infosante") {
            urlBase = window["env"].urlSante + '/api' + '/tables-ref/'
        }
        if (appName == "infosocial") {
            urlBase = window["env"].urlInfoSocial + '/api' + '/tables-ref/'
        }
        if (appName == "usager") {
            urlBase = window["env"].urlUsager + '/api' + '/tables-ref/'
        }
        
        return urlBase;
    }

}
