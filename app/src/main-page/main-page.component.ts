import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextboxComponent } from './textbox/textbox.component';
import { TranslateButtonComponent } from './translate-button/translate-button.component';
import { TexboxOutputComponent } from './texbox-output/texbox-output.component';
import { RamdropComponent } from './ramdrop/ramdrop.component';
import { SaveRamButtonComponent } from './save-ram-button/save-ram-button.component';
import { InstructionTableComponent } from './instruction-table/instruction-table.component';
import { TranslatorService } from '../Shared/Services/Translator/translator.service';
import { FormInputManagerService } from '../Shared/Services/FormInputManager/form-input-manager.service';
import { TableInstructionService } from '../Shared/Services/tableInstruction/table-instruction.service';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [
    CommonModule,
    TextboxComponent,
    TranslateButtonComponent,
    TexboxOutputComponent,
    RamdropComponent,
    SaveRamButtonComponent,
    InstructionTableComponent
  ],
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css'], 
})
export class MainPageComponent {
  parameter: string = '';
  inputText: string = '';
  output: string = '';
  isHexToMIPS: boolean = false;
  tableManager = inject(TableInstructionService);
  private translator = inject(TranslatorService);
  private inputManager = inject(FormInputManagerService).inputApp;
  private inputManagerIsHexToMips = inject(FormInputManagerService).isHexToMips;

  controlStack: { original: string, translated: string, type: 'MIPS' | 'HEX' }[] = [];
  selectedInstruction: string = ''; 

  onTableValueChange(value: string): void {
    console.log('isHexToMips:', this.isHexToMIPS);
    console.log('value:', value);
    
    this.tableManager.updateSelectedLineText(value); 
  }

  //Maneja la selección de una instrucción de la pila para mostrar su tabla de opcodes
  onInstructionClick(instruction: string): void {
    console.log('Instrucción seleccionada hjbdbchkzhd:', instruction);
    this.selectedInstruction = instruction;
    this.inputText = instruction;
    this.detectFormatAndToggle();
    this.onTableValueChange(instruction);
  }
  
  // Detecta automáticamente si el input es HEX o MIPS
  private detectFormatAndToggle(): void {
    this.isHexToMIPS = this.isHex(this.inputText);
    this.inputManagerIsHexToMips.setValue(this.isHexToMIPS);
  }

  onInput(input: string): void {
    this.inputText = input;
    this.detectFormatAndToggle();
  }

  onTextFile(textFile: Promise<string[]>): void {
    textFile.then((instructions) => {
      this.inputText = instructions[0];
      this.output = instructions[1] ?? '';
      this.inputManager.setValue(this.inputText);
      this.detectFormatAndToggle();
    });
  }

  onTranslate(): void {
    this.detectFormatAndToggle();
  
    let translatedInstruction = '';
    if (this.isHexToMIPS) {
      console.log("Detectado como HEX → Convertir a MIPS");
      translatedInstruction = this.translator.translateHextoMIPS(this.inputText);
    } else {
      console.log("Detectado como MIPS → Convertir a HEX");
      translatedInstruction = this.translator.translateMIPStoHex(this.inputText);
    }
  
    //validar si el formato de la instruccion en valido
    if (translatedInstruction.includes("Unknown")) {
      console.log("El formato de la instruccion es invalido");
    } else { //Agregar a la pila
    let instruction = this.inputText.trim();
    this.controlStack.push({ original: instruction, translated: translatedInstruction, type: this.isHexToMIPS ? 'HEX' : 'MIPS' });
    }
  }

  //Verifica si el input es HEX
  private isHex(input: string): boolean {
    return /^0x[0-9A-Fa-f]+$/.test(input) || /^[0-9A-Fa-f]{8}$/.test(input);
  }
}

