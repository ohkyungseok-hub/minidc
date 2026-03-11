import { NextResponse } from "next/server";

import { createSupabaseServer } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServer();

    if (!supabase) {
      return NextResponse.json({ ok: false, poll: null });
    }

    const { data, error } = await supabase
      .from("polls" as never)
      .select("id, question, poll_options(id, label, vote_count, sort_order)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ ok: true, poll: null });
    }

    const poll = data as {
      id: string;
      question: string;
      poll_options: { id: string; label: string; vote_count: number; sort_order: number }[];
    };

    const options = [...poll.poll_options].sort((a, b) => a.sort_order - b.sort_order);
    const totalVotes = options.reduce((s, o) => s + o.vote_count, 0);

    return NextResponse.json({
      ok: true,
      poll: {
        id: poll.id,
        question: poll.question,
        totalVotes,
        options: options.map((o) => ({
          id: o.id,
          label: o.label,
          voteCount: o.vote_count,
          percent: totalVotes > 0 ? Math.round((o.vote_count / totalVotes) * 100) : 0,
        })),
      },
    });
  } catch {
    return NextResponse.json({ ok: false, poll: null }, { status: 500 });
  }
}
