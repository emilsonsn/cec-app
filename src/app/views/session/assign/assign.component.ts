import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'assign',
  templateUrl: './assign.component.html',
  styleUrls: ['./assign.component.scss'],
})
export class AssignComponent implements OnInit {

  protected options: AnimationOptions = {
    path: '/assets/json/login_animation.json',
  };

  protected isToAssign: boolean = true;

  protected selectedFile: File | null = null;

  protected pdfSrc: string | Uint8Array | null = '';
    // 'https://files.cercomp.ufg.br/weby/up/58/o/O_poder_do_Ha%CC%81bito.pdf.pdf';

  protected signaturePosition: { x: number; y: number, page : number } = null;

  constructor (
    private readonly _toastr: ToastrService
  ) {}

  ngOnInit() {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.pdfSrc = e.target.result;
        this.isToAssign = true;
      };
      reader.readAsArrayBuffer(file);
    } else {
      this._toastr.error('Por favor, selecione um arquivo PDF.');
    }
  }

  returnToAssign(): void {
    this.isToAssign = false;
  }

  // PDF Viewer

  @ViewChild('pdfViewer', { static: false }) pdfViewerRef!: ElementRef;

  protected permitAssign: boolean = true;
  protected previosCtxUnsigned = null;
  protected previosCtxSigned = null;
  protected previosCanvasUnsigned = null;

  onCanvasClick(event: MouseEvent) {
    if (!this.permitAssign) return;

    this.togglePermitToAssign();

    let canvas = event.currentTarget as HTMLCanvasElement;
    const pageContainer = canvas.closest('.page');
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.src = '../../../../assets/images/2s.png';

    if (this.previosCtxSigned) {
      this.previosCtxSigned.drawImage(this.previosCanvasUnsigned, 0, 0);
    }

    // Armazena canvas antes da assinatura
      this.previosCanvasUnsigned = document.createElement('canvas');
      this.previosCanvasUnsigned.width = canvas.width;
      this.previosCanvasUnsigned.height = canvas.height;

      this.previosCtxUnsigned = this.previosCanvasUnsigned.getContext('2d');
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      this.previosCtxUnsigned.putImageData(imgData, 0, 0);
    //

    if (pageContainer) {
      const pageNumber = pageContainer.getAttribute('data-page-number');
      const rect = canvas.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;

      img.onload = function () {
        ctx.drawImage(img, clickX, clickY, 140, 60); // (imagem, x, y, largura, altura)
      };


      // Armazena a referência ctx do canvas(Assinado)
        this.previosCtxSigned = ctx;
      //

      console.log(`Posição X: ${clickX}, Y: ${clickY}, Página: ${pageNumber}`);

      this.signaturePosition = {
        x : +clickX,
        y : +clickY,
        page : +pageNumber
      };

      this.togglePermitToAssign();
    }
  }

  // Pode ser necessário otimizar para que não crie listeners atoa
  protected addClickEventToCanva(e) {
    const canvas = e.source.canvas as HTMLCanvasElement;

    canvas.addEventListener('click', (event: MouseEvent) =>
      this.onCanvasClick(event)
    );
  }

  protected togglePermitToAssign() {
    this.permitAssign = !this.permitAssign;
  }
}
