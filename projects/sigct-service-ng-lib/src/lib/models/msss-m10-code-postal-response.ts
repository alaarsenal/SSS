/**
 * Réponse à un appel au service web M10.
 *
 * {"ListeCodesPostaux":{"G3K0A1":[{"Code":"23027","doc_type":"MUN","Nom":"Québec","Recherche":"G3K0A1"}],
 *                       "G3K0A2":[{"Code":"23027","doc_type":"MUN","Nom":"Québec","Recherche":"G3K0A2"}],
 *                       "G3K0A3":[{"Code":"23027","doc_type":"MUN","Nom":"Québec","Recherche":"G3K0A3"}], 
 *                        ...
 *                      },
 *  "NombreResultat":457,
 *  "code_retour":1,
 *  "message_retour":"Opération réussie.",
 *  "duree_appel":23
 * }
 */
export class MsssM10CodePostalResponse {
	public ListeCodePostaux: any;  // retourné par ObtenirCodePostalParTerritoire
	public ListeCodesPostaux: any; // retourné par ObtenirAutocompletionCodePostal
	public NombreResultat: number;
	public duree_appel: number;
	public code_retour: number;
	public message_retour: string;
}