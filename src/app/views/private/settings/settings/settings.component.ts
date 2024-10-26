import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Construction } from '@models/construction';
import { ConstructionService } from '@services/construction.service';
import { SettingService } from '@services/settings.service';
import { DialogConfirmComponent } from '@shared/dialogs/dialog-confirm/dialog-confirm.component';
import { DialogConstructionComponent } from '@shared/dialogs/dialog-construction/dialog-construction.component';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';

export interface Setting {
  created_at: string;
  id: number;
  limit: number;
  updated_at: string;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  public loading: boolean = false;
  public form: FormGroup;

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
    });

    this.getSettings();

  }

  onSubmit() {
    if(!this.form.valid || this.loading) return;

    this._initOrStopLoading();

    this._settingService
      .patch(this.form.get('limit').value)
      .pipe(finalize(() => {}))
      .subscribe({
        next: (res) => {
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
      .pipe(finalize(() => {
        this._initOrStopLoading();
      }))
      .subscribe({
        next: (res) => {
          this.form.patchValue({ limit: res.limit });
        },
        error: (err) => {
          this._toastr.error(err.message);
        },
      });
  }

  // Utils

  private _initOrStopLoading(): void {
    this.loading = !this.loading;
  }
}
