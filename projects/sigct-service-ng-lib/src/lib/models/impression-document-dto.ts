import { SigctContentZoneComponent } from "projects/sigct-ui-ng-lib/src/lib/components/sigct-content-zone/sigct-content-zone.component";
import { ImpressionDocumentSectionDTO } from "./impression-document-section-dto";

export class ImpressionDocumentDTO {

    title: string;

    organisme: string;

    defaultTemplate: string = "default.html";

    docTemplate: string;

    fileName: string;

    parLabel: string;

    pageLabel: string;

    surLabel: string;

    imprimerLeLabel: string;

    sectionsList = new Array<ImpressionDocumentSectionDTO>();

    fileContent: any[];

    public loadSection(id: string, data: any, sectionsContentZones: SigctContentZoneComponent[]): void {
      const wrapper: SigctContentZoneComponent = sectionsContentZones.find(section => section.id == id);
      if (wrapper) {
        const section = new ImpressionDocumentSectionDTO();
        section.id = wrapper.id;
        section.title = wrapper.title;
        section.visible = !wrapper.collapsed;
        section.data = data;
        this.sectionsList.push(section);
      }
    }

}
