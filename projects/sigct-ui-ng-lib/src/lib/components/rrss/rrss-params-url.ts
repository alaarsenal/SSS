import { RrssDTO } from './rrss-dto';

export class RrssParamsUrl {
    rrssApiWebUrl: string;
    rrssApiWebUsername: string;
    rrssApiWebPass: string;
    rrssDTO : RrssDTO = new RrssDTO();
    urlActifRequerant: string;
    selectMultiRrss?: boolean;

    constructor() {}
}




