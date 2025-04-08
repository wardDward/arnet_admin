<template>
  <div class="p-6 bg-gray-100">
    <div class="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 class="text-2xl font-semibold mb-4">Create Multiple Choice Questions</h2>

      <!-- Loop through all questions -->
      <div v-for="(question, index) in questions" :key="index" class="mb-6">
        <h3 class="text-lg font-semibold mb-2">Question {{ index + 1 }}</h3>

        <!-- Question Input -->
        <div class="mb-4">
          <label for="question" class="block text-lg font-medium mb-2">Question</label>
          <input
            v-model="question.text"
            id="question"
            type="text"
            class="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter your question"
          />
        </div>

        <!-- Choices Input -->
        <div class="mb-4">
          <label for="choices" class="block text-lg font-medium mb-2">Choices</label>
          <div class="space-y-2">
            <!-- Dynamic choice inputs -->
            <div v-for="(choice, choiceIndex) in question.choices" :key="choiceIndex" class="flex items-center space-x-2">
              <span class="text-lg font-medium">Choice {{ choiceIndex + 1 }}:</span>
              <input
                v-model="question.choices[choiceIndex]"
                :id="'choice' + (choiceIndex + 1)"
                type="text"
                class="w-full p-2 border border-gray-300 rounded-md"
                :placeholder="'Enter choice ' + (choiceIndex + 1)"
              />
            </div>
          </div>
        </div>

        <!-- Correct Answer Input -->
        <div class="mb-4">
          <label for="correctAnswer" class="block text-lg font-medium mb-2">Correct Answer</label>
          <select
            v-model="question.correctAnswer"
            id="correctAnswer"
            class="w-full p-2 border border-gray-300 rounded-md"
          >
            <option v-for="(choice, choiceIndex) in question.choices" :key="choiceIndex" :value="choiceIndex">
              {{ String.fromCharCode(65 + choiceIndex) }} <!-- Converts index to A, B, C, D, etc -->
            </option>
          </select>
        </div>
      </div>

      <!-- Add New Question Button -->
      <div class="mb-6">
        <button
          @click="addQuestion"
          class="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors w-full"
        >
          Add New Question
        </button>
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
import { ref } from "vue";

// Define the structure for each multiple-choice question
const questions = ref([
  {
    text: "", // Question text
    choices: ["", "", "", ""], // Initial 4 choices
    correctAnswer: "", // Correct answer index
  },
]);

// Add a new question (with 4 initial choices)
const addQuestion = () => {
  if (questions.value.length < 10) {
    questions.value.push({
      text: "",
      choices: ["", "", "", ""], // Default to 4 choices
      correctAnswer: "",
    });
  }
};

// Handle form submission (this can be extended to save or process the data)
const handleSubmit = () => {
  console.log("All Questions Submitted:", questions.value);
};
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
