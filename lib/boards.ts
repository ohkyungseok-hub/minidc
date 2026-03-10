import { createSupabaseServer } from "@/lib/supabase/server";
import type { Board } from "@/types";

type SupabaseBoardRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  created_at: string;
};

export const mockBoards: Board[] = [
  {
    id: "board-confession",
    slug: "confession",
    name: "고해성사",
    description: "누구에게도 말 못할 일을 고백해보세요. 조금이나마 마음이 편안해질거예요",
    accent: "#DCC6FF",
    created_at: "2026-03-09T09:00:00.000Z",
  },
  {
    id: "board-comfort",
    slug: "comfort",
    name: "위로받고 싶어요",
    description: "삶이 힘든신가요? 위로받고 싶은 일이 있다면 알려주세요. 저희가 함께 응원해드릴게요.",
    accent: "#A7C7E7",
    created_at: "2026-03-09T09:10:00.000Z",
  },
  {
    id: "board-solutions",
    slug: "solutions",
    name: "해결책을 제시해주세요",
    description: "지피티가 해결하지 못한 삶의 지혜가 필요하신가요? 집단지성으로 당신을 도와드릴게요",
    accent: "#E9DCC9",
    created_at: "2026-03-09T09:20:00.000Z",
  },
];

const boardAccentPalette = ["#DCC6FF", "#A7C7E7", "#E9DCC9", "#DCC6FF", "#A7C7E7"];

function attachBoardAccent(board: Omit<Board, "accent">, index = 0): Board {
  const fallback = mockBoards.find((item) => item.slug === board.slug)?.accent;

  return {
    ...board,
    accent: fallback ?? boardAccentPalette[index % boardAccentPalette.length],
  };
}

export async function getBoards() {
  const supabase = await createSupabaseServer();

  if (!supabase) {
    return mockBoards;
  }

  const { data, error } = await supabase
    .from("boards")
    .select("id, slug, name, description, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    return [];
  }

  if (!data) {
    return [];
  }

  return (data as SupabaseBoardRow[]).map((board, index) =>
    attachBoardAccent(
      {
        id: board.id,
        slug: board.slug,
        name: board.name,
        description: board.description,
        created_at: board.created_at,
      },
      index,
    ),
  );
}

export async function getBoardBySlug(slug: string) {
  const supabase = await createSupabaseServer();

  if (!supabase) {
    return mockBoards.find((board) => board.slug === slug) ?? null;
  }

  const { data, error } = await supabase
    .from("boards")
    .select("id, slug, name, description, created_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    return null;
  }

  if (!data) {
    return null;
  }

  const board = data as SupabaseBoardRow;

  return attachBoardAccent({
    id: board.id,
    slug: board.slug,
    name: board.name,
    description: board.description,
    created_at: board.created_at,
  });
}

export async function getBoardById(id: string) {
  const supabase = await createSupabaseServer();

  if (!supabase) {
    return mockBoards.find((board) => board.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from("boards")
    .select("id, slug, name, description, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const board = data as SupabaseBoardRow;

  return attachBoardAccent({
    id: board.id,
    slug: board.slug,
    name: board.name,
    description: board.description,
    created_at: board.created_at,
  });
}
