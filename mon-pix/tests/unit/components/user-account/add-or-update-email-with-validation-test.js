import { setupTest } from 'ember-qunit';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';
import { module, test } from 'qunit';

module('Unit | Component | user-account | add-or-update-email-with-validation', function (hooks) {
  setupTest(hooks);

  module('#showVerificationCode', function () {
    test('should show verification code page', async function (assert) {
      // given
      const component = createGlimmerComponent('user-account/add-or-update-email-with-validation');
      const newEmail = 'toto@example.net';
      const password = 'pix123';

      // when
      component.showVerificationCode({ newEmail, password });

      // then
      assert.false(component.showEmailForm);
    });

    test('should save new email trimmed and in lowercase on sendVerificationCode', async function (assert) {
      // given
      const component = createGlimmerComponent('user-account/add-or-update-email-with-validation');
      const newEmail = '   Toto@Example.net    ';
      const password = 'pix123';

      // when
      component.showVerificationCode({ newEmail, password });

      // then
      assert.strictEqual(component.newEmail, 'Toto@Example.net');
    });

    test('should save password on sendVerificationCode', async function (assert) {
      // given
      const component = createGlimmerComponent('user-account/add-or-update-email-with-validation');
      const newEmail = 'toto@example.net';
      const password = 'pix123';

      // when
      component.showVerificationCode({ newEmail, password });

      // then
      assert.strictEqual(component.password, 'pix123');
    });
  });

  module('#action', function () {
    test('returns "add-email" when canAddEmailConnectionMethod is true', async function (assert) {
      // given
      const component = createGlimmerComponent('user-account/add-or-update-email-with-validation', {
        canAddEmailConnectionMethod: true,
      });

      // then
      assert.strictEqual(component.action, 'add-email');
    });

    test('returns "update-email" when canAddEmailConnectionMethod is false', async function (assert) {
      // given
      const component = createGlimmerComponent('user-account/add-or-update-email-with-validation', {
        canAddEmailConnectionMethod: false,
      });

      // then
      assert.strictEqual(component.action, 'update-email');
    });
  });
});
