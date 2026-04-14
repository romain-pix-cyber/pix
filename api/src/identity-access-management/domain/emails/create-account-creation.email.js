import {
  getEmailValidationUrl,
  getPixAppConnexionUrl,
  getPixWebsiteDomain,
  getPixWebsiteUrl,
  getSupportUrl,
} from '../../../shared/domain/services/url-service.js';
import { EmailFactory } from '../../../shared/mail/domain/models/EmailFactory.js';
import { mailer } from '../../../shared/mail/infrastructure/services/mailer.js';

/**
 * Creates an account creation email.
 *
 * @param {Object} params - The parameters for the email.
 * @param {string} params.locale - The locale for the email.
 * @param {string} params.email - The recipient's email address.
 * @param {string} params.firstName - The recipient's first name.
 * @param {string} params.token - The token for email validation.
 * @param {string} [params.redirectionUrl] - The redirection URL after validation.
 * @returns {Object} The email object.
 */
export function createAccountCreationEmail({ locale, email, firstName, token, redirectionUrl }) {
  const factory = new EmailFactory({ app: 'pix-app', locale });

  const { i18n } = factory;

  const redirectUrl = redirectionUrl || getPixAppConnexionUrl(locale);

  return factory.buildEmail({
    template: mailer.accountCreationTemplateId,
    subject: i18n.__('pix-account-creation-email.subject'),
    to: email,
    variables: {
      homeName: getPixWebsiteDomain(locale),
      homeUrl: getPixWebsiteUrl(locale),
      helpdeskUrl: getSupportUrl(locale),
      askForHelp: i18n.__('pix-account-creation-email.params.askForHelp'),
      disclaimer: i18n.__('pix-account-creation-email.params.disclaimer'),
      doNotAnswer: i18n.__('pix-account-creation-email.params.doNotAnswer'),
      goToPix: i18n.__('pix-account-creation-email.params.goToPix'),
      helpdeskLinkLabel: i18n.__('pix-account-creation-email.params.helpdeskLinkLabel'),
      moreOn: i18n.__('pix-account-creation-email.params.moreOn'),
      pixPresentation: i18n.__('pix-account-creation-email.params.pixPresentation'),
      subtitle: i18n.__('pix-account-creation-email.params.subtitle'),
      subtitleDescription: i18n.__('pix-account-creation-email.params.subtitleDescription'),
      title: i18n.__('pix-account-creation-email.params.title', { firstName }),
      redirectionUrl: getEmailValidationUrl({ locale, redirectUrl, token }),
    },
  });
}
