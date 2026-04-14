import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class NewController extends Controller {
  @service pixToast;
  @service router;
  @service intl;
  @service store;

  queryParams = ['parentOrganizationId'];

  @tracked parentOrganizationId = null;

  @action
  redirectOnCancel() {
    if (this.parentOrganizationId) {
      return this.router.transitionTo('authenticated.organizations.get.network', this.parentOrganizationId);
    }
    this.router.transitionTo('authenticated.organizations');
  }

  @action
  async addOrganization(form) {
    const organization = this.store.createRecord('organization', { ...form });

    if (this.parentOrganizationId) {
      organization.setProperties({
        parentOrganizationId: this.parentOrganizationId,
      });
    }

    try {
      await organization.save();
      this.pixToast.sendSuccessNotification({ message: 'L’organisation a été créée avec succès.' });

      if (organization.parentOrganizationId) {
        const parentOrganization = await this.store.findRecord('organization', organization.parentOrganizationId);
        await parentOrganization.hasMany('children').reload();
      }

      this.router.transitionTo('authenticated.organizations.get.all-tags', organization.id);
    } catch {
      this.pixToast.sendErrorNotification({ message: 'Une erreur est survenue.' });
      organization.rollbackAttributes();
    }
  }
}
