/**
 * GEditor Clone - AI Service
 * OpenAI API integration for content generation
 */

import { store } from '../core/state.js';
import { eventBus, Events } from '../core/events.js';
import { blockRegistry } from '../editor/block-registry.js';

class AIService {
  constructor() {
    this.isGenerating = false;
  }

  /**
   * Get OpenAI API key from settings
   * @private
   */
  _getApiKey() {
    return store.get('settings.openaiApiKey');
  }

  /**
   * Make OpenAI API request
   * @private
   */
  async _callOpenAI(messages, options = {}) {
    const apiKey = this._getApiKey();

    if (!apiKey) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다. 설정에서 API 키를 입력하세요.');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: options.model || 'gpt-4o-mini',
        messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API 요청 실패: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  /**
   * Generate product detail page from product info
   * @param {Object} productInfo - Product information
   * @returns {Promise<Array>} Generated blocks
   */
  async generateProductPage(productInfo) {
    if (this.isGenerating) {
      throw new Error('이미 생성 중입니다.');
    }

    this.isGenerating = true;
    eventBus.emit(Events.AI_GENERATE_START);

    try {
      const { name, description, imageUrl } = productInfo;

      // Generate marketing copy
      const copyPrompt = `
당신은 전문 마케팅 카피라이터입니다. 다음 상품에 대한 상세페이지 콘텐츠를 작성해주세요.

상품명: ${name}
상품 설명: ${description}

다음 형식의 JSON으로 응답해주세요 (JSON만 응답, 다른 텍스트 없이):
{
  "headline": "메인 헤드라인 (20자 이내)",
  "subheadline": "서브 헤드라인 (40자 이내)",
  "features": ["특징1", "특징2", "특징3"],
  "benefits": ["혜택1", "혜택2", "혜택3"],
  "description": "상세 설명 (100자 내외)",
  "cta": "구매 버튼 텍스트 (10자 이내)"
}
      `.trim();

      const copyResponse = await this._callOpenAI([
        { role: 'system', content: '당신은 전문 마케팅 카피라이터입니다. JSON 형식으로만 응답하세요.' },
        { role: 'user', content: copyPrompt }
      ]);

      // Parse JSON response
      let content;
      try {
        // Extract JSON from response (handle potential markdown code blocks)
        const jsonMatch = copyResponse.match(/\{[\s\S]*\}/);
        content = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(copyResponse);
      } catch (e) {
        console.error('Failed to parse AI response:', copyResponse);
        throw new Error('AI 응답을 파싱할 수 없습니다.');
      }

      // Create blocks from AI content
      const blocks = this._createBlocksFromContent(content, imageUrl);

      eventBus.emit(Events.AI_GENERATE_COMPLETE, { blocks });

      return blocks;

    } catch (error) {
      eventBus.emit(Events.AI_GENERATE_ERROR, { error: error.message });
      throw error;
    } finally {
      this.isGenerating = false;
    }
  }

  /**
   * Create blocks from AI-generated content
   * @private
   */
  _createBlocksFromContent(content, imageUrl) {
    const blocks = [];

    // Hero block
    blocks.push(blockRegistry.createBlock('hero', {
      title: content.headline || '상품명',
      subtitle: content.subheadline || '상품 설명',
      buttonText: content.cta || '구매하기',
      buttonUrl: '#purchase',
      backgroundColor: '#1a202c',
      minHeight: 400
    }));

    // Image block (if URL provided)
    if (imageUrl) {
      blocks.push(blockRegistry.createBlock('image', {
        src: imageUrl,
        alt: content.headline,
        maxWidth: '100%'
      }));
    }

    // Features section
    if (content.features && content.features.length > 0) {
      blocks.push(blockRegistry.createBlock('text', {
        content: `<h2 style="text-align: center; margin-bottom: 16px;">✨ 주요 특징</h2>`,
        textAlign: 'center',
        padding: { top: 40, right: 40, bottom: 20, left: 40 }
      }));

      blocks.push(blockRegistry.createBlock('list', {
        type: 'ul',
        items: content.features,
        padding: { top: 0, right: 60, bottom: 40, left: 60 }
      }));
    }

    // Divider
    blocks.push(blockRegistry.createBlock('divider', {}));

    // Benefits section
    if (content.benefits && content.benefits.length > 0) {
      blocks.push(blockRegistry.createBlock('text', {
        content: `<h2 style="text-align: center; margin-bottom: 16px;">💎 혜택</h2>`,
        textAlign: 'center',
        padding: { top: 40, right: 40, bottom: 20, left: 40 }
      }));

      blocks.push(blockRegistry.createBlock('list', {
        type: 'ul',
        items: content.benefits,
        padding: { top: 0, right: 60, bottom: 40, left: 60 }
      }));
    }

    // Description
    if (content.description) {
      blocks.push(blockRegistry.createBlock('text', {
        content: `<p>${content.description}</p>`,
        textAlign: 'center',
        padding: { top: 20, right: 40, bottom: 40, left: 40 }
      }));
    }

    // CTA Button
    blocks.push(blockRegistry.createBlock('button', {
      text: content.cta || '지금 구매하기',
      url: '#purchase',
      align: 'center',
      style: 'primary',
      size: 'lg',
      padding: { top: 40, right: 40, bottom: 60, left: 40 }
    }));

    return blocks;
  }

  /**
   * Crawl product info from URL (via CORS proxy)
   * @param {string} url - Product URL
   * @returns {Promise<Object>} Product info
   */
  async crawlProductUrl(url) {
    // Use a CORS proxy service
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;

    try {
      const response = await fetch(proxyUrl);
      const data = await response.json();

      if (!data.contents) {
        throw new Error('URL을 가져올 수 없습니다.');
      }

      // Parse HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.contents, 'text/html');

      // Extract product info from meta tags
      const getMetaContent = (name) => {
        const meta = doc.querySelector(`meta[property="${name}"], meta[name="${name}"]`);
        return meta?.getAttribute('content') || '';
      };

      const productInfo = {
        name: getMetaContent('og:title') || doc.querySelector('title')?.textContent || '',
        description: getMetaContent('og:description') || getMetaContent('description') || '',
        imageUrl: getMetaContent('og:image') || ''
      };

      // Try to extract price from JSON-LD
      const jsonLd = doc.querySelector('script[type="application/ld+json"]');
      if (jsonLd) {
        try {
          const ldData = JSON.parse(jsonLd.textContent);
          if (ldData.offers?.price) {
            productInfo.price = ldData.offers.price;
          }
          if (ldData.name) {
            productInfo.name = ldData.name;
          }
          if (ldData.description) {
            productInfo.description = ldData.description;
          }
        } catch (e) {
          // Ignore JSON-LD parse errors
        }
      }

      return productInfo;

    } catch (error) {
      console.error('URL crawl error:', error);
      throw new Error('URL에서 상품 정보를 가져올 수 없습니다.');
    }
  }

  /**
   * Generate page from URL
   * @param {string} url - Product URL
   * @returns {Promise<Array>} Generated blocks
   */
  async generateFromUrl(url) {
    // Crawl product info
    const productInfo = await this.crawlProductUrl(url);

    if (!productInfo.name && !productInfo.description) {
      throw new Error('상품 정보를 찾을 수 없습니다.');
    }

    // Generate page from extracted info
    return this.generateProductPage(productInfo);
  }
}

// Export singleton
export const aiService = new AIService();

export default aiService;
