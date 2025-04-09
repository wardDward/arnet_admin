<template>
    <div class="p-4 bg-gray-100 min-h-screen">
      <div class="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow">
        <!-- Header + Search -->
        <div class="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <h2 class="text-2xl font-bold">Student Scores</h2>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by student name..."
            class="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
  
        <!-- Scores Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full table-auto border-collapse">
            <thead class="bg-gray-200">
              <tr>
                <th class="text-left p-3">Name</th>
                <th class="text-left p-3">Lesson Name</th>
                <th class="text-left p-3">Score</th>
                <th class="text-left p-3">Status</th>
                <th class="text-left p-3">Time Submitted</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(record, index) in filteredScores"
                :key="index"
                class="border-b hover:bg-gray-50 transition-colors"
              >
                <td class="p-3">{{ record.name }}</td>
                <td class="p-3">{{ record.lesson }}</td>
                <td class="p-3">{{ record.score }}</td>
                <td class="p-3">
                  <span
                    :class="[
                      'px-3 py-1 rounded-full text-sm font-medium',
                      record.status === 'Passed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    ]"
                  >
                    {{ record.status }}
                  </span>
                </td>
                <td class="p-3">{{ record.time }}</td>
              </tr>
  
              <!-- Empty State -->
              <tr v-if="filteredScores.length === 0">
                <td colspan="5" class="text-center text-gray-500 py-4">No records found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { ref, computed } from 'vue';
  
  const scores = ref([
    { name: 'Alice Johnson', lesson: 'Math Basics', score: 95, status: 'Passed', time: '2025-04-09 10:12 AM' },
    { name: 'Bob Smith', lesson: 'Physics I', score: 72, status: 'Passed', time: '2025-04-08 4:20 PM' },
    { name: 'Charlie Ray', lesson: 'History', score: 58, status: 'Failed', time: '2025-04-07 3:00 PM' },
    { name: 'Diana King', lesson: 'Biology', score: 88, status: 'Passed', time: '2025-04-09 9:00 AM' },
  ]);
  
  const searchQuery = ref('');
  
  const filteredScores = computed(() =>
    scores.value.filter((s) =>
      s.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  );
  </script>
  
  <style scoped>
  table {
    border-spacing: 0;
  }
  th,
  td {
    min-width: 120px;
  }
  </style>
  