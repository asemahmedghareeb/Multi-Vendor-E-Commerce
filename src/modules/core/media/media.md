## Media module — developer guide

This document explains the Media module at `src/modules/core/media`. It describes the upload and streaming APIs, available strategies (local and S3), validation, authorization guards, cron job for cleanup, entity shape, utilities, and where to look in source code.

## Purpose

The Media module handles file uploads, validation, storage (local filesystem or AWS S3), streaming files to clients, marking files as referenced/unreferenced, and periodic removal of unreferenced files.

## Public API (HTTP controller)

- POST /media/upload
- Expects multipart file upload with headers:
  - `use_case` (required) — one of `FileUseCaseEnum` (e.g., `video_test`, `image_test`, `doc_test`).
  - `model` (required) — one of `FileModelEnum` (e.g., `public_test`).
  - `lang` header is required globally by the controller (see `@ApiHeader` in code).
- The controller method `upload` forwards the raw `Request` to `MediaService.uploadFile(req)` within a transactional context.

- GET /media/:model/:fileName
- Streams a file. Guarded by `FileAuthGuard` (resolves a guard per `model` defined in `FileGuardOptions`).

Controller file: `src/modules/core/media/controller/media.controller.ts`.

## Storage strategies

Two uploader strategies are provided and registered in `MediaModule`:

- `UploaderLocalStrategy` (`strategies/local.strategy.ts`)
  - Stores files under a `storage` directory in the repository (BASE_UPLOAD_DIR resolves to `.../storage`).
  - Uses `busboy` to stream the incoming file to disk and performs first-chunk MIME checks via the validation callback.
  - Implements `uploadFile`, `cancelFileUpload`, `streamFile`, and `deleteFiles`.

- `UploaderS3Strategy` (`strategies/s3.strategy.ts`)
  - Streams uploads to AWS S3 using `S3Client`.
  - Reads `AWS_REGION`, `AWS_ACCESS_KEY`, `AWS_SECRET_ACCESS_KEY`, and `AWS_S3_BUCKET` via `ConfigService` during construction.
  - Implements `uploadFile`, `cancelFileUpload`, `streamFile`, and `deleteFiles`.

The code currently injects `UploaderS3Strategy` into `MediaService` (see `@Inject(UploaderS3Strategy)`), meaning S3 is used by default in the service constructor.

## Upload flow (service internals)

`MediaService.uploadFile(req)`:

1. Validates `content-type` header exists; throws `AppHttpException(ErrorCodeEnum.MISSING_CONTENT_TYPE)` if missing.
2. Builds `UploadFileInput` from `req.headers.use_case` and `req.headers.model` and validates it with `class-validator`.
3. Calls `UploaderValidationService.useCaseValidator(fileInput)` to ensure the `model` supports the provided `use_case`.
4. Calls the configured uploader strategy's `uploadFile` method, passing:
   - `req`, the parsed `fileInput`,
   - `uploaderValidationService.onFirstChunkValidator` as the `onFirstChunkValidator` callback (performs MIME sniffing and accepted format checks),
   - a `callBack` function that saves metadata into the DB and returns saved `File` record.
5. Returns the saved `File` record to the caller.

Notes:

- The code calls `validateOrReject(fileInput)` and wraps validation errors via `validationPipeExceptionFactory`.
- The `uploadFile` implementation expects the upload to be streamed with `busboy` and validated on the first chunk using `file-type` to ensure MIME matches.

## Validation

- Validation rules per upload use case are defined in `options/validation.options.ts` using `ValidationOptions`.
- Each `FileUseCaseEnum` maps to `FileValidationOptions` (accepted formats, max size, and an `AppHttpException` instance to throw on error).
- `UploaderValidationService.onFirstChunkValidator`:
  - Checks declared `metadata.mimeType` is in `acceptedFormats`.
  - Uses `fileTypeFromBuffer(chunk)` to detect MIME from the first chunk and compares it to metadata; throws the configured error on mismatch.

## File model and metadata

