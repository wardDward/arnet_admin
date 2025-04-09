<template>
  <div class="p-6 bg-gray-100">
    <h2 class="text-2xl font-semibold mb-4">Create True or False Questions</h2>

    <!-- Loop through 10 question fields -->
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div v-for="(item, index) in questionItems" :key="index" class="bg-white p-4 rounded-lg shadow-md">
        <!-- Question Input -->
        <div class="mb-4">
          <label :for="'question-' + index" class="text-lg font-medium mb-2">
            Question {{ index + 1 }}:
          </label>
          <input
            v-model="item.question"
            :id="'question-' + index"
            type="text"
            class="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Type your question here"
          />
        </div>

        <!-- Answer Dropdown -->
        <div>
          <label :for="'answer-' + index" class="text-lg font-medium mb-2">
            Answer:
          </label>
          <select
            v-model="item.answer"
            :id="'answer-' + index"
            class="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="0">True</option>
            <option value="1">False</option>
          </select>
        </div>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors w-full"
      >
        Submit Questions and Answers
      </button>
    </form>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { db } from "@/utils/firebase";
import {
  doc,
  setDoc,
  collection,
  getDocs,
  query,
  orderBy
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useRoute } from "vue-router";

const route = useRoute();
const auth = getAuth();

const lessonId = route.query.lessonId as string;
const sublessonId = route.query.sublessonId as string;

const questionItems = ref(
  Array.from({ length: 10 }, () => ({
    question: "",
    answer: "0" // Default as "True"
  }))
);

// Fetch existing TOF questions if they exist
const fetchTofQuestions = async () => {
  try {
    const tofCollectionRef = collection(
      db,
      "lessons",
      lessonId,
      "sublessons",
      sublessonId,
      "tof"
    );

    const qSnapshot = await getDocs(query(tofCollectionRef, orderBy("__name__")));

    if (!qSnapshot.empty) {
      const fetchedQuestions: typeof questionItems.value = [];

      qSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        fetchedQuestions.push({
          question: data.statement || "",
          answer: String(data.answer ?? "0")
        });
      });

      questionItems.value = fetchedQuestions;
    }
  } catch (error) {
    console.error("Failed to fetch TOF questions:", error);
  }
};

// Submit TOF questions
const handleSubmit = async () => {
  const user = auth.currentUser;
  if (!user) {
    alert("User not logged in");
    return;
  }

  try {
    const sublessonDocRef = doc(
      db,
      "lessons",
      lessonId,
      "sublessons",
      sublessonId
    );
    await setDoc(sublessonDocRef, { exercise: "tof" }, { merge: true });

    for (let i = 0; i < questionItems.value.length; i++) {
      const item = questionItems.value[i];

      const qDocRef = doc(
        db,
        "lessons",
        lessonId,
        "sublessons",
        sublessonId,
        "tof",
        `${i + 1}`
      );

      await setDoc(qDocRef, {
        statement: item.question,
        answer: Number(item.answer)
      });
    }

    alert("Questions and answers submitted successfully!");
  } catch (error) {
    console.error("Error writing to Firestore:", error);
    alert("Submission failed. Please try again.");
  }
};

// Load questions on mount
onMounted(() => {
  fetchTofQuestions();
});
</script>

<style scoped>
select {
  transition: border-color 0.3s ease;
}

select:focus {
  border-color: #4f7fcf;
}

button:disabled {
  background-color: #ccc;
}
</style>
