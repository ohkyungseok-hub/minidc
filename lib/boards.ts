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
    id: "board-general",
    slug: "general",
    name: "자유",
    description: "가벼운 잡담과 링크 공유를 위한 기본 게시판",
    accent: "#f59e0b",
    created_at: "2026-03-09T09:00:00.000Z",
  },
  {
    id: "board-dev",
    slug: "dev",
    name: "개발",
    description: "Next.js, Supabase, 배포 이슈를 다루는 공간",
    accent: "#0f172a",
    created_at: "2026-03-09T09:10:00.000Z",
  },
  {
    id: "board-design",
    slug: "design",
    name: "디자인",
    description: "UI 레이아웃, 인터랙션, 브랜딩 시안을 논의하는 공간",
    accent: "#dc2626",
    created_at: "2026-03-09T09:20:00.000Z",
  },
];

const boardAccentPalette = ["#f59e0b", "#0f172a", "#dc2626", "#0369a1", "#166534"];

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
