import axios from "axios";
import type { RunTrace } from "./types";

export async function fetchRunTrace(
  baseUrl: string,
  flowsheetId: string
): Promise<RunTrace | null> {
  try {
    const response = await axios.get(`${baseUrl}/trace?id=${flowsheetId}`, {
      responseType: "json",
    });
    return response.data as RunTrace;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
}
