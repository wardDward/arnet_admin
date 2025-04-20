<template>
  <div>

    <!-- Loading Spinner -->
    <div v-if="isLoading" class="fixed inset-0 z-[9999999] bg-black bg-opacity-50 flex items-center justify-center">
      <div class="border-4 border-white border-t-transparent h-12 w-12 rounded-full animate-spin"></div>
    </div>

    <!-- Overlay & Close Button -->
    <div v-if="toggleModal || editModal" class="bg-black/50 absolute inset-0"></div>
    <div v-if="toggleModal || editModal" class="text-white absolute top-[20px] right-[50px] z-[999] cursor-pointer">
      <Icon name="material-symbols:cancel-outline" style="color: white" class="h-[30px] w-[30px]"
        @click.prevent="closeModals" />
    </div>
    <!-- Edit Sublesson Modal -->
    <div v-if="editModal"
      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[999999] bg-white w-full md:w-[45%] lg:w-[45%] xl:w-[35%] p-4 rounded-lg shadow-lg">
      <div class="text-center text-lg font-semibold tracking-wide mb-2">
        Edit Sublesson
      </div>
      <hr />
      <form class="p-4" @submit.prevent="updateSublesson">
        <input v-model="editSublesson.title" class="w-full p-2 border rounded mb-2" placeholder="Sublesson Title"
          required />

        <select v-model="editSublesson.parentId" class="w-full p-2 border rounded mb-2" required>
          <option disabled value="">Select Parent Lesson</option>
          <option v-for="lesson in lessons" :key="lesson.id" :value="lesson.id">
            {{ lesson.title }}
          </option>
        </select>

        <input v-model="editSublesson.videolink" class="w-full p-2 border rounded mb-2" placeholder="Video Link" />
        <textarea v-model="editSublesson.text" class="w-full p-2 border rounded mb-2" rows="15"
          placeholder="Sublesson Content"></textarea>

        <button type="submit" class="gradient w-full rounded-md text-lg font-[300] tracking-wide px-2 mt-5">
          Update
        </button>
      </form>
    </div>


    <!-- Add Sublesson Button -->
    <div class="flex items-center justify-between">
      <button class="text-sm hover:underline mb-2 gradient-text" type="button" @click.prevent="toggleModal = true">
        Add Sublesson
      </button>
      <div class="mb-4">
        <input v-model="searchQuery" type="text" placeholder="Search Sublessons" class="p-2 border rounded w-full" />
      </div>

    </div>
    <!-- Add Sublesson Modal -->
    <div v-if="toggleModal"
      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[999999] cursor-pointer bg-white w-full md:w-[45%] lg:w-[45%] xl:w-[35%] p-2 rounded-lg shadow-lg ">
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
        <input v-model="sublessonVideolink" class="w-full p-2 border rounded mb-2" placeholder="Video Link" />
        <textarea v-model="sublessonContent" class="w-full p-2 border rounded mb-2" rows="15"
          placeholder="Sublesson Content"></textarea>
        <button type="submit" class="gradient w-full rounded-md text-lg font-[300] tracking-wide px-2 mt-5">
          Add
        </button>
      </form>
    </div>

    <!-- Lessons Table -->
    <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
      <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
          <th scope="col" class="px-6 py-3">Sublesson ID</th>
          <th scope="col" class="px-6 py-3">Sublesson</th>
          <th scope="col" class="px-6 py-3">Lesson</th>
          <th scope="col" class="px-6 py-3">Content</th>
          <th scope="col" class="px-6 py-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="sublesson in paginatedSublessons" :key="sublesson.id" class="bg-white">
          <td class="px-6 py-4 font-mono text-xs">{{ sublesson.id }}</td>
          <td class="px-6 py-4">{{ sublesson.title }}</td>
          <td class="px-6 py-4">{{ sublesson.lessonTitle }}</td>
          <td class="px-6 py-4 max-w-[250px] truncate">{{ sublesson.text }}</td>
          <td class="px-6 py-4">
            <NuxtLink
              :to="{ path: `/lessons/${sublesson.id}/exercise`, query: { lessonId: sublesson.id.split('.')[0] + '.0', sublessonId: sublesson.id } }">
              <button class="text-white bg-blue-500 rounded px-4 py-2">Exercise</button>
            </NuxtLink>

            <button @click="openEditModal(sublesson)"
              class="px-4 py-2 text-white bg-yellow-500 rounded hover:bg-yellow-600 mx-2">
              Edit
            </button>
            <button @click="promptDeleteSublesson(sublesson)"
              class="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600">
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="!isLoading && totalPages > 1" class="flex justify-center gap-2 mt-4">
      <!-- Prev Button -->
      <button @click="prevPage" :disabled="currentPage === 1" class="px-3 py-1 rounded border"
        :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }">
        Prev
      </button>

      <!-- Page Numbers -->
      <button v-for="page in pageNumbers" :key="page" @click="changePage(page)"
        :class="['px-3 py-1 rounded border', currentPage === page ? 'bg-green-500 text-white' : 'bg-white']">
        {{ page }}
      </button>

      <!-- Next Button -->
      <button @click="nextPage" :disabled="currentPage === totalPages" class="px-3 py-1 rounded border"
        :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }">
        Next
      </button>
    </div>



  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import { db } from "@/utils/firebase";
