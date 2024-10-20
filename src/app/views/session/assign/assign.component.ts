import { CdkDrag } from '@angular/cdk/drag-drop';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AnimationOptions } from 'ngx-lottie';
import { ToastrService } from 'ngx-toastr';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs';

@Component({
  selector: 'assign',
  templateUrl: './assign.component.html',
  styleUrls: ['./assign.component.scss'],
})
export class AssignComponent implements OnInit {

  protected isToAssign : boolean = false;

  protected selectedFile: File | null = null;
  protected pdfSrc: string | ArrayBuffer | null = null;
  protected signaturePosition: { x: number; y: number } | null = null;


  constructor (
    private readonly _toastr : ToastrService
  ) {
    (pdfjsLib as any).GlobalWorkerOptions.workerSrc = '../../../../assets/pdf.worker.mjs';
  }

  ngOnInit() { }

  print(event: any) {
    console.log(event.source.getFreeDragPosition());
  }

  protected onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];

    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        this.pdfSrc = reader.result;
        this.renderPdf(reader.result as string);
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  protected renderPdf(pdfData: string) {
    const loadingTask = pdfjsLib.getDocument(pdfData);
    loadingTask.promise.then(
      (pdf) => {
        pdf.getPage(1).then((page) => {
          const scale = 1.5;
          const viewport = page.getViewport({ scale });

          const canvas = document.getElementById('pdf-canvas') as HTMLCanvasElement;
          const context = canvas.getContext('2d');

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          const renderContext = {
            canvasContext: context!,
            viewport: viewport,
          };
          page.render(renderContext);

          this.isToAssign = true;
        });
      },
      (reason) => {
        this._toastr.error("Erro ao carregar PDF: " + reason);
      }
    );
  }

  public returnToAssign() {
    this.isToAssign = false;
    this.selectedFile = null;
    this.pdfSrc = null;
    this.signaturePosition = null;
  }

  // Apenas para debug -> Pega a posição de um (x,y) no PDF
  protected onCanvasClick(event: MouseEvent) {
    const canvas = event.target as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.signaturePosition = { x, y };

    console.log('Posição da assinatura:', { x, y });
  }

  // Account Manager
  protected options: AnimationOptions = {
    path: '/assets/json/login_animation.json',
  };
}
