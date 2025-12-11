## Auto Module Loader — code explanation

## What does this do

At runtime this code scans the repository for files matching `**/*.module.ts` (excluding `node_modules`, the root `src/app.module.ts`, and `src/modules/core/**`), dynamically imports each matched module file, collects the first exported value from each import as a `DynamicModule`, and returns a `DynamicModule` that imports all collected modules via `AutoModuleLoaderModule.register()`.

The main job of this module is to discover and import application modules automatically so they do not need to be listed one-by-one in the application's module `imports`.

This file describes the current code in `src/modules/core/auto-module-loader`.

`auto-module-loader.module.ts` behavior

- The file defines an async helper `loadModules(): Promise<DynamicModule[]>` and a `AutoModuleLoaderModule` class with a static `register()` method.

loadModules()

- Uses `glob('**/*.module.ts', { ignore: ['node_modules/**', 'src/app.module.ts', 'src/modules/core/**'] })` to find module files in the project filesystem, excluding `node_modules`, the application's root `app.module.ts`, and any files under `src/modules/core`.
- Maps matched file paths to module import paths by splitting on `'modules/'` (with a fallback for Windows backslash) and removing the `.ts` extension.
- Dynamically imports each module file using `import('../../' + file)` and awaits all imports via `Promise.all`.
- Converts each imported module object into a `DynamicModule` by taking the first exported value `Object.values(mod)[0]` and casting it to `DynamicModule`.
- Logs the number of loaded modules using `Logger.log` and returns the array of `DynamicModule` instances.
- Wraps the logic in a try/catch: on error it logs via `Logger.error('Error loading modules:', error)` and rethrows the error.

`AutoModuleLoaderModule` class

- Exports a class `AutoModuleLoaderModule` annotated with `@Module({})`.
- Static method `register(): Promise<DynamicModule>`:
  - Calls `await loadModules()` to obtain dynamic modules.
  - Returns a `DynamicModule` object with `module: AutoModuleLoaderModule` and `imports: modules`.

Imports referenced

- `DynamicModule`, `Logger`, and `Module` from `@nestjs/common`.
- `glob` from the `glob` package.

Where to find code

- File: `src/modules/core/auto-module-loader/auto-module-loader.module.ts`
