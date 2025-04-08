<template>
  <div class="p-6 bg-gray-100">
    <div class="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 class="text-2xl font-semibold mb-4">Create Multiple Choice Questions</h2>

      <!-- Loop through all questions -->
      <div v-for="(question, index) in questions" :key="index" class="mb-6">
        <h3 class="text-lg font-semibold mb-2">Question {{ index + 1 }}</h3>

        <!-- Question Input -->
        <div class="mb-4">
          <label class="block text-lg font-medium mb-2">Question</label>
          <input
            v-model="question.text"
            type="text"
            class="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter your question"
          />
        </div>

        <!-- Choices Input -->
        <div class="mb-4">
          <label class="block text-lg font-medium mb-2">Options</label>
          <div class="space-y-2">
            <div v-for="(choice, choiceIndex) in question.choices" :key="choiceIndex" class="flex items-center space-x-2">
              <span class="text-lg font-medium">{{ choiceIndex + 1 }}:</span>
              <input
                v-model="question.choices[choiceIndex]"
                type="text"
                class="w-full p-2 border border-gray-300 rounded-md"
                :placeholder="'Enter option ' + (choiceIndex + 1)"
              />
            </div>
          </div>
        </div>

        <!-- Correct Answer -->
        <div class="mb-4">
          <label class="block text-lg font-medium mb-2">Correct Answer</label>
          <select
            v-model="question.correctAnswer"
            class="w-full p-2 border border-gray-300 rounded-md"
          >
            <option v-for="(choice, choiceIndex) in question.choices" :key="choiceIndex" :value="choiceIndex">
              {{ choiceIndex + 1 }}
            </option>
          </select>
        </div>
      </div>

      <!-- Submit Button -->
      <button
        @click="handleSubmit"
        class="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors w-full"
      >
        Submit All Questions
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { db } from "@/utils/firebase";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useRoute } from "vue-router";

const route = useRoute();
const auth = getAuth();

const lessonId = route.query.lessonId as string;
const sublessonId = route.query.sublessonId as string;

const questions = ref(
  Array.from({ length: 10 }, () => ({
    text: "",
    choices: ["", "", "", ""],
    correctAnswer: 0,
  }))
);

// Fetch existing quiz questions if available
const fetchQuiz = async () => {
  try {
    const quizCollectionRef = collection(db, "lessons", lessonId, "sublessons", sublessonId, "quiz");
    const qSnapshot = await getDocs(query(quizCollectionRef, orderBy("__name__")));

    if (!qSnapshot.empty) {
      const loadedQuestions: typeof questions.value = [];

      qSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        loadedQuestions.push({
          text: data.question || "",
          choices: data.options || ["", "", "", ""],
          correctAnswer: data.answer ?? 0,
        });
      });

      questions.value = loadedQuestions;
    }
  } catch (error) {
    console.error("Failed to fetch quiz questions:", error);
  }
};

// Submit questions to Firestore
const handleSubmit = async () => {
  const user = auth.currentUser;
  if (!user) {
    alert("User not logged in");
    return;
  }

  try {
    const sublessonDocRef = doc(db, "lessons", lessonId, "sublessons", sublessonId);
    await setDoc(sublessonDocRef, { exercise: "quiz" }, { merge: true });

    for (let i = 0; i < questions.value.length; i++) {
      const q = questions.value[i];

      const questionData = {
        question: q.text,
        options: q.choices,
        answer: q.correctAnswer,
      };

      const qDocRef = doc(db, "lessons", lessonId, "sublessons", sublessonId, "quiz", `${i + 1}`);
      await setDoc(qDocRef, questionData);
    }

    alert("Multiple choice questions submitted successfully!");
  } catch (error) {
    console.error("Error submitting quiz:", error);
    alert("Submission failed. Please try again.");
  }
};

// Load existing questions on mount
onMounted(() => {
  fetchQuiz();
});
</script>

<style scoped>
input,
select {
  transition: border-color 0.3s ease;
}
input:focus,
select:focus {
  border-color: #4f7fcf;
}
button:disabled {
  background-color: #ccc;
}
</style>
