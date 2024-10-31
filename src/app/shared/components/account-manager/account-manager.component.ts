import {Component, Input} from '@angular/core';
import { User } from '@models/user';
import { AuthService } from '@services/auth.service';
import { SessionQuery } from '@store/session.query';
import {AnimationOptions} from "ngx-lottie";

@Component({
  selector: 'app-account-manager',
  templateUrl: './account-manager.component.html',
  styleUrl: './account-manager.component.scss'
})
export class AccountManagerComponent {
  @Input() primary_text: string = '';
  @Input() secondary_text: boolean;
  @Input() options: AnimationOptions = {};
  @Input() logged : boolean = false;
  protected user : User;

  constructor(
    private readonly _authService : AuthService,
    private readonly _sessionQuery : SessionQuery,

  ) {}

  ngOnInit() {
    this._sessionQuery.user$.subscribe((user) => {
      this.user = user;
    });
  }

  // Logged


  logout() {
    this.logged = false;
    this._authService.logout();
  }


}
