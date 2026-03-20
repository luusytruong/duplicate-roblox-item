"use server";

import { api } from "../api";

export type SessionPayload = {
  cookie: string;
};

export type SessionStatus = "ALIVE" | "PAUSED" | "DIE";

export type SessionResponse = {
  id: number;
  userId: string;
  userAgent: string;
  username: string;
  cookie: string;
  status: SessionStatus;
  createdAt: Date;
  updatedAt: Date;
};

export async function createSession(
  payload: SessionPayload,
): Promise<SessionResponse | null> {
  try {
    const res = await api.post("https://express.truong.cloud/api/sessions", {
      cookie: payload.cookie,
    });

    if (!res.data || res.data.error) throw new Error(res.data.error);

    console.log(res.data);
    return res.data as SessionResponse;
  } catch (error) {
    console.error(error);
    return null;
  }
}
