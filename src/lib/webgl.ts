/**
 * WebGL Support Detection Utilities
 * Validates: Requirements 1.1, 9.6
 */

export interface WebGLCapabilities {
  supported: boolean;
  version: 1 | 2 | null;
  renderer: string | null;
  vendor: string | null;
  maxTextureSize: number | null;
}

/**
 * Detects WebGL support and capabilities
 */
export function detectWebGLSupport(): WebGLCapabilities {
  if (typeof window === 'undefined') {
    return {
      supported: false,
      version: null,
      renderer: null,
      vendor: null,
      maxTextureSize: null,
    };
  }

  const canvas = document.createElement('canvas');

  // Try WebGL 2 first
  let gl: WebGLRenderingContext | WebGL2RenderingContext | null =
    canvas.getContext('webgl2');
  let version: 1 | 2 | null = gl ? 2 : null;

  // Fallback to WebGL 1
  if (!gl) {
    gl =
      (canvas.getContext('webgl') as WebGLRenderingContext | null) ||
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
    version = gl ? 1 : null;
  }

  if (!gl) {
    return {
      supported: false,
      version: null,
      renderer: null,
      vendor: null,
      maxTextureSize: null,
    };
  }

  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');

  return {
    supported: true,
    version,
    renderer: debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      : null,
    vendor: debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
      : null,
    maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
  };
}

/**
 * Simple check for WebGL support
 */
export function isWebGLSupported(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    return !!(
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    );
  } catch {
    return false;
  }
}
