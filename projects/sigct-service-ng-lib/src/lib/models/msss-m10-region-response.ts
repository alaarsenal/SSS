import { MsssM10BaseFeature } from './msss-m10-base-feature';

export class MsssM10RegionResponse {
	public features: MsssM10BaseFeature;
	public retour: number;
	public duree_appel: number;
	public code_retour: number;
	public message_retour: string;
	public entree: string;
}