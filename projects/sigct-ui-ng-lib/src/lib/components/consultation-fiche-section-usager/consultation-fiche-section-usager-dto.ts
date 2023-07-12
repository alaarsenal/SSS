import { UsagerDTO } from 'projects/usager-ng-core/src/lib/models';
import { UsagerIdentHistoDTO } from 'projects/usager-ng-core/src/lib/models/usager-ident-histo-dto';

export class ConsultationFicheSectionUsagerDTO {
  public idUsager: number;
  public idUsagerHisto: number;
  public ageAnnees?: number;
  public ageMois?: number;
  public ageJours?: number;
  public usagerDTO?: UsagerDTO;
  public usagerHistoDTO?: UsagerIdentHistoDTO;
}
