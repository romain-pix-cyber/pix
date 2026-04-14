import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import AddEmailWithValidationForm from './add-email-with-validation-form';
import EmailVerificationCode from './email-verification-code';
import EmailWithValidationForm from './email-with-validation-form';

export default class AddOrUpdateEmailWithValidation extends Component {
  <template>
    <div class="update-email-with-validation">
      {{#if this.showEmailForm}}
        {{#if @canAddEmailConnectionMethod}}
          <AddEmailWithValidationForm
            @disableEmailEditionMode={{@disableEmailEditionMode}}
            @showVerificationCode={{this.showVerificationCode}}
          />
        {{else}}
          <EmailWithValidationForm
            @disableEmailEditionMode={{@disableEmailEditionMode}}
            @showVerificationCode={{this.showVerificationCode}}
          />
        {{/if}}
      {{else}}
        <EmailVerificationCode
          @disableEmailEditionMode={{@disableEmailEditionMode}}
          @displayEmailUpdateMessage={{@displayEmailUpdateMessage}}
          @email={{this.newEmail}}
          @password={{this.password}}
          @action={{this.action}}
        />
      {{/if}}
    </div>
  </template>

  @tracked newEmail = '';
  @tracked password = '';
  @tracked showEmailForm = true;

  get action() {
    return this.args.canAddEmailConnectionMethod ? 'add-email' : 'update-email';
  }

  @action
  showVerificationCode({ newEmail, password }) {
    this.newEmail = newEmail.trim();
    this.password = password;
    this.showEmailForm = false;
  }
}
