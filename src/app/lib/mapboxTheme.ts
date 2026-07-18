import type mapboxgl from "mapbox-gl";

// 给公园/绿地/森林/景区图层套一层柔和浅绿，让漫游底图更统一、更耐看。
// 来源：参考项目「把所有的诗都种回到地球上」
export function applySoftGreenParksTheme(map: mapboxgl.Map) {
  const style = map.getStyle?.();
  if (!style?.layers?.length) return;

  const FILL = "#CFEFD6"; // soft mint green
  const LINE = "#BFE7C8";
  const FILL_OPACITY = 0.28;

  const GREEN_LAYER_ID_RE =
    /(park|landuse|national-park|forest|wood|grass|meadow|golf|pitch|cemetery|garden)/i;

  for (const layer of style.layers) {
    if (!layer?.id) continue;
    if (!GREEN_LAYER_ID_RE.test(layer.id)) continue;

    if (layer.type === "fill") {
      try {
        map.setPaintProperty(layer.id, "fill-color", FILL);
        map.setPaintProperty(layer.id, "fill-opacity", FILL_OPACITY);
      } catch {}
    }

    if (layer.type === "line") {
      try {
        map.setPaintProperty(layer.id, "line-color", LINE);
        map.setPaintProperty(layer.id, "line-opacity", 0.35);
      } catch {}
    }
  }
}

// 公共地球使用低照度的知识地图底图：地理仍可辨认，但不会抢过新闻知识卡片。
// 视觉取法来自 sunset-radio 的深夜地图，配色改为 Pocket Earth 的深海蓝与链上绿。
export function applyPublicEarthTheme(map: mapboxgl.Map) {
  const style = map.getStyle?.();
  if (!style?.layers?.length) return;

  for (const layer of style.layers) {
    if (!layer?.id) continue;
    try {
      if (layer.type === "background") map.setPaintProperty(layer.id, "background-color", "#02050a");
      if (/water|ocean/i.test(layer.id) && layer.type === "fill") {
        map.setPaintProperty(layer.id, "fill-color", "#07131d");
        map.setPaintProperty(layer.id, "fill-opacity", 0.98);
      }
      if (/(land|landuse|park|national-park|forest|wood|grass|meadow|pitch|cemetery|garden)/i.test(layer.id)) {
        if (layer.type === "fill") {
          map.setPaintProperty(layer.id, "fill-color", "#17201f");
          map.setPaintProperty(layer.id, "fill-opacity", 0.9);
        }
        if (layer.type === "line") {
          map.setPaintProperty(layer.id, "line-color", "#31433e");
          map.setPaintProperty(layer.id, "line-opacity", 0.32);
        }
      }
      if (/(road|bridge|tunnel)/i.test(layer.id) && layer.type === "line") {
        map.setPaintProperty(layer.id, "line-color", "#27343a");
        map.setPaintProperty(layer.id, "line-opacity", 0.25);
      }
      if (layer.type === "symbol") {
        const isCountryLabel = /country-label/i.test(layer.id);
        // 公共地球不是导航地图：城市、道路、景点等底图文字会和新闻卡片争抢注意力。
        // 只留极淡的国家级提示，其余符号全部隐藏，让公共知识成为唯一的阅读入口。
        map.setLayoutProperty(layer.id, "visibility", isCountryLabel ? "visible" : "none");
        if (isCountryLabel) {
          map.setLayoutProperty(layer.id, "text-size", ["interpolate", ["linear"], ["zoom"], 0, 6, 3, 7.5, 6, 9] as any);
          map.setPaintProperty(layer.id, "text-color", "#71817c");
          map.setPaintProperty(layer.id, "text-halo-color", "#02050a");
          map.setPaintProperty(layer.id, "text-halo-width", 1);
          map.setPaintProperty(layer.id, "text-opacity", 0.34);
          try { map.setPaintProperty(layer.id, "icon-opacity", 0); } catch {}
        }
      }
    } catch {}
  }

  try {
    map.setFog({
      color: "#07110f",
      "high-color": "#0b1c20",
      "space-color": "#010307",
      "horizon-blend": 0.035,
      "star-intensity": 0.08,
    } as any);
  } catch {}
}

// 把地图上所有文字标注（地名、道路、POI 等）切换为中文。
// Mapbox 矢量底图自带 name_zh-Hans 字段，没有中文时回退到本地名 / 英文名。
export function setMapLabelsToChinese(map: mapboxgl.Map) {
  const style = map.getStyle?.();
  if (!style?.layers?.length) return;

  const zhField = [
    "coalesce",
    ["get", "name_zh-Hans"],
    ["get", "name_zh-Hant"],
    ["get", "name_zh"],
    ["get", "name"],
  ];

  for (const layer of style.layers) {
    if (layer.type !== "symbol") continue;
    const textField = (layer as any).layout?.["text-field"];
    if (!textField) continue;
    try {
      map.setLayoutProperty(layer.id, "text-field", zhField as any);
    } catch {}
  }
}
