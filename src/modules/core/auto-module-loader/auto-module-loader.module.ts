import { DynamicModule, Logger, Module } from '@nestjs/common';
import { glob } from 'glob';

// Function to dynamically load all modules in the project except for core modules and the main app module
async function loadModules(): Promise<DynamicModule[]> {
  try {
    // Use glob to find all module files in the project, excluding specified paths
    let files = await glob('**/*.module.{ts,js}', {
      ignore: [
        'node_modules/**',
        'src/app.module.ts',
        'dist/app.module.js',
        'src/modules/core/**',
        'dist/modules/core/**',
      ],
    });

    // Extract the relative paths of the modules for dynamic imports
    files = files.map(
      (e) =>
        e
          .split(e.includes('/') ? 'modules/' : 'modules\\')[1] // Handle both Unix and Windows path separators
          ?.replace(/\.(ts|js)$/, ''), // Remove the file extension
    );

    // Dynamically import each module file
    const imports = await Promise.all(
      files.map((file) => import('../../' + file)),
    );

    // Convert the imported modules into DynamicModule instances
    const dynamicModules = imports.map((mod) => {
      return Object.values(mod)[0] as DynamicModule;
    });

    // Log the number of modules successfully loaded
    Logger.log(`Loaded ${dynamicModules.length} modules `, 'Dynamic import');
    return dynamicModules;
  } catch (error) {
    // Log and rethrow any errors encountered during the module loading process
    Logger.error('Error loading modules:', error);
    throw error;
  }
}

@Module({})
export class AutoModuleLoaderModule {
  // Static method to register the dynamically loaded modules into the application
  static async register(): Promise<DynamicModule> {
    const modules = await loadModules(); // Load all eligible modules
    return {
      module: AutoModuleLoaderModule, // Define the current module
      imports: modules, // Include the dynamically loaded modules
    };
  }
}
