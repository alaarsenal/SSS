import { Output, QueryList, EventEmitter } from '@angular/core';
import { ViewChildren } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import { ConsultationNoteComplDTO } from 'projects/sigct-service-ng-lib/src/lib/models/consultation-note-compl-dto';
import { NoteComplementaireDTO } from 'projects/sigct-service-ng-lib/src/lib/models/note-compl-dto';
import DateUtils from 'projects/sigct-service-ng-lib/src/lib/utils/date-utils';
import { SigctContentZoneComponent } from '../sigct-content-zone/sigct-content-zone.component';
import { SectionNoteComplementaireDTO } from '../../model/section-note-complementaire-dto';
import { TableFichierDTO } from '../../../../../sigct-service-ng-lib/src/lib/models/TableFichierDTO';


@Component({
  selector: 'app-consultation-fiche-section-note-compl',
  templateUrl: './consultation-fiche-section-note-compl.component.html',
  styleUrls: ['./consultation-fiche-section-note-compl.component.css']
})
export class ConsultationFicheSectionNoteComplComponent implements OnInit {

  dto: ConsultationNoteComplDTO;
  liste: NoteComplementaireDTO[];
  isListeVide: boolean = false;
  tableFichierDTOs: TableFichierDTO[] = [];

  @ViewChildren(SigctContentZoneComponent)
  contentZones: QueryList<SigctContentZoneComponent>;

  @Input()
  idFicheAppel: number;

  @Input()
  set consultationNoteComplDto(consultationNoteComplDto: ConsultationNoteComplDTO) {
    this.dto = consultationNoteComplDto;

    if (this.dto) {
      if(this.dto.tableFichierDTOs?.length > 0){
        this.tableFichierDTOs = this.dto.tableFichierDTOs;
       }
      if (this.dto.listeNoteCompl?.length > 0) {
        this.liste = this.dto.listeNoteCompl;

        this.liste.forEach((note: NoteComplementaireDTO) => {

          if (note.dateDebut) {
            let dtDebut: Date = new Date();
            dtDebut.setTime(Number(note.dateDebut));
            let dtFin: Date = new Date();
            dtFin.setTime(Number(note.dateFin));
            let dureeCalc = this.setDureeCalculee(dtDebut, dtFin);

            note.strDureeCalculee = dureeCalc;
          }

          if (note.dureeCorrigee) {
            let dureeCorrig = DateUtils.secondesToHHMMSS(note.dureeCorrigee);

            note.strDureeCorrigee = dureeCorrig;
          }


        });

        this.isListeVide = false;
      } else {
        this.isListeVide = true;
      }

    } else {
      this.isListeVide = true;
    }



  }

  @Output()
  downloadFileEvent: EventEmitter<number> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  loadDonneesImpression(section: SectionNoteComplementaireDTO) {
    if (section) {
      section.notes = this.liste;
      section.tableFichierDTOs = this.tableFichierDTOs;
    }
  }

  /**
   * Détermine la durée calculée à partir de la dateDebut et la date de fin.
   * @param dateDebut
   * @param dateFin
   */
  private setDureeCalculee(dateDebut: Date, dateFin: Date): string {
    let duree: number = 0;
    if (dateDebut) {
      duree = DateUtils.calculerNbSecondesBetween(dateDebut, dateFin);
    }

    return DateUtils.secondesToHHMMSS(duree);
  }

  // Section Files attached

  isFilesPresent(noteId: number): boolean {
    if(noteId) {
      return this.tableFichierDTOs?.filter(file => file.refId == noteId).length > 0;
    }
    return false;
  }

  getFilesAttachedByNoteId(noteId: number): TableFichierDTO[] {
    if(noteId) {
      return this.tableFichierDTOs?.filter(file => file.refId == noteId);
    }
    return [];
  }

  
  onTelechargerFichier(fileId: number): void {
    this.downloadFileEvent.emit(fileId);
  }

}
