"use server";

import { apiGet, apiPatch, apiPost } from "@/lib/api";
import {
  ChallengeSubmissionDetail,
  ChallengeSubmissionHistoryResponse,
  UpdateSubmissionNoteResult,
} from "@/types";

type SubmissionPayload = {
  challengeId: string;
  code: string;
  language: string;
};

type CodeExecutionResponse = {
  submissionId?: string;
  testCaseResults: unknown[];
  allPassed?: boolean;
  passedTestCases?: number;
  totalTestCases?: number;
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export const runCode = async (data: SubmissionPayload) => {
  try {
    const res = await apiPost<CodeExecutionResponse>("/submissions/run", data);
    return { success: true, data: res };
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to run code");
    console.error("Run Code Error:", message);
    return {
      success: false,
      error: message,
    };
  }
};

export const submitChallenge = async (data: SubmissionPayload) => {
  try {
    const res = await apiPost<CodeExecutionResponse>("/submissions/submit", data);
    return { success: true, data: res };
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to submit challenge");
    console.error("Submit Challenge Error:", message);
    return {
      success: false,
      error: message,
    };
  }
};

export const getChallengeSubmissionHistory = async (
  challengeId: string,
  params?: {
    page?: number;
    limit?: number;
    status?: string;
    language?: string;
  },
) => {
  try {
    const query = new URLSearchParams();

    if (params?.page) {
      query.set("page", params.page.toString());
    }

    if (params?.limit) {
      query.set("limit", params.limit.toString());
    }

    if (params?.status && params.status !== "all") {
      query.set("status", params.status);
    }

    if (params?.language && params.language !== "all") {
      query.set("language", params.language);
    }

    const queryString = query.toString();
    const endpoint = `/submissions/challenge/${challengeId}${
      queryString ? `?${queryString}` : ""
    }`;

    const res = await apiGet<ChallengeSubmissionHistoryResponse>(endpoint);
    return { success: true, data: res };
  } catch (error: unknown) {
    const message = getErrorMessage(
      error,
      "Failed to load submission history",
    );
    console.error("Get Challenge Submission History Error:", message);
    return {
      success: false,
      error: message,
    };
  }
};

export const updateSubmissionNote = async (
  submissionId: string,
  note: string | null,
  noteColor?: string | null,
) => {
  try {
    const res = await apiPatch<UpdateSubmissionNoteResult>(
      `/submissions/${submissionId}/note`,
      { note, noteColor },
    );
    return { success: true, data: res };
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to update submission note");
    console.error("Update Submission Note Error:", message);
    return {
      success: false,
      error: message,
    };
  }
};

export const getSubmissionDetail = async (submissionId: string) => {
  try {
    const res = await apiGet<ChallengeSubmissionDetail>(
      `/submissions/${submissionId}`,
    );
    return { success: true, data: res };
  } catch (error: unknown) {
    const message = getErrorMessage(error, "Failed to load submission detail");
    console.error("Get Submission Detail Error:", message);
    return {
      success: false,
      error: message,
    };
  }
};
