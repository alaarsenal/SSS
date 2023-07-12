import { Component, ElementRef, EventEmitter, forwardRef, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { CKEditorComponent } from '@ckeditor/ckeditor5-angular';
import { ChangeEvent } from '@ckeditor/ckeditor5-angular/ckeditor.component';
import { ReferenceDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-dto.js';
import { RaccourciService } from 'projects/sigct-service-ng-lib/src/lib/services/raccourcis/raccourcis-api.service.js';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils.js';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils.js';
import { Subscription } from 'rxjs';
import { EnumCkEditorConfigOption } from '../../model/ckeditor-config-option-enum.js';
import * as CustomEditor from './ckeditor.js';

/*Le font-size est explicite ici car le min-row passé par paramêtre depend de lui.
Si celui-ci change, il faudra aussi changer le resultat des valeurs de min-height au css*/
const FONT_SIZE: number = 14;

@Component({
  selector: 'msss-ckeditor',
  templateUrl: './ckeditor.component.html',
  styleUrls: ['./ckeditor.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CkeditorComponent),
      multi: true
    }
  ]
})
export class CkeditorComponent implements OnInit {

  @ViewChild("ckEditor", { static: true, read: ElementRef })
  ckEditor: ElementRef;

  @ViewChild("ckEditor", { static: false })
  editorObj: CKEditorComponent;


  public editor = CustomEditor;

  @Input("id")
  id: string;

  @Input('value')
  value: string;

  @Output() valueChange: EventEmitter<string> = new EventEmitter();

  @Input("label")
  label: string;

  @Input("config")
  config: any;

  @Input("maxlength")
  maxlength: string;

  /**
   * Lorsqu'infromé, le height est calculé en tenant compte de sa valeur de manière suivante:
   * this.height = String((this._minRows + 1) * FONT_SIZE);
   * Ce calcul est effectué dans loadTextAreaMinHeight();
   * Les classes avec minHeight sont fixes au css.
   * Pour l'instant on tient compte de row de 1 à 5. Pour plus de valeur, il faudra
   * ajouter des classes correspondant à ces valeur en tenant compte de FONT_SIZE.
   */
  @Input()
  set minRows(value: number) {
    if (value) {
      this._minRows = value;
    }
    this.loadTextAreaMinHeight();
  }
  _minRows: number = 2;

  /**Pour que le height soit appliqué au text area du ckeditor,
   * il faut ajouter la class height-[height] au .css de ce composant
   * Ex. heigh-113, height-89 pour le champ donnees pertinentes dans demande et evaluation*/
  @Input()
  height: string;

  @Input("raccourcis")
  public raccourcis: boolean = false;

  @Input()
  set configOptions(values: EnumCkEditorConfigOption[]) {
    if (CollectionUtils.isNotBlank(values)) {
      let aux: string[] = [];
      values.forEach(item => {
        aux.push(item);
      });
      this.configAllegee.toolbar = aux;
    }
  };
  configAllegee: any = {
    toolbar: ['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript', '|', 'removeFormat', '|', 'fontColor', 'fontBackgroundColor', '|', 'specialCharacters', '|'],
    language: 'fr',
    resize_enabled: true,
  };

  label_id: string;

  // Permet d'utiliser le ckeditor comme accesseur
  onChange: any = () => { this.valueChange.emit(this.value); };

  onTouched: any = () => { };

  registerOnChange: any = () => { };

  registerOnTouched: any = () => { };

  writeValue: any = () => { };

  private textAreaWrapper: Element;
  private textArea: Element;
  private style: string;

  private subsciption: Subscription = new Subscription();

  constructor(private raccourciService: RaccourciService) { }

  ngOnInit() {
    if (!this.config) {
      this.config = this.configAllegee;
    }
    this.label_id = "label_" + this.id;
    this.loadTextAreaMinHeight();
    
    // Récupère la liste des raccourcis uniquement si on les utilise.
    if (this.raccourcis) {
      this.subsciption.add(
        this.raccourciService.getListeRaccourcis().subscribe((data: ReferenceDTO[]) =>
          this.raccourciService.populeRaccourcis(data))
      );
    }
  }

  ngOnDestroy(): void {
    if (this.subsciption) {
      this.subsciption.unsubscribe();
    }
  }

  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (this.ckEditor.nativeElement.contains(event.target)) {
      this.loadTextArea();
      this.updateTextAreaHeight();
    } else {
      if (this.style && this.textArea) {
        this.textArea.setAttribute("style", this.style);
      }
    }
  }

  //Permet d'arrêter la saisie à maxlength caractères
  public setCharLimit({ editor }: ChangeEvent) {
    let $input = document.activeElement;

    $input.addEventListener("keypress", event => {
     // let nbCharacters = editor.plugins.get('WordCount').characters;
     //calculer le nombre de charactères en incluant les balises html
      let nbCharacters = editor.getData().length;
      if (nbCharacters >= +this.maxlength) {
        event.returnValue = false;
      } else {
        event.returnValue = true;
      }
    });

    $input.addEventListener("paste", event => {
      //let nbCharacters = editor.plugins.get('WordCount').characters;
      //calculer le nombre de charactères en incluant les balises html
      let nbCharacters = editor.getData().length;
      if (nbCharacters > +this.maxlength) {
        //enlever les charactères qui dépassent le maxlength - 7 (7 correspond au nombre de charactères de <p></p>, qui est ajouté au début et à la fin de texte))
        editor.setData(this.value.replace(/<[^>]*>/g, '').substring(0, Number(this.maxlength) - 7));
        event.returnValue = false;
      } else {
        event.returnValue = true;
      }
    });
  }

  private loadTextArea(): void {
    if (!this.textAreaWrapper) {
      const mainDiv: Element = this.ckEditor.nativeElement.querySelector('div');

      if (mainDiv) {
        const array: HTMLCollectionOf<Element> = mainDiv.getElementsByClassName('ck-editor__main');
        this.textAreaWrapper = array?.item(0);

        if (this.textAreaWrapper && !this.textArea) {
          const array: HTMLCollectionOf<Element> = this.textAreaWrapper.getElementsByClassName('ck-editor__editable');
          this.textArea = array?.item(0);
        }
      }
    }
  }

  private loadTextAreaMinHeight(): void {
    if (StringUtils.isBlank(this.height)) {
      this.height = String((this._minRows + 1) * FONT_SIZE);
    }
  }

  private updateTextAreaHeight(): void {
    if (this.textArea) {
      const style: string = this.textArea.getAttribute("style");
      if (style) {
        this.style = style;
      }
      if (this.style) {
        this.textArea.setAttribute("style", this.style);
        const height: string = this.style.split(":")[1].trim();
        this.textAreaWrapper.setAttribute("style", 'min-height:' + height);
      }
    }
  }

  getHeightClass(): string {
    return 'heigh-' + this.height;
  }

  @HostListener('document:keydown', ['$event'])
  onKeySpaceDown(ev: KeyboardEvent) {
    if (this.ckEditor.nativeElement.contains(ev.target)) {
      if (ev.key == " ") {
        if (this.raccourcis) {
          // Position du curseur
          const cursorPos = this.editorObj.editorInstance.model.document.selection.getFirstPosition();
          // Position du début de la ligne
          const debutLignePos = this.editorObj.editorInstance.model.createPositionAt(cursorPos.parent, "before");
          // Range entre le début de la ligne et la position du curseur
          const rangeBeforeCursor = this.editorObj.editorInstance.model.createRange(debutLignePos, cursorPos);

          // Récupère le texte avant le curseur et le style sous le curseur
          let textBefore: string = "";
          let attributes = {};
          for (const value of rangeBeforeCursor) {
            if (value.item.is('textProxy')) {
              textBefore += value.item.data;
              attributes = value.item.getAttributes();
            }
          }

          // Récupère le dernier mot précédant le curseur
          let wordBefore: string = null;
          if (textBefore?.length > 0) {
            const lastSpacePos: number = textBefore.lastIndexOf(" ");
            wordBefore = textBefore.substring(lastSpacePos + 1);
          }

          if (wordBefore) {
            // Récupère le raccourci correspondant au dernier mot précédant le curseur
            const raccourci: string = this.raccourciService.getRaccourci(wordBefore);
            if (raccourci) {
              // Remplace le dernier mot par le raccourci
              this.editorObj.editorInstance.model.change(writer => {
                // Position du début du mot à remplacer
                const wordBeforeStartPos = this.editorObj.editorInstance.model.createPositionAt(cursorPos);
                wordBeforeStartPos.path[1] = wordBeforeStartPos.path[1] - wordBefore.length;
                // Range du mot à remplacer
                const wordBeforeRange = writer.createRange(wordBeforeStartPos, cursorPos);
                // Supprime le mot
                writer.remove(wordBeforeRange);
                // Inscrit le raccourci
                writer.insertText(raccourci, attributes, wordBeforeStartPos);
              });
            }
          }
        }
      }
    }
  }

}
