<template>
  <div class="p-4 bg-gray-100 min-h-screen">
    <!-- Loading Spinner -->
    <div v-if="isLoading" class="fixed inset-0 z-[9999999] bg-black bg-opacity-50 flex items-center justify-center">
      <div class="border-4 border-white border-t-transparent h-12 w-12 rounded-full animate-spin"></div>
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
              <th class="text-left p-3">Student Number</th>
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
import { db } from '@/utils/firebase';
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';

const searchQuery = ref('');
const scores = ref<any[]>([]);
const isLoading = ref(false);
const lessonTitleMap = new Map<string, string>();

const currentPage = ref(1);
const itemsPerPage = ref(10);

// Cache lesson titles only once
const preloadLessonTitles = (() => {
  let hasLoaded = false;
  return async () => {
    if (hasLoaded) return;
    hasLoaded = true;

    const lessonIds = Array.from({ length: 10 }, (_, i) => `${i + 1}.0`);
    const fetches = lessonIds.map(async (lessonId) => {
      const sublessonsRef = collection(db, `lessons/${lessonId}/sublessons`);
      const sublessonsSnap = await getDocs(sublessonsRef);
      sublessonsSnap.forEach(doc => {
        lessonTitleMap.set(doc.id, doc.data().title || doc.id);
      });
    });

    await Promise.all(fetches);
  };
})();

const userIdMap = new Map<string, string>();

const generateStableFakeUserId = (realUid: string) => {
  if (userIdMap.has(realUid)) return userIdMap.get(realUid)!;

  // Create a "stable" number based on the UID's hash
  let hash = 0;
  for (let i = 0; i < realUid.length; i++) {
    hash = realUid.charCodeAt(i) + ((hash << 5) - hash);
  }
  const stableNum = 1400 + (Math.abs(hash) % 600); // ensures between 1400-1999
  const fakeUid = `21-${stableNum}`;
  userIdMap.set(realUid, fakeUid);
  return fakeUid;
};


const fetchScores = async () => {
  isLoading.value = true;
  try {
    await preloadLessonTitles();

    const profilesSnap = await getDocs(collection(db, 'profile'));
    const lessonIds = Array.from({ length: 10 }, (_, i) => `${i + 1}.0`);
    const allScores: any[] = [];

    await Promise.all(profilesSnap.docs.map(async (userDoc) => {
      const { firstname, lastname } = userDoc.data();
      const userId = userDoc.id;
      const fakeUserId = generateStableFakeUserId(userId);

      const userName = `${firstname} ${lastname}`;

      const lessonsFetch = lessonIds.map(async (lessonId) => {
        const lessonSnap = await getDocs(collection(db, `profile/${userId}/${lessonId}`));

        lessonSnap.docs.forEach((subDoc) => {
          const { score, status } = subDoc.data();
          if (score !== undefined && status !== undefined) {
            allScores.push({
            userId: fakeUserId, // display fake ID only
            name: userName,
            lesson: lessonTitleMap.get(subDoc.id) || subDoc.id,
            score,
            status,
          });
          }
        });
      });

      await Promise.all(lessonsFetch);
    }));

    scores.value = allScores.sort((a, b) => a.userId.localeCompare(b.userId));
  } catch (error) {
    console.error('Error fetching scores:', error);
  } finally {
    isLoading.value = false;
  }
};

const totalPages = computed(() => Math.ceil(filteredScores.value.length / itemsPerPage.value));
const paginatedScores = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return filteredScores.value.slice(start, start + itemsPerPage.value);
});

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

const filteredScores = computed(() =>
  scores.value.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    s.userId.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
);

onMounted(fetchScores);
</script>

