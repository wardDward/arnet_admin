<template>
  <div>
    <!-- Exercises Table -->
    <div v-if="exercises.length">
      <h3 class="text-lg font-semibold my-4">Exercises</h3>
      <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" class="px-6 py-3">Lesson Title</th>
            <th scope="col" class="px-6 py-3">Sublesson ID</th>
            <th scope="col" class="px-6 py-3">Type</th>
            <th scope="col" class="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="exercise in exercises" 
            :key="exercise.id" 
            class="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
          >
            <td class="px-6 py-4">{{ exercise.lessonTitle }}</td>
            <td class="px-6 py-4">{{ exercise.sublessonId }}</td>
            <td class="px-6 py-4 capitalize">{{ exercise.type }}</td>
            <td class="px-6 py-4">
              <button
                @click="deleteExercise(exercise)"
                class="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-gray-600 dark:text-gray-300 mt-4">No exercises found.</div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { db } from "@/utils/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";

interface Exercise {
  id: string;
  type: string;
  lessonId: string;
  sublessonId: string;
  lessonTitle: string;
  [key: string]: any;
}

const exercises = ref<Exercise[]>([]);

const fetchExercises = async () => {
  try {
    const lessonSnapshots = await getDocs(collection(db, "lessons"));
    const allExercises: Exercise[] = [];

    for (const lessonDoc of lessonSnapshots.docs) {
      const lessonId = lessonDoc.id;
      const sublessonsRef = collection(db, `lessons/${lessonId}/sublessons`);
      const sublessonsSnapshot = await getDocs(sublessonsRef);

      for (const sublessonDoc of sublessonsSnapshot.docs) {
        const sublessonId = sublessonDoc.id;
        const sublessonData = sublessonDoc.data();
        const lessonTitle = sublessonData.title || lessonId;

        const exerciseTypes = ["quiz", "tof", "sequence"];
        for (const type of exerciseTypes) {
          const exercisesRef = collection(db, `lessons/${lessonId}/sublessons/${sublessonId}/${type}`);
          const exercisesSnapshot = await getDocs(exercisesRef);

          exercisesSnapshot.forEach((exerciseDoc) => {
            allExercises.push({
              id: exerciseDoc.id,
              type,
              lessonId,
              sublessonId,
              lessonTitle,
              ...exerciseDoc.data(),
            });
          });
        }
      }
    }

    exercises.value = allExercises;
  } catch (error) {
    console.error("Error fetching exercises:", error);
  }
};

const deleteExercise = async (exercise: Exercise) => {
  try {
    const { lessonId, sublessonId, type, id } = exercise;
    const exerciseRef = doc(db, `lessons/${lessonId}/sublessons/${sublessonId}/${type}/${id}`);
    await deleteDoc(exerciseRef);
    exercises.value = exercises.value.filter((ex) => ex.id !== id);
  } catch (error) {
    console.error("Error deleting exercise:", error);
  }
};

onMounted(() => {
  fetchExercises();
});
</script>
