"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import { apiGet } from "@/lib/api";
import {
  PaginatedResponse,
  PracticeActivityResponse,
  ProfileActivityResponse,
  SolvedChallengeItem,
  StarredChallengeItem,
  StarredInterviewItem,
  Skill,
  UserProfile,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

async function hasAuthToken() {
  return Boolean((await cookies()).get("token")?.value);
}

export async function getMyProfile(): Promise<UserProfile | null> {
  if (!(await hasAuthToken())) {
    return null;
  }

  try {
    return await apiGet<UserProfile>("/users/me");
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

export async function getMyStarredChallenges(
  page = 1,
  limit = 10,
  filters?: Record<string, string | string[]>,
): Promise<PaginatedResponse<StarredChallengeItem> | null> {
  if (!(await hasAuthToken())) {
    return null;
  }

  try {
    const query = new URLSearchParams();
    query.append("page", page.toString());
    query.append("limit", limit.toString());

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((entry) => query.append(key, entry));
        } else if (value) {
          query.append(key, value);
        }
      });
    }

    return await apiGet<PaginatedResponse<StarredChallengeItem>>(
      `/users/me/starred?${query.toString()}`,
    );
  } catch (error) {
    console.error("Error fetching starred challenges:", error);
    return null;
  }
}

export async function getMyStarredInterviews(
  page = 1,
  limit = 10,
  filters?: Record<string, string | string[]>,
): Promise<PaginatedResponse<StarredInterviewItem> | null> {
  if (!(await hasAuthToken())) {
    return null;
  }

  try {
    const query = new URLSearchParams();
    query.append("page", page.toString());
    query.append("limit", limit.toString());

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((entry) => query.append(key, entry));
        } else if (value) {
          query.append(key, value);
        }
      });
    }

    return await apiGet<PaginatedResponse<StarredInterviewItem>>(
      `/users/me/starred-interviews?${query.toString()}`,
    );
  } catch (error) {
    console.error("Error fetching starred interviews:", error);
    return null;
  }
}

export async function getMySolvedChallenges(
  page = 1,
  limit = 10,
): Promise<PaginatedResponse<SolvedChallengeItem> | null> {
  if (!(await hasAuthToken())) {
    return null;
  }

  try {
    return await apiGet<PaginatedResponse<SolvedChallengeItem>>(
      `/users/me/solved?page=${page}&limit=${limit}`,
    );
  } catch (error) {
    console.error("Error fetching solved challenges:", error);
    return null;
  }
}

export async function getMyRecentActivity(
  page = 1,
  limit = 20,
  filters?: Record<string, string | string[]>,
): Promise<PracticeActivityResponse | null> {
  if (!(await hasAuthToken())) {
    return null;
  }

  try {
    const query = new URLSearchParams();
    query.append("page", page.toString());
    query.append("limit", limit.toString());

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((entry) => query.append(key, entry));
        } else if (value) {
          query.append(key, value);
        }
      });
    }

    return await apiGet<PracticeActivityResponse>(
      `/users/me/activity?${query.toString()}`,
    );
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return null;
  }
}

export async function getProfileActivity(
  page = 1,
  limit = 10,
): Promise<ProfileActivityResponse | null> {
  if (!(await hasAuthToken())) return null;

  try {
    return await apiGet<ProfileActivityResponse>(
      `/users/me/profile-activity?page=${page}&limit=${limit}`,
    );
  } catch (error) {
    console.error("Error fetching profile activity:", error);
    return null;
  }
}

export async function getMyRecommendedSkills(
  limit = 3,
): Promise<Skill[] | null> {
  if (!(await hasAuthToken())) {
    return null;
  }

  try {
    return await apiGet<Skill[]>(`/users/me/recommended-skills?limit=${limit}`);
  } catch (error) {
    console.error("Error fetching recommended skills:", error);
    return null;
  }
}

export async function updateMyProfile(formData: FormData) {
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    return {
      success: false,
      message: "You must be signed in to update your profile.",
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to update profile.",
      };
    }

    const nextUser = data.data;
    const cookieStore = await cookies();
    const currentUserCookie = cookieStore.get("user")?.value;

    if (currentUserCookie) {
      try {
        const currentUser = JSON.parse(currentUserCookie);
        cookieStore.set("user", JSON.stringify({
          ...currentUser,
          name: nextUser.name,
          avatarUrl: nextUser.avatarUrl ?? null,
        }), {
          maxAge: 60 * 60 * 24 * 7,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          path: "/",
          sameSite: "lax",
        });
      } catch {
        // Ignore malformed cookie and keep profile updated via API.
      }
    }

    revalidatePath("/");
    revalidatePath("/profile");
    revalidatePath("/interview");

    return {
      success: true,
      data: nextUser as UserProfile,
    };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      message: "Failed to update profile.",
    };
  }
}
