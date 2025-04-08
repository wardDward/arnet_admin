<template>
  <div class="p-6 bg-gray-100">
    <h2 class="text-2xl font-semibold mb-4 text-center">Sequence Questions</h2>

    <!-- Container for the draggable inputs -->
    <div class="bg-white p-6 rounded-lg shadow-md space-y-4 max-w-2xl mx-auto">
      <div
        v-for="(item, index) in questions"
        :key="item.id"
        class="flex items-center space-x-2 border p-3 rounded-md cursor-move"
        :draggable="true"
        @dragstart="onDragStart($event, index)"
        @dragover.prevent
        @drop="onDrop($event, index)"
      >
        <span class="text-lg font-medium text-gray-700 w-8">{{ index + 1 }}:</span>
        <input
          v-model="item.text"
          type="text"
          class="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          placeholder="Enter a question or statement"
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
import { ref } from "vue";

// Create an array of 10 items with a text property (to be used in the input field)
const questions = ref(
  Array.from({ length: 10 }, (_, index) => ({
    id: index + 1,
    text: `Item ${index + 1}`, // Default value for each item
  }))
);

let draggedIndex: number | null = null;

// Handle drag start event
const onDragStart = (event: DragEvent, index: number) => {
  draggedIndex = index; // Store the index of the dragged item
  event.dataTransfer?.setData("text/plain", String(index)); // Set the dragged item's index in dataTransfer
};

// Handle drop event
const onDrop = (event: DragEvent, targetIndex: number) => {
  if (draggedIndex !== null && draggedIndex !== targetIndex) {
    // Swap the items in the array
    const draggedItem = questions.value[draggedIndex];
    questions.value.splice(draggedIndex, 1);
    questions.value.splice(targetIndex, 0, draggedItem);
  }
};

// Handle form submission
const handleSubmit = () => {
  console.log(questions.value);
};
</script>

<style scoped>
.dragging {
  opacity: 0.5;
}

button:disabled {
  background-color: #ccc;
}
</style>
