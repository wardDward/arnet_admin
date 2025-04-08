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
        <input v-model="sublessonVideolink" class="w-full p-2 border rounded mb-2" placeholder="Video Link"/>
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
        <input v-model="editSublesson.videolink" class="w-full p-2 border rounded mb-2" placeholder="Video Link"/>
        <textarea v-model="editSublesson.text" class="w-full p-2 border rounded mb-2" rows="17"></textarea>
        <button type="submit" class="gradient w-full rounded-md text-lg font-[300] tracking-wide px-2 mt-5">
          Update
        </button>
      </form>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[999999] cursor-pointer bg-white w-full md:w-[45%] lg:w-[45%] xl:w-[35%] p-4 rounded-lg shadow-lg"
    >
      <div class="text-center text-lg font-semibold tracking-wide mb-4 text-black">
        Are you sure you want to delete <b>{{ sublessonToDelete?.title }}</b>?
      </div>
      <div class="flex justify-center gap-4">
        <button
          class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          @click="confirmDelete"
        >
          Yes, Delete
        </button>
        <button
          class="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
          @click="cancelDelete"
        >
          Cancel
        </button>
      </div>
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
          
            <NuxtLink :to="{ path: `lessons/${sublesson.id}/exercise` }">
              <button class="text-white bg-blue-500 rounded px-4 py-2">Add Quiz</button>
            </NuxtLink>
           
            <button @click="openEditModal(sublesson)" class="px-4 py-2 text-white bg-yellow-500 rounded hover:bg-yellow-600 mx-2">
              Edit
            </button>
            <button @click="promptDeleteSublesson(sublesson)" class="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600">
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Global Loading Spinner -->
<div v-if="isLoading" class="fixed inset-0 z-[9999999] bg-black/40 flex items-center justify-center">
  <svg class="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
    <path class="opacity-75" fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
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
const sublessonVideolink = ref(""); // Declare the videolink variable
const editSublesson = ref<any>({ id: "", title: "", videolink: "", text: "", parentId: "" });
const isLoading = ref(false);

// Fetch Lessons and Sublessons
onMounted(async () => {
  isLoading.value = true;
  await fetchLessons();
  isLoading.value = false;
});

const fetchLessons = async () => {
  try {
    const lessonsSnapshot = await getDocs(collection(db, "lessons"));
    const lessonList: any[] = lessonsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    lessons.value = lessonList;

    const sublessonPromises = lessonList.map(async lesson => {
      const subSnap = await getDocs(collection(db, "lessons", lesson.id, "sublessons"));
      return subSnap.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        videolink: doc.data().videolink,
        text: doc.data().text,
        parentId: lesson.id,
        lessonTitle: lesson.title,
      }));
    });

    const resolved = await Promise.all(sublessonPromises);
    sublessons.value = resolved.flat();
  } catch (error) {
    console.error("Error fetching lessons or sublessons:", error);
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

    const newSublesson = {
      id: newId,
      title: sublessonTitle.value,
      text: sublessonContent.value,
      videolink: sublessonVideolink.value || "", // Add videolink here
    };

    // Use setDoc with the generated ID
    const subDocRef = doc(db, "lessons", parentLessonId.value, "sublessons", newId);
    await setDoc(subDocRef, newSublesson);

    sublessons.value.push({
      id: newId,
      title: sublessonTitle.value,
      text: sublessonContent.value,
      videolink: sublessonVideolink.value || "", // Add videolink here
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
    videolink: editSublesson.value.videolink || "", // Optional fallback
  });

    const index = sublessons.value.findIndex(sub => sub.id === editSublesson.value.id);
    sublessons.value[index] = { ...editSublesson.value };

    closeModals();
  } catch (error) {
    console.error("Error updating sublesson:", error);
  }
};

// Delete Confirmation State
const showDeleteModal = ref(false);
const sublessonToDelete = ref<any>(null);

// Open Delete Modal
const promptDeleteSublesson = (sublesson: any) => {
  sublessonToDelete.value = sublesson;
  showDeleteModal.value = true;
};

// Confirm Delete
const confirmDelete = async () => {
  if (!sublessonToDelete.value) return;
  try {
    await deleteDoc(doc(db, "lessons", sublessonToDelete.value.parentId, "sublessons", sublessonToDelete.value.id));
    sublessons.value = sublessons.value.filter(sub => sub.id !== sublessonToDelete.value.id);
  } catch (error) {
    console.error("Error deleting sublesson:", error);
  } finally {
    showDeleteModal.value = false;
    sublessonToDelete.value = null;
  }
};

// Cancel Delete
const cancelDelete = () => {
  showDeleteModal.value = false;
  sublessonToDelete.value = null;
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
