import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { ReferenceSourceInformationDTO } from 'projects/infosante-ng-core/src/lib/models/reference-source-information-dto';
import { SourcesInformationDTO } from 'projects/infosante-ng-core/src/lib/models/sources-information-dto';


@Injectable({
  providedIn: 'root'
})
export class AutresSourcesInformationDataService implements OnInit, OnDestroy {

    constructor() {

    }

    ngOnInit() {
    }

    ngOnDestroy() {
    }

    /**
    * Crée une source d'information au format DTO
    * @param idFicheAppel identifiant fiche appel en cours
    * @param refAutreSourceInformationDTO référence autre source information (liste déroulante)
    * @param detail (optionnel) détail saisi par l'utilisateur
    */
    public getAutreSourceInformationDTO(idFicheAppel: number, refAutreSourceInformationDTO: ReferenceSourceInformationDTO, detail?: string): SourcesInformationDTO {

        let autreSourceInformationDTO = new SourcesInformationDTO();
     
        if (detail) {
           autreSourceInformationDTO.details = detail;
        }

        autreSourceInformationDTO.idFicheAppel = idFicheAppel;

        autreSourceInformationDTO.codeRefSourceInformation = refAutreSourceInformationDTO.code;

        return autreSourceInformationDTO;
    }

    /**
     * Retourne vrai si autreSourceInformationDTO existe dans la liste listeAutreSource
     * @param autreSourceInformationDTO source à vérifier
     * @param listeAutreSource Liste source information existante
     */
    public isExistant(autreSourceInformationDTO: SourcesInformationDTO, listeAutreSource: SourcesInformationDTO[]): boolean {

        let resultat: boolean = false;
        
        listeAutreSource.forEach( (item: SourcesInformationDTO) => {
            if (item.codeRefSourceInformation === autreSourceInformationDTO.codeRefSourceInformation ) {
                resultat = true;
            }
        });

        return resultat;
    }



}