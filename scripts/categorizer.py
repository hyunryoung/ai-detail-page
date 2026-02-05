"""
프롬프트 카테고리 분류기
- 태그 기반 자동 카테고리 분류
- Gemini API를 사용한 스마트 분류 (선택적)
"""

import json
import os
import re
from typing import Optional

# 카테고리 정의 및 관련 키워드
CATEGORIES = {
    "portrait": {
        "name_ko": "인물",
        "name_en": "Portrait",
        "keywords": [
            # 영문
            "portrait", "woman", "man", "girl", "boy", "face", "model", "selfie",
            "beauty", "fashion model", "person", "human", "people", "lady",
            "gentleman", "child", "kid", "baby", "elder", "senior",
            # 중문
            "人物", "肖像", "女", "男", "少女", "少年", "美女", "帅哥", "模特",
            "自拍", "写真", "面部", "脸", "人像", "女孩", "男孩", "女性", "男性",
            "女郎", "美人", "丽人", "超模", "健身", "瑜伽"
        ]
    },
    "product": {
        "name_ko": "제품",
        "name_en": "Product",
        "keywords": [
            # 영문
            "product", "cosmetic", "skincare", "bottle", "package", "packaging",
            "cream", "serum", "lotion", "phone", "device", "gadget", "tech",
            "electronics", "luxury", "brand", "commercial", "advertisement",
            "mockup", "render", "3d product",
            # 중문
            "产品", "化妆品", "护肤", "瓶", "包装", "精华", "乳液", "手机",
            "设备", "电子", "奢华", "品牌", "商业", "广告", "渲染", "护肤品",
            "美妆", "香水", "口红"
        ]
    },
    "food": {
        "name_ko": "음식",
        "name_en": "Food",
        "keywords": [
            # 영문
            "food", "dish", "meal", "cuisine", "restaurant", "cooking", "recipe",
            "ingredient", "fruit", "vegetable", "meat", "dessert", "cake", "bread",
            "drink", "beverage", "coffee", "tea", "cocktail", "wine", "beer",
            "breakfast", "lunch", "dinner", "snack",
            # 중문
            "美食", "食物", "菜", "餐", "料理", "烹饪", "食谱", "水果", "蔬菜",
            "肉", "甜点", "蛋糕", "面包", "饮料", "咖啡", "茶", "鸡尾酒",
            "早餐", "午餐", "晚餐", "小吃", "饺子", "烤肉", "寿司", "拉面",
            "酸奶", "冰淇淋", "巧克力"
        ]
    },
    "fashion": {
        "name_ko": "패션",
        "name_en": "Fashion",
        "keywords": [
            # 영문
            "fashion", "clothing", "dress", "suit", "jacket", "coat", "shirt",
            "pants", "skirt", "shoes", "sneaker", "heel", "boot", "accessory",
            "jewelry", "watch", "bag", "handbag", "sunglasses", "hat", "scarf",
            "editorial", "runway", "vogue", "haute couture",
            # 중문
            "时尚", "服装", "连衣裙", "西装", "夹克", "外套", "衬衫", "裤子",
            "裙子", "鞋", "运动鞋", "高跟鞋", "靴子", "配饰", "珠宝", "手表",
            "包", "手提包", "太阳镜", "帽子", "围巾", "时装", "大片", "高定",
            "汉服", "和服", "旗袍"
        ]
    },
    "landscape": {
        "name_ko": "풍경",
        "name_en": "Landscape",
        "keywords": [
            # 영문
            "landscape", "nature", "mountain", "ocean", "sea", "beach", "forest",
            "tree", "sky", "cloud", "sunset", "sunrise", "night", "city",
            "urban", "street", "building", "architecture", "interior", "room",
            "house", "apartment", "office", "garden", "park",
            # 중문
            "风景", "自然", "山", "海", "海滩", "森林", "树", "天空", "云",
            "日落", "日出", "夜", "城市", "街道", "建筑", "室内", "房间",
            "房子", "公寓", "办公室", "花园", "公园", "景观"
        ]
    },
    "graphic": {
        "name_ko": "그래픽",
        "name_en": "Graphic",
        "keywords": [
            # 영문
            "logo", "icon", "typography", "text", "letter", "font", "graphic",
            "illustration", "vector", "abstract", "pattern", "design", "art",
            "poster", "banner", "flyer", "infographic", "diagram", "chart",
            "ui", "ux", "web design", "app design", "minimalist",
            # 중문
            "标志", "图标", "字体", "文字", "字母", "图形", "插画", "矢量",
            "抽象", "图案", "设计", "艺术", "海报", "横幅", "传单", "信息图",
            "图表", "极简", "3D", "立体", "渲染"
        ]
    },
    "character": {
        "name_ko": "캐릭터",
        "name_en": "Character",
        "keywords": [
            # 영문
            "character", "anime", "cartoon", "mascot", "creature", "monster",
            "robot", "mecha", "fantasy", "sci-fi", "game", "avatar", "chibi",
            "cute", "kawaii",
            # 중문
            "角色", "动漫", "卡通", "吉祥物", "生物", "怪物", "机器人", "机甲",
            "奇幻", "科幻", "游戏", "头像", "Q版", "可爱", "萌"
        ]
    },
    "vehicle": {
        "name_ko": "자동차/탈것",
        "name_en": "Vehicle",
        "keywords": [
            # 영문
            "car", "vehicle", "automobile", "motorcycle", "bike", "bicycle",
            "truck", "bus", "train", "airplane", "plane", "helicopter", "boat",
            "ship", "yacht", "sports car", "suv", "sedan",
            # 중문
            "车", "汽车", "摩托车", "自行车", "卡车", "巴士", "火车", "飞机",
            "直升机", "船", "游艇", "跑车", "越野车"
        ]
    }
}


