import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConstructionRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings/settings.component';
import { MatDialogModule } from '@angular/material/dialog';
import { SharedModule } from '@shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { MatInputModule } from '@angular/material/input';
import { MatRippleModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@NgModule({
  declarations: [
    SettingsComponent
  ],
  imports: [
    CommonModule,
    ConstructionRoutingModule,
    SharedModule,
    MatDialogModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatRippleModule,
    NgxMaskDirective,
    NgxMaskPipe,
  ]
})
export class SettingsModule { }
