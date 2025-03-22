<template>
  <div>
    <!-- Overlay & Close Button -->
    <div v-if="toggleModal" class="bg-black/50 absolute inset-0"></div>
    <div
      v-if="toggleModal"
      class="text-white absolute top-[20px] right-[50px] z-[999] cursor-pointer"
    >
      <Icon
        name="material-symbols:cancel-outline"
        style="color: white"
        class="h-[30px] w-[30px]"
        @click.prevent="toggleModal = false"
      />
    </div>

    <!-- Add Lesson Button -->
    <button
      class="text-sm hover:underline mb-2 gradient-text"
      type="button"
      @click.prevent="toggleModal = true"
    >
      Add Lesson
    </button>

    <!-- Add Lesson Modal -->
    <div
      v-if="toggleModal"
      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[999999] cursor-pointer bg-white w-full md:w-[45%] lg:w-[45%] xl:w-[35%] p-2 rounded-lg shadow-lg"
    >
      <div class="text-center text-lg font-semibold tracking-wide mb-2">
        Add Lesson
      </div>
      <hr />
      <form class="p-4" @submit.prevent="addLesson">
        <input
          v-model="lessonTitle"
          class="w-full p-2 border rounded mb-2"
          placeholder="Lesson Title"
          required
        />
        <input
          v-model="lessonTopic"
          class="w-full p-2 border rounded mb-2"
          placeholder="Lesson Topic"
          required
        />
        <Markdown v-model="lessonContent" />
        <button
          type="submit"
          class="gradient w-full rounded-md text-lg font-[300] tracking-wide px-2 mt-5"
        >
          Add
        </button>
      </form>
    </div>

    <!-- Lessons Table -->
    <table
      class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
    >
      <thead
        class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
      >
        <tr>
          <th scope="col" class="px-6 py-3">Lesson</th>
          <th scope="col" class="px-6 py-3">Topic</th>
          <th scope="col" class="px-6 py-3">Content</th>
          <th scope="col" class="px-6 py-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="lesson in lessons" :key="lesson.id" class="bg-white">
          <td class="px-6 py-4">{{ lesson.title }}</td>
          <td class="px-6 py-4">{{ lesson.topic }}</td>
          <td class="px-6 py-4 max-w-[250px] truncate">{{ lesson.content }}</td>
          <td class="px-6 py-4">
            <NuxtLink :to="{ path: `/lessons/${lesson.id}/create_quiz` }">
  <button class="text-white bg-blue-500 rounded px-4 py-2">Add Quiz</button>
</NuxtLink>
            <button
              @click="deleteLesson(lesson.id)"
              class="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { db } from "@/utils/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

// State
const toggleModal = ref(false);
const lessons = ref<any[]>([]);
const lessonTitle = ref("");
const lessonTopic = ref("");
const lessonContent = ref("");

// Fetch Lessons from Firestore
const fetchLessons = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "lessons"));
    lessons.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching lessons:", error);
  }
};

// Add a Lesson
const addLesson = async () => {
  if (!lessonTitle.value || !lessonTopic.value || !lessonContent.value) return;
  try {
    const newLesson = {
      title: lessonTitle.value,
      topic: lessonTopic.value,
      content: lessonContent.value,
    };
    const docRef = await addDoc(collection(db, "lessons"), newLesson);
    lessons.value.push({ id: docRef.id, ...newLesson });
    toggleModal.value = false;
    lessonTitle.value = "";
    lessonTopic.value = "";
    lessonContent.value = "";
  } catch (error) {
    console.error("Error adding lesson:", error);
  }
};

// Delete a Lesson
const deleteLesson = async (lessonId: string) => {
  try {
    await deleteDoc(doc(db, "lessons", lessonId));
    lessons.value = lessons.value.filter((lesson) => lesson.id !== lessonId);
  } catch (error) {
    console.error("Error deleting lesson:", error);
  }
};

// Load lessons on mount
onMounted(fetchLessons);
</script>

<style></style>
