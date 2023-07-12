import { Observable } from 'rxjs'
import { FicheAppelNonTermineeDTO } from '../models/fiche-appel-non-terminee-dto';

export interface IficheAppelApiService {

    getFicheAppel(id: number): Observable<any>;

    updateFicheAppel(ficheAppelSocial: any): Observable<any>;

    getFichesAppelNonTerminees(): Observable<FicheAppelNonTermineeDTO[]>;
}

