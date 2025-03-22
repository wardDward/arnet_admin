// src/composables/useFirebase.js
import { ref } from "vue";
import { db } from "@/utils/firebase";
import { collection, addDoc } from "firebase/firestore";

export const useExercise = () => {
  const submitting = ref(false);
  const error = ref(null);

  const submitQuiz = async (quizData:any) => {
    try {
      submitting.value = true;
      error.value = null; // Reset error before trying to submit

      await addDoc(collection(db, "exercises"), quizData);
      return "Quiz submitted successfully!";
    } catch (err) {
      error.value = err.message;
      return `Error submitting quiz: ${err.message}`;
    } finally {
      submitting.value = false;
    }
  };

  return {
    submitting,
    error,
    submitQuiz,
  };
};
