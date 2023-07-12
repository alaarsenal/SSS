import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stripHtml'
})
export class StripHtmlPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) { 
      return value;
    }
    const tmpDiv: HTMLElement = document.createElement('div');
    tmpDiv.innerHTML = value;
    const cleanText: string = tmpDiv.textContent || tmpDiv.innerText || '';
    tmpDiv.remove();
    return cleanText;
  }

}
