import { MsssM10AdresseFeature } from './msss-m10-adresse-feature';

/**
 * Classe qui représente la réponse à une recherche d'adresse à l'aide des services M10.
 * Correspond au JSON suivant:
 * {"features": [{"doc_type": "ancienne_municipalite",
 *	              "highlight": "Cap-<strong>Saint</strong>-Ignace-Station",
 *                "_id": "AWoCrBeVeiSrgTpVjXLr",
 *                "properties": {"@timestamp": "2019-04-09T15:16:30.877Z",
 *                               "@version": "1",
 *                               "id": "18045",
 *                                "mun_reference": "Cap-Saint-Ignace",
 *                               "nom_mun": "Cap-Saint-Ignace-Station",
 *                               "recherche": "Cap-Saint-Ignace-Station",
 *                               "province": {"code": "QC",
 *                                            "nom": "Québec"
 *                                           },
 *                               "pays": {"code": "CA",
 *                                        "nom": "Canada"
 *                                       }
 *				                },
 *				  "score": 4.3444324,
 *				  "type": "Feature"
 *				 },
 *               ...
 *              ],
 *  "max_score": 4.3444324,
 *  "retour": 5,
 *  "took": 7,
 *  "total": 1062,
 *  "duree_appel": 44,
 *  "message_retour": "Opération réussie.",
 *  "code_retour": 1,
 *  "entree": "st-igna",
 *  "type": "FeatureCollection"
 * }
 */
export class MsssM10AdresseResponse {
	public features: MsssM10AdresseFeature[];
	public max_score: number;
	public retour: number;
	public took: number;
	public total: number;
	public duree_appel: number;
	public code_retour: number;
	public message_retour: string;
	public entree: string;
	public type: string;
}