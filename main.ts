/**
 * Shader Collection Entry Point
 *
 * Loads a shader from the shaders/ folder based on the SHADER_NAME env variable
 * or URL parameter (?shader=name).
 *
 * Supports both single-view and multi-view shader projects.
 */

import {
  mount,
  loadDemo,
  isMultiViewConfig,
} from 'shader-sandbox';
import type {
  ProjectConfig,
  MultiViewConfig,
  MultiViewProject,
  ShaderProject,
  DemoScriptHooks,
} from 'shader-sandbox';

interface PatchStyle {
  left?: string;
  top?: string;
  width?: string;
  height?: string;
}

interface DropdownSpec {
  uniform: string;
  label: string;
  options: string[];
  value: number;
}

interface TextInputSpec {
  id: string;
  label: string;
  default?: string;
}

interface ButtonSpec {
  label: string;
  action: string;
}

interface BufferedMultiViewResult {
  project: MultiViewProject;
  patch: PatchStyle | null;
  dropdowns: DropdownSpec[];
}

// Load a multi-view project whose views are full sub-project folders (each with buffers).
// Returns null if the config is not a buffered multi-view project.
async function tryLoadBufferedMultiView(
  shaderName: string,
  glslFiles: Record<string, () => Promise<string>>,
  jsonFiles: Record<string, () => Promise<ProjectConfig | MultiViewConfig>>,
  imageFiles: Record<string, () => Promise<string>>,
  scriptFiles: Record<string, () => Promise<any>>,
): Promise<BufferedMultiViewResult | null> {
  const configPath = `./shaders/${shaderName}/config.json`;
  if (!(configPath in jsonFiles)) return null;

  const config = await jsonFiles[configPath]();
  if (!isMultiViewConfig(config)) return null;

  // Only take this path when views are sub-project folders with their own config.json
  const isSubProject = (v: string) => `./shaders/${v}/config.json` in jsonFiles;
  if (!config.views.some(isSubProject)) return null;

  // Load each sub-project as a full ShaderProject (buffers and all)
  const viewProjects = await Promise.all(
    config.views.map(v => loadDemo(`shaders/${v}`, glslFiles, jsonFiles, imageFiles, scriptFiles))
  ) as ShaderProject[];

  // Load this folder's script.js
  let script: DemoScriptHooks | null = null;
  const scriptPath = `./shaders/${shaderName}/script.js`;
  if (scriptPath in scriptFiles) {
    const mod = await scriptFiles[scriptPath]();
    const hooks: DemoScriptHooks = {};
    if (typeof mod.setup === 'function') hooks.setup = mod.setup;
    if (typeof mod.onFrame === 'function') hooks.onFrame = mod.onFrame;
    if (hooks.setup || hooks.onFrame) script = hooks;
  }

  // Load this folder's common.glsl
  const commonPath = `./shaders/${shaderName}/common.glsl`;
  const commonSource = commonPath in glslFiles ? await glslFiles[commonPath]() : null;

  // Merge uniforms: sub-project defaults overridden by combined config
  const mergedUniforms = Object.assign(
    {},
    ...viewProjects.map(p => p.uniforms),
    config.uniforms ?? {},
  );

  return {
    project: {
      mode: 'standard',
      root: `./shaders/${shaderName}`,
      meta: {
        title: config.title ?? shaderName,
        author: (config as any).author ?? null,
        description: (config as any).description ?? null,
      },
      theme: config.theme ?? 'light',
      controls: config.controls ?? true,
      startPaused: config.startPaused ?? false,
      pixelRatio: config.pixelRatio ?? null,
      commonSource,
      uniforms: mergedUniforms,
      textures: viewProjects.flatMap(p => p.textures),
      script,
      views: config.views.map((name, i) => ({
        name,
        passes: viewProjects[i].passes,
      })),
      viewLayout: config.layout ?? 'split',
    },
    patch: (config as any).patch ?? null,
    dropdowns: Object.entries(mergedUniforms)
      .filter(([, def]) => Array.isArray((def as any).options))
      .map(([name, def]) => ({
        uniform: name,
        label: (def as any).label ?? name,
        options: (def as any).options as string[],
        value: (def as any).value ?? 0,
      })),
  };
}

