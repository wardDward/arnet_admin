<template>
  <div class="p-6 bg-gray-100">
    <div v-if="sublesson" class="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
      <!-- Title Section -->
      <div class="flex items-center justify-center mb-4">
        <h2 class="text-2xl font-semibold">Create Exercise for</h2> 
        <span class="text-2xl font-bold mx-2">{{ sublesson.title }}</span>
      </div>

      <!-- Tab Buttons -->
      <div class="flex justify-between gap-4 mb-6">
        <button
          class="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors w-full"
          @click="selectedTab = 'trueOrFalse'"
        >
          True or False
        </button>
        <button
          class="bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors w-full"
          @click="selectedTab = 'sequence'"
        >
          Sequence
        </button>
        <button
          class="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors w-full"
          @click="selectedTab = 'multipleChoice'"
        >
          Multiple Choice
        </button>
      </div>

      <!-- Tab Content -->
      <div v-if="selectedTab === 'trueOrFalse'">
        <TrueOrFalse :sublesson="sublesson" />
      </div>
      <div v-if="selectedTab === 'sequence'">
        <Sequence :sublesson="sublesson" />
      </div>
      <div v-if="selectedTab === 'multipleChoice'">
        <MultipleChoice :sublesson="sublesson" />
      </div>
    </div>

    <div v-else class="text-xl text-gray-500">Loading...</div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { db } from "@/utils/firebase";
import { collection, getDocs } from "firebase/firestore";

// Import your components
import TrueOrFalse from "@/components/exercise_compo/TrueOrFalse.vue";
import Sequence from "@/components/exercise_compo/Sequence.vue";
import MultipleChoice from "@/components/exercise_compo/MultipleChoice.vue";

const route = useRoute();
const sublesson = ref<any>(null);
const isLoading = ref(false);
const selectedTab = ref(null);

onMounted(async () => {
  const sublessonId = route.params.id;
  if (!sublessonId) {
    console.warn("Missing sublesson ID in route.");
    return;
  }

  isLoading.value = true;
  await fetchSublessonById(sublessonId);
  isLoading.value = false;
});

const fetchSublessonById = async (sublessonId: string) => {
  try {
    const lessonsSnap = await getDocs(collection(db, "lessons"));

    for (const lessonDoc of lessonsSnap.docs) {
      const sublessonsRef = collection(db, "lessons", lessonDoc.id, "sublessons");
      const sublessonsSnap = await getDocs(sublessonsRef);

      for (const subDoc of sublessonsSnap.docs) {
        if (subDoc.id === sublessonId) {
          sublesson.value = {
            id: subDoc.id,
            ...subDoc.data(),
            parentId: lessonDoc.id,
            lessonTitle: lessonDoc.data().title
          };
          return;
        }
      }
    }

    console.warn("Sublesson not found");
  } catch (error) {
    console.error("Error fetching sublesson:", error);
  }
};
</script>
