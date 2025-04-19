<template>
  <div class="p-4 bg-gray-100 min-h-screen">
    <!-- Loading Spinner -->
    <div v-if="isLoading" class="fixed inset-0 z-[9999999] bg-black/40 flex items-center justify-center">
      <svg class="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
    </div>

    <div class="max-w-7xl mx-auto bg-white p-6 rounded-lg shadow">
      <!-- Header + Search -->
      <div class="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 class="text-2xl font-bold">Student Scores</h2>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by user ID or student name..."
          class="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>

      <!-- Scores Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full table-auto border-collapse">
          <thead class="bg-gray-200">
            <tr>
              <th class="text-left p-3">User ID</th>
              <th class="text-left p-3">Name</th>
              <th class="text-left p-3">Lesson Name</th>
              <th class="text-left p-3">Score</th>
              <th class="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(record, index) in paginatedScores"
              :key="index"
              class="border-b hover:bg-gray-50 transition-colors"
            >
              <td class="p-3">{{ record.userId }}</td>
              <td class="p-3">{{ record.name }}</td>
              <td class="p-3">{{ record.lesson }}</td>
              <td class="p-3">{{ record.score }}</td>
              <td class="p-3">
                <span
                  :class="[ 
                    'px-3 py-1 rounded-full text-sm font-medium',
                    record.status === 'passed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  ]"
                >
                  {{ record.status === 'passed' ? 'Passed' : `Failed` }}
                </span>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="filteredScores.length === 0">
              <td colspan="5" class="text-center text-gray-500 py-4">No records found.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Controls -->
      <div class="flex justify-between items-center mt-4">
        <button 
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-4 py-2 bg-white text-black border rounded disabled:bg-gray-300"
        >
          Previous
        </button>
        <div class="flex gap-2">
          <button
            v-for="page in totalPages"
            :key="page"
            @click="goToPage(page)"
            :class="{
              'bg-green-500 text-white': currentPage === page,
              'bg-gray-200 text-black': currentPage !== page
            }"
            class="px-4 py-2 rounded"
          >
            {{ page }}
          </button>
        </div>
        <button 
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 bg-white text-black border rounded disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { db } from '@/utils/firebase'; // Adjust this to your correct path
import { collection, getDocs } from 'firebase/firestore';

const searchQuery = ref('');
const scores = ref<any[]>([]);
const isLoading = ref(false); // Add loading state
const lessonTitleMap = new Map<string, string>();

// Pagination state
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Preload lesson titles function
const preloadLessonTitles = async () => {
  const lessonIds = ['1.0', '2.0', '3.0', '4.0', '5.0', '6.0', '7.0', '8.0', '9.0', '10.0'];

  for (const lessonId of lessonIds) {
    const sublessonsRef = collection(db, `lessons/${lessonId}/sublessons`);
    const sublessonsSnap = await getDocs(sublessonsRef);

    sublessonsSnap.forEach(doc => {
      const title = doc.data().title;
      lessonTitleMap.set(doc.id, title);
    });
  }
};

// Function to fetch data from Firestore for all users
const fetchScores = async () => {
  isLoading.value = true;
  try {
    // Step 1: Preload lesson titles only once
    await preloadLessonTitles();

    // Step 2: Fetch all user profiles
    const profilesRef = collection(db, 'profile');
    const profilesSnap = await getDocs(profilesRef);

    const allScores: any[] = [];

    const lessonIds = ['1.0', '2.0', '3.0', '4.0', '5.0', '6.0', '7.0', '8.0', '9.0', '10.0'];

    // Step 3: Process all users in parallel
    await Promise.all(profilesSnap.docs.map(async (userDoc) => {
      const userId = userDoc.id;
      const userData = userDoc.data();
      const userName = `${userData.firstname} ${userData.lastname}`;

      // Step 4: Process all lessons for this user in parallel
      const userLessonFetches = lessonIds.map(async (lessonId) => {
        const lessonRef = collection(db, `profile/${userId}/${lessonId}`);
        const lessonSnap = await getDocs(lessonRef);

        lessonSnap.forEach((subDoc) => {
          const sublessonId = subDoc.id;
          const sublessonData = subDoc.data();

          if (sublessonData.score !== undefined && sublessonData.status !== undefined) {
            const lessonTitle = lessonTitleMap.get(sublessonId) || sublessonId;

            allScores.push({
              userId,
              name: userName,
              lesson: lessonTitle,
              score: sublessonData.score,
              status: sublessonData.status,
            });
          }
        });
      });

      await Promise.all(userLessonFetches); // Wait for all lesson fetches to finish
    }));

    // Step 5: Assign once and sort
    scores.value = allScores.sort((a, b) => a.userId.localeCompare(b.userId));
  } catch (error) {
    console.error('Error fetching scores:', error);
  } finally {
    isLoading.value = false;
  }
};

// Pagination logic
const totalPages = computed(() => Math.ceil(filteredScores.value.length / itemsPerPage.value));
const paginatedScores = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredScores.value.slice(start, end);
});

// Function to handle page changes
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// Filter scores based on search query
const filteredScores = computed(() =>
  scores.value.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    s.userId.toLowerCase().includes(searchQuery.value.toLowerCase()) // Search by userId as well
  )
);

onMounted(() => {
  fetchScores();
});
</script>
