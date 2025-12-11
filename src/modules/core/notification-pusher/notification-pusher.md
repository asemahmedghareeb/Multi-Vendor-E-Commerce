## Notification Pusher — Developer guide

A concise, developer-facing document describing the Notification Pusher module located at `src/modules/core/notification-pusher`.

## What this module does

The Notification Pusher module enqueues and processes push notification jobs. It exposes a service that other parts of the application can call to enqueue notifications; a BullMQ-backed worker processes those jobs and calls a concrete push strategy (currently Firebase Cloud Messaging via `FcmStrategy`).

## Public API (service)

`NotificationPusherService` is the module's public surface exported for use by other modules.

- sendNotification(token: string, title: string, body: string, data: {} = {})
  - Validates `AppConfig.allowNotificationPusher`. If the flag is falsy the method throws an `AppHttpException` with `ErrorCodeEnum.NOT_IMPLEMENTED`.
  - Enqueues a job named `send-notification` on the `notification-pusher-queue` with payload `{ token, title, body, data }`.

- sendLocalizedNotification(token: string, notification: NotificationEnum, context: {}, lang: LangEnum, data?: {})
  - Calls `AppHelperService.localize` to compute title and body using keys `notifications.<notification>.title` and `notifications.<notification>.body`.
  - Delegates to `sendNotification` with the computed title/body.

Example call (existing code pattern):

```ts
notificationPusherService.sendNotification(
  token,
  'Order ready',
  'Your order is ready for pickup',
  { orderId: '123' },
);

notificationPusherService.sendLocalizedNotification(
  token,
  NotificationEnum.WELCOME_NOTIFICATION,
  { name: 'Alice' },
  LangEnum.EN,
);
```

## Queue and processing

- The module registers a BullMQ queue named `notification-pusher-queue` in `NotificationPusherModule`.
- Jobs are enqueued using `notificationsQueue.add('send-notification', payload)`.
- `NotificationPusherProcessor` is a `WorkerHost` registered with `@Processor('notification-pusher-queue', { limiter: { duration: 3000, max: 10 } })`. This config imposes a limit of up to 10 jobs every 3 seconds at the worker level.
- When processing a job, `NotificationPusherProcessor.process(job)` calls the injected `NotificationPusherStrategy.sendNotification(job.data)` and rethrows errors after logging them with `Logger.error(err)`.

## Strategy implementation (Firebase)

- `FcmStrategy` implements `NotificationPusherStrategy`.
- On construction it initializes the Firebase Admin SDK once (checks `fireBaseAdmin.apps.length`) and uses `ConfigService` to read the service-account fields: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`.
- `sendNotification(payload: NotificationPayloadType)` constructs a `fireBaseAdmin.messaging.Message` object and calls `fireBaseAdmin.messaging().send(message)`. The payload shape is `{ token, title, body, data }`.

Note on initialization: the constructor guards against multiple `initializeApp` calls by checking `fireBaseAdmin.apps.length`.

## Types & enums used

- `NotificationPayloadType` (type): { token: string; title: string; body: string; data: {} }
- `NotificationPusherStrategy` (interface): `sendNotification(payload: NotificationPayloadType): Promise<any>`
- `NotificationEnum` (enum): currently contains `WELCOME_NOTIFICATION` (string key used by localization)

## Error handling and behavior

- If `AppConfig.allowNotificationPusher` is falsy, `NotificationPusherService.sendNotification` throws `AppHttpException` and no job is enqueued.
- During job processing, if the strategy throws, `NotificationPusherProcessor` logs the error and rethrows it, allowing the queue's retry/backoff behavior to be applied (if configured).

## Configuration values referenced by the code

- `AppConfig.allowNotificationPusher` — feature toggle checked by `NotificationPusherService`.
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` — read at runtime by `FcmStrategy` via `ConfigService` to create Firebase credentials.

## Observability in current code

- The processor logs errors using `Logger.error`.
- The service does not emit logs when enqueuing jobs in the current implementation.

## Quick internals reference (exact code locations)

- Module: `src/modules/core/notification-pusher/notification-pusher.module.ts`
- Service: `src/modules/core/notification-pusher/services/notification-pusher.service.ts`
- Processor: `src/modules/core/notification-pusher/processors/notification-pusher.processor.ts`
- Strategy: `src/modules/core/notification-pusher/strategies/fcm.strategy.ts`
- Types / interfaces / enums: `types/notification-payload.type.ts`, `interfaces/notification-pusher.strategy.ts`, `enums/notification.enum.ts`

## Testing notes (for reading current code)

- Unit tests for the service should mock `@InjectQueue('notification-pusher-queue')` and assert `add('send-notification', payload)` is called with the expected payload.
- Unit tests for the processor should mock `NotificationPusherStrategy` and verify `process(job)` calls `sendNotification(job.data)` and that thrown errors are propagated.

---

This document describes what the code does and where to look for the implementation. It is intentionally focused on the current code and behavior.
