import { Component, Inject, OnInit, } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TypeEquipementCommunicationEnum } from '../../../models/type-equipement-communication.enum';
import { UsagerCommDTO } from '../../../models/usager-comm-dto';
import { UsagerLieuResidenceDTO } from '../../../models/usager-lieu-residence-dto';
import { AdressesUsagerComponent } from '../adresses-usager/adresses-usager.component';
import { CommunicationUsagerComponent } from '../communication-usager/communication-usager.component';

export interface PopupData {
  communications?: UsagerCommDTO[];
  commComponent?: CommunicationUsagerComponent;
  addresses?: UsagerLieuResidenceDTO[];
  addressComponent?: AdressesUsagerComponent;
  currentIdUsagerIdentif?: number;
  typeDataToAdd?: string;
}

export enum TypeDataToBind {
  COMM = "comm",
  ADDRESS = "address"
}




@Component({
  selector: 'app-popup-import-comm-addrss-linked-usager',
  templateUrl: './popup-import-comm-addrss-linked-usager.component.html',
  styleUrls: ['./popup-import-comm-addrss-linked-usager.component.css']
})
export class PopupImportCommAddrssLinkedUsagerComponent implements OnInit {

  communications: UsagerCommDTO[];
  commComponent: CommunicationUsagerComponent;
  addresses: UsagerLieuResidenceDTO[];
  addressComponent: AdressesUsagerComponent;
  currentIdUsagerIdentif: number;
  typeDataToAdd: string;

  constructor(private dialogRef: MatDialogRef<PopupImportCommAddrssLinkedUsagerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PopupData) { }

  ngOnInit(): void {
    this.communications = this.data?.communications;
    this.commComponent = this.data?.commComponent;
    this.addresses = this.data?.addresses;
    this.addressComponent = this.data?.addressComponent;
    this.currentIdUsagerIdentif = this.data?.currentIdUsagerIdentif;
    this.typeDataToAdd = this.data?.typeDataToAdd;
  }

  addCommunication(comm: UsagerCommDTO): void {
    this.commComponent.changeMoyen(comm.codeTypeEquipComm);

    this.commComponent.usagerComm.courriel = null;
    this.commComponent.usagerComm.numero = null;
    this.commComponent.usagerComm.poste = null;

    if (comm.codeTypeEquipComm == TypeEquipementCommunicationEnum.COURELEC) {
      this.commComponent.usagerComm.courriel = comm.coordonnees;
    } else {
      if (comm.codeTypeEquipComm == TypeEquipementCommunicationEnum.TEL || comm.codeTypeEquipComm == TypeEquipementCommunicationEnum.TEL2) {
        if (comm.coordonnees.includes('#')) {
          let tabCoordonnes = comm.coordonnees.split('#');
          this.commComponent.usagerComm.numero = tabCoordonnes[0].substr(0, 3) + " " + tabCoordonnes[0].substr(3, 3) + "-" + tabCoordonnes[0].substr(6, 4);
          if (tabCoordonnes[1]) {
            this.commComponent.usagerComm.poste = tabCoordonnes[1];
          }
        } else {
          this.commComponent.usagerComm.numero = comm.coordonnees.substr(0, 3) + " " + comm.coordonnees.substr(3, 3) + "-" + comm.coordonnees.substr(6, 4);
        }
      } else {
        this.commComponent.usagerComm.numero = comm.coordonnees;
      }
    }
    this.commComponent.usagerComm.codeTypeEquipComm = comm.codeTypeEquipComm;
    this.commComponent.usagerComm.codeTypeCoordComm = comm.codeTypeCoordComm;
    this.commComponent.usagerComm.detail = comm.detail;

    this.dialogRef.close();
  }

  addAddress(address: UsagerLieuResidenceDTO): void {
    address.id = null;
    address.idUsagerIdentification = this.currentIdUsagerIdentif;
    this.addressComponent.transfertDataToUI(address);

    this.dialogRef.close();
  }

  closeAndReturnModifyUI() {
    this.dialogRef.close();
  }

  isCommToBind(typeData: string): boolean {
    if (this.typeDataToAdd && this.typeDataToAdd === TypeDataToBind.COMM) {
      return true;
    }
    return false;
  }

  isAddressToBind(typeData: string): boolean {
    if (this.typeDataToAdd && this.typeDataToAdd === TypeDataToBind.ADDRESS) {
      return true;
    }
    return false;
  }

}
