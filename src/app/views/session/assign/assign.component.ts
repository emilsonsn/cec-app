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
  protected signaturePosition;

  dragPosition = {x: 300, y: 1800};

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
        // Container onde os canvases vão ser adicionados
        const pdfContainer = document.getElementById('pdf-container');
        if (pdfContainer) {
          pdfContainer.innerHTML = ''; // Limpa o container antes de renderizar

          // Itera pelas páginas do PDF e cria um canvas para cada uma
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            pdf.getPage(pageNum).then((page) => {
              const scale = 1.5;
              const viewport = page.getViewport({ scale });

              // Cria um elemento div para conter o canvas e a assinatura
              const pageContainer = document.createElement('div');
              pageContainer.classList.add('page-container');
              pdfContainer.appendChild(pageContainer);

              // Cria um novo canvas para cada página
              const canvas = document.createElement('canvas');
              canvas.id = `pdf-canvas-${pageNum}`;
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              pageContainer.appendChild(canvas);

              const context = canvas.getContext('2d');

              const renderContext = {
                canvasContext: context!,
                viewport: viewport,
              };

              // Renderiza a página no canvas
              page.render(renderContext);

              // Adiciona o evento de clique no canvas, passando também o número da página
              canvas.addEventListener('click', (event: MouseEvent) => this.onCanvasClick(event, pageNum));

              // Cria a div para a "assinatura" e aplica as propriedades de arraste
              const signatureDiv = document.createElement('div');
              signatureDiv.classList.add('example-box');
              signatureDiv.innerText = 'Assinatura';
              pageContainer.appendChild(signatureDiv);

              this.isToAssign = true;
            });
          }
        }
      },
      (reason) => {
        this._toastr.error("Erro ao carregar PDF: " + reason);
      }
    );
  }

  // Função para pegar a posição de clique no canvas e o número da página
  protected onCanvasClick(event: MouseEvent, pageNum: number) {
    const canvas = event.target as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.signaturePosition = { x, y, page: pageNum };

    // Definir a posição inicial como {x: 0, y: 0} se for necessário
    this.dragPosition = { x: 0, y: 0 };

    setTimeout(() => {
      // Atualizar diretamente a posição para o local correto
      this.dragPosition = { x: x, y: y * pageNum }; // Atribua as coordenadas diretamente
    }, 200); // Um pequeno delay, pode ajustar o tempo conforme necessário

    console.log(`Posição da assinatura na página ${pageNum}:`, { x, y });
  }



  public returnToAssign() {
    this.isToAssign = false;
    this.selectedFile = null;
    this.pdfSrc = null;
    this.signaturePosition = null;
  }

  // Account Manager
  protected options: AnimationOptions = {
    path: '/assets/json/login_animation.json',
  };
}
