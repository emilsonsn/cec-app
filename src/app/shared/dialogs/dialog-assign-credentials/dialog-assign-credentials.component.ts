import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AssignService } from '@services/assign.service';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, map, ReplaySubject, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dialog-assign-credentials',
  templateUrl: './dialog-assign-credentials.component.html',
  styleUrls: ['./dialog-assign-credentials.component.scss'],
})
export class DialogAssignCredentialsComponent implements OnInit {
  protected form: FormGroup;
  protected formCertificate: FormGroup;
  protected isToShowCertificate: boolean = false;

  // Certificates
  protected certificateSelect = [];
  protected certificateCtrl: FormControl<any> = new FormControl<any>(null);
  protected certificateFilterCtrl: FormControl<any> = new FormControl<string>(
    ''
  );
  protected filteredCertificates: ReplaySubject<any[]> = new ReplaySubject<
    any[]
  >(1);

  // Utils
  protected loading: boolean = false;
  protected _onDestroy = new Subject<void>();

  constructor(
    @Inject(MAT_DIALOG_DATA)
    private readonly _data,
    private readonly dialogRef: MatDialogRef<DialogAssignCredentialsComponent>,
    private readonly _fb: FormBuilder,
    private readonly _assignService: AssignService,
    private readonly _toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.form = this._fb.group({
      cpf_cnpj: [null, [Validators.required]],
      code_otp: [null, [Validators.required]],
    });

    this.formCertificate = this._fb.group({
      certificate: [null, [Validators.required]],
    });
  }

  public onSubmit(): void {
    if (this.loading) return;

    if (!this.isToShowCertificate) {
      if (!this.form.valid) return;

      this.searchCertificates();

      console.log(this.form.getRawValue());
    } else {
      if (!this.formCertificate.valid) return;

      console.log(this.formCertificate.getRawValue());
    }
  }

  protected submitCredentials() {}

  // Getters
  protected searchCertificates() {

    this._assignService.getCertificates({...this.form.getRawValue()}).subscribe({
      next: (res) => {
        this.certificateSelect = res.data;
        this.isToShowCertificate = true;

        this.filteredCertificates.next(this.certificateSelect.slice());
      },
      error: (err) => {
        this._toastr.error(err.error.error);
      },
    });

    this.getCertificates();
    this.prepareFilterCertificateCtrl();
  }

  public getCertificates() {}

  // Utils
  public onCancel(): void {
    this.dialogRef.close(false);
  }

  protected _initOrStopLoading() {
    this.loading = !this.loading;
  }

  // Filters
  protected prepareFilterCertificateCtrl() {
    this.certificateFilterCtrl.valueChanges
      .pipe(
        takeUntil(this._onDestroy),
        debounceTime(100),
        map((search: string | null) => {
          if (!search) {
            return this.certificateSelect.slice();
          } else {
            search = search.toLowerCase();
            return this.certificateSelect.filter((certificate) =>
              certificate.name.toLowerCase().includes(search)
            );
          }
        })
      )
      .subscribe((filtered) => {
        this.filteredCertificates.next(filtered);
      });
  }
}
