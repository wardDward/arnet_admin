<template>
  <div>
     <!-- Overlay & Close Button -->
    <div v-if="toggleModal || editModal" class="bg-black/50 absolute inset-0"></div>
    <div
      v-if="toggleModal || editModal"
      class="text-white absolute top-[20px] right-[50px] z-[999] cursor-pointer"
    >
      <Icon
        name="material-symbols:cancel-outline"
        style="color: white"
        class="h-[30px] w-[30px]"
        @click.prevent="closeModals"
      />
    </div>

    <!-- Add Sublesson Button -->
    <button
      class="text-sm hover:underline mb-2 gradient-text"
      type="button"
      @click.prevent="toggleModal = true"
    >
      Add Sublesson
    </button>

    <!-- Add Sublesson Modal -->
    <div
      v-if="toggleModal"
      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[999999] cursor-pointer bg-white w-full md:w-[45%] lg:w-[45%] xl:w-[35%] p-2 rounded-lg shadow-lg "
    >
      <div class="text-center text-lg font-semibold tracking-wide mb-2">
        Add Sublesson
      </div>
      <hr />
      <form class="p-4" @submit.prevent="addSublesson">
        <input v-model="sublessonTitle" class="w-full p-2 border rounded mb-2" placeholder="Sublesson Title" required />
        <select v-model="parentLessonId" class="w-full p-2 border rounded mb-2" required>
          <option disabled value="">Select Parent Lesson</option>
          <option v-for="lesson in lessons" :key="lesson.id" :value="lesson.id">
            {{ lesson.title }}
          </option>
        </select>
        <textarea v-model="sublessonContent" class="w-full p-2 border rounded mb-2" rows="15" placeholder="Sublesson Content"></textarea>
        <button type="submit" class="gradient w-full rounded-md text-lg font-[300] tracking-wide px-2 mt-5">
          Add
        </button>
      </form>
    </div>

    <!-- Edit Sublesson Modal -->
    <div
      v-if="editModal"
      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[999999] cursor-pointer bg-white w-full md:w-[45%] lg:w-[45%] xl:w-[35%] p-2 rounded-lg shadow-lg "
    >
      <div class="text-center text-lg font-semibold tracking-wide mb-2">
        Edit Sublesson
      </div>
      <hr />
      <form class="p-4" @submit.prevent="updateSublesson">
        <input v-model="editSublesson.title" class="w-full p-2 border rounded mb-2" required />
        <textarea v-model="editSublesson.text" class="w-full p-2 border rounded mb-2" rows="17"></textarea>
        <button type="submit" class="gradient w-full rounded-md text-lg font-[300] tracking-wide px-2 mt-5">
          Update
        </button>
      </form>
    </div>
    <!-- Lessons Table -->
    <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
      <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th scope="col" class="px-6 py-3">Sublesson</th>
          <th scope="col" class="px-6 py-3">Lesson</th>
          <th scope="col" class="px-6 py-3">Content</th>
          <th scope="col" class="px-6 py-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="sublesson in sublessons" :key="sublesson.id" class="bg-white">
          <td class="px-6 py-4">{{ sublesson.title }}</td>
          <td class="px-6 py-4">{{ sublesson.lessonTitle }}</td>
          <td class="px-6 py-4 max-w-[250px] truncate">{{ sublesson.text }}</td>
          <td class="px-6 py-4">
          <!-- 
            <NuxtLink :to="{ path: `/lessons/${sublesson.id}/create_quiz` }">
              <button class="text-white bg-blue-500 rounded px-4 py-2">Add Quiz</button>
            </NuxtLink>
            -->
            <button @click="openEditModal(sublesson)" class="px-4 py-2 text-white bg-yellow-500 rounded hover:bg-yellow-600">
              Edit
            </button>
            <button @click="deleteSublesson(sublesson.id, sublesson.parentId)" class="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600">
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
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";

// State
const toggleModal = ref(false);
const editModal = ref(false);
const lessons = ref<any[]>([]);
const sublessons = ref<any[]>([]);
const sublessonTitle = ref("");
const parentLessonId = ref("");
const sublessonContent = ref("");
const editSublesson = ref<any>({ id: "", title: "", text: "", parentId: "" });

// Fetch Lessons and Sublessons
const fetchLessons = async () => {
  try {
    const lessonsSnapshot = await getDocs(collection(db, "lessons"));
    let allLessons: any[] = [];
    let allSublessons: any[] = [];

    for (const lessonDoc of lessonsSnapshot.docs) {
      const lessonData = lessonDoc.data();
      const lessonId = lessonDoc.id;
      allLessons.push({ id: lessonId, ...lessonData });

      const sublessonsSnapshot = await getDocs(collection(db, "lessons", lessonId, "sublessons"));
      sublessonsSnapshot.forEach((subDoc) => {
        allSublessons.push({
          id: subDoc.id,
          title: subDoc.data().title,
          lessonTitle: lessonData.title,
          text: subDoc.data().text,
          parentId: lessonId,
        });
      });
    }

    lessons.value = allLessons;
    sublessons.value = allSublessons;
  } catch (error) {
    console.error("Error fetching lessons:", error);
  }
};

import { getDocs, setDoc, doc, collection } from "firebase/firestore";

const addSublesson = async () => {
  if (!sublessonTitle.value || !parentLessonId.value || !sublessonContent.value) return;

  try {
    const sublessonsRef = collection(db, "lessons", parentLessonId.value, "sublessons");
    const sublessonsSnapshot = await getDocs(sublessonsRef);

    // Count existing sublessons
    const sublessonCount = sublessonsSnapshot.size;

    // Remove .0 if present and generate new ID
    const baseId = parentLessonId.value.replace(/\.0$/, ""); 
    const newId = `${baseId}.${sublessonCount + 1}`;

    const newSublesson = { id: newId, title: sublessonTitle.value, text: sublessonContent.value };

    // Use setDoc with the generated ID
    const subDocRef = doc(db, "lessons", parentLessonId.value, "sublessons", newId);
    await setDoc(subDocRef, newSublesson);

    sublessons.value.push({
      id: newId,
      title: sublessonTitle.value,
      text: sublessonContent.value,
      lessonTitle: lessons.value.find(lesson => lesson.id === parentLessonId.value)?.title || "Unknown",
      parentId: parentLessonId.value,
    });

    closeModals();
  } catch (error) {
    console.error("Error adding sublesson:", error);
  }
};


// Open Edit Modal
const openEditModal = (sublesson: any) => {
  editSublesson.value = { ...sublesson };
  editModal.value = true;
};

// Update Sublesson
const updateSublesson = async () => {
  try {
    await updateDoc(doc(db, "lessons", editSublesson.value.parentId, "sublessons", editSublesson.value.id), {
      title: editSublesson.value.title,
      text: editSublesson.value.text,
    });

    const index = sublessons.value.findIndex(sub => sub.id === editSublesson.value.id);
    sublessons.value[index] = { ...editSublesson.value };

    closeModals();
  } catch (error) {
    console.error("Error updating sublesson:", error);
  }
};

// Delete Sublesson
const deleteSublesson = async (sublessonId: string, parentLessonId: string) => {
  await deleteDoc(doc(db, "lessons", parentLessonId, "sublessons", sublessonId));
  sublessons.value = sublessons.value.filter(sub => sub.id !== sublessonId);
};

// Close Modals
const closeModals = () => {
  toggleModal.value = false;
  editModal.value = false;
};

onMounted(fetchLessons);
</script>