function injectDropdowns(
  mountTarget: HTMLElement,
  dropdowns: DropdownSpec[],
  handle: ReturnType<typeof mount>,
): void {
  // The uniforms panel may not be open yet, but the DOM elements exist.
  // Poll briefly for the list container since UniformControls renders synchronously.
  const list = mountTarget.querySelector('.uniform-controls-list');
  if (!list) return;

  for (const dd of dropdowns) {
    const wrapper = document.createElement('div');
    wrapper.className = 'uniform-control uniform-control-select';

    const labelRow = document.createElement('div');
    labelRow.className = 'uniform-control-label-row';
    const labelEl = document.createElement('label');
    labelEl.className = 'uniform-control-label';
    labelEl.textContent = dd.label;
    labelRow.appendChild(labelEl);
    wrapper.appendChild(labelRow);

    const sel = document.createElement('select');
    sel.style.cssText = [
      'width:100%',
      'background:var(--bg-tertiary)',
      'color:var(--text-primary)',
      'border:1px solid var(--border-primary)',
      'border-radius:4px',
      'padding:4px 8px',
      'font-family:var(--font-mono)',
      'font-size:12px',
      'cursor:pointer',
      'outline:none',
    ].join(';');
    dd.options.forEach((opt, i) => {
      const option = document.createElement('option');
      option.value = String(i);
      option.textContent = opt;
      if (i === dd.value) option.selected = true;
      sel.appendChild(option);
    });
    sel.addEventListener('change', () => handle.setUniform(dd.uniform, parseInt(sel.value)));
    wrapper.appendChild(sel);

    list.appendChild(wrapper);
  }
}

function injectTextInputsAndButtons(
  mountTarget: HTMLElement,
  textInputs: TextInputSpec[],
  buttons: ButtonSpec[],
  scriptMod: any,
  handle: ReturnType<typeof mount>,
): void {
  const list = mountTarget.querySelector('.uniform-controls-list');
  if (!list) return;

  const inputValues: Record<string, string> = {};

  for (const spec of textInputs) {
    inputValues[spec.id] = spec.default ?? '';

    const wrapper = document.createElement('div');
    wrapper.className = 'uniform-control';

    const labelRow = document.createElement('div');
    labelRow.className = 'uniform-control-label-row';
    const labelEl = document.createElement('label');
    labelEl.className = 'uniform-control-label';
    labelEl.textContent = spec.label;
    labelRow.appendChild(labelEl);
    wrapper.appendChild(labelRow);

    const input = document.createElement('input');
    input.type = 'text';
    input.value = spec.default ?? '';
    input.style.cssText = [
      'width:100%',
      'background:var(--bg-tertiary)',
      'color:var(--text-primary)',
      'border:1px solid var(--border-primary)',
      'border-radius:4px',
      'padding:4px 8px',
      'font-family:var(--font-mono)',
      'font-size:12px',
      'outline:none',
      'box-sizing:border-box',
    ].join(';');
    input.addEventListener('input', () => { inputValues[spec.id] = input.value; });
    wrapper.appendChild(input);
    list.appendChild(wrapper);
  }

  for (const spec of buttons) {
    const wrapper = document.createElement('div');
    wrapper.className = 'uniform-control';

    const btn = document.createElement('button');
    btn.textContent = spec.label;
    btn.style.cssText = [
      'width:100%',
      'background:var(--bg-tertiary)',
      'color:var(--text-primary)',
      'border:1px solid var(--border-primary)',
      'border-radius:4px',
      'padding:6px 8px',
      'font-family:var(--font-mono)',
      'font-size:12px',
      'cursor:pointer',
    ].join(';');
    btn.addEventListener('click', () => {
      if (scriptMod && typeof scriptMod[spec.action] === 'function') {
        scriptMod[spec.action]({ ...inputValues }, handle);
      }
    });
    wrapper.appendChild(btn);
    list.appendChild(wrapper);
  }
}

// Get shader name from env (set by dev script) or URL param
function getShaderName(): string {
  // Check URL parameter first
  const urlParams = new URLSearchParams(window.location.search);
  const urlShader = urlParams.get('shader');
  if (urlShader) return urlShader;

  // Fall back to env variable (set by vite define)
  // @ts-ignore
  return typeof __SHADER_NAME__ !== 'undefined' ? __SHADER_NAME__ : 'simple';
}

