export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  /** How much bowl capacity one drop uses (out of 100) */
  volume: number;
  color: string;
  color2?: string;
}

/** Each drop position stored in the bowl */
export interface DroppedItem {
  ingredientId: string;
  /** 0~1 relative position in bowl circle */
  x: number;
  y: number;
}

export const BOWL_CAPACITY = 100;

export const INGREDIENTS: Ingredient[] = [
  { id: "rice", name: "밥", unit: "공기", volume: 10, color: "#FEFEFE", color2: "#F5F5F0" },
  { id: "bomdong", name: "봄동", unit: "줌", volume: 6, color: "#6DBE45", color2: "#8DC63F" },
  { id: "gochugaru", name: "고춧가루", unit: "큰술", volume: 3, color: "#E64A19", color2: "#FF7043" },
  { id: "gochujang", name: "고추장", unit: "큰술", volume: 3, color: "#C41E1E", color2: "#E53935" },
  { id: "fishsauce", name: "멸치액젓", unit: "큰술", volume: 2, color: "#8D6E63", color2: "#A1887F" },
  { id: "vinegar", name: "식초", unit: "큰술", volume: 2, color: "#A5D6A7", color2: "#C8E6C9" },
  { id: "garlic", name: "다진마늘", unit: "큰술", volume: 2, color: "#F5F0E0", color2: "#EDE7D0" },
  { id: "sesameOil", name: "참기름", unit: "작은술", volume: 1, color: "#C49A1A", color2: "#DAB02A" },
  { id: "egg", name: "달걀프라이", unit: "개", volume: 8, color: "#FFB300", color2: "#FFFEF8" },
  { id: "sesameSeeds", name: "깨소금", unit: "꼬집", volume: 1, color: "#F5E6B8", color2: "#EDD9A0" },
];
