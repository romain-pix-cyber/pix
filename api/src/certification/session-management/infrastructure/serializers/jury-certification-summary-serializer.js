import lodash from 'lodash';

const { Serializer } = jsonapiSerializer;

const { get } = lodash;

import jsonapiSerializer from 'jsonapi-serializer';

const serialize = function (juryCertificationSummary, meta, { translate }) {
  return new Serializer('jury-certification-summary', {
    transform(juryCertificationSummary) {
      // eslint-disable-next-line no-unused-vars
      const { certificationIssueReports, ...result } = juryCertificationSummary;
      result.certificationObtained = juryCertificationSummary.getCertificationLabel(translate);
      result.examinerComment = get(juryCertificationSummary, 'certificationIssueReports[0].description');
      result.numberOfCertificationIssueReports = juryCertificationSummary.certificationIssueReports.length;
      result.reachedResultKey = juryCertificationSummary.reachedResultKey;
      result.numberOfCertificationIssueReportsWithRequiredAction =
        juryCertificationSummary.certificationIssueReports.filter(
          (issueReport) => issueReport.isImpactful && issueReport.resolvedAt === null,
        ).length;
      return result;
    },
    attributes: [
      'firstName',
      'lastName',
      'status',
      'pixScore',
      'algorithmVersion',
      'reachedResultKey',
      'createdAt',
      'completedAt',
      'isPublished',
      'examinerComment',
      'numberOfCertificationIssueReports',
      'numberOfCertificationIssueReportsWithRequiredAction',
      'isFlaggedAborted',
      'certificationFramework',
    ],
    meta,
  }).serialize(juryCertificationSummary);
};

export { serialize };