async function main() {
  try {
    const shaderName = getShaderName();

    // Gallery mode: show all shaders as a grid
    if (shaderName === '__gallery__') {
      await initGallery();
      return;
    }

    console.log(`Loading shader: ${shaderName}`);

    // Load shaders using Vite's import.meta.glob
    const glslFiles = import.meta.glob<string>('./shaders/**/*.glsl', {
      query: '?raw',
      import: 'default',
    });

    const jsonFiles = import.meta.glob<ProjectConfig>('./shaders/**/*.json', {
      import: 'default',
    });

    const imageFiles = import.meta.glob<string>('./shaders/**/*.{jpg,jpeg,png,gif,webp,bmp}', {
      query: '?url',
      import: 'default',
    });

    // Script files (script.js hooks for JS-driven computation)
    const scriptFiles = import.meta.glob<any>('./shaders/**/script.js');

    // Get root container
    const rootContainer = document.getElementById('app');
    if (!rootContainer) {
      throw new Error('Container element #app not found');
    }

    // Load the specific shader project
    const buffered = await tryLoadBufferedMultiView(shaderName, glslFiles, jsonFiles, imageFiles, scriptFiles);
    const project = buffered
      ? buffered.project
      : await loadDemo(`shaders/${shaderName}`, glslFiles, jsonFiles, imageFiles, scriptFiles);

    // Load raw config and script module for UI extras (text inputs, buttons)
    const configPath = `./shaders/${shaderName}/config.json`;
    const rawConfig = configPath in jsonFiles ? await (jsonFiles as any)[configPath]() : null;
    const scriptModPath = `./shaders/${shaderName}/script.js`;
    const scriptMod = scriptModPath in scriptFiles ? await scriptFiles[scriptModPath]() : null;

    // Create a patch sub-container if specified, otherwise use the full root
    let mountTarget = rootContainer;
    if (buffered?.patch) {
      const p = buffered.patch;
      const patch = document.createElement('div');
      patch.style.position = 'absolute';
      if (p.left   !== undefined) patch.style.left   = p.left;
      if (p.top    !== undefined) patch.style.top    = p.top;
      if (p.width  !== undefined) patch.style.width  = p.width;
      if (p.height !== undefined) patch.style.height = p.height;
      rootContainer.appendChild(patch);
      mountTarget = patch;
    }

    // Mount the shader — handles layout, wiring, and start
    const handle = mount(mountTarget, { project });

    // Inject dropdown controls for any uniform that specifies options
    const dropdowns: DropdownSpec[] = Object.entries(project.uniforms ?? {})
      .filter(([, def]) => Array.isArray((def as any).options))
      .map(([name, def]) => ({
        uniform: name,
        label: (def as any).label ?? name,
        options: (def as any).options as string[],
        value: (def as any).value ?? 0,
      }));
    if (dropdowns.length) {
      injectDropdowns(mountTarget, dropdowns, handle);
    }

    // Inject text inputs and buttons from config
    const textInputs: TextInputSpec[] = (rawConfig as any)?.textInputs ?? [];
    const buttons: ButtonSpec[]       = (rawConfig as any)?.buttons ?? [];
    if (textInputs.length || buttons.length) {
      injectTextInputsAndButtons(mountTarget, textInputs, buttons, scriptMod, handle);
    }

    // Expose for debugging
    (window as any).app = handle;

  } catch (error) {
    console.error('Failed to initialize:', error);
    const container = document.getElementById('app');
    if (container) {
      container.innerHTML = `
        <div style="color: red; padding: 20px; font-family: monospace;">
          <h2>Error</h2>
          <pre>${error instanceof Error ? error.message : String(error)}</pre>
        </div>
      `;
    }
  }
}

/**
 * Initialize the shader gallery page.
 * Discovers all shaders via import.meta.glob and renders a card grid.
 */
async function initGallery() {
  const configModules = import.meta.glob<any>('./shaders/*/config.json', { import: 'default' });

  const rootContainer = document.getElementById('app');
  if (!rootContainer) return;

  // Collect shader info
  const cards: Array<{ name: string; title: string; description: string }> = [];
  for (const [path, loader] of Object.entries(configModules)) {
    // path looks like './shaders/my-shader/config.json'
    const match = path.match(/\.\/shaders\/([^/]+)\/config\.json$/);
    if (!match) continue;
    const name = match[1];
    let title = name;
    let description = '';
    try {
      const config = await loader();
      if (config?.meta?.title) title = config.meta.title;
      if (config?.meta?.description) description = config.meta.description;
    } catch {}
    cards.push({ name, title, description });
  }

  cards.sort((a, b) => a.name.localeCompare(b.name));

  rootContainer.innerHTML = `
    <style>
      body { background: #0a0a0f; margin: 0; }
      .gallery-container {
        min-height: 100vh;
        padding: 60px 40px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        color: #e0e0e0;
      }
      .gallery-title {
        text-align: center;
        font-size: 28px;
        font-weight: 600;
        margin-bottom: 40px;
        color: #fff;
        letter-spacing: -0.5px;
      }
      .gallery-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 20px;
        max-width: 1200px;
        margin: 0 auto;
      }
      .gallery-card {
        background: rgba(30, 30, 40, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 10px;
        padding: 24px;
        text-decoration: none;
        color: inherit;
        transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
        backdrop-filter: blur(12px);
        cursor: pointer;
      }
      .gallery-card:hover {
        transform: translateY(-2px);
        border-color: rgba(100, 140, 255, 0.3);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      }
      .gallery-card-title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 6px;
        color: #fff;
      }
      .gallery-card-name {
        font-size: 12px;
        font-family: 'Monaco', 'Menlo', monospace;
        color: rgba(255, 255, 255, 0.4);
        margin-bottom: 8px;
      }
      .gallery-card-desc {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.6);
        line-height: 1.5;
      }
    </style>
    <div class="gallery-container">
      <h1 class="gallery-title">Shader Gallery</h1>
      <div class="gallery-grid">
        ${cards.map(c => `
          <a class="gallery-card" href="?shader=${c.name}">
            <div class="gallery-card-title">${c.title}</div>
            ${c.title !== c.name ? `<div class="gallery-card-name">${c.name}</div>` : ''}
            ${c.description ? `<div class="gallery-card-desc">${c.description}</div>` : ''}
          </a>
        `).join('')}
      </div>
    </div>
  `;
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
