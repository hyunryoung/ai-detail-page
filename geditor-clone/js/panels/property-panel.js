/**
 * GEditor Clone - Property Panel
 * Dynamic property editor for selected blocks
 */

import { store } from '../core/state.js';
import { eventBus, Events } from '../core/events.js';
import { blockRegistry } from '../editor/block-registry.js';
import { debounce } from '../core/utils.js';

/**
 * Property definitions for each block type
 */
const propertyDefinitions = {
  hero: [
    {
      section: '콘텐츠',
      props: [
        { key: 'title', label: '제목', type: 'text' },
        { key: 'subtitle', label: '부제목', type: 'textarea' },
        { key: 'buttonText', label: '버튼 텍스트', type: 'text' },
        { key: 'buttonUrl', label: '버튼 링크', type: 'text' }
      ]
    },
    {
      section: '배경',
      props: [
        { key: 'backgroundImage', label: '배경 이미지', type: 'image' },
        { key: 'backgroundColor', label: '배경 색상', type: 'color' },
        { key: 'overlayOpacity', label: '오버레이 투명도', type: 'slider', min: 0, max: 100, unit: '%' }
      ]
    },
    {
      section: '스타일',
      props: [
        { key: 'minHeight', label: '최소 높이', type: 'slider', min: 200, max: 800, unit: 'px' },
        { key: 'textColor', label: '텍스트 색상', type: 'color' },
        { key: 'textAlign', label: '정렬', type: 'align' }
      ]
    },
    {
      section: '여백',
      props: [
        { key: 'padding', label: '안쪽 여백', type: 'spacing' }
      ]
    }
  ],

  text: [
    {
      section: '콘텐츠',
      props: [
        { key: 'content', label: '텍스트', type: 'richtext' }
      ]
    },
    {
      section: '스타일',
      props: [
        { key: 'textAlign', label: '정렬', type: 'align' },
        { key: 'fontSize', label: '글자 크기', type: 'slider', min: 12, max: 48, unit: 'px' },
        { key: 'lineHeight', label: '줄 간격', type: 'slider', min: 1, max: 3, step: 0.1 },
        { key: 'color', label: '글자 색상', type: 'color' },
        { key: 'backgroundColor', label: '배경 색상', type: 'color' }
      ]
    },
    {
      section: '여백',
      props: [
        { key: 'padding', label: '안쪽 여백', type: 'spacing' }
      ]
    }
  ],

  image: [
    {
      section: '이미지',
      props: [
        { key: 'src', label: '이미지 URL', type: 'image' },
        { key: 'alt', label: '대체 텍스트', type: 'text' },
        { key: 'link', label: '링크 URL', type: 'text' }
      ]
    },
    {
      section: '스타일',
      props: [
        { key: 'maxWidth', label: '최대 너비', type: 'text' },
        { key: 'borderRadius', label: '모서리 둥글기', type: 'slider', min: 0, max: 50, unit: 'px' },
        { key: 'shadow', label: '그림자', type: 'select', options: [
          { value: 'none', label: '없음' },
          { value: 'sm', label: '작게' },
          { value: 'md', label: '보통' },
          { value: 'lg', label: '크게' }
        ]}
      ]
    },
    {
      section: '여백',
      props: [
        { key: 'padding', label: '안쪽 여백', type: 'spacing' }
      ]
    }
  ],

  divider: [
    {
      section: '스타일',
      props: [
        { key: 'style', label: '선 스타일', type: 'select', options: [
          { value: 'solid', label: '실선' },
          { value: 'dashed', label: '점선' },
          { value: 'dotted', label: '점' },
          { value: 'thick', label: '두꺼운 선' }
        ]},
        { key: 'color', label: '색상', type: 'color' },
        { key: 'width', label: '너비', type: 'text' }
      ]
    },
    {
      section: '여백',
      props: [
        { key: 'margin.top', label: '위 여백', type: 'slider', min: 0, max: 100, unit: 'px' },
        { key: 'margin.bottom', label: '아래 여백', type: 'slider', min: 0, max: 100, unit: 'px' }
      ]
    }
  ],

  spacer: [
    {
      section: '크기',
      props: [
        { key: 'height', label: '높이', type: 'slider', min: 20, max: 200, unit: 'px' }
      ]
    }
  ],

  button: [
    {
      section: '콘텐츠',
      props: [
        { key: 'text', label: '버튼 텍스트', type: 'text' },
        { key: 'url', label: '링크 URL', type: 'text' },
        { key: 'target', label: '열기 방식', type: 'select', options: [
          { value: '_self', label: '현재 창' },
          { value: '_blank', label: '새 창' }
        ]}
      ]
    },
    {
      section: '스타일',
      props: [
        { key: 'style', label: '버튼 스타일', type: 'select', options: [
          { value: 'primary', label: '기본' },
          { value: 'secondary', label: '보조' },
          { value: 'outline', label: '외곽선' }
        ]},
        { key: 'size', label: '크기', type: 'select', options: [
          { value: 'sm', label: '작게' },
          { value: 'md', label: '보통' },
          { value: 'lg', label: '크게' }
        ]},
        { key: 'align', label: '정렬', type: 'align' },
        { key: 'backgroundColor', label: '배경 색상', type: 'color' },
        { key: 'textColor', label: '텍스트 색상', type: 'color' },
        { key: 'borderRadius', label: '모서리 둥글기', type: 'slider', min: 0, max: 50, unit: 'px' },
        { key: 'fullWidth', label: '전체 너비', type: 'toggle' }
      ]
    },
    {
      section: '여백',
      props: [
        { key: 'padding', label: '안쪽 여백', type: 'spacing' }
      ]
    }
  ],

  video: [
    {
      section: '비디오',
      props: [
        { key: 'url', label: '동영상 URL', type: 'text', placeholder: 'YouTube 또는 Vimeo URL' },
        { key: 'autoplay', label: '자동 재생', type: 'toggle' },
        { key: 'muted', label: '음소거', type: 'toggle' }
      ]
    },
    {
      section: '여백',
      props: [
        { key: 'padding', label: '안쪽 여백', type: 'spacing' }
      ]
    }
  ],

  gallery: [
    {
      section: '레이아웃',
      props: [
        { key: 'columns', label: '열 개수', type: 'select', options: [
          { value: 2, label: '2열' },
          { value: 3, label: '3열' },
          { value: 4, label: '4열' }
        ]},
        { key: 'gap', label: '간격', type: 'slider', min: 0, max: 32, unit: 'px' },
        { key: 'borderRadius', label: '모서리 둥글기', type: 'slider', min: 0, max: 20, unit: 'px' }
      ]
    },
    {
      section: '여백',
      props: [
        { key: 'padding', label: '안쪽 여백', type: 'spacing' }
      ]
    }
  ],

  quote: [
    {
      section: '콘텐츠',
      props: [
        { key: 'text', label: '인용문', type: 'textarea' },
        { key: 'author', label: '작성자', type: 'text' }
      ]
    },
    {
      section: '스타일',
      props: [
        { key: 'borderColor', label: '테두리 색상', type: 'color' },
        { key: 'backgroundColor', label: '배경 색상', type: 'color' },
        { key: 'textColor', label: '텍스트 색상', type: 'color' }
      ]
    },
    {
      section: '여백',
      props: [
        { key: 'padding', label: '안쪽 여백', type: 'spacing' }
      ]
    }
  ]
};

