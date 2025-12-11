import { HttpException } from '@nestjs/common';
import { ErrorCodeEnum } from '../enums/error-code.enum';
import { ValidationError } from 'class-validator';

// Custom exception class extending the built-in HttpException.
// This class is used to provide additional metadata (extensions) for errors.
export class AppHttpException extends HttpException {
  constructor(
    // The error code representing the type of error (e.g., BAD_REQUEST_EXCEPTION).
    errorCode: ErrorCodeEnum,

    // Additional metadata to include in the error response.
    // This can include validation errors, timestamps, or other custom data.
    public extensions: {
      [key: string]: string | number | Partial<ValidationError>[];
    } = {},
  ) {
    // Calls the parent HttpException constructor with the error message and status code.
    // The error message is derived from the ErrorCodeEnum.
    super(ErrorCodeEnum[errorCode], errorCode);
  }
}
