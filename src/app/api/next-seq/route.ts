import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST() {
  try {
    // Bảng gợi ý trong Supabase:
    // ---------------------------------------
    // drop table if exists public.discord_sequence cascade;
    //
    // create table public.discord_sequence (
    //   id          bigint generated always as identity primary key,
    //   created_at  timestamptz default now()
    // );
    //
    // -- Có thể tắt RLS cho đơn giản
    // alter table public.discord_sequence disable row level security;
    // ---------------------------------------
    const { data, error } = await supabaseAdmin
      .from("discord_sequence")
      .insert({})
      .select("id")
      .single();

    if (error || !data?.id) {
      console.error("[next-seq] Supabase error", error);
      return NextResponse.json(
        {
          ok: false,
          error: error?.message || "Failed to create sequence row",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      sequenceId: data.id as number,
    });
  } catch (err) {
    console.error("[next-seq] Unexpected error", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

