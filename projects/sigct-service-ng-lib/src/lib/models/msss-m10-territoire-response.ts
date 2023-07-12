import { MsssM10TerritoireFeature } from './msss-m10-territoire-feature';

/**
 *{"features": [{"doc_type": null,
 *               "highlight": null,
 *               "properties": {"code": "12",
 *                              "doc_type": "rss",
 *                              "nom": "Chaudière-Appalaches"},
 *               "type": "Feature"}
 *             ],
 *  "retour": 1,
 *  "duree_appel": 66,
 *  "message_retour": "Opération réussie.",
 *  "code_retour": 1,
 *  "entree": "G0M1H1",
 *  "type": "FeatureCollection"
 *}
 */
  export class MsssM10TerritoireResponse {
	public features: MsssM10TerritoireFeature[];
	public retour: number;
	public duree_appel: number;
	public code_retour: number;
	public message_retour: string;
	public entree: string;
	public type: string;
}