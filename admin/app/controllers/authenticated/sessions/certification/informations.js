import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import ENV from 'pix-admin/config/environment';

export default class CertificationInformationsController extends Controller {
  // Domain constants
  MAX_REACHABLE_LEVEL = ENV.APP.MAX_REACHABLE_LEVEL;

  // Properties
  @service pixToast;
  @service intl;

  @tracked displayJuryLevelSelect = false;
  @tracked selectedJuryLevel = null;

  get certification() {
    return this.model.certification;
  }

  get juryLevelOptions() {
    const translatedDefaultJuryOptions = this.certification.complementaryCertificationCourseResultWithExternal
      .get('defaultJuryOptions')
      .map((value) => ({
        value,
        label: this.intl.t(`components.certifications.edu-results.v2.external-jury-select-options.${value}`),
      }));
    return [
      ...this.certification.complementaryCertificationCourseResultWithExternal.get('allowedExternalLevels'),
      ...translatedDefaultJuryOptions,
    ];
  }

  get shouldDisplayPixScore() {
    return this.certification.version === 2;
  }

  saveAssessmentResult(commentByJury) {
    this.certification.commentByJury = commentByJury;
    return this.certification.save({ adapterOptions: { updateJuryComment: true } });
  }

  async saveCertificationCourse() {
    return await this.certification.save({ adapterOptions: { updateJuryComment: false } });
  }

  @action
  async onJuryCommentSave(commentByJury) {
    try {
      await this.saveAssessmentResult(commentByJury);
      this.pixToast.sendSuccessNotification({ message: 'Le commentaire du jury a bien été enregistré.' });
      return true;
    } catch {
      this.pixToast.sendErrorNotification({ message: "Le commentaire du jury n'a pas pu être enregistré." });
      return false;
    }
  }

  @action
  selectJuryLevel(value) {
    this.selectedJuryLevel = value;
  }

  @action
  async onEditJuryLevelSave() {
    if (!this.selectedJuryLevel) return;
    await this.certification.save({
      adapterOptions: {
        isJuryLevelEdit: true,
        juryLevel: this.selectedJuryLevel,
        complementaryCertificationCourseId: this.certification.complementaryCertificationCourseResultWithExternal.get(
          'complementaryCertificationCourseId',
        ),
      },
    });
    await this.certification.reload();

    this.displayJuryLevelSelect = false;
  }

  get shouldDisplayJuryLevelEditButton() {
    return this.certification.complementaryCertificationCourseResultWithExternal.get('isExternalResultEditable');
  }

  @action editJury() {
    this.displayJuryLevelSelect = true;
  }

  @action onCancelJuryLevelEditButtonClick() {
    this.displayJuryLevelSelect = false;
  }
}
