import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogAssignCredentialsComponent } from '@shared/dialogs/dialog-assign-credentials/dialog-assign-credentials.component';
import { SessionQuery } from '@store/session.query';
import { SessionService } from '@store/session.service';
import { AnimationOptions } from 'ngx-lottie';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'assign',
  templateUrl: './assign.component.html',
  styleUrls: ['./assign.component.scss'],
})
export class AssignComponent implements OnInit {
  // Controle de Componente
  protected isToAssign: boolean = true;

  // File
  @ViewChild('fileInput') fileInput!: ElementRef;
  protected selectedFile: File | null = null;
  protected pdfSrc: string | Uint8Array | null = '';
  // 'https://files.cercomp.ufg.br/weby/up/58/o/O_poder_do_Ha%CC%81bito.pdf.pdf';

  // Assinatura
  protected signaturePosition: { x: number; y: number; page: number } = null;

  // Utils
  protected options: AnimationOptions = {
    path: '/assets/json/login_animation.json',
  };

  protected loading: boolean = false;

  constructor(
    private readonly _toastr: ToastrService,
    private readonly _sessionQuery: SessionQuery,
    private readonly _sessionService: SessionService,
    private readonly _dialog: MatDialog
  ) {}

  ngOnInit() {
    if (!this.pdfSrc) this.isToAssign = false;
  }

  protected onSubmit() {
    const dialogConfig: MatDialogConfig = {
      width: '80%',
      maxWidth: '1000px',
      maxHeight: '90%',
      hasBackdrop: true,
      closeOnNavigation: true,
    };

    this._dialog
      .open(DialogAssignCredentialsComponent, {
        ...dialogConfig,
      })
      .afterClosed()
      .subscribe({
        next: (res) => {
          if (res) {
            this.assign(res);
          }
        },
      });
  }

  protected assign(credentials) {

    console.log({
      file: this.selectedFile,
      positionX: this.signaturePosition.x,
      positionY: this.signaturePosition.y,
      page: this.signaturePosition.page,
      ...credentials,
    });

  }

  protected onFileSelected(event: any): void {
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

  // PDF Viewer

  @ViewChild('pdfViewer', { static: false }) pdfViewerRef!: ElementRef;

  protected permitAssign: boolean = true;
  protected previosCtxUnsigned = null;
  protected previosCtxSigned = null;
  protected previosCanvasUnsigned = null;

  protected onCanvasClick(event: MouseEvent) {
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
        x: +clickX,
        y: +clickY,
        page: +pageNumber,
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

  // Utils
  public _initOrStopLoading() {
    this.loading = !this.loading;
  }

  protected togglePermitToAssign() {
    this.permitAssign = !this.permitAssign;
  }

  protected returnToAssign(): void {
    this.isToAssign = false;
    this.selectedFile = null;
    this.fileInput.nativeElement.value = '';
    this.pdfSrc = '';
  }
}
