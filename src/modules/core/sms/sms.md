## SMS Module (Core)

This document describes the core SMS module used by the application. It covers architecture, the main source files, runtime flow, configuration and secrets, usage examples, extension points, testing guidance, and known TODOs.

## Purpose

The SMS module provides an asynchronous, pluggable mechanism for sending SMS messages from the application. It queues outgoing messages using BullMQ and processes them with a rate-limited worker. Strategies allow swapping the underlying transport (e.g., Twilio, AWS SNS) without changing business code.

## Key files

- `src/modules/core/sms/sms.module.ts`
  - Nest module that registers the `sms-queue` with BullMQ and provides module-level providers (`SmsProcessor`, `SmsService`, `TwilioStrategy`, `SnsStrategy`).
- `src/modules/core/sms/services/sms.service.ts`
  - Public API used by other modules to enqueue SMS send requests. Exposes `sendSms` and `sendLocalizedSms`.
- `src/modules/core/sms/processors/sms.processor.ts`
  - BullMQ worker (`WorkerHost`) that processes queued messages and dispatches them to a concrete `SmsStrategy`.
- `src/modules/core/sms/interfaces/sms-strategy.interface.ts`
  - The `SmsStrategy` interface that all concrete transport strategies must implement: `sendSMS(to: string, body: string): Promise<any>`.
- `src/modules/core/sms/strategies/twilio.strategy.ts`
  - Twilio transport strategy (not shown here). The `SmsProcessor` currently injects `TwilioStrategy` as the implementation used by the worker.
- `src/modules/core/sms/strategies/sns.strategy.ts`
  - AWS SNS transport strategy. Note: its `sendSMS` method currently contains a TODO placeholder; see "Known TODOs" below.
- `src/modules/core/sms/enum/sms-message.enum.ts`
  - Predefined message keys used by `sendLocalizedSms`.

## High-level architecture & flow

1. Application code calls `SmsService.sendSms(to, body)` or `SmsService.sendLocalizedSms(to, messageEnum, context, lang)`.
2. `sendLocalizedSms` uses `AppHelperService.localize` to build a localized message string, then delegates to `sendSms`.
3. `sendSms` checks `AppConfig.allowSms`. If SMS sending is disabled, an `AppHttpException` is thrown.
4. If allowed, `sendSms` adds a job named `send-sms` to the BullMQ queue `sms-queue` with payload `{ to, body }`.
5. `SmsProcessor` (a `WorkerHost`) consumes jobs from `sms-queue`. It is configured with a limiter `{ duration: 3000, max: 10 }` which throttles processing to at most 10 jobs per 3 seconds.
6. For each job, `SmsProcessor.process` calls the injected `SmsStrategy.sendSMS(to, body)` to perform the actual delivery.
7. Transport-specific strategies (e.g., `TwilioStrategy`, `SnsStrategy`) implement the low-level API calls and error mapping.

## Components explained

### SmsModule

Registers the queue and provides relevant providers. By default both `TwilioStrategy` and `SnsStrategy` are registered as providers, and `SmsProcessor` currently injects `TwilioStrategy` explicitly.

### SmsService

- Methods
  - `sendSms(to: string, body: string)`
    - Validates that SMS is enabled via `AppConfig.allowSms`.
    - Adds a `send-sms` job to the `sms-queue` with the message payload.
  - `sendLocalizedSms(to: string, message: SmsMessageEnum, context: {}, lang: LangEnum)`
    - Calls `AppHelperService.localize('sms.' + message, context, lang)` to build a localized body.
    - Calls `sendSms` with the resolved string.

Notes:

- `AppConfig.allowSms` is a runtime feature toggle. When false, `sendSms` throws `AppHttpException` with `ErrorCodeEnum.NOT_IMPLEMENTED`.
- Jobs are fire-and-forget: `sendSms` does not return delivery results, only enqueues work.

### SmsProcessor

This is a rate-limited worker that executes queued jobs. It expects an injected `SmsStrategy` and delegates delivery to it. The processor logs errors and rethrows them so BullMQ can apply retry/backoff behavior configured by the queue (or defaults).

Important: currently `SmsProcessor` injects `TwilioStrategy` specifically. If you want to switch to another strategy at runtime or via configuration, consider injecting a token (for example a provider named `SMS_STRATEGY`) and using a conditional provider in `SmsModule`.

### SmsStrategy interface

Any transport should implement the `sendSMS(to: string, body: string): Promise<any>` method and should throw an error or reject the promise on failures. Implementations should:

- Validate destination phone numbers and message length where appropriate.
- Map transport-specific errors to meaningful exceptions or include enough context for the caller to diagnose issues.

## Configuration & environment variables

## Code-focused explanation of the SMS module (current implementation)

This file documents what the code in `src/modules/core/sms` currently does. The text below only explains the existing code and does not provide recommendations.

### Files and responsibilities (concise)

- `sms.module.ts` — Defines a Nest module that imports a BullMQ queue registration for `sms-queue`. It registers `SmsProcessor`, `SmsService`, `TwilioStrategy`, and `SnsStrategy` as providers and exports `SmsService`.

