import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { ImpressionDocumentDTO } from 'projects/sigct-service-ng-lib/src/lib/models/impression-document-dto';



const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'my-auth-token'
  })
};






@Injectable({
  providedIn: 'root'
})
export class ImpressionService {

  private baseUrlApiUsager: string;

  constructor(
    private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler) {

    this.baseUrlApiUsager = window["env"].urlUsagerApi;
    this.httpErrorHandler.createHandleError('ImpressionService'); //Important pour instancier correctement le service
  }

  genererPdfEnregistrement(idEnregistrement: number, documentDTO: ImpressionDocumentDTO): void {
    this.http.post<ImpressionDocumentDTO>(this.baseUrlApiUsager + "/enregistrements/" + idEnregistrement + "/pdf", documentDTO, httpOptions)
      .subscribe((dto: ImpressionDocumentDTO) => {
        const data: any = dto.fileContent;
        const byteCharacters = atob(data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        let blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      });
  }



}
