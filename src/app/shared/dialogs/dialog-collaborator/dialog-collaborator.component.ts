import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { UserService } from '@services/user.service';
import { User } from '@models/user';
import { DialogTypeUserSectorComponent } from '../dialog-type-user-sector/dialog-type-user-sector.component';
import dayjs from 'dayjs';
import { Utils } from '@shared/utils';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dialog-collaborator',
  templateUrl: './dialog-collaborator.component.html',
  styleUrl: './dialog-collaborator.component.scss',
})
export class DialogCollaboratorComponent {
  public form: FormGroup;
  public loading: boolean = false;
  public profileImageFile: File | null = null;
  profileImage: string | ArrayBuffer = null;
  isDragOver: boolean = false;

  protected confirm_password: String;

  public utils = Utils;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    private readonly _data: { user: User },
    private readonly _dialogRef: MatDialogRef<DialogCollaboratorComponent>,
    private readonly _fb: FormBuilder,
    private readonly _dialog: MatDialog,
    private readonly _userService: UserService,
    private readonly _toastr : ToastrService,
  ) {}

  ngOnInit(): void {
    this.form = this._fb.group({
      id: [null],
      name: [null, [Validators.required]],
      cpf_cnpj: [null, [Validators.required]],
      birth_date: [null, [Validators.required]],
      phone: [null, [Validators.required]],
      whatsapp: [null, [Validators.required]],
      email: [null, [Validators.required]],
      password: [null],
    });

    this.form.get('birth_date').valueChanges.subscribe(data => {
      const inputValue = data;
      if (this.isValidDateFormat(data)) {
        const [day, month, year] = inputValue.split('/').map(Number);
        this.form.controls['birth_date'].setValue(new Date(year, month - 1, day));
      }
    });

    this.form.get('email').disable();

    if (this._data?.user) {
      console.log(this._data.user);
      this.form.patchValue(this._data?.user);

      if (this._data.user.photo) {
        this.profileImage = this._data.user.photo;
      }
    }
  }

  public onSubmit(): void {
    if (!this.form.valid ) {
      console.log(this.form.valid);
      this.form.markAllAsTouched();
      return
    }

    if(this.form.get('password').value != this.confirm_password) return;

    this._initOrStopLoading();

    this._userService.patchUser(this._data.user.id, this.prepareFormData())
      .pipe(finalize(() => {
        this._initOrStopLoading();
      }))
      .subscribe({
        next : (res) => {
          this._dialogRef.close({...res.data});
        },
        error : (err) => {
          this._toastr.error(err.error.error);
        }
      })

  }

  protected prepareFormData() {
    const formData = new FormData();

    formData.append('name', this.form.get('name')?.value);
    formData.append('cpf_cnpj', this.form.get('cpf_cnpj')?.value);
    formData.append(
      'birth_date',
      dayjs(this.form.get('birth_date')?.value).format('YYYY-MM-DD')
    );
    formData.append('phone', this.form.get('phone')?.value);
    formData.append('whatsapp', this.form.get('whatsapp')?.value);
    formData.append('email', this.form.get('email')?.value);
    formData.append('password', this.form.get('password')?.value);

    if(this.profileImageFile) {
      formData.append('photo', this.profileImageFile);
    }

    return formData;
  }

  // File
  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.updateProfileImage(file);
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;

    const file = event.dataTransfer?.files[0];
    this.updateProfileImage(file);
  }

  updateProfileImage(file) {
    if (file) {
      this.profileImageFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImage = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(event: Event): void {
    event.stopPropagation();
    this.profileImage = null;
  }

  // Utils
  protected _initOrStopLoading() {
    this.loading = !this.loading;
  }

  public onCancel(): void {
    this._dialogRef.close();
  }

  protected isValidDateFormat(value: string): boolean {
    return /^\d{2}\/\d{2}\/\d{4}$/.test(value);
  }

}
