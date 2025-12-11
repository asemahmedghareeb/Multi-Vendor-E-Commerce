import { ValidationError } from 'class-validator';
import { ErrorCodeEnum } from '../enums/error-code.enum';
import { AppHttpException } from '../exceptions/app-http.exception';
import { ValidationErrorMessageEnum } from '../enums/validation-error-message.enum';
import { AppHelperService } from 'src/modules/core/app-helper/services/app-helper.service';

export const validationPipeExceptionFactory = (
  errors: ValidationError[],
  appHelperService?: AppHelperService,
) => {
  // Throws a custom exception (AppHttpException) with a BAD_REQUEST_EXCEPTION error code.
  return new AppHttpException(ErrorCodeEnum.BAD_REQUEST_EXCEPTION, {
    // Maps validation errors to a localized format.
    validationMessages: getValidationMessages(errors, appHelperService),
  });
};

const getValidationMessages = (
  errors: ValidationError[],
  appHelperService?: AppHelperService,
): any =>
  errors.map((error) => {
    if (!error.constraints && error.children) {
      return {
        property: error?.property,
        errors: getValidationMessages(error.children, appHelperService),
      };
    }
    // Iterates over each validation constraint for the current error.
    Object.keys(error.constraints as Object).forEach((constraint) => {
      if (
        !ValidationErrorMessageEnum[
          (error.constraints as Object)[constraint]
        ] ||
        !appHelperService
      )
        return;
      // Translates the validation error message using the i18n service.
      (error.constraints as Object)[constraint] = appHelperService?.localize(
        `validation-errors.${(error.constraints as Object)[constraint]}`,
        {},
      );
    });
    // Returns the property name and translated constraints for the error.
    return {
      property: error?.property,
      constraints: error?.constraints,
    };
  });
