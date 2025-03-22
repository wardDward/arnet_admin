<template>
  <div>
    <!-- Exercises Table -->
    <div v-if="exercises.length">
      <h3 class="text-lg font-semibold my-4">Exercises</h3>
      <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" class="px-6 py-3">Lesson Title</th>
            <th scope="col" class="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="exercise in exercises" :key="exercise.id" class="bg-white">
            <td class="px-6 py-4">{{ exercise.lessonTitle }}</td>
            <td class="px-6 py-4">
              <button
                @click="deleteExercise(exercise.id)"
                class="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { db } from "@/utils/firebase";
import { collection, getDocs, deleteDoc, doc, getDoc } from "firebase/firestore"; // Correct imports

// State for lessons and exercises
const toggleModal = ref(false);
const exercises = ref<any[]>([]);

// Fetch exercises and their related lesson titles
const fetchExercises = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "exercises"));
    const exercisePromises = querySnapshot.docs.map(async (docSnapshot) => {
      const exerciseData = { id: docSnapshot.id, ...docSnapshot.data() };
      // Fetch lesson title using the lessonId from each exercise
      const lessonRef = doc(db, "lessons", exerciseData.lessonId); // Correct use of doc function
      const lessonSnapshot = await getDoc(lessonRef);
      const lessonTitle = lessonSnapshot.exists() ? lessonSnapshot.data().title : "Unknown Lesson";
      
      // Add lesson title to exercise data
      exerciseData.lessonTitle = lessonTitle;
      return exerciseData;
    });

    // Wait for all promises to resolve and update exercises
    exercises.value = await Promise.all(exercisePromises);
  } catch (error) {
    console.error("Error fetching exercises:", error);
  }
};

// Delete exercise
const deleteExercise = async (exerciseId: string) => {
  try {
    await deleteDoc(doc(db, "exercises", exerciseId)); // Correct use of doc function
    exercises.value = exercises.value.filter((exercise) => exercise.id !== exerciseId);
  } catch (error) {
    console.error("Error deleting exercise:", error);
  }
};

onMounted(() => {
  fetchExercises();
});
</script>