def categorize_by_tags(tags: list, title: str = "", prompt_text: str = "") -> str:
    """태그, 제목, 프롬프트를 분석하여 카테고리 결정"""
    
    # 모든 텍스트를 합쳐서 분석
    all_text = " ".join(tags).lower() + " " + title.lower() + " " + prompt_text.lower()
    
    # 각 카테고리별 점수 계산
    scores = {}
    for cat_id, cat_info in CATEGORIES.items():
        score = 0
        for keyword in cat_info["keywords"]:
            if keyword.lower() in all_text:
                # 키워드가 태그에 있으면 가중치 높음
                if any(keyword.lower() in tag.lower() for tag in tags):
                    score += 3
                # 제목에 있으면 중간 가중치
                elif keyword.lower() in title.lower():
                    score += 2
                # 프롬프트에 있으면 낮은 가중치
                else:
                    score += 1
        scores[cat_id] = score
    
    # 가장 높은 점수의 카테고리 반환
    if max(scores.values()) > 0:
        return max(scores, key=scores.get)
    
    # 기본값
    return "graphic"


def categorize_prompts(input_file: str, output_file: str):
    """프롬프트 데이터에 카테고리 추가"""
    
    print(f"📂 프롬프트 카테고리 분류 시작...")
    print(f"   입력: {input_file}")
    print(f"   출력: {output_file}")
    
    # 데이터 로드
    with open(input_file, "r", encoding="utf-8") as f:
        prompts = json.load(f)
    
    print(f"   총 {len(prompts)}개 프롬프트 처리 중...")
    
    # 카테고리별 카운트
    category_counts = {cat_id: 0 for cat_id in CATEGORIES}
    
    # 각 프롬프트에 카테고리 추가
    for item in prompts:
        tags = item.get("tags", [])
        if not isinstance(tags, list):
            tags = []
        
        title = item.get("title_cn", "") or item.get("title_ko", "") or ""
        if not isinstance(title, str):
            title = str(title) if title else ""
        
        prompt_text = item.get("prompt_en", "") or item.get("prompt_cn", "") or ""
        if not isinstance(prompt_text, str):
            prompt_text = str(prompt_text) if prompt_text else ""
        
        category = categorize_by_tags(tags, title, prompt_text)
        item["category"] = category
        item["category_ko"] = CATEGORIES[category]["name_ko"]
        item["category_en"] = CATEGORIES[category]["name_en"]
        
        category_counts[category] += 1
    
    # 결과 저장
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(prompts, f, ensure_ascii=False, indent=2)
    
    # 통계 출력
    print(f"\n📊 카테고리별 분류 결과:")
    for cat_id, count in sorted(category_counts.items(), key=lambda x: -x[1]):
        cat_name = CATEGORIES[cat_id]["name_ko"]
        percentage = count / len(prompts) * 100
        print(f"   {cat_name} ({cat_id}): {count}개 ({percentage:.1f}%)")
    
    print(f"\n✅ 카테고리 분류 완료: {output_file}")
    return prompts


def get_category_list():
    """카테고리 목록 반환"""
    return [
        {
            "id": cat_id,
            "name_ko": cat_info["name_ko"],
            "name_en": cat_info["name_en"]
        }
        for cat_id, cat_info in CATEGORIES.items()
    ]


if __name__ == "__main__":
    import sys
    
    # 기본 경로
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    input_file = os.path.join(base_dir, "data", "prompts_raw.json")
    output_file = os.path.join(base_dir, "data", "prompts_categorized.json")
    
    # 명령줄 인자로 경로 지정 가능
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
    if len(sys.argv) > 2:
        output_file = sys.argv[2]
    
    categorize_prompts(input_file, output_file)