- `services/sms.service.ts` — Exposes two methods:
  - `sendSms(to: string, body: string)`
    - Throws `AppHttpException(ErrorCodeEnum.NOT_IMPLEMENTED)` if `AppConfig.allowSms` is falsy.
    - Calls `this.smsQueue.add('send-sms', { to, body })` to enqueue a job.
  - `sendLocalizedSms(to: string, message: SmsMessageEnum, context: {}, lang: LangEnum = AppConfig.defaultLang)`
    - Calls `this.appHelperServer.localize('sms.' + message, context, lang)` to compute `body`.
    - Calls `sendSms(to, body)` to enqueue the job.

- `processors/sms.processor.ts` — A class decorated with `@Processor('sms-queue', { limiter: { duration: 3000, max: 10 } })` that extends `WorkerHost`.
  - The constructor injects `TwilioStrategy` (typed as `SmsStrategy`) and stores it as `smsStrategy`.
  - `process(job: Job)` extracts `job.data.to` and `job.data.body` and calls `this.smsStrategy.sendSMS(to, body)` inside a try/catch. If an error occurs it logs via `Logger.error(err)` and rethrows the error.

- `interfaces/sms-strategy.interface.ts` — Exports an interface: `sendSMS(to: string, body: string): Promise<any>`.

- `strategies/sns.strategy.ts` — An `@Injectable()` class that implements `SmsStrategy`.
  - The constructor creates an AWS `SNSClient` using `ConfigService.getOrThrow('AWS_REGION')` and credentials from `AWS_ACCESS_KEY` and `AWS_SECRET_ACCESS_KEY`.
  - `sendSMS(to: string, body: string)` is present but contains a TODO placeholder in the current file.

- `enum/sms-message.enum.ts` — Defines message keys (e.g., `HELLO_MESSAGE`, `PHONE_VERIFICATION_CODE`, `RESET_PASSWORD_CODE`, `LOGIN_VERIFICATION_CODE`, `UPDATE_PHONE_NUMBER`) used by `sendLocalizedSms`.

### Runtime flow (step-by-step)

1. A caller invokes `SmsService.sendSms` or `SmsService.sendLocalizedSms`.
2. `sendLocalizedSms` calls `AppHelperService.localize` to build a message body and delegates to `sendSms`.
3. `sendSms` checks `AppConfig.allowSms`. If falsy it throws an `AppHttpException` with `ErrorCodeEnum.NOT_IMPLEMENTED` and a message string.
4. If `AppConfig.allowSms` is truthy, `sendSms` calls `this.smsQueue.add('send-sms', { to, body })`.
5. `SmsProcessor` consumes jobs from `sms-queue`. The `@Processor` decorator registers a limiter `{ duration: 3000, max: 10 }`.
6. For each job, `SmsProcessor.process` calls `this.smsStrategy.sendSMS(job.data.to, job.data.body)` and rethrows any caught error (after logging) so BullMQ can handle retries.

### Dependency wiring in current code

- `SmsModule` registers the queue via `BullModule.registerQueue({ name: 'sms-queue' })` and provides `SmsProcessor`, `SmsService`, `TwilioStrategy`, and `SnsStrategy`.
- `SmsService` receives the queue via `@InjectQueue('sms-queue')` and receives `AppHelperService` as a dependency.
- `SmsProcessor` injects `TwilioStrategy` explicitly:
  - `constructor(@Inject(TwilioStrategy) private readonly smsStrategy: SmsStrategy) { super(); }`

### Error handling behavior

- `SmsService.sendSms` throws an `AppHttpException` immediately when `AppConfig.allowSms` is falsy; it does not enqueue the job in that case.
- `SmsProcessor.process` logs errors via `Logger.error(err)` and rethrows them. Rethrowing allows BullMQ's retry/backoff mechanisms (if configured on the queue) to take effect.

### Configuration values used by files shown

- `AppConfig.allowSms` — feature toggle referenced by `SmsService`.
- `AppConfig.defaultLang` — default language used by `sendLocalizedSms` when `lang` is not provided.
- `ConfigService.getOrThrow('AWS_REGION')`, `ConfigService.getOrThrow('AWS_ACCESS_KEY')`, and `ConfigService.getOrThrow('AWS_SECRET_ACCESS_KEY')` — used by `SnsStrategy` to instantiate `SNSClient`.

### Concrete code references

- `sms.module.ts` registers the queue, providers and exports `SmsService`.
- `sms.service.ts` contains the `sendSms` and `sendLocalizedSms` methods and enqueues jobs via `this.smsQueue.add('send-sms', { to, body })`.
- `sms.processor.ts` is decorated with `@Processor('sms-queue', { limiter: { duration: 3000, max: 10 } })` and calls `this.smsStrategy.sendSMS(to, body)` in `process`.
- `sns.strategy.ts`'s constructor configures `SNSClient` with `region` and `credentials` using `ConfigService.getOrThrow(...)`; `sendSMS` is unimplemented in the current file.

### Message keys

- `SmsMessageEnum` lists the keys expected by `AppHelperService.localize` when `sendLocalizedSms` is called.

### Observability points in the existing code

- `SmsProcessor` uses `Logger.error(err)` when a strategy call fails; `SmsService` throws an exception when the feature toggle is off.

### Final note

This text only describes the current code and how the pieces interact. It does not include recommendations or proposed changes.
