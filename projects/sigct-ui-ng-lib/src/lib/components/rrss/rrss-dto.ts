export class RrssDTO {
  id: number = null;
  rrssId: number = null;
  rrssNom: string = null;

  constructor() { }

  equals(obj: RrssDTO): boolean {
    return obj != null && obj != undefined && this.id == obj.id;
  }
}
