<template>
  <div class="p-6 bg-gray-100">
    <h2 class="text-2xl font-semibold mb-4">Create Questions and Answers</h2>

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

        <!-- Answer Input -->
        <div>
          <label :for="'answer-' + index" class="text-lg font-medium mb-2">
            Answer {{ index + 1 }}:
          </label>
          <input
            v-model="item.answer"
            :id="'answer-' + index"
            type="text"
            class="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Type your answer here"
          />
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
import { ref } from "vue";

const questionItems = ref(
  Array.from({ length: 10 }, (_, index) => ({
    question: ``, // Default question
    answer: "", // Empty answer field
  }))
);

const handleSubmit = () => {
  console.log(questionItems.value);
};
</script>

<style scoped>
input {
  transition: border-color 0.3s ease;
}

input:focus {
  border-color: #4f7fcf;
}

button:disabled {
  background-color: #ccc;
}
</style>
