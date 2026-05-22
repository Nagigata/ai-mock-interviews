"use server";

import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";
import type {
  AdminCommentDetail,
  AdminCommentsResponse,
  AdminDeleteContentPayload,
  AdminSolutionDetail,
  AdminSolutionsResponse,
} from "@/types";

export async function getAdminDashboard(params?: { range?: string }) {
  try {
    const query = new URLSearchParams();
    if (params?.range) query.set("range", params.range);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return await apiGet<any>(`/admin/dashboard${suffix}`);
  } catch {
    return null;
  }
}

export async function getAdminStats(params?: { range?: string }) {
  try {
    const query = new URLSearchParams();
    if (params?.range) query.set("range", params.range);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return await apiGet<any>(`/admin/stats${suffix}`);
  } catch {
    return null;
  }
}

export async function getAdminAuditLogs(params?: {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  entityType?: string;
}) {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.search) query.set("search", params.search);
    if (params?.action) query.set("action", params.action);
    if (params?.entityType) query.set("entityType", params.entityType);
    return await apiGet<any>(`/admin/audit-logs?${query.toString()}`);
  } catch {
    return null;
  }
}

export async function getAdminUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}) {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.search) query.set("search", params.search);
    if (params?.role) query.set("role", params.role);
    if (params?.status) query.set("status", params.status);
    return await apiGet<any>(`/admin/users?${query.toString()}`);
  } catch {
    return null;
  }
}

export async function getAdminUserDetail(userId: string) {
  try {
    return await apiGet<any>(`/admin/users/${userId}`);
  } catch {
    return null;
  }
}

export async function updateAdminUser(
  userId: string,
  data: { role?: string; isActive?: boolean }
) {
  try {
    return await apiPatch<any>(`/admin/users/${userId}`, data);
  } catch {
    return null;
  }
}

export async function getAdminInterviews(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  level?: string;
}) {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.search) query.set("search", params.search);
    if (params?.status) query.set("status", params.status);
    if (params?.type) query.set("type", params.type);
    if (params?.level) query.set("level", params.level);
    return await apiGet<any>(`/admin/interviews?${query.toString()}`);
  } catch {
    return null;
  }
}

export async function getAdminInterviewDetail(interviewId: string) {
  try {
    return await apiGet<any>(`/admin/interviews/${interviewId}`);
  } catch {
    return null;
  }
}

export async function getAdminInterviewAttemptDetail(
  interviewId: string,
  attemptId: string
) {
  try {
    return await apiGet<any>(
      `/admin/interviews/${interviewId}/attempts/${attemptId}`
    );
  } catch {
    return null;
  }
}

export async function archiveAdminInterview(interviewId: string) {
  return apiPatch<any>(`/admin/interviews/${interviewId}/archive`);
}

export async function restoreAdminInterview(interviewId: string) {
  return apiPatch<any>(`/admin/interviews/${interviewId}/restore`);
}

export async function getAdminChallenges(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  difficulty?: string;
  skillId?: string;
}) {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.search) query.set("search", params.search);
    if (params?.status) query.set("status", params.status);
    if (params?.difficulty) query.set("difficulty", params.difficulty);
    if (params?.skillId) query.set("skillId", params.skillId);
    return await apiGet<any>(`/admin/challenges?${query.toString()}`);
  } catch {
    return null;
  }
}

export async function createAdminChallenge(data: any) {
  return apiPost<any>("/admin/challenges", data);
}

export async function updateAdminChallenge(id: string, data: any) {
  return apiPatch<any>(`/admin/challenges/${id}`, data);
}

export async function getAdminSkills(params?: { status?: string }) {
  try {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return await apiGet<any>(`/admin/skills${suffix}`);
  } catch {
    return null;
  }
}

export async function createAdminSkill(data: {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}) {
  return apiPost<any>("/admin/skills", data);
}

export async function updateAdminSkill(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    icon?: string;
    isActive?: boolean;
  }
) {
  return apiPatch<any>(`/admin/skills/${id}`, data);
}

// ===== Admin Solutions =====

export async function getAdminSolutions(params?: {
  page?: number;
  limit?: number;
  search?: string;
  language?: string;
  challengeId?: string;
  createdFrom?: string;
  createdTo?: string;
}) {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.search) query.set("search", params.search);
    if (params?.language) query.set("language", params.language);
    if (params?.challengeId) query.set("challengeId", params.challengeId);
    if (params?.createdFrom) query.set("createdFrom", params.createdFrom);
    if (params?.createdTo) query.set("createdTo", params.createdTo);
    return await apiGet<AdminSolutionsResponse>(
      `/admin/solutions?${query.toString()}`,
    );
  } catch {
    return null;
  }
}

export async function getAdminSolutionDetail(solutionId: string) {
  try {
    return await apiGet<AdminSolutionDetail>(`/admin/solutions/${solutionId}`);
  } catch {
    return null;
  }
}

export async function deleteAdminSolution(
  solutionId: string,
  data?: AdminDeleteContentPayload,
) {
  return apiDelete<{ id: string; title: string; deletedAt: string }>(
    `/admin/solutions/${solutionId}`,
    data,
  );
}

// ===== Admin Comments =====

export async function getAdminComments(params?: {
  page?: number;
  limit?: number;
  search?: string;
  hasReplies?: string;
  createdFrom?: string;
  createdTo?: string;
}) {
  try {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.search) query.set("search", params.search);
    if (params?.hasReplies) query.set("hasReplies", params.hasReplies);
    if (params?.createdFrom) query.set("createdFrom", params.createdFrom);
    if (params?.createdTo) query.set("createdTo", params.createdTo);
    return await apiGet<AdminCommentsResponse>(
      `/admin/comments?${query.toString()}`,
    );
  } catch {
    return null;
  }
}

export async function getAdminCommentDetail(commentId: string) {
  try {
    return await apiGet<AdminCommentDetail>(`/admin/comments/${commentId}`);
  } catch {
    return null;
  }
}

export async function deleteAdminComment(
  commentId: string,
  data?: AdminDeleteContentPayload,
) {
  return apiDelete<{ id: string; deletedAt: string }>(
    `/admin/comments/${commentId}`,
    data,
  );
}