import { collection, getDocs, setDoc, doc, deleteDoc } from "firebase/firestore";

// State
const toggleModal = ref(false);
const editModal = ref(false);
const lessons = ref<any[]>([]);
const sublessons = ref<any[]>([]);
const sublessonTitle = ref("");
const parentLessonId = ref("");
const sublessonContent = ref("");
const sublessonVideolink = ref("");
const editSublesson = ref<any>({ id: "", title: "", videolink: "", text: "", parentId: "" });
const isLoading = ref(false);
const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = ref(6);

// Fetch Lessons and Sublessons
onMounted(async () => {
  isLoading.value = true;
  await fetchLessons();
  isLoading.value = false;
});

// Fetch lessons and sublessons
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
    sublessons.value = resolved.flat().sort((a, b) => {
      const aParts = a.id.split('.').map(Number);
      const bParts = b.id.split('.').map(Number);
      return aParts[0] - bParts[0] || aParts[1] - bParts[1];
    });
  } catch (error) {
    console.error("Error fetching lessons or sublessons:", error);
  }
};

// Computed property for filtered sublessons based on search query
const filteredSublessons = computed(() => {
  return sublessons.value.filter(sublesson =>
    sublesson.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Computed property for total pages
const totalPages = computed(() => {
  return Math.ceil(filteredSublessons.value.length / itemsPerPage.value);
});

// Computed property for paginated sublessons
const paginatedSublessons = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredSublessons.value.slice(start, end);
});

// Method for changing pages
const changePage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
};

// Method for going to the next page
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

// Method for going to the previous page
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const pageNumbers = computed(() => {
  const range: number[] = [];
  let start = currentPage.value - 2 > 0 ? currentPage.value - 2 : 1;
  let end = currentPage.value + 2 <= totalPages.value ? currentPage.value + 2 : totalPages.value;

  if (end - start < 4) {
    start = end - 4 > 0 ? end - 4 : 1;
  }

  if (end - start + 1 < 5) {
    end = start + 4 <= totalPages.value ? start + 4 : totalPages.value;
  }

  for (let i = start; i <= end; i++) {
    range.push(i);
  }

  return range;
});


// Modal for Sublesson Edit
const openEditModal = (sublesson: any) => {
  editModal.value = true;
  editSublesson.value = sublesson;
};

// Close Modals
const closeModals = () => {
  toggleModal.value = false;
  editModal.value = false;
};

// Add Sublesson
const addSublesson = async () => {
  try {
    isLoading.value = true;
    const newSublesson = {
      title: sublessonTitle.value,
      videolink: sublessonVideolink.value,
      text: sublessonContent.value,
      parentId: parentLessonId.value
    };
    const docRef = await setDoc(doc(db, "lessons", parentLessonId.value, "sublessons", Date.now().toString()), newSublesson);
    closeModals();
    sublessonTitle.value = "";
    sublessonVideolink.value = "";
    sublessonContent.value = "";
    parentLessonId.value = "";
    await fetchLessons(); // Refetch lessons and sublessons after adding
  } catch (error) {
    console.error("Error adding sublesson:", error);
  } finally {
    isLoading.value = false;
  }
};

// Prompt for deletion
const promptDeleteSublesson = (sublesson: any) => {
  if (confirm(`Are you sure you want to delete ${sublesson.title}?`)) {
    deleteSublesson(sublesson);
  }
};

const updateSublesson = async () => {
  try {
    isLoading.value = true;
    const subRef = doc(db, "lessons", editSublesson.value.parentId, "sublessons", editSublesson.value.id);
    await setDoc(subRef, {
      title: editSublesson.value.title,
      videolink: editSublesson.value.videolink,
      text: editSublesson.value.text,
      parentId: editSublesson.value.parentId,
    });

    await fetchLessons();
    closeModals();
  } catch (error) {
    console.error("Failed to update sublesson:", error);
  } finally {
    isLoading.value = false;
  }
};


// Delete Sublesson
const deleteSublesson = async (sublesson: any) => {
  try {
    await deleteDoc(doc(db, "lessons", sublesson.parentId, "sublessons", sublesson.id));
    await fetchLessons(); // Refetch lessons and sublessons after deletion
  } catch (error) {
    console.error("Error deleting sublesson:", error);
  }
};
</script>
