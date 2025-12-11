import { ValidationPipe } from '@nestjs/common';
import { validationPipeExceptionFactory } from 'src/common/utilities/validation-pipe-exception.factory';
import { AppHelperService } from 'src/modules/core/app-helper/services/app-helper.service';

// Factory function to create a customized ValidationPipe instance.
// This pipe is responsible for validating incoming request data and handling validation errors.
export const ValidationPipeFactory = (appHelperService: AppHelperService) => {
  return new ValidationPipe({
    // Enables automatic transformation of input data to match the expected types.
    transform: true,
    // Configuration options for the transformation process.
    transformOptions: {
      // Allows implicit type conversion (e.g., string to number).
      enableImplicitConversion: true,
    },

    exceptionFactory: (errors) =>
      validationPipeExceptionFactory(errors, appHelperService),
  });
};
