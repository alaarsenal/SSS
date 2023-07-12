import { Fusion } from './fusion-interface';
import { UsagerCommDTO } from './usager-comm-dto';

export class UsagerCommFusionDTO extends UsagerCommDTO implements Fusion {
  idSource1: number;
  idSource2: number;
  archive: string;
}