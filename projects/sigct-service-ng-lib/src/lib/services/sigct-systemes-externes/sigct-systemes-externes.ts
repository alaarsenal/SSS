import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class SigctSystemesExternesService {
    constructor() {
    }

    openAvisCommuniques(urlApi: string) {
        window.open(urlApi + "sigct/systemesexternes/avis", "_blank");
    }

}