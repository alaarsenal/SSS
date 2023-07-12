/**
 * Ce service permet a un composant de s'abonner et de demander la mise a jour du nombre de fiche d'appel non termine
 * Ce service est specifique a cette fonctionnalite ne pas ajouter d'autres methodes en lien avec la fiche d'appel
 */
import { HttpClient } from "@angular/common/http";
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class SigctFicheAppelNonTermineService implements OnDestroy {

    public nbFicheAppelOuverteSubj = new BehaviorSubject<string>("0");

    private souscriptionNbFicheOuverte: Subscription;

    constructor(private http: HttpClient) { }

    ngOnDestroy() {
        if (this.souscriptionNbFicheOuverte) { this.souscriptionNbFicheOuverte.unsubscribe(); }
    }


    /**
     * Demande au service d'interroger le backend pour interroger la bd sur le nombre de fiche d'appel non termine
     * Le resultat est envoyé a ceux qui sont abonne
     * @param urlBase selon le projet  (InfoSante ou InfoSocial) le prefixe de l'URL est different
     */
    doRefreshNbListeFicheAppelNonTermine(urlBase: string) {

        if (this.souscriptionNbFicheOuverte) { this.souscriptionNbFicheOuverte.unsubscribe(); }
        this.souscriptionNbFicheOuverte = this.getNbFicheAppelNonTermine(urlBase).subscribe((objJson: any) => {
            this.nbFicheAppelOuverteSubj.next(objJson.nbFicheOuverte);
        });

    }


    /**
     * Permet a un composant de s'abonner pour avoir en direct le nombre de fiche d'appel non termine
     */
    onChangerNbFicheOuverte(): Observable<string> {
        return this.nbFicheAppelOuverteSubj.asObservable();
    }

    /**
     * Appel HTTP au backend
     * @param urlBase
     */
    public getNbFicheAppelNonTermine(urlBase: string): Observable<string> {
        if (!urlBase.endsWith("/")) {
            urlBase += "/";
        }
        return this.http.get<string>(urlBase + 'fiches-appel/nombreNonTermine/');
    }
}
