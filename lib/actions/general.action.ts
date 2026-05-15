"use server";

import { apiGet, apiPost, apiDelete } from "@/lib/api";
import { 
  CreateFeedbackParams, 
  Feedback, 
  FeedbackGenerationStartResult,
  Interview, 
  InterviewAttempt,
  InterviewAttemptDetail,
  InterviewGenerationJob,
  GetFeedbackByAttemptIdParams,
  GetFeedbackByInterviewIdParams, 
  GetLatestInterviewsParams 
} from "@/types";

export async function createFeedback(params: CreateFeedbackParams) {
  const { attemptId, transcript } = params;

  try {
    const feedback = await apiPost<Feedback>("/feedbacks", {
      attemptId,
      transcript,
    });

    return { success: true, feedbackId: feedback.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to generate interview feedback.",
    };
  }
}

export async function startFeedbackGeneration(params: CreateFeedbackParams) {
  const { attemptId, transcript } = params;

  try {
    const result = await apiPost<FeedbackGenerationStartResult>(
      "/feedbacks/start-generation",
      {
        attemptId,
        transcript,
      },
    );

    return {
      success: result.status === "FEEDBACK_PROCESSING",
      status: result.status,
      message: result.message,
    };
  } catch (error) {
    console.error("Error starting feedback generation:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to start interview feedback generation.",
    };
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  try {
    return await apiGet<Interview>(`/interviews/${id}`);
  } catch {
    return null;
  }
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams,
): Promise<Feedback | null> {
  const { interviewId } = params;

  try {
    return await apiGet<Feedback>(`/feedbacks/interview/${interviewId}`);
  } catch {
    return null;
  }
}

export async function getFeedbackByAttemptId(
  params: GetFeedbackByAttemptIdParams,
): Promise<Feedback | null> {
  const { attemptId } = params;

  try {
    return await apiGet<Feedback>(`/feedbacks/attempt/${attemptId}`);
  } catch {
    return null;
  }
}

export async function createInterviewAttempt(
  interviewId: string,
): Promise<InterviewAttempt | null> {
  try {
    return await apiPost<InterviewAttempt>(`/interviews/${interviewId}/attempts`);
  } catch {
    return null;
  }
}

export async function getInterviewAttempts(
  interviewId: string,
): Promise<InterviewAttempt[] | null> {
  try {
    return await apiGet<InterviewAttempt[]>(`/interviews/${interviewId}/attempts`);
  } catch {
    return null;
  }
}

export async function getInterviewAttemptById(
  attemptId: string,
): Promise<InterviewAttemptDetail | null> {
  try {
    return await apiGet<InterviewAttemptDetail>(`/interviews/attempts/${attemptId}`);
  } catch {
    return null;
  }
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams,
): Promise<Interview[] | null> {
  try {
    const searchParams = new URLSearchParams();
    if (params.limit) {
      searchParams.set("limit", params.limit.toString());
    }

    const queryString = searchParams.toString();
    return await apiGet<Interview[]>(
      queryString ? `/interviews/latest?${queryString}` : "/interviews/latest",
    );
  } catch {
    return null;
  }
}

export async function getInterviewsByUserId(
  _userId: string,
): Promise<Interview[] | null> {
  void _userId;

  try {
    // Backend gets userId from JWT token automatically
    return await apiGet<Interview[]>("/interviews");
  } catch {
    return null;
  }
}

export async function getAttemptedInterviews(): Promise<Interview[] | null> {
  try {
    return await apiGet<Interview[]>("/interviews/attempted");
  } catch {
    return null;
  }
}

export async function getActiveInterviewGenerationJob(): Promise<InterviewGenerationJob | null> {
  try {
    return await apiGet<InterviewGenerationJob | null>(
      "/interviews/generation-jobs/active",
    );
  } catch {
    return null;
  }
}

export async function getInterviewGenerationJobById(
  jobId: string,
): Promise<InterviewGenerationJob | null> {
  try {
    return await apiGet<InterviewGenerationJob>(
      `/interviews/generation-jobs/${jobId}`,
    );
  } catch {
    return null;
  }
}

export async function deleteInterview(interviewId: string) {
  try {
    await apiDelete(`/interviews/${interviewId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting interview:", error);
    return { success: false };
  }
}

export async function toggleInterviewStar(
  interviewId: string,
): Promise<{ starred: boolean } | null> {
  try {
    return await apiPost<{ starred: boolean }>(
      `/interviews/${interviewId}/star`,
    );
  } catch (error) {
    console.error("Error toggling interview star:", error);
    return null;
  }
}
