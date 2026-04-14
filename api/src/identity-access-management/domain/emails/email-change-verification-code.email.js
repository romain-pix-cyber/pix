import { getPixWebsiteDomain, getPixWebsiteUrl } from '../../../shared/domain/services/url-service.js';
import { EmailFactory } from '../../../shared/mail/domain/models/EmailFactory.js';
import { mailer } from '../../../shared/mail/infrastructure/services/mailer.js';

const EMAIL_VERIFICATION_CODE_TAG = 'EMAIL_VERIFICATION_CODE';

/**
 * Send a verification code for email change (add or update)
 *
 * @param {Object} params - The parameters for the email.
 * @param {string} params.email - The recipient's email address.
 * @param {string} params.locale - The locale for the email.
 * @param {string} params.code - The token for email change validation.
 * @returns {Object} The email object.
 */
export function emailChangeVerificationCodeEmail({ email, code, locale }) {
  const factory = new EmailFactory({ app: 'pix-app', locale });

  const { i18n } = factory;

  return factory.buildEmail({
    template: mailer.emailVerificationCodeTemplateId,
    subject: i18n.__('verification-code-email.subject', { code }),
    to: email,
    tags: [EMAIL_VERIFICATION_CODE_TAG],
    variables: {
      code,
      homeName: getPixWebsiteDomain(locale),
      homeUrl: getPixWebsiteUrl(locale),
      context: i18n.__('verification-code-email.body.context'),
      doNotAnswer: i18n.__('verification-code-email.body.doNotAnswer'),
      greeting: i18n.__('verification-code-email.body.greeting'),
      moreOn: i18n.__('verification-code-email.body.moreOn'),
      pixPresentation: i18n.__('verification-code-email.body.pixPresentation'),
      seeYouSoon: i18n.__('verification-code-email.body.seeYouSoon'),
      signing: i18n.__('verification-code-email.body.signing'),
      warningMessage: i18n.__('verification-code-email.body.warningMessage'),
    },
  });
}
