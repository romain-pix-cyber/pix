import { HttpErrors } from '../../shared/application/http-errors.js';
import { DomainErrorMappingConfiguration } from '../../shared/application/models/domain-error-mapping-configuration.js';
import {
  AdministrationTeamNotFound,
  ArchiveCertificationCentersInBatchError,
  ArchiveOrganizationsInBatchError,
  CountryNotFoundError,
  DpoEmailInvalid,
  FeatureNotFound,
  FeatureParamsNotProcessable,
  NetworkAlreadyExistError,
  OrganizationBatchUpdateError,
  OrganizationLearnerTypeNotFound,
  OrganizationNotFound,
  ParentOrganizationNotInNetworkError,
  StructureNotFoundError,
  TagNotFoundError,
  UnableToAttachChildOrganizationToParentOrganizationError,
  UnableToDetachParentOrganizationFromChildOrganization,
} from '../domain/errors.js';

const organizationalEntitiesDomainErrorMappingConfiguration = [
  {
    name: UnableToAttachChildOrganizationToParentOrganizationError.name,
    httpErrorFn: (error) => new HttpErrors.ConflictError(error.message, error.code, error.meta),
  },
  {
    name: UnableToDetachParentOrganizationFromChildOrganization.name,
    httpErrorFn: (error) => new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta),
  },
  {
    name: OrganizationNotFound.name,
    httpErrorFn: (error) => new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta),
  },
  {
    name: OrganizationLearnerTypeNotFound.name,
    httpErrorFn: (error) => new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta),
  },
  {
    name: TagNotFoundError.name,
    httpErrorFn: (error) => new HttpErrors.NotFoundError(error.message, error.code, error.meta),
  },
  {
    name: FeatureNotFound.name,
    httpErrorFn: (error) => new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta),
  },
  {
    name: FeatureParamsNotProcessable.name,
    httpErrorFn: (error) => new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta),
  },
  {
    name: DpoEmailInvalid.name,
    httpErrorFn: (error) => new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta),
  },
  {
    name: OrganizationBatchUpdateError.name,
    httpErrorFn: (error) => new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta),
  },
  {
    name: ArchiveCertificationCentersInBatchError.name,
    httpErrorFn: (error) => new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta),
  },
  {
    name: ArchiveOrganizationsInBatchError.name,
    httpErrorFn: (error) => new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta),
  },
  {
    name: AdministrationTeamNotFound.name,
    httpErrorFn: (error) => new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta),
  },
  {
    name: NetworkAlreadyExistError.name,
    httpErrorFn: (error) => new HttpErrors.ConflictError(error.message, error.code, error.meta),
  },
  {
    name: ParentOrganizationNotInNetworkError.name,
    httpErrorFn: (error) => new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta),
  },
  {
    name: CountryNotFoundError.name,
    httpErrorFn: (error) => new HttpErrors.NotFoundError(error.message, error.code, error.meta),
  },
  {
    name: StructureNotFoundError.name,
    httpErrorFn: (error) => new HttpErrors.UnprocessableEntityError(error.message, error.code, error.meta),
  },
].map((domainErrorMappingConfiguration) => new DomainErrorMappingConfiguration(domainErrorMappingConfiguration));

export { organizationalEntitiesDomainErrorMappingConfiguration };
