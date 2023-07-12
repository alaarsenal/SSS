import { GenericSectionImpressionDTO } from "projects/sigct-ui-ng-lib/src/lib/model/generic-section-impression-fiche-dto";

export class ConsultationIsiswEvaluationDTO extends GenericSectionImpressionDTO {

  usagerCapable: boolean;         //caller_understanding
  usagerSatisfait: boolean;       //caller_satisfaction
  precision: string;              //evaluation_details
  categorieAppelant: string;      //call_catg
  nomAppelant: string;            //caller_name
  lienAppelant: string;           //caller_relationship
  telephoneAppelant: string;      //caller_phone
  atsAppelant: string;            //caller_fax
  organismeAppelant: string;      //caller_building
  langueAppel: string;            //caller_language
  commentairePrompt1: string;     //comment_prompt1
  commentairePrompt2: string;     //comment_promt2
  commentaire1: string;           //comment1
  commentaire2: string;           //comment2
  champsPrompt1: string;          //custom_field_prompt1
  champsPrompt2: string;          //custom_field_prompt2
  champsPrompt3: string;          //custom_field_prompt3
  champs1: string;                 //custom_field1
  champs2: string;                 //custom_field2
  champs3: string;                 //custom_field3
}
