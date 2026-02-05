"""
OpenNana 프롬프트 수집기 (API 버전)
- 1,585개 AI 이미지 프롬프트 크롤링
- Gemini API로 한글 번역
"""

import json
import re
import time
import os
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Optional

import requests

# 출력 버퍼링 비활성화
sys.stdout.reconfigure(line_buffering=True)

# Gemini API
from google import genai

# ============ 설정 ============
API_BASE = "https://api.opennana.com/api"
PROMPTS_LIST_URL = f"{API_BASE}/prompts"
PROMPT_DETAIL_URL = f"{API_BASE}/prompts"  # + /{slug}

MAX_WORKERS = 20  # 병렬 크롤링 워커 수
REQUEST_DELAY = 0.05  # 요청 간 딜레이 (초)
BATCH_SIZE = 10  # 번역 배치 크기
PAGE_LIMIT = 100  # 한 페이지당 프롬프트 수 (최대)

# 파일 경로
RAW_DATA_FILE = "prompts_raw.json"
KO_DATA_FILE = "prompts_ko.json"

# 세션 설정
session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json",
})


def get_all_prompts_list() -> list[dict]:
    """API로 모든 프롬프트 목록 가져오기"""
    print("📋 프롬프트 목록 가져오는 중...")
    
    all_items = []
    page = 1
    
    while True:
        try:
            url = f"{PROMPTS_LIST_URL}?page={page}&limit={PAGE_LIMIT}&sort=created_at&order=DESC"
            response = session.get(url, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get("status") != 200:
                print(f"  ⚠ API 오류: {data.get('msg')}")
                break
            
            items = data.get("data", {}).get("items", [])
            pagination = data.get("data", {}).get("pagination", {})
            
            if not items:
                break
            
            all_items.extend(items)
            
            total = pagination.get("total", 0)
            total_pages = pagination.get("total_pages", 1)
            
            print(f"  페이지 {page}/{total_pages}: {len(items)}개 (총 {len(all_items)}/{total}개)")
            
            if not pagination.get("has_more", False):
                break
            
            page += 1
            time.sleep(REQUEST_DELAY)
            
        except Exception as e:
            print(f"  ⚠ 페이지 {page} 오류: {e}")
            break
    
    print(f"  ✓ 총 {len(all_items)}개 프롬프트 목록 수집 완료")
    return all_items


def get_prompt_detail(slug: str) -> Optional[dict]:
    """API로 프롬프트 상세 정보 가져오기"""
    try:
        time.sleep(REQUEST_DELAY)
        url = f"{PROMPT_DETAIL_URL}/{slug}"
        response = session.get(url, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        
        if data.get("status") != 200:
            return None
        
        detail = data.get("data", {})
        
        # 프롬프트 파싱
        prompts = detail.get("prompts", [])
        prompt_en = ""
        negative_prompt_en = ""
        prompt_cn = ""
        negative_prompt_cn = ""
        
        for p in prompts:
            text = p.get("text", "")
            p_type = p.get("type", "")
            
            # JSON 파싱 시도
            try:
                prompt_data = json.loads(text)
                if p_type == "en":
                    prompt_en = prompt_data.get("prompt", "")
                    negative_prompt_en = prompt_data.get("negative_prompt", "")
                elif p_type == "zh":
                    prompt_cn = prompt_data.get("prompt", "")
                    negative_prompt_cn = prompt_data.get("negative_prompt", "")
            except json.JSONDecodeError:
                # JSON이 아닌 경우 그대로 사용
                if p_type == "en":
                    prompt_en = text
                elif p_type == "zh":
                    prompt_cn = text
        
        return {
            "id": detail.get("slug", ""),
            "title_cn": detail.get("title", ""),
            "tags": detail.get("tags", []),
            "thumbnail_url": detail.get("images", [""])[0] if detail.get("images") else "",
            "source_url": detail.get("source_url", ""),
            "source_name": detail.get("source_name", ""),
            "prompt_en": prompt_en,
            "negative_prompt_en": negative_prompt_en,
            "prompt_cn": prompt_cn,
            "negative_prompt_cn": negative_prompt_cn,
        }
        
    except Exception as e:
        print(f"  ⚠ {slug} 상세 정보 오류: {e}")
        return None


def scrape_all_prompts(prompt_list: list[dict]) -> list[dict]:
    """모든 프롬프트 상세 정보 병렬 수집"""
    print(f"\n📥 {len(prompt_list)}개 프롬프트 상세 정보 수집 중... (워커 {MAX_WORKERS}개)")
    
    # 이미 수집된 데이터가 있으면 로드
    existing = []
    existing_ids = set()
    
    if os.path.exists(RAW_DATA_FILE):
        with open(RAW_DATA_FILE, "r", encoding="utf-8") as f:
            existing = json.load(f)
            existing_ids = {p["id"] for p in existing}
    
    # 수집해야 할 슬러그 목록
    slugs_to_fetch = [p["slug"] for p in prompt_list if p["slug"] not in existing_ids]
    
    if not slugs_to_fetch:
        print("  ✓ 모든 데이터가 이미 수집되어 있습니다")
        return existing
    
    print(f"  ✓ 기존 {len(existing)}개 로드, {len(slugs_to_fetch)}개 추가 수집 필요")
    
    results = []
    failed = []
    
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_to_slug = {executor.submit(get_prompt_detail, slug): slug for slug in slugs_to_fetch}
        
        for i, future in enumerate(as_completed(future_to_slug)):
            slug = future_to_slug[future]
            try:
                result = future.result()
                if result:
                    results.append(result)
                else:
                    failed.append(slug)
            except Exception as e:
                print(f"  ⚠ {slug} 오류: {e}")
                failed.append(slug)
            
            # 진행 상황 출력
            if (i + 1) % 100 == 0 or i + 1 == len(slugs_to_fetch):
                print(f"  진행: {i + 1}/{len(slugs_to_fetch)} ({len(results)}개 성공, {len(failed)}개 실패)")
    
    # 기존 데이터와 병합
    all_data = existing + results
    
    # 저장
    with open(RAW_DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)
    
    print(f"  ✓ 총 {len(all_data)}개 프롬프트 저장 완료")
    
    if failed:
        print(f"  ⚠ 실패한 슬러그 {len(failed)}개")
    
    return all_data


def translate_with_gemini(prompts: list[dict]) -> list[dict]:
    """Gemini API로 한글 번역"""
    print(f"\n🌐 Gemini API로 번역 중...")
    
    # API 키 확인
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("  ⚠ GEMINI_API_KEY 환경변수가 설정되지 않았습니다")
        print("  Windows: set GEMINI_API_KEY=your_api_key")
        print("  PowerShell: $env:GEMINI_API_KEY='your_api_key'")
        return prompts
    
    # Gemini 클라이언트 초기화
    client = genai.Client(api_key=api_key)
    
    # 이미 번역된 데이터 로드
    existing = []
    existing_ids = set()
    
    if os.path.exists(KO_DATA_FILE):
        with open(KO_DATA_FILE, "r", encoding="utf-8") as f:
            existing = json.load(f)
            existing_ids = {p["id"] for p in existing}
    
    to_translate = [p for p in prompts if p["id"] not in existing_ids]
    
    if not to_translate:
        print("  ✓ 모든 데이터가 이미 번역되어 있습니다")
        return existing
    
    print(f"  ✓ 기존 {len(existing)}개 로드, {len(to_translate)}개 추가 번역 필요")
    
    translated = []
    
    # 배치 처리
    for i in range(0, len(to_translate), BATCH_SIZE):
        batch = to_translate[i:i + BATCH_SIZE]
        
        # 번역 프롬프트 생성
        translation_prompt = """다음 AI 이미지 프롬프트들을 한국어로 번역해주세요.
JSON 형식으로 응답해주세요. 각 항목에 대해:
- title_ko: 제목 한글 번역 (자연스러운 한국어로)
- tags_ko: 태그들 한글 번역 (배열, 자연스러운 한국어 단어로)
- prompt_ko: 프롬프트 한글 번역 (AI 이미지 생성에 사용할 수 있도록 자연스럽게)
- negative_prompt_ko: 네거티브 프롬프트 한글 번역

번역할 데이터:
"""
        
        for j, prompt in enumerate(batch):
            # 영문 프롬프트가 있으면 영문 기준, 없으면 중문 기준
            source_prompt = prompt.get('prompt_en') or prompt.get('prompt_cn', '')
            source_negative = prompt.get('negative_prompt_en') or prompt.get('negative_prompt_cn', '')
            
            translation_prompt += f"""
--- 항목 {j + 1} (id: {prompt['id']}) ---
제목(중문): {prompt.get('title_cn', '')}
태그(중문): {prompt.get('tags', [])}
프롬프트: {source_prompt}
네거티브 프롬프트: {source_negative}
"""
        
        translation_prompt += """

응답은 반드시 아래 JSON 배열 형식으로만 해주세요 (다른 텍스트 없이):
[
  {
    "id": "항목id",
    "title_ko": "한글 제목",
    "tags_ko": ["태그1", "태그2"],
    "prompt_ko": "한글 프롬프트",
    "negative_prompt_ko": "한글 네거티브 프롬프트"
  }
]
"""
        
        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=translation_prompt
            )
            
            # JSON 파싱
            response_text = response.text
            # JSON 블록 추출
            json_match = re.search(r'\[[\s\S]*\]', response_text)
            if json_match:
                translations = json.loads(json_match.group())
                
                # 원본 데이터와 병합
                for prompt in batch:
                    trans = next((t for t in translations if t.get("id") == prompt["id"]), None)
                    if trans:
                        prompt.update({
                            "title_ko": trans.get("title_ko", ""),
                            "tags_ko": trans.get("tags_ko", []),
                            "prompt_ko": trans.get("prompt_ko", ""),
                            "negative_prompt_ko": trans.get("negative_prompt_ko", ""),
                        })
                    translated.append(prompt)
            else:
                print(f"  ⚠ 배치 {i // BATCH_SIZE + 1} JSON 파싱 실패")
                # 번역 실패 시에도 원본 데이터는 저장
                for prompt in batch:
                    prompt.update({
                        "title_ko": "",
                        "tags_ko": [],
                        "prompt_ko": "",
                        "negative_prompt_ko": "",
                    })
                    translated.append(prompt)
                
        except Exception as e:
            print(f"  ⚠ 배치 {i // BATCH_SIZE + 1} 번역 오류: {e}")
            # 오류 시에도 원본 데이터는 저장
            for prompt in batch:
                prompt.update({
                    "title_ko": "",
                    "tags_ko": [],
                    "prompt_ko": "",
                    "negative_prompt_ko": "",
                })
                translated.append(prompt)
        
        # 진행률 출력
        progress = min(i + BATCH_SIZE, len(to_translate))
        print(f"  진행: {progress}/{len(to_translate)} ({progress * 100 // len(to_translate)}%)")
        
        # 중간 저장 (100개마다)
        if len(translated) % 100 == 0:
            temp_all = existing + translated
            with open(KO_DATA_FILE, "w", encoding="utf-8") as f:
                json.dump(temp_all, f, ensure_ascii=False, indent=2)
        
        time.sleep(0.3)  # Rate limit 방지
    
    # 기존 데이터와 병합
    all_data = existing + translated
    
    # 최종 저장
    with open(KO_DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)
    
    print(f"  ✓ 총 {len(all_data)}개 프롬프트 번역 완료")
    return all_data


def main():
    """메인 실행"""
    print("=" * 60)
    print("  OpenNana 프롬프트 수집기 (API 버전)")
    print("=" * 60)
    
    # 1. 프롬프트 목록 가져오기
    prompt_list = get_all_prompts_list()
    
    if not prompt_list:
        print("❌ 프롬프트 목록을 가져올 수 없습니다")
        return
    
    # 2. 프롬프트 상세 정보 수집
    prompts = scrape_all_prompts(prompt_list)
    
    if not prompts:
        print("❌ 수집된 프롬프트가 없습니다")
        return
    
    # 3. 한글 번역
    translated = translate_with_gemini(prompts)
    
    print("\n" + "=" * 60)
    print(f"  ✅ 완료! 총 {len(translated)}개 프롬프트 수집 및 번역")
    print(f"  - 원본 데이터: {RAW_DATA_FILE}")
    print(f"  - 한글화 데이터: {KO_DATA_FILE}")
    print("=" * 60)


if __name__ == "__main__":
    main()
