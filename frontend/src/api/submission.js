import axios from "axios";

export const createSubmission = async (submissionData) => {
  try {
    const response = await axios.post(
      `api/submissions/create`,
      submissionData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