- Entity: `src/modules/core/media/entities/file.entity.ts` (`File`)
  - Fields stored: `fileName`, `mimeType`, `sizeInBytes`, `hasReference` (boolean), `fileModel` (enum), `fileUseCase` (enum), plus base fields from `AppBaseEntity` (id, timestamps, etc.).
  - `url` getter returns a route path `/media/<model>/<fileName>` used by the controller to stream files.

## Utilities

- `generateFileName(useCase, filename)` — constructs a sanitized filename with: `<useCase>-<timestamp>-<uuid>-<sanitized_original_name><ext>`.
  - Removes characters not matching `[a-zA-Z0-9\\u0600-\\u06FF_-]` from the original name.

- `generateFileValidationOptions(acceptedFormats, maxSizeInBytes, errorCode)` — helper to build `FileValidationOptions` objects.

## Guards and authorization

- `FileAuthGuard` is used on the streaming route. It reads `model` from route params and maps it to a guard class via `FileGuardOptions` (configured per model in `guards/index.ts`).
- `TestFileAuthGuard` is the guard implementation for `public_test`; its `canActivate` currently returns `true`.

## Cron job

- `RemoveUnreferencedFilesCron` runs at `0 3 * * *` (3:00 AM) and calls `MediaService.removeUnReferencedFiles()`.
- `MediaService.removeUnReferencedFiles()` finds files with `hasReference = false` and `createdAt` older than 2 hours, delegates deletion to the uploader strategy via `deleteFiles`, and removes DB records via `fileRepository.remove(unreferencedFiles)`.

## Stream and delete operations

- `uploaderStrategy.streamFile(model, filename, res)` is implemented by both local and S3 strategies to pipe the file content to the HTTP response.
- `uploaderStrategy.deleteFiles(filesToDelete)` is implemented by both strategies; the service calls it with a mapped array of `{ model, filename }`.

## Types used

- `FileToDelete` — { model: FileModelEnum; filename: string }
- `FileValidationOptions` — { maxSizeInBytes, acceptedFormats, error }
- `LocalFileResource` and `S3FileResource` — internal resource shapes used while streaming uploads.

## Where to look in code

- Module: `src/modules/core/media/media.module.ts`
- Controller: `src/modules/core/media/controller/media.controller.ts`
- Service: `src/modules/core/media/services/media.service.ts`
- Strategies: `src/modules/core/media/strategies/local.strategy.ts`, `src/modules/core/media/strategies/s3.strategy.ts`
- Validation: `src/modules/core/media/services/file-validation.service.ts`, `src/modules/core/media/options/validation.options.ts`
- Utilities/types: `src/modules/core/media/utilities/*`, `src/modules/core/media/types/*`
- Guards: `src/modules/core/media/guards/*`
- Cron: `src/modules/core/media/crons/remove-unreferenced-files.cron.ts`

## Strategy deep-dive — UploaderLocalStrategy (detailed)

Location: `src/modules/core/media/strategies/local.strategy.ts`

Lifecycle overview:

- The strategy uses `busboy` to parse multipart requests and streams file data directly to disk via `fs.createWriteStream`.
- Upload starts when `busboy` emits the `file` event with a `Readable` stream and metadata (`Busboy.FileInfo`).
- The strategy validates the first chunk using the `onFirstChunkValidator` callback. Validation includes checking declared `mimeType` and sniffing the chunk with `file-type`.
- After validation, the stream is piped into a write stream to the target file path. The strategy accumulates `sizeInBytes` as data arrives.
- When the file stream ends, the strategy calls the provided `callBack(metadata, sizeInBytes, saveName)` which is expected to persist metadata and return the file record.

Key busboy events used (observed in code):

- `file` — emitted with field name, readStream, and metadata. The handler:
  - sets up `on('data')` to capture the first chunk for on-first-chunk validation,
  - creates a write stream to a directory derived from `BASE_UPLOAD_DIR` and `fileInput.model`,
  - pipes the readStream into the write stream and listens for `finish`/`error` to resolve or cancel.
