import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { User } from '@models/user';
import { AssignService } from '@services/assign.service';
import { AuthService } from '@services/auth.service';
import { DialogAssignCredentialsComponent } from '@shared/dialogs/dialog-assign-credentials/dialog-assign-credentials.component';
import { DialogCollaboratorComponent } from '@shared/dialogs/dialog-collaborator/dialog-collaborator.component';
import { SessionQuery } from '@store/session.query';
import { SessionService } from '@store/session.service';
import { SessionStore } from '@store/session.store';
import { AnimationOptions } from 'ngx-lottie';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';

@Component({
  selector: 'assign',
  templateUrl: './assign.component.html',
  styleUrls: ['./assign.component.scss'],
})
export class AssignComponent implements OnInit {
  // Controle de Componente
  protected isToAssign: boolean = true;
  protected successAssigned : boolean = false;

  // File
  @ViewChild('fileInput') fileInput!: ElementRef;
  protected selectedFile: File | null = null;
  protected pdfSrc: string | Uint8Array | null = '';
  // 'https://files.cercomp.ufg.br/weby/up/58/o/O_poder_do_Ha%CC%81bito.pdf.pdf';

  // Assinatura
  protected signaturePosition: { x: number; y: number; page: number } = null;

  protected urlAssignedDoc : string = '';

  // Utils
  protected options: AnimationOptions = {
    path: '/assets/json/login_animation.json',
  };

  protected user: User;

  protected loading: boolean = false;

  constructor(
    private readonly _toastr: ToastrService,
    private readonly _assignService: AssignService,
    private readonly _dialog: MatDialog,
    private readonly _sessionQuery: SessionQuery,
    private readonly _authService: AuthService,
    private readonly _sessionService : SessionService,
    private readonly _sessionStore : SessionStore,
  ) {}

  ngOnInit() {
    if (!this.pdfSrc) this.isToAssign = false;

    this._sessionQuery.user$.subscribe((user) => {
      this.user = user;
    });
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
    this._initOrStopLoading();

    this._assignService
      .postFile(this.prepareFormData(credentials))
      .pipe(
        finalize(() => {
          this._initOrStopLoading();
        })
      )
      .subscribe({
        next: (res) => {
          this._toastr.success(res.message);
          this.successAssigned = true;
          this.urlAssignedDoc = res.data.path;
        },
        error: (err) => {
          this._toastr.error(err.error.error);
        },
      });
  }

  protected prepareFormData(credentials) {
    const formData = new FormData();

    formData.append('file', this.selectedFile);
    formData.append('positionX', String(this.signaturePosition.x));
    formData.append('positionY', String(this.signaturePosition.y));
    formData.append('page', String(this.signaturePosition.page));
    formData.append('access_token', String(credentials.access_token));
    formData.append('certificate_alias', String(credentials.certificate_alias));

    return formData;
  }

  protected downloadAssignedDoc() {
    window.open(this.urlAssignedDoc, '_blank');
  }

  protected onFileSelected(event: any): void {
    const file = event.target.files[0];
    this.selectedFile = event.target.files[0];

    console.log(this.selectedFile);

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

  // Perfil

  protected openDialogEditUser() {
    const dialogConfig: MatDialogConfig = {
      width: '80%',
      maxWidth: '1000px',
      maxHeight: '90%',
      hasBackdrop: true,
      closeOnNavigation: true,
    };

    this._dialog
      .open(DialogCollaboratorComponent, {
        data: {
          user : this.user ?? null
        },
        ...dialogConfig,
      })
      .afterClosed()
      .subscribe({
        next: (user) => {
          if (user) {
            this.user = user;

            this._toastr.success('Usuário atualizado!');
          }
        },
      });
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
    img.src = '../../../../assets/images/assignBg.png';

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
        ctx.drawImage(img, clickX, clickY, 107, 30); // (imagem, x, y, largura, altura)
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
    this.successAssigned = false;
    this.selectedFile = null;
    this.fileInput.nativeElement.value = '';
    this.pdfSrc = '';
  }

  protected logout() {
    this._authService.logout();
  }

}
