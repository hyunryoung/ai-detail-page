/**
 * GEditor Clone - HTML Export Service
 */

import { store } from '../core/state.js';
import { blockRegistry } from '../editor/block-registry.js';
import { eventBus, Events } from '../core/events.js';

class ExportService {
  constructor() {
    // Export configuration
    this.config = {
      includeStyles: true,
      minify: false,
      responsive: true
    };
  }

  /**
   * Generate standalone HTML file content
   * @returns {string} HTML string
   */
  generateHTML() {
    const project = store.get('project');
    const blocks = store.getBlocks();
    const theme = store.get('theme');

    // Generate block HTML
    const blocksHtml = blocks.map(block => {
      const config = blockRegistry.get(block.type);
      if (config && config.render) {
        // Remove data-block-id and toolbar from exported HTML
        let html = config.render(block);
        html = html.replace(/data-block-id="[^"]*"/g, '');
        return html;
      }
      return '';
    }).join('\n');

    // Generate CSS
    const css = this._generateCSS(theme);

    // Generate full HTML document
    const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.name || '상세페이지'}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200">
  <style>
${css}
  </style>
</head>
<body>
  <div class="page-container">
${blocksHtml}
  </div>
</body>
</html>`;

    return html;
  }

  /**
   * Generate CSS styles
   * @private
   */
  _generateCSS(theme) {
    return `
    /* Reset & Base */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: ${theme.textColor || '#1a202c'};
      background: ${theme.backgroundColor || '#ffffff'};
      -webkit-font-smoothing: antialiased;
    }

    img {
      max-width: 100%;
      height: auto;
      display: block;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    /* Page Container */
    .page-container {
      max-width: 860px;
      margin: 0 auto;
      background: #ffffff;
    }

    /* Button */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 24px;
      font-size: 14px;
      font-weight: 500;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
    }

    .btn-primary {
      background: ${theme.primaryColor || '#4A90E2'};
      color: #ffffff;
      border: none;
    }

    .btn-primary:hover {
      opacity: 0.9;
    }

    /* Hero Block */
    .block-hero {
      position: relative;
      min-height: 300px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 60px 40px;
      background-size: cover;
      background-position: center;
    }

    .block-hero-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
    }

    .block-hero-content {
      position: relative;
      z-index: 1;
      max-width: 600px;
    }

    .block-hero h1 {
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 16px;
      line-height: 1.3;
    }

    .block-hero p {
      font-size: 18px;
      margin-bottom: 24px;
      opacity: 0.9;
    }

    /* Text Block */
    .block-text {
      padding: 20px 40px;
    }

    .block-text h1, .block-text h2, .block-text h3 {
      margin-bottom: 16px;
    }

    .block-text p {
      line-height: 1.8;
    }

    /* Image Block */
    .block-image {
      padding: 20px 0;
      text-align: center;
    }

    .block-image img {
      margin: 0 auto;
    }

    /* Divider Block */
    .block-divider {
      padding: 30px 40px;
    }

    .block-divider hr {
      border: none;
      height: 1px;
      background: #e2e8f0;
    }

    /* Spacer Block */
    .block-spacer {
      height: 60px;
    }

    /* Button Block */
    .block-button {
      padding: 20px 40px;
      text-align: center;
    }

    /* Video Block */
    .block-video {
      position: relative;
      padding-bottom: 56.25%;
      height: 0;
      overflow: hidden;
    }

    .block-video iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
    }

    /* Gallery Block */
    .block-gallery {
      display: grid;
      gap: 8px;
      padding: 20px;
    }

    .block-gallery-item {
      aspect-ratio: 1;
      overflow: hidden;
    }

    .block-gallery-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* Quote Block */
    .block-quote {
      padding: 20px 40px;
      border-left: 4px solid ${theme.primaryColor || '#4A90E2'};
      background: #f8fafc;
    }

    .block-quote blockquote {
      font-size: 18px;
      font-style: italic;
      margin-bottom: 8px;
    }

    .block-quote cite {
      font-size: 14px;
      color: #718096;
    }

    /* List Block */
    .block-list {
      padding: 20px 40px;
    }

    .block-list ul, .block-list ol {
      padding-left: 24px;
    }

    .block-list li {
      margin-bottom: 8px;
    }

    /* Social Block */
    .block-social {
      display: flex;
      justify-content: center;
      gap: 16px;
      padding: 30px;
    }

    .block-social a {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f3f4f6;
      border-radius: 50%;
      transition: all 0.2s ease;
    }

    .block-social a:hover {
      background: ${theme.primaryColor || '#4A90E2'};
      color: #ffffff;
    }

    .block-social svg {
      width: 20px;
      height: 20px;
    }

    /* Map Block */
    .block-map {
      min-height: 300px;
    }

    .block-map iframe {
      width: 100%;
      height: 100%;
      min-height: 300px;
      border: none;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .page-container {
        max-width: 100%;
      }

      .block-hero {
        padding: 40px 20px;
      }

      .block-hero h1 {
        font-size: 28px;
      }

      .block-hero p {
        font-size: 16px;
      }

      .block-text,
      .block-divider,
      .block-button,
      .block-list,
      .block-quote {
        padding-left: 20px;
        padding-right: 20px;
      }
    }
    `;
  }

  /**
   * Download HTML file
   */
  download() {
    const html = this.generateHTML();
    const project = store.get('project');
    const filename = `${project.name || 'export'}.html`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    eventBus.emit(Events.PROJECT_EXPORT, { filename });
    eventBus.emit(Events.TOAST_SHOW, {
      type: 'success',
      message: `${filename} 다운로드 완료`
    });
  }

  /**
   * Open HTML in new tab for preview
   */
  preview() {
    const html = this.generateHTML();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    window.open(url, '_blank');

    // Clean up after a delay
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
}

// Export singleton
export const exportService = new ExportService();

export default exportService;
