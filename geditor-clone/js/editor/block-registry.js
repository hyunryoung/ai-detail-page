/**
 * GEditor Clone - Block Registry
 * Defines available block types and their default properties
 */

import { generateId } from '../core/utils.js';

/**
 * Block type definitions
 */
const blockTypes = {
  // ============================================
  // Basic Blocks
  // ============================================

  hero: {
    name: '히어로',
    category: 'basic',
    icon: 'view_carousel',
    description: '대형 배너 이미지와 텍스트',
    defaultProps: {
      title: '멋진 제목을 입력하세요',
      subtitle: '부제목이나 설명을 작성하세요',
      buttonText: '자세히 보기',
      buttonUrl: '#',
      backgroundImage: '',
      backgroundColor: '#1a202c',
      overlayOpacity: 40,
      minHeight: 400,
      textColor: '#ffffff',
      textAlign: 'center',
      padding: { top: 60, right: 40, bottom: 60, left: 40 }
    },
    render: (block) => {
      const p = block.props;
      const bgStyle = p.backgroundImage
        ? `background-image: url('${p.backgroundImage}'); background-size: cover; background-position: center;`
        : `background-color: ${p.backgroundColor};`;

      return `
        <div class="block block-hero" data-block-id="${block.id}" style="${bgStyle} min-height: ${p.minHeight}px; padding: ${p.padding.top}px ${p.padding.right}px ${p.padding.bottom}px ${p.padding.left}px;">
          ${p.backgroundImage ? `<div class="block-hero-overlay" style="opacity: ${p.overlayOpacity / 100};"></div>` : ''}
          <div class="block-hero-content" style="text-align: ${p.textAlign};">
            <h1 style="color: ${p.textColor};">${p.title}</h1>
            <p style="color: ${p.textColor};">${p.subtitle}</p>
            ${p.buttonText ? `<a href="${p.buttonUrl}" class="btn btn-primary">${p.buttonText}</a>` : ''}
          </div>
        </div>
      `;
    }
  },

  text: {
    name: '텍스트',
    category: 'basic',
    icon: 'text_fields',
    description: '제목, 본문, 설명 텍스트',
    defaultProps: {
      content: '<p>텍스트를 입력하세요.</p>',
      textAlign: 'left',
      fontSize: 16,
      lineHeight: 1.7,
      color: '#1a202c',
      backgroundColor: 'transparent',
      padding: { top: 20, right: 40, bottom: 20, left: 40 }
    },
    render: (block) => {
      const p = block.props;
      return `
        <div class="block block-text" data-block-id="${block.id}"
             style="text-align: ${p.textAlign}; font-size: ${p.fontSize}px; line-height: ${p.lineHeight}; color: ${p.color}; background-color: ${p.backgroundColor}; padding: ${p.padding.top}px ${p.padding.right}px ${p.padding.bottom}px ${p.padding.left}px;"
             data-align="${p.textAlign}">
          ${p.content}
        </div>
      `;
    }
  },

  image: {
    name: '이미지',
    category: 'basic',
    icon: 'image',
    description: '단일 이미지',
    defaultProps: {
      src: '',
      alt: '',
      width: 'auto',
      maxWidth: '100%',
      height: 'auto',
      objectFit: 'cover',
      borderRadius: 0,
      shadow: 'none',
      link: '',
      padding: { top: 20, right: 0, bottom: 20, left: 0 }
    },
    render: (block) => {
      const p = block.props;
      const shadowStyles = {
        none: 'none',
        sm: '0 1px 3px rgba(0,0,0,0.12)',
        md: '0 4px 6px rgba(0,0,0,0.15)',
        lg: '0 10px 20px rgba(0,0,0,0.2)'
      };

      const content = p.src
        ? `<img src="${p.src}" alt="${p.alt}" style="width: ${p.width}; max-width: ${p.maxWidth}; height: ${p.height}; object-fit: ${p.objectFit}; border-radius: ${p.borderRadius}px; box-shadow: ${shadowStyles[p.shadow] || 'none'};">`
        : `<div class="block-image-placeholder">
            <span class="material-symbols-outlined">add_photo_alternate</span>
            <span>이미지를 추가하세요</span>
           </div>`;

      const wrapped = p.link
        ? `<a href="${p.link}" target="_blank">${content}</a>`
        : content;

      return `
        <div class="block block-image" data-block-id="${block.id}"
             style="padding: ${p.padding.top}px ${p.padding.right}px ${p.padding.bottom}px ${p.padding.left}px; text-align: center;">
          ${wrapped}
        </div>
      `;
    }
  },

  divider: {
    name: '구분선',
    category: 'basic',
    icon: 'horizontal_rule',
    description: '섹션 구분선',
    defaultProps: {
      style: 'solid', // solid, dashed, dotted, thick
      color: '#e2e8f0',
      width: '100%',
      thickness: 1,
      margin: { top: 30, bottom: 30 }
    },
    render: (block) => {
      const p = block.props;
      let borderStyle = p.style === 'thick' ? 'solid' : p.style;
      let height = p.style === 'thick' ? '3px' : `${p.thickness}px`;

      return `
        <div class="block block-divider" data-block-id="${block.id}"
             data-style="${p.style}"
             style="padding: ${p.margin.top}px 40px ${p.margin.bottom}px 40px;">
          <hr style="border: none; border-top: ${height} ${borderStyle} ${p.color}; width: ${p.width};">
        </div>
      `;
    }
  },

  spacer: {
    name: '여백',
    category: 'basic',
    icon: 'height',
    description: '빈 공간 추가',
    defaultProps: {
      height: 60
    },
    render: (block) => {
      const p = block.props;
      return `
        <div class="block block-spacer" data-block-id="${block.id}"
             data-height="${p.height}px"
             style="height: ${p.height}px;">
        </div>
      `;
    }
  },

  // ============================================
  // Layout Blocks
  // ============================================

  columns: {
    name: '컬럼',
    category: 'layout',
    icon: 'view_column',
    description: '2~4열 레이아웃',
    defaultProps: {
      columns: 2,
      gap: 20,
      padding: { top: 20, right: 20, bottom: 20, left: 20 },
      columnContent: ['', '']
    },
    render: (block) => {
      const p = block.props;
      const cols = Array.from({ length: p.columns }, (_, i) => {
        return `<div class="block-column" data-column-index="${i}">${p.columnContent[i] || ''}</div>`;
      }).join('');

      return `
        <div class="block block-columns" data-block-id="${block.id}"
             style="display: flex; gap: ${p.gap}px; padding: ${p.padding.top}px ${p.padding.right}px ${p.padding.bottom}px ${p.padding.left}px;">
          ${cols}
        </div>
      `;
    }
  },

  // ============================================
  // Button Block
  // ============================================

  button: {
    name: '버튼',
    category: 'basic',
    icon: 'smart_button',
    description: 'CTA 버튼',
    defaultProps: {
      text: '버튼 텍스트',
      url: '#',
      target: '_self',
      style: 'primary', // primary, secondary, outline
      size: 'md', // sm, md, lg
      align: 'center',
      backgroundColor: '#4A90E2',
      textColor: '#ffffff',
      borderRadius: 6,
      fullWidth: false,
      padding: { top: 20, right: 40, bottom: 20, left: 40 }
    },
    render: (block) => {
      const p = block.props;
      const sizeStyles = {
        sm: 'padding: 8px 16px; font-size: 13px;',
        md: 'padding: 12px 24px; font-size: 14px;',
        lg: 'padding: 16px 32px; font-size: 16px;'
      };

      let buttonStyle = sizeStyles[p.size];
      buttonStyle += ` border-radius: ${p.borderRadius}px;`;

      if (p.style === 'outline') {
        buttonStyle += ` background: transparent; color: ${p.backgroundColor}; border: 2px solid ${p.backgroundColor};`;
      } else {
        buttonStyle += ` background: ${p.backgroundColor}; color: ${p.textColor}; border: none;`;
      }

      if (p.fullWidth) {
        buttonStyle += ' width: 100%; display: block;';
      }

      return `
        <div class="block block-button" data-block-id="${block.id}"
             style="text-align: ${p.align}; padding: ${p.padding.top}px ${p.padding.right}px ${p.padding.bottom}px ${p.padding.left}px;">
          <a href="${p.url}" target="${p.target}" class="btn" style="${buttonStyle}">
            ${p.text}
          </a>
        </div>
      `;
    }
  },

  // ============================================
  // Video Block
  // ============================================

  video: {
    name: '비디오',
    category: 'basic',
    icon: 'play_circle',
    description: 'YouTube/Vimeo 동영상',
    defaultProps: {
      url: '',
      aspectRatio: '16:9',
      autoplay: false,
      muted: false,
      padding: { top: 20, right: 0, bottom: 20, left: 0 }
    },
    render: (block) => {
      const p = block.props;

      // Parse YouTube/Vimeo URLs
      let embedUrl = '';
      if (p.url) {
        if (p.url.includes('youtube.com') || p.url.includes('youtu.be')) {
          const videoId = p.url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
          if (videoId) {
            embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0${p.autoplay ? '&autoplay=1' : ''}${p.muted ? '&mute=1' : ''}`;
          }
        } else if (p.url.includes('vimeo.com')) {
          const videoId = p.url.match(/vimeo\.com\/(\d+)/)?.[1];
          if (videoId) {
            embedUrl = `https://player.vimeo.com/video/${videoId}?${p.autoplay ? 'autoplay=1&' : ''}${p.muted ? 'muted=1' : ''}`;
          }
        }
      }

      const content = embedUrl
        ? `<iframe src="${embedUrl}" allow="autoplay; fullscreen" allowfullscreen></iframe>`
        : `<div class="block-video-placeholder">
            <span class="material-symbols-outlined">play_circle</span>
            <span>YouTube 또는 Vimeo URL을 입력하세요</span>
           </div>`;

      return `
        <div class="block block-video" data-block-id="${block.id}"
             style="padding: ${p.padding.top}px ${p.padding.right}px ${p.padding.bottom}px ${p.padding.left}px;">
          ${content}
        </div>
      `;
    }
  },

  // ============================================
  // Gallery Block
  // ============================================

  gallery: {
    name: '갤러리',
    category: 'layout',
    icon: 'grid_view',
    description: '이미지 갤러리',
    defaultProps: {
      images: [],
      columns: 3,
      gap: 8,
      borderRadius: 4,
      padding: { top: 20, right: 20, bottom: 20, left: 20 }
    },
    render: (block) => {
      const p = block.props;

      const items = p.images.length > 0
        ? p.images.map(img => `
            <div class="block-gallery-item" style="border-radius: ${p.borderRadius}px;">
              <img src="${img.src}" alt="${img.alt || ''}">
            </div>
          `).join('')
        : Array.from({ length: 6 }, (_, i) => `
            <div class="block-gallery-item" style="border-radius: ${p.borderRadius}px; background: #f3f4f6; display: flex; align-items: center; justify-content: center;">
              <span class="material-symbols-outlined" style="font-size: 24px; color: #9ca3af;">image</span>
            </div>
          `).join('');

      return `
        <div class="block block-gallery" data-block-id="${block.id}"
             data-cols="${p.columns}"
             style="grid-template-columns: repeat(${p.columns}, 1fr); gap: ${p.gap}px; padding: ${p.padding.top}px ${p.padding.right}px ${p.padding.bottom}px ${p.padding.left}px;">
          ${items}
        </div>
      `;
    }
  },

  // ============================================
  // List Block
  // ============================================

  list: {
    name: '목록',
    category: 'basic',
    icon: 'format_list_bulleted',
    description: '글머리 기호 목록',
    defaultProps: {
      type: 'ul', // ul, ol
      items: ['항목 1', '항목 2', '항목 3'],
      fontSize: 16,
      color: '#1a202c',
      padding: { top: 20, right: 40, bottom: 20, left: 40 }
    },
    render: (block) => {
      const p = block.props;
      const tag = p.type;
      const items = p.items.map(item => `<li>${item}</li>`).join('');

      return `
        <div class="block block-list" data-block-id="${block.id}"
             style="font-size: ${p.fontSize}px; color: ${p.color}; padding: ${p.padding.top}px ${p.padding.right}px ${p.padding.bottom}px ${p.padding.left}px;">
          <${tag}>${items}</${tag}>
        </div>
      `;
    }
  },

  // ============================================
  // Quote Block
  // ============================================

  quote: {
    name: '인용문',
    category: 'basic',
    icon: 'format_quote',
    description: '인용구',
    defaultProps: {
      text: '인용할 문구를 입력하세요.',
      author: '',
      borderColor: '#4A90E2',
      backgroundColor: '#f8fafc',
      textColor: '#4a5568',
      padding: { top: 20, right: 40, bottom: 20, left: 40 }
    },
    render: (block) => {
      const p = block.props;
      return `
        <div class="block block-quote" data-block-id="${block.id}"
             style="border-left-color: ${p.borderColor}; background: ${p.backgroundColor}; padding: ${p.padding.top}px ${p.padding.right}px ${p.padding.bottom}px ${p.padding.left}px;">
          <blockquote style="color: ${p.textColor};">${p.text}</blockquote>
          ${p.author ? `<cite>— ${p.author}</cite>` : ''}
        </div>
      `;
    }
  },

  // ============================================
  // Social Block
  // ============================================

  social: {
    name: 'SNS',
    category: 'other',
    icon: 'share',
    description: 'SNS 아이콘 링크',
    defaultProps: {
      links: [
        { platform: 'instagram', url: '#' },
        { platform: 'youtube', url: '#' },
        { platform: 'facebook', url: '#' }
      ],
      iconSize: 40,
      iconColor: '#4b5563',
      backgroundColor: '#f3f4f6',
      padding: { top: 30, right: 0, bottom: 30, left: 0 }
    },
    render: (block) => {
      const p = block.props;

      const platformIcons = {
        instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
        youtube: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
        facebook: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
        twitter: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
        naver: 'M1 1v22h22V1H1zm16.39 15.85l-5.47-7.96v7.96H7.61V7.15h4.36l5.47 7.96V7.15h4.31v9.7h-4.36z'
      };

      const icons = p.links.map(link => {
        const iconPath = platformIcons[link.platform] || '';
        return `
          <a href="${link.url}" target="_blank" rel="noopener" style="width: ${p.iconSize}px; height: ${p.iconSize}px; background: ${p.backgroundColor};">
            <svg viewBox="0 0 24 24" style="width: 20px; height: 20px; fill: ${p.iconColor};">
              <path d="${iconPath}"/>
            </svg>
          </a>
        `;
      }).join('');

      return `
        <div class="block block-social" data-block-id="${block.id}"
             style="padding: ${p.padding.top}px ${p.padding.right}px ${p.padding.bottom}px ${p.padding.left}px;">
          ${icons}
        </div>
      `;
    }
  },

  // ============================================
  // Map Block
  // ============================================

  map: {
    name: '지도',
    category: 'other',
    icon: 'map',
    description: 'Google Maps 임베드',
    defaultProps: {
      address: '',
      lat: 37.5665,
      lng: 126.978,
      zoom: 15,
      height: 300,
      padding: { top: 0, right: 0, bottom: 0, left: 0 }
    },
    render: (block) => {
      const p = block.props;
      const query = p.address || `${p.lat},${p.lng}`;
      const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(query)}&zoom=${p.zoom}`;

      return `
        <div class="block block-map" data-block-id="${block.id}"
             style="height: ${p.height}px; padding: ${p.padding.top}px ${p.padding.right}px ${p.padding.bottom}px ${p.padding.left}px;">
          <iframe src="${mapUrl}" style="width: 100%; height: 100%; border: 0;" allowfullscreen loading="lazy"></iframe>
        </div>
      `;
    }
  }
};

/**
 * Block Registry class
 */
class BlockRegistry {
  constructor() {
    this.types = new Map();

    // Register default block types
    Object.entries(blockTypes).forEach(([type, config]) => {
      this.register(type, config);
    });
  }

  /**
   * Register a block type
   * @param {string} type - Block type name
   * @param {Object} config - Block configuration
   */
  register(type, config) {
    this.types.set(type, config);
  }

  /**
   * Get block type configuration
   * @param {string} type - Block type name
   * @returns {Object|null}
   */
  get(type) {
    return this.types.get(type) || null;
  }

  /**
   * Get all registered types
   * @returns {Map}
   */
  getAll() {
    return this.types;
  }

  /**
   * Get block types by category
   * @param {string} category - Category name
   * @returns {Array}
   */
  getByCategory(category) {
    const result = [];
    this.types.forEach((config, type) => {
      if (config.category === category) {
        result.push({ type, ...config });
      }
    });
    return result;
  }

  /**
   * Get all categories
   * @returns {Array}
   */
  getCategories() {
    const categories = new Set();
    this.types.forEach(config => {
      categories.add(config.category);
    });
    return Array.from(categories);
  }

  /**
   * Create a new block instance
   * @param {string} type - Block type
   * @param {Object} [overrideProps] - Override default props
   * @returns {Object} Block object
   */
  createBlock(type, overrideProps = {}) {
    const config = this.get(type);
    if (!config) {
      throw new Error(`Unknown block type: ${type}`);
    }

    return {
      id: generateId('block'),
      type,
      props: {
        ...JSON.parse(JSON.stringify(config.defaultProps)),
        ...overrideProps
      },
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Render a block to HTML
   * @param {Object} block - Block object
   * @returns {string} HTML string
   */
  renderBlock(block) {
    const config = this.get(block.type);
    if (!config || !config.render) {
      return `<div class="block block-unknown" data-block-id="${block.id}">Unknown block type: ${block.type}</div>`;
    }
    return config.render(block);
  }
}

// Export singleton instance
export const blockRegistry = new BlockRegistry();

export default blockRegistry;
