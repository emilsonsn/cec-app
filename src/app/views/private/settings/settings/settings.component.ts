import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConstructionService } from '@services/construction.service';
import { SettingService } from '@services/settings.service';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  public loading: boolean = false;
  public form: FormGroup;
  public previewUrl: string | ArrayBuffer | null = null;

  constructor(
    private readonly _dialog: MatDialog,
    private readonly _toastr: ToastrService,
    private readonly _constructionService: ConstructionService,
    private readonly _fb: FormBuilder,
    private readonly _settingService: SettingService
  ) {}

  ngOnInit() {
    this.form = this._fb.group({
      limit: [0, [Validators.required]],
      url: [''],
      display: ['']
    });
    this.getSettings();
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
      this.form.patchValue({ display: file });
    }
  }

  onSubmit() {
    if (!this.form.valid || this.loading) return;

    this._initOrStopLoading();

    const formData = new FormData();
    formData.append('limit', this.form.get('limit').value);
    formData.append('url', this.form.get('url').value);
  
    if (this.form.get('display').value) {
      formData.append('display', this.form.get('display').value);
    }

    this._settingService
      .patch(formData)
      .pipe(finalize(() => this._initOrStopLoading()))
      .subscribe({
        next: () => {
          this._toastr.success('Configurações salvas com sucesso!');
        },
        error: (err) => {
          this._toastr.error(err.message);
        },
      });
  }

  getSettings() {
    this._initOrStopLoading();

    this._settingService.get()
      .pipe(finalize(() => this._initOrStopLoading()))
      .subscribe({
        next: (res) => {
          this.form.patchValue({
              limit: res.limit,
              url: res.url
            });
          if (res.display) {
            this.previewUrl = res.display;
          }
        },
        error: (err) => {
          this._toastr.error(err.message);
        },
      });
  }

  private _initOrStopLoading(): void {
    this.loading = !this.loading;
  }
}
