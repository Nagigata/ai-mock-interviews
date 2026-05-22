"use server";

import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { ProfileSolutionsResponse, ProfileDiscussResponse } from "@/types";

export async function createSolution(
  challengeId: string,
  data: { submissionId: string; title: string; description?: string },
) {
  return apiPost(`/challenges/${challengeId}/solutions`, data);
}

export async function getSolutions(challengeId: string, page = 1, limit = 20) {
  return apiGet(`/challenges/${challengeId}/solutions?page=${page}&limit=${limit}`);
}

export async function getSolutionById(solutionId: string) {
  return apiGet(`/solutions/${solutionId}`);
}

export async function deleteSolution(solutionId: string) {
  return apiDelete(`/solutions/${solutionId}`);
}

export async function toggleSolutionUpvote(solutionId: string) {
  return apiPost(`/solutions/${solutionId}/upvote`, {});
}

export async function createComment(
  solutionId: string,
  data: { content: string; parentId?: string },
) {
  return apiPost(`/solutions/${solutionId}/comments`, data);
}

export async function updateComment(
  solutionId: string,
  commentId: string,
  data: { content: string },
) {
  return apiPatch(`/solutions/${solutionId}/comments/${commentId}`, data);
}

export async function deleteComment(solutionId: string, commentId: string) {
  return apiDelete(`/solutions/${solutionId}/comments/${commentId}`);
}

export async function toggleCommentUpvote(solutionId: string, commentId: string) {
  return apiPost(`/solutions/${solutionId}/comments/${commentId}/upvote`, {});
}

export async function getProfileSolutions(
  page = 1,
  limit = 10,
): Promise<ProfileSolutionsResponse | null> {
  try {
    return await apiGet<ProfileSolutionsResponse>(
      `/solutions/me?page=${page}&limit=${limit}`,
    );
  } catch (error) {
    console.error("Error fetching profile solutions:", error);
    return null;
  }
}

export async function getProfileDiscuss(
  page = 1,
  limit = 10,
): Promise<ProfileDiscussResponse | null> {
  try {
    return await apiGet<ProfileDiscussResponse>(
      `/solutions/me/comments?page=${page}&limit=${limit}`,
    );
  } catch (error) {
    console.error("Error fetching profile discuss:", error);
    return null;
  }
}
