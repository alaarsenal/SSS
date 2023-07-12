import { Fusion } from './fusion-interface';
import { UsagerLieuResidenceDTO } from './usager-lieu-residence-dto';

export class UsagerLieuResidenceFusionDTO extends UsagerLieuResidenceDTO implements Fusion {
    idSource1: number;
    idSource2: number;
    archive: string;
    noCiviqRue: string;
}
