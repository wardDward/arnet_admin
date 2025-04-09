<template>
  <div class="p-6 bg-gray-100">
    <h2 class="text-2xl font-semibold mb-4 text-center">Sequence Questions</h2>

    <!-- Input Container -->
    <div class="bg-white p-6 rounded-lg shadow-md space-y-4 max-w-2xl mx-auto">
      <!-- Instruction Input -->
      <div class="mb-4">
        <label class="block text-gray-700 font-medium mb-2">Instruction:</label>
        <input
          v-model="instruction"
          type="text"
          class="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter instruction for the sequence"
        />
      </div>

      <!-- Step Inputs -->
      <div
        v-for="(item, index) in questions"
        :key="item.id"
        class="flex items-center space-x-2 border p-3 rounded-md"
      >
        <span class="text-lg font-medium text-gray-700 w-24">Step {{ index + 1 }}:</span>
        <input
          v-model="item.text"
          type="text"
          class="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          placeholder="Enter a step or statement"
        />
      </div>
    </div>

    <!-- Submit Button -->
    <button
      @click="handleSubmit"
      class="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors w-full mt-4"
    >
      Submit Sequence
    </button>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { db } from "@/utils/firebase"; // Your Firebase config
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useRoute } from "vue-router";

const route = useRoute();
const auth = getAuth();

// Create an array of 10 items with a text property (to be used in the input field)
const questions = ref(
  Array.from({ length: 10 }, (_, index) => ({
    id: index + 1,
    text: "", // Default value for each item
  }))
);

// Fetch existing sequence questions if they exist
const instruction = ref("");

// Fetch existing sequence questions and instruction
const fetchSequenceQuestions = async () => {
  const lessonId = route.query.lessonId as string;
  const sublessonId = route.query.sublessonId as string;

  try {
    const sequenceDocRef = doc(
      db,
      "lessons",
      lessonId,
      "sublessons",
      sublessonId,
      "sequence",
      "steps"
    );

    const sequenceDocSnap = await getDoc(sequenceDocRef);

    if (sequenceDocSnap.exists()) {
      const data = sequenceDocSnap.data();

      instruction.value = data.instruction || "";

      const fetchedQuestions = Object.keys(data)
        .filter((key) => key !== "instruction")
        .map((key) => ({
          id: parseInt(key),
          text: data[key] as string,
        }));

      questions.value = fetchedQuestions;
    }
  } catch (error) {
    console.error("Failed to fetch sequence questions:", error);
  }
};

// Submit with instruction
const handleSubmit = async () => {
  const user = auth.currentUser;
  if (!user) {
    alert("User not logged in");
    return;
  }

  const lessonId = route.query.lessonId as string;
  const sublessonId = route.query.sublessonId as string;

  try {
    // Set the 'exercise' field to "sequence"
    const sublessonDocRef = doc(db, "lessons", lessonId, "sublessons", sublessonId);
    await setDoc(sublessonDocRef, { exercise: "sequence" }, { merge: true });

    // Save the sequence steps + instruction
    const stepsDocRef = doc(db, "lessons", lessonId, "sublessons", sublessonId, "sequence", "steps");

    const stepsData = questions.value.reduce((acc, item, index) => {
      acc[String(index + 1)] = item.text;
      return acc;
    }, {} as Record<string, string>);

    stepsData.instruction = instruction.value;

    await setDoc(stepsDocRef, stepsData);

    alert("Sequence questions submitted successfully!");
  } catch (error) {
    console.error("Error writing to Firestore:", error);
    alert("Submission failed. Please try again.");
  }
};

// Load sequence questions on mount
onMounted(() => {
  fetchSequenceQuestions();
});
</script>

<style scoped>
.dragging {
  opacity: 0.5;
}

button:disabled {
  background-color: #ccc;
}
</style>
