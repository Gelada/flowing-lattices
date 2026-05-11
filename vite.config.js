import { defineConfig } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import fs from 'fs';
import path from 'path';

function glslIncludePlugin() {
  return {
    name: 'glsl-include',
    enforce: 'pre',
    load(id) {
      if (!id.includes('?raw')) return null;
      const cleanId = id.replace(/\?.*$/, '');
      if (!cleanId.endsWith('.glsl')) return null;
      if (!fs.existsSync(cleanId)) return null;

      const self = this;
      const processIncludes = (src, filePath) => {
        return src.replace(/^#include\s+"([^"]+)"/gm, (_, includePath) => {
          const absPath = path.resolve(path.dirname(filePath), includePath);
          self.addWatchFile(absPath);
          return processIncludes(fs.readFileSync(absPath, 'utf-8'), absPath);
        });
      };

      const processed = processIncludes(fs.readFileSync(cleanId, 'utf-8'), cleanId);
      return `export default ${JSON.stringify(processed)}`;
    },
  };
}

// Get shader name from command line args or env
const shaderName = process.env.SHADER_NAME || 'simple';

// When building via `shader build`, the CLI generates _build-entry.js with
// shader-specific glob imports. We build it as a standalone ES module that
// exports mount(). In dev mode, index.html + main.ts is used as normal.
const useBuildEntry = !!process.env.SHADER_BUILD_ENTRY;

export default defineConfig({
  plugins: [
    glslIncludePlugin(),
    cssInjectedByJsPlugin(),
  ],
  base: './',
  define: {
    __SHADER_NAME__: JSON.stringify(shaderName),
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: `dist/${shaderName}`,
    ...(useBuildEntry ? {
      lib: {
        entry: './_build-entry.js',
        formats: ['es'],
        fileName: () => 'main.js',
      },
    } : {}),
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || '';
          if (/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(name)) {
            return 'assets/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
});
