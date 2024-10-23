import { Component, OnInit } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'assign',
  templateUrl: './assign.component.html',
  styleUrls: ['./assign.component.scss'],
})
export class AssignComponent implements OnInit {

  protected isToAssign: boolean = false;
  protected selectedFile: File | null = null;
  pdfSrc: string | Uint8Array | null = "https://files.cercomp.ufg.br/weby/up/58/o/O_poder_do_Ha%CC%81bito.pdf.pdf";
  signaturePosition: { x: number, y: number } | null = null;

  constructor(private readonly _toastr: ToastrService) {}

  ngOnInit() {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // this.pdfSrc = e.target.result;
        this.isToAssign = true;
      };
      reader.readAsArrayBuffer(file);
    } else {
      this._toastr.error('Por favor, selecione um arquivo PDF.');
    }
  }

  getCoordinates(event: MouseEvent): void {
    const pdfContainer = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX - pdfContainer.left - 45;
    const y = event.clientY - pdfContainer.top + 50;
    console.log('Coordinates: ', { x, y });
    this.signaturePosition = { x, y };
    this.drawSignaturePlaceholder(x, y);
  }

  drawSignaturePlaceholder(x: number, y: number): void {
    const signatureDiv = document.querySelector('.assing-model') as HTMLElement;
    signatureDiv.style.display = 'flex'; // Exibe o div de assinatura
    signatureDiv.style.position = 'absolute';
    signatureDiv.style.left = `${x}px`; // Centraliza o div no eixo X
    signatureDiv.style.top = `${y}px`; // Centraliza o div no eixo Y
  }
  
  returnToAssign(): void {
    this.isToAssign = false;
  }

  protected options: AnimationOptions = {
    path: '/assets/json/login_animation.json',
  };
}
