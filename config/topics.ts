export type TopicSlug =
  | "work"
  | "relationship"
  | "family"
  | "anxiety"
  | "loneliness"
  | "money";

export type TopicFaq = {
  question: string;
  answer: string;
};

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
  /** DB 키워드 검색용 */
  keywords: string[];
  /** FAQ (People Also Ask 대응, FAQPage JSON-LD) */
  faqs: TopicFaq[];
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
    faqs: [
      {
        question: "직장 스트레스를 익명으로 털어놓을 수 있는 공간이 있나요?",
        answer: "블랙펄즈에서는 직장 스트레스, 상사 문제, 퇴사 고민, 번아웃 등을 익명으로 자유롭게 이야기할 수 있습니다. 회원가입 없이도 글을 읽을 수 있습니다.",
      },
      {
        question: "퇴사 고민을 주변에 말하기 어려울 때 어떻게 하나요?",
        answer: "퇴사 결정은 혼자 감당하기 어렵습니다. 블랙펄즈의 익명 공간에서 솔직한 고민을 꺼내고, 비슷한 경험을 가진 사람들의 이야기를 통해 힌트를 얻어보세요.",
      },
      {
        question: "번아웃인지 어떻게 알 수 있나요?",
        answer: "매일 출근이 버겁고, 작은 일에도 에너지가 소진되며, 이전에 좋아하던 일도 의욕이 사라진다면 번아웃일 수 있습니다. 블랙펄즈에서 같은 경험을 나누는 이야기를 찾아보세요.",
      },
    ],
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
    faqs: [
      {
        question: "연애 고민을 익명으로 털어놓을 수 있는 곳이 있나요?",
        answer: "블랙펄즈에서는 이별, 짝사랑, 권태기, 집착 등 연애에서 말 못한 감정을 익명으로 자유롭게 이야기할 수 있습니다.",
      },
      {
        question: "이별 후 힘든 마음을 어떻게 털어놓을 수 있나요?",
        answer: "이별 후의 감정은 쉽게 꺼내기 어렵습니다. 블랙펄즈에서 익명으로 솔직한 마음을 적고, 비슷한 경험을 가진 사람들의 위로와 공감을 받아보세요.",
      },
      {
        question: "짝사랑 고백을 해야 할지 어떻게 판단하나요?",
        answer: "정답은 없습니다. 블랙펄즈에서 비슷한 상황을 겪은 사람들의 이야기를 읽으며 자신에게 맞는 선택을 찾아가세요.",
      },
    ],
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
    faqs: [
      {
        question: "가족 문제를 주변에 말하기 어려울 때 어디에 털어놓나요?",
        answer: "가족 문제는 친구에게도 꺼내기 어렵습니다. 블랙펄즈에서는 부모 갈등, 형제 불화, 부부 문제 등을 익명으로 이야기하고 공감을 받을 수 있습니다.",
      },
      {
        question: "부모님과의 갈등을 혼자 감당하기 힘들 때 어떻게 하나요?",
        answer: "혼자 끌어안고 있는 무게를 내려놓는 것이 먼저입니다. 블랙펄즈에서 익명으로 상황을 털어놓고 비슷한 경험을 나눈 사람들의 이야기를 들어보세요.",
      },
      {
        question: "시댁·처가 문제를 배우자에게 말하기 어려울 때는?",
        answer: "가장 말하기 어려운 주제 중 하나입니다. 블랙펄즈에서 익명으로 상황을 공유하고 다양한 시각의 조언을 구해보세요.",
      },
    ],
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
    faqs: [
      {
        question: "이유 없이 불안한 감정을 익명으로 털어놓을 수 있나요?",
        answer: "블랙펄즈에서는 이유를 설명하기 어려운 불안, 우울감, 무기력감도 익명으로 자유롭게 꺼낼 수 있습니다. 같은 감정을 겪는 사람들의 이야기가 당신 옆에 있습니다.",
      },
      {
        question: "우울한지 번아웃인지 모르겠을 때 어떻게 하나요?",
        answer: "정확한 진단은 전문가에게 받는 것이 좋습니다. 블랙펄즈에서 비슷한 감정을 겪어본 사람들의 이야기를 통해 자신의 상태를 돌아보는 계기를 만들어보세요.",
      },
      {
        question: "멘탈이 흔들릴 때 혼자 버티는 방법이 있나요?",
        answer: "혼자 버티기보다 표현하는 것이 도움이 됩니다. 블랙펄즈에서 익명으로 현재 감정을 기록하고, 같은 시간을 버텨온 사람들의 이야기에서 힘을 얻어보세요.",
      },
    ],
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
    faqs: [
      {
        question: "외롭고 공허한 마음을 익명으로 이야기할 수 있나요?",
        answer: "블랙펄즈에서는 설명하기 어려운 외로움, 고독감, 공허한 감정을 익명으로 털어놓고 공감과 위로를 받을 수 있습니다.",
      },
      {
        question: "사람들이 있어도 혼자인 느낌이 드는 이유가 무엇인가요?",
        answer: "연결되어 있지만 단절된 느낌은 많은 사람이 공유하는 감정입니다. 블랙펄즈에서 비슷한 경험을 가진 사람들의 이야기를 통해 당신이 혼자가 아님을 느껴보세요.",
      },
      {
        question: "외로움을 해소할 방법을 찾고 있어요",
        answer: "외로움의 해소는 거창한 방법보다 작은 연결에서 시작됩니다. 블랙펄즈에서 익명으로 마음을 나누며 비슷한 감정을 가진 사람들과 연결되어 보세요.",
      },
    ],
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
    faqs: [
      {
        question: "돈 문제를 익명으로 털어놓을 수 있는 공간이 있나요?",
        answer: "블랙펄즈에서는 생활비 부족, 빚, 경제적 압박 등 돈 문제를 익명으로 자유롭게 이야기하고 비슷한 상황의 사람들과 공감을 나눌 수 있습니다.",
      },
      {
        question: "빚이 있다는 사실을 가족에게 말하지 못하고 있어요",
        answer: "돈 문제는 가장 가까운 사람에게도 말하기 어렵습니다. 블랙펄즈에서 익명으로 상황을 공유하고, 비슷한 상황을 겪어온 사람들의 경험과 조언을 구해보세요.",
      },
      {
        question: "경제적 압박으로 미래가 막막할 때 어떻게 하나요?",
        answer: "막막함을 혼자 안고 있으면 더 무거워집니다. 블랙펄즈에서 익명으로 현재 상황을 털어놓고 같은 무게를 지고 있는 사람들의 이야기에서 실마리를 찾아보세요.",
      },
    ],
  },
};

export const TOPIC_SLUGS = Object.keys(TOPICS) as TopicSlug[];

export function isValidTopicSlug(slug: string): slug is TopicSlug {
  return slug in TOPICS;
}
