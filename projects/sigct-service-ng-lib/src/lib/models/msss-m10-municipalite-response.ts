import { MsssM10MunicipaliteFeature } from './msss-m10-municipalite-feature';

/**
 * {"features":[{"doc_type":"ancienne_municipalite",
 *               "highlight":"<strong>Mont</strong>-Murray",
 *               "_id":"AWoCrC5MeiSrgTpVjXck",
 *               "properties":{"@timestamp":"2019-04-09T15:16:30.781Z",
 *                             "@version":"1",
 *                             "id":"15013",
 *                             "mun_reference":"La Malbaie",
 *                             "nom_mun":"Mont-Murray",
 *                             "recherche":"Mont-Murray",
 *                             "province":{"code":"QC",
 *                                         "nom":"Québec"},
 *                             "pays":{"code":"CA",
 *                                     "nom":"Canada"}},
 *               "score":6.222431,
 *               "type":"Feature"},
 *               ...
 *             ],
 *  "max_score":6.222431,
 *  "retour":15,
 *  "took":5,
 *  "total":29,
 *  "duree_appel":31,
 *  "message_retour":"Opération réussie.",
 *  "code_retour":1,
 *  "entree":"mont",
 *  "type":"FeatureCollection"
 * }
 */
export class MsssM10MunicipaliteResponse {
	public features: MsssM10MunicipaliteFeature[];
	public max_score: number;
	public retour: number;
	public took: number;
	public total: number;
	public duree_appel: number;
	public message_retour: string;
	public code_retour: number;
	public entree: string;
	public type: string;
}