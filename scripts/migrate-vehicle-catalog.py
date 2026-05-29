"""
freepasserp3 차종 카탈로그 (_index.json, 425 entries) → jpkerp5 4단 평탄화
출력: jpkerp5/public/data/vehicle-catalog/_index.json (모든 트림 평탄화)
       jpkerp5/public/data/vehicle-catalog/_makers.json (제조사 리스트)

평탄화 단위 = 트림 1개 = 카탈로그 1건
{ id, maker, model, subModel, trim, displayName }
"""

import json
import re
from pathlib import Path

SRC = Path(r"C:\dev\freepasserp3\public\data\car-master")
OUT_DIR = Path(r"C:\dev\jpkerp5\public\data\vehicle-catalog")
OUT_DIR.mkdir(parents=True, exist_ok=True)


def slugify(s: str) -> str:
    """트림 이름을 id-safe 슬러그로. 한글·영숫자·하이픈만 남김."""
    s = (s or "").strip().lower()
    s = re.sub(r"[^\w가-힣\-]+", "_", s)
    s = re.sub(r"_+", "_", s).strip("_")
    return s or "na"


def extract_sub_model(title: str, maker: str, model_root: str) -> str:
    """title에서 maker · model_root 제거한 나머지 = 세부모델 (chassis코드 + 페리 여부)."""
    s = (title or "").strip()
    if maker and s.startswith(maker):
        s = s[len(maker):].strip()
    if model_root and s.startswith(model_root):
        s = s[len(model_root):].strip()
    s = s.replace("(", " ").replace(")", " ").strip()
    s = re.sub(r"\s+", " ", s)
    return s if s else "기본"


def main() -> None:
    src_index = SRC / "_index.json"
    with open(src_index, encoding="utf-8") as f:
        data = json.load(f)

    flat: list[dict] = []
    skipped = 0

    for entry_id, e in data.items():
        title = (e.get("title") or "").strip()
        maker = (e.get("maker") or "").strip()
        model = (e.get("model_root") or "").strip()
        trims = e.get("trims") or []

        if not maker or not model or not title:
            skipped += 1
            continue

        sub_model = extract_sub_model(title, maker, model)

        if not trims:
            trims = ["기본"]

        for trim in trims:
            trim = (trim or "").strip()
            if not trim:
                continue
            trim_slug = slugify(trim)
            row_id = f"{entry_id}__{trim_slug}"
            display = re.sub(r"\s+", " ", f"{maker} {model} {sub_model} {trim}").strip()
            flat.append({
                "id": row_id,
                "maker": maker,
                "model": model,
                "subModel": sub_model,
                "trim": trim,
                "displayName": display,
            })

    flat.sort(key=lambda r: (r["maker"], r["model"], r["subModel"], r["trim"]))

    out_index = OUT_DIR / "_index.json"
    with open(out_index, "w", encoding="utf-8") as f:
        json.dump(flat, f, ensure_ascii=False, separators=(",", ":"))

    makers = sorted({r["maker"] for r in flat})
    out_makers = OUT_DIR / "_makers.json"
    with open(out_makers, "w", encoding="utf-8") as f:
        json.dump(makers, f, ensure_ascii=False, indent=2)

    # 통계
    by_maker: dict[str, int] = {}
    for r in flat:
        by_maker[r["maker"]] = by_maker.get(r["maker"], 0) + 1

    print(f"Source entries: {len(data)}")
    print(f"Skipped (no maker/model/title): {skipped}")
    print(f"Output flat trims: {len(flat)}")
    print(f"Unique makers: {len(makers)}")
    print(f"Output file: {out_index} ({out_index.stat().st_size // 1024} KB)")
    print()
    print("Top 10 makers by trim count:")
    for maker, n in sorted(by_maker.items(), key=lambda x: -x[1])[:10]:
        print(f"  {maker:20s} {n:5d}")


if __name__ == "__main__":
    main()
