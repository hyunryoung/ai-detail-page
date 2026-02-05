"""
OpenNana 프롬프트 원본 수집기
- 번역 없이 원본 데이터만 수집
- data/prompts_original.json 에 저장
"""

import json
import time
import os
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Optional

import requests

# 출력 버퍼링 비활성화
sys.stdout.reconfigure(line_buffering=True)

# ============ 설정 ============
API_BASE = "https://api.opennana.com/api"
PROMPTS_LIST_URL = f"{API_BASE}/prompts"
PROMPT_DETAIL_URL = f"{API_BASE}/prompts"

MAX_WORKERS = 20
REQUEST_DELAY = 0.05
PAGE_LIMIT = 100

# 저장 경로
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "prompts_original.json")

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
            
            try:
                prompt_data = json.loads(text)
                
                # 배열 형태인 경우 (여러 프롬프트가 묶여있는 경우)
                if isinstance(prompt_data, list):
                    # 배열의 모든 프롬프트를 합쳐서 저장
                    combined_prompts = []
                    for item in prompt_data:
                        if isinstance(item, dict):
                            # concise_prompt 또는 다른 프롬프트 필드 추출
                            gen_cmd = item.get("generation_command", {})
                            if isinstance(gen_cmd, dict):
                                cp = gen_cmd.get("concise_prompt", "")
                                if cp:
                                    combined_prompts.append(cp)
                            # 또는 직접 prompt 필드
                            elif item.get("prompt"):
                                combined_prompts.append(item.get("prompt", ""))
                    
                    combined_text = "\n\n---\n\n".join(combined_prompts) if combined_prompts else text
                    
                    if p_type == "en":
                        prompt_en = combined_text
                    elif p_type == "zh":
                        prompt_cn = combined_text
                
                # 딕셔너리 형태인 경우 (일반적인 경우)
                elif isinstance(prompt_data, dict):
                    if p_type == "en":
                        prompt_en = prompt_data.get("prompt", "")
                        negative_prompt_en = prompt_data.get("negative_prompt", "")
                    elif p_type == "zh":
                        prompt_cn = prompt_data.get("prompt", "")
                        negative_prompt_cn = prompt_data.get("negative_prompt", "")
                        
            except json.JSONDecodeError:
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
        print(f"  ⚠ {slug} 오류: {e}")
        return None


def collect_all_prompts(prompt_list: list[dict]) -> list[dict]:
    """모든 프롬프트 상세 정보 병렬 수집 (새로 수집)"""
    print(f"\n📥 {len(prompt_list)}개 프롬프트 상세 정보 수집 중... (워커 {MAX_WORKERS}개)")
    
    slugs = [p["slug"] for p in prompt_list]
    
    results = []
    failed = []
    
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_to_slug = {executor.submit(get_prompt_detail, slug): slug for slug in slugs}
        
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
            
            if (i + 1) % 100 == 0 or i + 1 == len(slugs):
                print(f"  진행: {i + 1}/{len(slugs)} ({len(results)}개 성공, {len(failed)}개 실패)")
    
    print(f"\n  ✓ 총 {len(results)}개 프롬프트 수집 완료")
    
    if failed:
        print(f"  ⚠ 실패: {len(failed)}개")
    
    return results


def main():
    print("=" * 60)
    print("  OpenNana 프롬프트 원본 수집기")
    print("  (번역 없이 원본만 수집)")
    print("=" * 60)
    
    # 출력 디렉토리 생성
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # 1. 프롬프트 목록 가져오기
    prompt_list = get_all_prompts_list()
    
    if not prompt_list:
        print("❌ 프롬프트 목록을 가져올 수 없습니다")
        return
    
    # 2. 프롬프트 상세 정보 수집
    prompts = collect_all_prompts(prompt_list)
    
    if not prompts:
        print("❌ 수집된 프롬프트가 없습니다")
        return
    
    # 3. 저장
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(prompts, f, ensure_ascii=False, indent=2)
    
    print("\n" + "=" * 60)
    print(f"  ✅ 완료! 총 {len(prompts)}개 프롬프트 수집")
    print(f"  📁 저장 위치: {OUTPUT_FILE}")
    print("=" * 60)


if __name__ == "__main__":
    main()