- `filesLimit` and `fieldsLimit` — used to reject requests that exceed allowed counts (the strategy triggers an error handler or cancels the upload).
- `error` — if Busboy emits an error the strategy cancels ongoing file writes and rejects the operation.
- `finish` — fired when Busboy completes parsing; the strategy then finalizes state and invokes any final callback.

Validation and first-chunk logic:

- The strategy relies on `UploaderValidationService.onFirstChunkValidator` passed from the service. That callback receives the `fileInput`, `metadata`, and the first `chunk` buffer.
- The callback examines metadata.mimeType against allowed `acceptedFormats`, uses `fileTypeFromBuffer` or similar to detect actual MIME and throw `AppHttpException` if mismatched.

Cancellation and cleanup:

- If validation fails, busboy `error` fires or the strategy calls `cancelFileUpload(fileResources)` to close write streams and unlink partially written files.
- The strategy's `cancelFileUpload` iterates created `LocalFileResource` objects, closes write streams, and removes incomplete files from disk.

Streaming to clients:

- `streamFile(model, filename, res)` resolves the file path and pipes an `fs.createReadStream` to the Express `Response` with appropriate headers (content-type, content-length when available).

Deletion:

- `deleteFiles(filesToDelete)` maps each `{ model, filename }` to the absolute path under the `storage` directory and uses `fs.unlink` to remove files. Errors are handled per-file (strategy implementation detail).

Observability and errors:

- The strategy should log I/O errors and handle `ENOENT` when reading/deleting missing files; current code uses thrown errors to bubble to callers.

Testing notes (local):

- Unit tests can mock `busboy` and simulate the `file` event by piping a readable stream into the handler and asserting that `callBack` is invoked with correct metadata and final size.
- For streamFile tests, create a temporary file under the test storage directory and assert the response receives expected bytes and headers.

## Strategy deep-dive — UploaderS3Strategy (detailed)

Location: `src/modules/core/media/strategies/s3.strategy.ts`

Construction and configuration:

- The strategy constructs an AWS `S3Client` in the constructor using `ConfigService.getOrThrow` to read `AWS_REGION`, `AWS_ACCESS_KEY`, and `AWS_SECRET_ACCESS_KEY`.
- It also reads `AWS_S3_BUCKET` as the bucket name used for uploads and streaming.

Upload lifecycle (observed pattern):

- The strategy listens for Busboy `file` event and uses the incoming `Readable` stream to upload to S3. Common implementations use an S3 multipart upload or `PutObjectCommand` with a streaming body.
- It creates an intermediate `PassThrough` stream or uses the readStream directly as the `Body` for the S3 upload command; it also tracks `sizeInBytes` as data flows.
- The strategy passes the same `onFirstChunkValidator` callback early with the first chunk buffer to ensure validation before the upload proceeds.
- After the upload completes, the strategy calls the provided `callBack(metadata, sizeInBytes, saveName)` to persist file metadata.

Cancellation and abort:

- If the client aborts the request or validation fails, the strategy calls `cancelFileUpload(fileResources)` which should abort the S3 upload (using abort controllers or multipart upload abort commands) and cleanup any partial uploads.

Streaming to clients:

- `streamFile(model, filename, res)` uses S3 `GetObjectCommand` (or `getObject` in higher-level SDKs) to obtain a readable stream from S3 and pipes it to `res`. It sets content-type header based on the object's metadata.

Deletion:

- `deleteFiles(filesToDelete)` maps to `DeleteObjectsCommand` for the configured bucket with the keys derived from model + filename.

Observability and errors:

- The strategy should translate S3 errors (e.g., 404 NotFound) to application-specific errors; in the code it throws and lets upper layers handle it.

Env vars referenced:

- `AWS_REGION`, `AWS_ACCESS_KEY`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET` — required for S3 strategy to operate.

Testing notes (S3):

- Unit tests should mock the `S3Client` (or inject a fake client) and assert `PutObjectCommand`/`Upload` and `GetObjectCommand` interactions.
- Integration tests can use localstack to run a local S3-compatible service and validate end-to-end upload/stream/delete behavior.
