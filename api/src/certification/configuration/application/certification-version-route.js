import JoiDate from '@joi/date';
import BaseJoi from 'joi';

const Joi = BaseJoi.extend(JoiDate);

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { SCOPES } from '../../shared/domain/models/Scopes.js';
import { certificationVersionController } from './certification-version-controller.js';

const register = async function (server) {
  server.route([
    {
      method: 'GET',
      path: '/api/admin/certification-versions/{scope}/active',
      config: {
        pre: [
          {
            method: (request, h) =>
              securityPreHandlers.hasAtLeastOneAccessOf([securityPreHandlers.checkAdminMemberHasRoleSuperAdmin])(
                request,
                h,
              ),
            assign: 'hasRoleSuperAdmin',
          },
        ],
        validate: {
          params: Joi.object({
            scope: Joi.string()
              .required()
              .valid(...Object.values(SCOPES)),
          }),
        },
        handler: certificationVersionController.getActiveVersionByScope,
        tags: ['api', 'admin'],
        notes: [
          'Cette route est restreinte aux utilisateurs authentifiés avec le rôle Super Admin',
          'Elle permet de récupérer la version active de certification pour un scope donné',
        ],
      },
    },
  ]);
};

const name = 'certification/configuration/certification-versions-api';
export { name, register };
