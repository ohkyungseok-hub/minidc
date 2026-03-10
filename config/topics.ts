export type TopicSlug =
  | "work"
  | "relationship"
  | "family"
  | "anxiety"
  | "loneliness"
  | "money";

export type TopicConfig = {
  slug: TopicSlug;
  /** 화면 표시용 한글 라벨 */
  label: string;
  emoji: string;
  /** <title> 태그용 문자열 (| 블랙펄즈 제외) */
  title: string;
  /** meta description */
  description: string;
  /** /best/[topic] meta title */
  bestTitle: string;
  /** /best/[topic] meta description */
  bestDescription: string;
  /** 페이지 H1 */
  h1: string;
  /** 카테고리 소개 첫 문단 (SEO용) */
  intro: string;
  /** 연관 주제 슬러그 */
  relatedTopics: TopicSlug[];
  /** 관련 게시판 slugs (boards 테이블 slug) */
  boardSlugs: string[];
  /** DB 키워드 검색용 (추후 topic 필드 추가 시 교체 가능) */
  keywords: string[];
};

export const TOPICS: Record<TopicSlug, TopicConfig> = {
  work: {
    slug: "work",
    label: "직장",
    emoji: "💼",
    title: "직장 스트레스 익명 고민상담",
    description:
      "상사 문제, 퇴사 고민, 인간관계, 번아웃까지. 직장 스트레스를 익명으로 털어놓고 공감과 위로를 받을 수 있는 공간입니다.",
    bestTitle: "직장 스트레스 익명 고백 모음",
    bestDescription:
      "상사 문제, 퇴사 고민, 번아웃 등 직장 스트레스와 관련된 익명 고백 중 공감을 많이 받은 이야기들을 모았습니다.",
    h1: "직장 스트레스, 익명으로 털어놓는 공간",
    intro:
      "직장 생활에서 생기는 크고 작은 스트레스는 가장 가까운 사람에게도 쉽게 말하기 어렵습니다. 상사의 부당한 대우, 그만두고 싶은 마음, 번아웃으로 지친 하루를 블랙펄즈에서 익명으로 털어놓아 보세요. 같은 상황을 겪어본 사람들의 공감과 위로가 기다리고 있습니다.",
    relatedTopics: ["money", "anxiety"],
    boardSlugs: ["confession", "solutions"],
    keywords: ["직장", "상사", "퇴사", "번아웃", "회사", "업무", "야근", "이직"],
  },
  relationship: {
    slug: "relationship",
    label: "연애",
    emoji: "💌",
    title: "연애 고민 익명 고백",
    description:
      "이별, 권태기, 짝사랑, 집착, 서운함까지. 연애에서 말 못한 감정을 익명으로 털어놓고 위로와 공감을 나눠보세요.",
    bestTitle: "연애 고민 공감 글 모음",
    bestDescription:
      "이별, 서운함, 권태기, 짝사랑 등 연애 고민과 관련해 많은 공감을 받은 익명 고백들을 모았습니다.",
    h1: "연애 고민, 말 못한 감정을 털어놓는 공간",
    intro:
      "좋아한다고 말하지 못하거나, 사랑하는데 상처받고 있거나, 헤어졌지만 잊지 못하거나. 연애의 고민은 친구에게도 온전히 꺼내기 어렵습니다. 블랙펄즈에서 익명으로 마음을 털어놓고, 비슷한 감정을 겪어본 사람들의 이야기 속에서 위로를 찾아보세요.",
    relatedTopics: ["loneliness", "anxiety"],
    boardSlugs: ["confession", "comfort"],
    keywords: ["연애", "이별", "짝사랑", "권태기", "남자친구", "여자친구", "실연"],
  },
  family: {
    slug: "family",
    label: "가족",
    emoji: "🏡",
    title: "가족 문제 익명 고민상담",
    description:
      "부모, 형제, 부부, 가족 갈등처럼 쉽게 말하기 어려운 가족 문제를 익명으로 털어놓고 위로를 받을 수 있는 공간입니다.",
    bestTitle: "가족 문제 위로 글 모음",
    bestDescription:
      "부모, 부부, 형제, 가족 갈등과 관련해 공감과 위로를 많이 받은 익명 고백들을 모았습니다.",
    h1: "가족 문제, 혼자 안고 있던 이야기를 털어놓는 공간",
    intro:
      "가족이기 때문에 더 힘들고, 가족이기 때문에 더 말 못하는 상황이 있습니다. 부모와의 갈등, 형제 사이의 불화, 부부 관계의 균열 — 혼자 안고 있기엔 너무 무거운 이야기를 블랙펄즈에서 익명으로 털어놓아 보세요.",
    relatedTopics: ["anxiety", "loneliness"],
    boardSlugs: ["confession", "comfort"],
    keywords: ["가족", "부모", "형제", "부부", "엄마", "아빠", "시댁", "갈등"],
  },
  anxiety: {
    slug: "anxiety",
    label: "불안",
    emoji: "🌀",
    title: "불안하고 힘들 때 털어놓는 공간",
    description:
      "이유 없는 불안, 멘탈 흔들림, 우울감, 걱정을 익명으로 털어놓고 공감과 위로를 받을 수 있는 블랙펄즈 이야기 공간입니다.",
    bestTitle: "불안·우울 공감 글 모음",
    bestDescription:
      "이유 없는 불안, 멘탈 흔들림, 우울감과 관련해 공감을 많이 받은 익명 고백들을 모았습니다.",
    h1: "불안하고 힘든 마음, 익명으로 털어놓는 공간",
    intro:
      "이유를 설명하기 어렵지만 계속 불안하거나, 멘탈이 흔들리는 날이 이어질 때 — 이런 감정을 그냥 꺼내놓을 수 있는 공간이 필요합니다. 블랙펄즈에서 익명으로 지금의 감정을 털어놓고, 비슷한 시간을 보내고 있는 사람들의 이야기 속에서 작은 위로를 찾아보세요.",
    relatedTopics: ["loneliness", "work", "family"],
    boardSlugs: ["comfort", "confession"],
    keywords: ["불안", "우울", "걱정", "멘탈", "힘들다", "스트레스", "공황", "무기력"],
  },
  loneliness: {
    slug: "loneliness",
    label: "외로움",
    emoji: "🌙",
    title: "외로울 때 위로받는 익명 커뮤니티",
    description:
      "혼자라고 느껴질 때, 외롭고 공허할 때 마음을 익명으로 털어놓고 공감과 위로를 받을 수 있는 공간입니다.",
    bestTitle: "외로움 위로 글 모음",
    bestDescription:
      "외롭고 공허한 마음을 담은 글 중 많은 공감과 위로를 받은 익명 고백들을 모았습니다.",
    h1: "외롭고 공허할 때, 함께 있는 공간",
    intro:
      "사람들 사이에 있어도 혼자인 것 같고, 아무도 진짜 나를 모르는 것 같을 때가 있습니다. 그 외로움을 블랙펄즈에서 익명으로 꺼내보세요. 혼자가 아니라는 것을, 같은 감정을 느끼는 사람들의 이야기에서 느낄 수 있습니다.",
    relatedTopics: ["anxiety", "relationship"],
    boardSlugs: ["comfort", "confession"],
    keywords: ["외로움", "고독", "혼자", "공허", "고립", "쓸쓸", "소외"],
  },
  money: {
    slug: "money",
    label: "돈 문제",
    emoji: "💸",
    title: "돈 문제 익명 고민상담",
    description:
      "생활비, 빚, 경제적 압박, 미래 걱정까지. 돈 문제로 힘든 마음을 익명으로 털어놓고 함께 견디는 공간입니다.",
    bestTitle: "돈 문제 공감 글 모음",
    bestDescription:
      "생활비, 빚, 경제적 압박과 관련해 공감을 많이 받은 익명 고백들을 모았습니다.",
    h1: "돈 문제, 혼자 끌어안고 있던 부담을 털어놓는 공간",
    intro:
      "돈 문제는 가장 가까운 사람에게도 꺼내기 어렵습니다. 생활비가 부족하거나, 빚이 쌓이거나, 미래가 막막할 때의 무게감을 블랙펄즈에서 익명으로 털어놓아 보세요. 같은 무게를 지고 있는 사람들의 이야기가 작은 위로가 됩니다.",
    relatedTopics: ["work", "anxiety"],
    boardSlugs: ["solutions", "confession"],
    keywords: ["돈", "빚", "생활비", "경제", "월급", "대출", "파산", "가난"],
  },
};

export const TOPIC_SLUGS = Object.keys(TOPICS) as TopicSlug[];

export function isValidTopicSlug(slug: string): slug is TopicSlug {
  return slug in TOPICS;
}
