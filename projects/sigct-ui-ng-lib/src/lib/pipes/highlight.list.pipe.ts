/**
 * ajouter highlight dans la liste déroulante
 */
import { PipeTransform, Pipe } from '@angular/core';

@Pipe({ name: 'highlight' })
export class HighlightPipe implements PipeTransform {
  transform(text: string, search): string {
    return this.highlightIgnoreAccents(text, search);
  }

  private highlightIgnoreAccents(text: string, search: any): string {
    if (text && search) {
      // Si search contient autre chose que des espaces
      if (search.trim()){
        search = search.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&").split(' ').filter(t => t.length > 0).join('|');
      }
      const unaccentText = this.removeAccents(text);
      const unaccentSearchText = this.removeAccents(search);
      const unaccentTextMatch = unaccentText.replace(new RegExp(unaccentSearchText, 'gi'), match => `<${match}>`);
      if (unaccentTextMatch.includes("<") && unaccentTextMatch.includes(">")) {
        const textArray = [...text];
        let highlight: string = "";
        let index = 0;
        textArray.forEach((value) => {
          if (unaccentTextMatch.charAt(index) == "<") {
            highlight = highlight.concat(`<font color="#cc0000"><b>`);
            highlight = highlight.concat(value);
            index += 2;
          }
          else if (unaccentTextMatch.charAt(index) == ">") {
            highlight = highlight.concat(`</b></font>`);
            highlight = highlight.concat(value);
            index += 2;
          }
          else {
            highlight = highlight.concat(value);
            index++;
          }
        });
        if (index <= unaccentTextMatch.length && unaccentTextMatch.charAt(index) == ">") {
          highlight.concat(`</b></font>`);
        }
        return highlight;
      }
    }
    return text;
  }

  private removeAccents(text: string) {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  private standardHighlight(search: any, text: string) {
    const pattern = search.toString()
      .replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
      .split(' ')
      .filter(t => t.length > 0)
      .join('|');
    const regex = new RegExp(pattern, 'gi');
    return search ? text.replace(regex, match => `<font color="#cc0000"><b>${match}</b></font>`) : text;
  }
}