class PropertyPanel {
  constructor() {
    this.container = null;
    this.emptyState = null;
    this.editor = null;
    this.currentBlockId = null;

    this._init();
  }

  /**
   * Initialize property panel
   * @private
   */
  _init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this._setup());
    } else {
      this._setup();
    }
  }

  /**
   * Setup panel elements
   * @private
   */
  _setup() {
    this.container = document.getElementById('propertyContent');
    this.emptyState = document.getElementById('propertyEmpty');
    this.editor = document.getElementById('propertyEditor');

    if (!this.container) return;

    this._setupStoreSubscription();
  }

  /**
   * Setup store subscription
   * @private
   */
  _setupStoreSubscription() {
    // Watch for selection changes
    store.watch('selectedBlockId', (blockId) => {
      if (blockId) {
        this.showProperties(blockId);
      } else {
        this.showEmpty();
      }
    });

    // Watch for block updates (to refresh property values)
    eventBus.on(Events.BLOCK_UPDATE, ({ id }) => {
      if (id === this.currentBlockId) {
        this.showProperties(id);
      }
    });
  }

  /**
   * Show empty state
   */
  showEmpty() {
    this.currentBlockId = null;
    this.emptyState.classList.remove('hidden');
    this.editor.classList.add('hidden');
    this.editor.innerHTML = '';
  }

  /**
   * Show properties for a block
   * @param {string} blockId - Block ID
   */
  showProperties(blockId) {
    const block = store.getBlock(blockId);
    if (!block) {
      this.showEmpty();
      return;
    }

    this.currentBlockId = blockId;
    this.emptyState.classList.add('hidden');
    this.editor.classList.remove('hidden');

    const definitions = propertyDefinitions[block.type];
    if (!definitions) {
      this.editor.innerHTML = `
        <div class="property-section">
          <div class="property-section-body">
            <p style="color: var(--color-text-muted); font-size: 13px;">
              이 블록 유형에 대한 속성 편집기가 없습니다.
            </p>
          </div>
        </div>
      `;
      return;
    }

    // Render property sections
    const html = definitions.map(section => this._renderSection(section, block)).join('');
    this.editor.innerHTML = html;

    // Setup event listeners
    this._setupPropertyEvents();
  }

  /**
   * Render a property section
   * @private
   */
  _renderSection(section, block) {
    const propsHtml = section.props.map(prop => this._renderProperty(prop, block)).join('');

    return `
      <div class="property-section" data-section="${section.section}">
        <div class="property-section-header">
          <span class="property-section-title">${section.section}</span>
          <span class="property-section-toggle">
            <span class="material-symbols-outlined">expand_more</span>
          </span>
        </div>
        <div class="property-section-body">
          ${propsHtml}
        </div>
      </div>
    `;
  }

  /**
   * Render a single property control
   * @private
   */
  _renderProperty(prop, block) {
    const value = this._getNestedValue(block.props, prop.key);

    switch (prop.type) {
      case 'text':
        return this._renderTextInput(prop, value);

      case 'textarea':
        return this._renderTextarea(prop, value);

      case 'color':
        return this._renderColorPicker(prop, value);

      case 'slider':
        return this._renderSlider(prop, value);

      case 'select':
        return this._renderSelect(prop, value);

      case 'align':
        return this._renderAlignButtons(prop, value);

      case 'toggle':
        return this._renderToggle(prop, value);

      case 'spacing':
        return this._renderSpacing(prop, value);

      case 'image':
        return this._renderImageInput(prop, value);

      case 'richtext':
        return this._renderRichText(prop, value);

      default:
        return `<div class="property-row">Unknown type: ${prop.type}</div>`;
    }
  }

  /**
   * Render text input
   * @private
   */
  _renderTextInput(prop, value) {
    return `
      <div class="property-row">
        <label class="property-label">${prop.label}</label>
        <input type="text" class="property-input" data-prop="${prop.key}" value="${value || ''}" placeholder="${prop.placeholder || ''}">
      </div>
    `;
  }

  /**
   * Render textarea
   * @private
   */
  _renderTextarea(prop, value) {
    return `
      <div class="property-row">
        <label class="property-label">${prop.label}</label>
        <textarea class="property-input" data-prop="${prop.key}" rows="3">${value || ''}</textarea>
      </div>
    `;
  }

  /**
   * Render color picker
   * @private
   */
  _renderColorPicker(prop, value) {
    return `
      <div class="property-row">
        <label class="property-label">${prop.label}</label>
        <div class="color-picker-wrapper">
          <div class="color-preview" data-prop="${prop.key}" style="cursor: pointer;">
            <div class="color-preview-inner" style="background: ${value || '#ffffff'};"></div>
          </div>
          <input type="text" class="color-hex-input" data-prop="${prop.key}" value="${value || '#ffffff'}">
        </div>
      </div>
    `;
  }

  /**
   * Render slider
   * @private
   */
  _renderSlider(prop, value) {
    const min = prop.min || 0;
    const max = prop.max || 100;
    const step = prop.step || 1;
    const unit = prop.unit || '';

    return `
      <div class="property-row">
        <label class="property-label">${prop.label}</label>
        <div class="slider-with-input">
          <input type="range" class="property-slider" data-prop="${prop.key}"
                 min="${min}" max="${max}" step="${step}" value="${value || min}">
          <input type="number" class="property-input small" data-prop="${prop.key}"
                 min="${min}" max="${max}" step="${step}" value="${value || min}">
          ${unit ? `<span style="font-size: 12px; color: var(--color-text-muted);">${unit}</span>` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Render select dropdown
   * @private
   */
  _renderSelect(prop, value) {
    const options = prop.options.map(opt =>
      `<option value="${opt.value}" ${opt.value == value ? 'selected' : ''}>${opt.label}</option>`
    ).join('');

    return `
      <div class="property-row">
        <label class="property-label">${prop.label}</label>
        <select class="property-select" data-prop="${prop.key}">
          ${options}
        </select>
      </div>
    `;
  }

  /**
   * Render align buttons
   * @private
   */
  _renderAlignButtons(prop, value) {
    const alignments = ['left', 'center', 'right'];
    const icons = {
      left: 'format_align_left',
      center: 'format_align_center',
      right: 'format_align_right'
    };

    const buttons = alignments.map(align =>
      `<button class="btn-group-item ${value === align ? 'active' : ''}" data-prop="${prop.key}" data-value="${align}">
        <span class="material-symbols-outlined">${icons[align]}</span>
      </button>`
    ).join('');

    return `
      <div class="property-row">
        <label class="property-label">${prop.label}</label>
        <div class="btn-group">${buttons}</div>
      </div>
    `;
  }

  /**
   * Render toggle switch
   * @private
   */
  _renderToggle(prop, value) {
    return `
      <div class="property-row inline">
        <label class="property-label">${prop.label}</label>
        <div class="toggle-switch ${value ? 'active' : ''}" data-prop="${prop.key}"></div>
      </div>
    `;
  }

  /**
   * Render spacing control
   * @private
   */
  _renderSpacing(prop, value) {
    const v = value || { top: 0, right: 0, bottom: 0, left: 0 };

    return `
      <div class="property-row">
        <label class="property-label">${prop.label}</label>
        <div class="spacing-control">
          <input type="number" class="top" data-prop="${prop.key}.top" value="${v.top}" min="0" max="200">
          <input type="number" class="left" data-prop="${prop.key}.left" value="${v.left}" min="0" max="200">
          <button class="spacing-link-btn center" title="모두 연동">
            <span class="material-symbols-outlined">link</span>
          </button>
          <input type="number" class="right" data-prop="${prop.key}.right" value="${v.right}" min="0" max="200">
          <input type="number" class="bottom" data-prop="${prop.key}.bottom" value="${v.bottom}" min="0" max="200">
        </div>
      </div>
    `;
  }

  /**
   * Render image input
   * @private
   */
  _renderImageInput(prop, value) {
    return `
      <div class="property-row">
        <label class="property-label">${prop.label}</label>
        <input type="text" class="property-input" data-prop="${prop.key}" value="${value || ''}" placeholder="이미지 URL">
        <button class="btn btn-outline" style="margin-top: 8px; width: 100%;" data-browse-image="${prop.key}">
          <span class="material-symbols-outlined">image</span>
          <span>이미지 선택</span>
        </button>
      </div>
    `;
  }

  /**
   * Render rich text editor (simplified)
   * @private
   */
  _renderRichText(prop, value) {
    return `
      <div class="property-row">
        <label class="property-label">${prop.label}</label>
        <textarea class="property-input" data-prop="${prop.key}" rows="5" style="font-family: inherit;">${this._stripHtml(value || '')}</textarea>
      </div>
    `;
  }

  /**
   * Strip HTML tags
   * @private
   */
  _stripHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  /**
   * Get nested value from object
   * @private
   */
  _getNestedValue(obj, path) {
    return path.split('.').reduce((o, k) => (o || {})[k], obj);
  }

  /**
   * Set nested value in object
   * @private
   */
  _setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const last = keys.pop();
    const target = keys.reduce((o, k) => o[k] = o[k] || {}, obj);
    target[last] = value;
    return obj;
  }

  /**
   * Setup property change events
   * @private
   */
  _setupPropertyEvents() {
    // Debounced update function
    const updateProperty = debounce((propKey, value) => {
      if (!this.currentBlockId) return;

      const block = store.getBlock(this.currentBlockId);
      if (!block) return;

      const newProps = { ...block.props };
      this._setNestedValue(newProps, propKey, value);

      store.updateBlock(this.currentBlockId, { props: newProps });
    }, 150);

    // Text inputs and textareas
    this.editor.addEventListener('input', (e) => {
      const input = e.target;
      if (input.matches('input[type="text"], input[type="number"], textarea, .color-hex-input')) {
        const propKey = input.dataset.prop;
        let value = input.value;

        // Parse numbers
        if (input.type === 'number' || input.type === 'range') {
          value = parseFloat(value) || 0;
        }

        updateProperty(propKey, value);

        // Sync slider and number input
        if (input.type === 'range' || input.type === 'number') {
          const sibling = input.parentElement.querySelector(
            input.type === 'range' ? 'input[type="number"]' : 'input[type="range"]'
          );
          if (sibling && sibling.dataset.prop === propKey) {
            sibling.value = value;
          }
        }

        // Update color preview
        if (input.classList.contains('color-hex-input')) {
          const preview = input.parentElement.querySelector('.color-preview-inner');
          if (preview) {
            preview.style.background = value;
          }
        }
      }
    });

    // Select dropdowns
    this.editor.addEventListener('change', (e) => {
      if (e.target.matches('select')) {
        const propKey = e.target.dataset.prop;
        let value = e.target.value;

        // Convert to number if needed
        if (!isNaN(value)) {
          value = parseInt(value, 10);
        }

        updateProperty(propKey, value);
      }
    });

    // Toggle switches
    this.editor.addEventListener('click', (e) => {
      const toggle = e.target.closest('.toggle-switch');
      if (toggle) {
        toggle.classList.toggle('active');
        const propKey = toggle.dataset.prop;
        const value = toggle.classList.contains('active');
        updateProperty(propKey, value);
      }

      // Align buttons
      const alignBtn = e.target.closest('.btn-group-item');
      if (alignBtn) {
        const group = alignBtn.closest('.btn-group');
        group.querySelectorAll('.btn-group-item').forEach(btn => btn.classList.remove('active'));
        alignBtn.classList.add('active');

        const propKey = alignBtn.dataset.prop;
        const value = alignBtn.dataset.value;
        updateProperty(propKey, value);
      }

      // Section toggle
      const sectionHeader = e.target.closest('.property-section-header');
      if (sectionHeader) {
        const section = sectionHeader.closest('.property-section');
        section.classList.toggle('collapsed');
      }

      // Color preview click (open color picker)
      const colorPreview = e.target.closest('.color-preview');
      if (colorPreview) {
        const input = document.createElement('input');
        input.type = 'color';
        input.value = colorPreview.querySelector('.color-preview-inner').style.background || '#ffffff';

        input.addEventListener('input', (evt) => {
          const hexInput = colorPreview.parentElement.querySelector('.color-hex-input');
          if (hexInput) {
            hexInput.value = evt.target.value;
            hexInput.dispatchEvent(new Event('input', { bubbles: true }));
          }
          colorPreview.querySelector('.color-preview-inner').style.background = evt.target.value;
        });

        input.click();
      }
    });
  }
}

// Export singleton
export const propertyPanel = new PropertyPanel();

export default propertyPanel;
