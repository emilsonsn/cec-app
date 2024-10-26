import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RequestType } from '@models/request';
import { UserService } from '@services/user.service';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-dialog-edit-limit',
  templateUrl: './dialog-edit-limit.component.html',
  styleUrl: './dialog-edit-limit.component.scss'
})
export class DialogEditLimitComponent {
  public loading: boolean = false;
  public form: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    protected readonly _data,
    private readonly _fb: FormBuilder,
    private readonly _dialogRef: MatDialogRef<DialogEditLimitComponent>,
    private readonly _userService : UserService,
    private readonly _toastr : ToastrService,
  ){}

  ngOnInit() {
    this.form = this._fb.group({
      file_limit: [null, Validators.required],
    });
  }

  public onConfirm(){
    if(!this.form.valid || this.loading || !this._data?.user) return;

    this._initOrStopLoading();

    this._userService.changeLimit({
      user_id : this._data?.user?.id,
      file_limit : this.form.get('file_limit').value
    })
     .pipe(finalize(() => { this._initOrStopLoading() }))
     .subscribe({
       next : (res) => {
         this._toastr.success(res.message);
         this._dialogRef.close(true);
       },
       error : (err) => {
         this._toastr.error(err.error.error);
       }
     })

  }

  public onCancel(){
    this._dialogRef.close()
  }

  // Utils
  private _initOrStopLoading(): void {
    this.loading = !this.loading;
  }

}
