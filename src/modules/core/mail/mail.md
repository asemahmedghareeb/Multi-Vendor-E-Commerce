## Mail module — code explanation

This file explains the current code in `src/modules/core/mail`. It only describes what the existing code does.

### Files and responsibilities

- `mail.module.ts`
  - Registers a BullMQ queue named `mail-queue`.
  - Provides `MailService`, `MailProcessor`, `MailAdapterService`, `NodemailerStrategy`, and `SesStrategy` as Nest providers.
  - Exports `MailService`.

- `services/mail.service.ts`
  - `sendEmailWithATemplate(to, subject, template, context, lang?)`
    - Throws `AppHttpException(ErrorCodeEnum.NOT_IMPLEMENTED)` if `AppConfig.allowMail` is falsy.
    - Calls `this.mailAdapter.compileTemplate(template, context, lang)` to get `html`.
    - Calls `this.appHelperService.localize('mail-subject.' + subject, context, lang)` to compute `subject` text.
    - Enqueues a job on `mail-queue` named `send-email` with payload `{ from, to, subject, html }` (typed as `Mail.Options`).
  - `sendEmailWithText(to, subject, text)`
    - Throws `AppHttpException(ErrorCodeEnum.NOT_IMPLEMENTED)` if `AppConfig.allowMail` is falsy.
    - Enqueues a `send-email` job with payload `{ from, to, subject, text }`.

- `services/mail-adapter.service.ts`
  - `compileTemplate(templateName: MailTemplateEnum, context: {}, lang: LangEnum = AppConfig.defaultLang)`
    - Constructs `templatePath` as `path.join(__dirname, '..', 'templates', lang, templateName)`.
    - Reads the template file synchronously (`fs.readFileSync(templatePath, 'utf-8')`).
    - Compiles the template using `Handlebars.compile(source)` and returns `template(context)` (rendered string).

- `processors/mail.processor.ts`
  - Decorated with `@Processor('mail-queue', { limiter: { duration: 3000, max: 10 } })`.
  - Constructor injects `NodemailerStrategy` via `@Inject(NodemailerStrategy)` and assigns it to `mailerService` typed as `MailerStrategy`.
  - `process(job: Job)` calls `this.mailerService.sendEmail(job.data)` inside a try/catch. On error it calls `Logger.error(err)` and rethrows the error.

- `strategies/nodemailer.strategy.ts`
  - Constructor calls `NodemailerTransportFactory()` to create a Nodemailer transporter.
  - `sendEmail(mailOptions: Mail)` calls `this.transporter.sendMail(mailOptions)`.

- `strategies/ses.strategy.ts`
  - Constructor creates an `SESClient` using `ConfigService.getOrThrow('AWS_REGION')`, `AWS_ACCESS_KEY`, and `AWS_SECRET_ACCESS_KEY` for credentials.
  - `fromEmail` is set to `AppConfig.AppEmail`.
  - `sendEmail(mailOptions: Mail)` constructs a `SendEmailCommand` with `Source`, `Destination.ToAddresses`, and `Message.Subject`/`Message.Body` populated from `mailOptions`. It then calls `this.sesClient.send(command)`.

- `templates/` directory
  - Contains Handlebars templates under language subfolders (e.g., `en/`, `ar/`) matching `MailTemplateEnum` filenames.

### Data shapes and types used

- `types/mail.type.ts` defines `Mail` as `{ from: string; to: string; subject: string; html?: string; text?: string }`.

### Configuration values referenced

- `AppConfig.allowMail` — checked in `MailService` methods.
- `AppConfig.AppName` and `AppConfig.AppEmail` — used to construct the `from` field when enqueuing mails.
- Nodemailer config: `NodeMailerOptions` references env vars such as `APP_EMAIL` and `GOOGLE_APP_PASSWORD` (in `src/config/node-mailer/node-mailer.options.ts`).
- SES config: `AWS_REGION`, `AWS_ACCESS_KEY`, `AWS_SECRET_ACCESS_KEY` (used in `SesStrategy` constructor via `ConfigService`).

### Runtime flow (concise)

1. `MailService` builds `Mail.Options` (from/template or text) and enqueues `send-email` on `mail-queue`.
2. `MailProcessor` receives the job and calls the injected `MailerStrategy.sendEmail(job.data)`.
3. `MailerStrategy` implementation (Nodemailer or SES) performs the transport-specific API call to send the message.

### Error handling in the existing code

- `MailService` throws `AppHttpException(ErrorCodeEnum.NOT_IMPLEMENTED)` when `AppConfig.allowMail` is falsy.
- `MailProcessor.process` logs errors with `Logger.error(err)` and rethrows the error.

### Where to find code

- Module: `src/modules/core/mail/mail.module.ts`
- Service: `src/modules/core/mail/services/mail.service.ts`
- Adapter: `src/modules/core/mail/services/mail-adapter.service.ts`
- Processor: `src/modules/core/mail/processors/mail.processor.ts`
- Strategies: `src/modules/core/mail/strategies/nodemailer.strategy.ts`, `src/modules/core/mail/strategies/ses.strategy.ts`
- Templates: `src/modules/core/mail/templates`
