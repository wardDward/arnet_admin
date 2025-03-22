<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-4">Create Quiz</h2>

    <button
      class="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      @click="addQuestion"
      v-if="questions.length < 10"
    >
      + Add Question
    </button>

    <div v-for="(question, index) in questions" :key="index" class="border p-4 mb-4 rounded-lg">
      <label class="block font-semibold">Question Type:</label>
      <select v-model="question.type" class="border p-2 w-full">
        <option value="true_false">True or False</option>
        <option value="matching">Matching Quiz</option>
        <option value="sequencing">Sequencing</option>
        <option value="multiple_choice">Multiple Choice</option>
      </select>

      <div class="mt-3" v-if="question.type">
        <label class="block font-semibold">Question:</label>
        <input v-model="question.text" class="border p-2 w-full" placeholder="Enter question" />
      </div>

      <!-- True/False Question -->
      <div v-if="question.type === 'true_false'" class="mt-3">
        <label class="block font-semibold">Answer:</label>
        <select v-model="question.answer" class="border p-2 w-full">
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      </div>

      <!-- Matching Question -->
      <div v-if="question.type === 'matching'" class="mt-3">
        <label class="block font-semibold">Image URL:</label>
        <input v-model="question.image" class="border p-2 w-full" placeholder="Enter image URL" />
        <label class="block font-semibold mt-2">Answer:</label>
        <input v-model="question.answer" class="border p-2 w-full" placeholder="Enter answer" />
      </div>

      <!-- Sequencing Question -->
      <div v-if="question.type === 'sequencing'" class="mt-3">
        <label class="block font-semibold">Steps (Max: 10)</label>
        <div v-for="(step, idx) in question.sequence" :key="idx" class="flex space-x-2 mt-2">
          <span>{{ idx + 1 }}.</span>
          <input v-model="question.sequence[idx]" class="border p-2 w-full" placeholder="Enter step" />
        </div>
        <button
          class="bg-green-500 text-white px-3 py-1 mt-2 rounded"
          @click="addSequenceStep(index)"
          v-if="question.sequence.length < 10"
        >
          + Add Step
        </button>
        <label class="block font-semibold mt-2">Correct Sequence:</label>
        <input v-model="question.answer" class="border p-2 w-full" placeholder="Enter correct sequence" />
      </div>

      <!-- Multiple Choice Question -->
      <div v-if="question.type === 'multiple_choice'" class="mt-3">
        <label class="block font-semibold">Choices:</label>
        <div v-for="(choice, idx) in question.choices" :key="idx" class="flex space-x-2 mt-2">
          <input v-model="question.choices[idx]" class="border p-2 w-full" placeholder="Choice {{ idx + 1 }}" />
        </div>
        <label class="block font-semibold mt-2">Correct Answer:</label>
        <input v-model="question.answer" class="border p-2 w-full" placeholder="Enter correct answer" />
      </div>

      <button
        class="bg-red-500 text-white px-3 py-1 mt-3 rounded"
        @click="removeQuestion(index)"
      >
        Remove Question
      </button>
    </div>

    <button
      class="bg-green-500 text-white px-4 py-2 mt-4 rounded"
      @click="submitForm"
      v-if="questions.length > 0"
    >
      Submit Quiz
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useExercise } from "@/composables/useExercise"; // Import the composable

const { submitting, error, submitQuiz } = useExercise();

const questions = ref([]);

// Add a new question
const addQuestion = () => {
  if (questions.value.length < 10) {
    questions.value.push({
      type: "true_false",
      text: "",
      answer: "", // store the correct answer for all question types
      sequence: [],
      choices: ["", "", "", ""],
    });
  }
};

// Add a new step to a sequencing question
const addSequenceStep = (index) => {
  if (questions.value[index].sequence.length < 10) {
    questions.value[index].sequence.push("");
  }
};

// Remove a question
const removeQuestion = (index) => {
  questions.value.splice(index, 1);
};

// Submit the form
const submitForm = async () => {
  if (questions.value.length === 0) {
    alert("Please add at least one question.");
    return;
  }

  // Ensure we only submit if each type has no more than 10 questions
  const quizData = {
    questions: questions.value,
    createdAt: new Date(),
  };

  const result = await submitQuiz(quizData);
  alert(result);

  if (!error.value) {
    questions.value = []; // Reset form
  }
};
</script>
