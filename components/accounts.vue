<template>
  <div>
    <!-- Background Overlay -->
    <div v-if="toggleModal" class="bg-black/50 absolute inset-0 z-[9998]"></div>

    <!-- Cancel Icon for Modal -->
    <div
      v-if="toggleModal"
      class="text-white fixed right-[50px] top-[20px] z-[9999] cursor-pointer"
    >
      <Icon
        name="material-symbols:cancel-outline"
        style="color: white"
        class="h-[30px] w-[30px]"
        @click.prevent="toggleModal = false"
      />
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteUserModal"
      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[999999] bg-white w-full md:w-[45%] lg:w-[45%] xl:w-[35%] p-4 rounded-lg shadow-lg"
    >
      <div class="text-center text-lg font-semibold text-black mb-4">
        Are you sure you want to delete
        <strong>{{ userToDelete?.firstname }} {{ userToDelete?.lastname }}</strong>?
      </div>
      <div class="flex justify-center gap-4">
        <button
          class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          @click="confirmDeleteUser"
        >
          Yes, Delete
        </button>
        <button
          class="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
          @click="cancelDeleteUser"
        >
          Cancel
        </button>
      </div>
    </div>

    <!-- Top Bar with Add and Search -->
    <div class="flex justify-between items-center my-4">
      <button
        class="text-sm hover:underline gradient-text"
        type="button"
        @click.prevent="toggleModal = true"
      >
        Add Account
      </button>

      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search by name or email"
        class="w-full md:w-[300px] border border-slate-300 px-3 py-1 rounded"
      />
    </div>

    <!-- Add Account Modal -->
    <div
      v-if="toggleModal"
      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[999999] bg-white w-full md:w-[45%] lg:w-[45%] xl:w-[35%] p-2 rounded-lg shadow-lg"
    >
      <div class="text-center text-lg font-semibold tracking-wide mb-2">
        Add Account
      </div>
      <hr />
      <form class="p-4" @submit.prevent="handleRegister">
        <div class="flex flex-col mb-2">
          <label class="text-sm">Firstname</label>
          <input type="text" v-model="firstname" class="w-full border border-slate-300 py-1 rounded-md px-2" />
          <span v-if="errors.firstname" class="text-red-500 text-xs">{{ errors.firstname }}</span>
        </div>
        <div class="flex flex-col mb-2">
          <label class="text-sm">Lastname</label>
          <input type="text" v-model="lastname" class="w-full border border-slate-300 py-1 rounded-md px-2" />
          <span v-if="errors.lastname" class="text-red-500 text-xs">{{ errors.lastname }}</span>
        </div>
        <div class="flex flex-col mb-2">
          <label class="text-sm">Email Address</label>
          <input type="email" v-model="email" class="w-full border border-slate-300 py-1 rounded-md px-2" />
          <span v-if="errors.email" class="text-red-500 text-xs">{{ errors.email }}</span>
        </div>
        <div class="flex flex-col mb-2">
          <label class="text-sm">Password</label>
          <input type="password" v-model="password" class="w-full border border-slate-300 py-1 rounded-md px-2" />
          <span v-if="errors.password" class="text-red-500 text-xs">{{ errors.password }}</span>
        </div>
        <button
          type="submit"
          class="gradient w-full text-white text-lg font-medium tracking-wide py-2 rounded-md"
        >
          Add
        </button>
      </form>
    </div>

    <!-- Loading Spinner -->
    <div v-if="isLoading" class="fixed inset-0 z-[9999999] bg-black/40 flex items-center justify-center">
      <svg class="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
    </div>

    <!-- User Table -->
    <table v-if="!isLoading" class="w-full text-sm text-left text-gray-500">
      <thead class="text-xs text-gray-700 uppercase bg-gray-50">
        <tr>
          <th class="px-6 py-3">Firstname</th>
          <th class="px-6 py-3">Lastname</th>
          <th class="px-6 py-3">Email</th>
          <th class="px-6 py-3">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in paginatedUsers" :key="user.id" class="bg-white border-b">
          <td class="px-6 py-4">{{ user.firstname }}</td>
          <td class="px-6 py-4">{{ user.lastname }}</td>
          <td class="px-6 py-4">{{ user.email }}</td>
          <td class="px-6 py-4">
            <button @click="promptDeleteUser(user)" class="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600">
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination Controls -->
    <div v-if="!isLoading && totalPages > 1" class="flex justify-center gap-2 mt-4">
      <button
        @click="prevPage"
        :disabled="currentPage === 1"
        class="px-3 py-1 rounded border"
        :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
      >
        Prev
      </button>

      <button
        v-for="page in pageNumbers"
        :key="page"
        @click="goToPage(page)"
        :class="['px-3 py-1 rounded border', currentPage === page ? 'bg-green-500 text-white' : 'bg-white']"
      >
        {{ page }}
      </button>

      <button
        @click="nextPage"
        :disabled="currentPage === totalPages"
        class="px-3 py-1 rounded border"
        :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useAuth } from "@/composables/useAuth";

const firstname = ref("");
const lastname = ref("");
const email = ref("");
const password = ref("");
const toggleModal = ref(false);
const showDeleteUserModal = ref(false);
const userToDelete = ref<any>(null);
const searchQuery = ref("");
const isLoading = ref(false);

const errors = ref({
  firstname: "",
  lastname: "",
  email: "",
  password: "",
});

const currentPage = ref(1);
const itemsPerPage = 6;

const { register, users, fetchUsers, deleteUser } = useAuth();

const handleRegister = async () => {
  errors.value = { firstname: "", lastname: "", email: "", password: "" };

  if (!firstname.value.trim()) errors.value.firstname = "Firstname is required.";
  if (!lastname.value.trim()) errors.value.lastname = "Lastname is required.";
  if (!email.value.trim()) errors.value.email = "Email is required.";
  if (!password.value.trim()) errors.value.password = "Password is required.";

  if (Object.values(errors.value).some((err) => err)) return;

  try {
    await register(email.value, password.value, firstname.value, lastname.value);
    firstname.value = "";
    lastname.value = "";
    email.value = "";
    password.value = "";
    toggleModal.value = false;
    await fetchUsers(); // refresh the list
  } catch (error: any) {
    errors.value.email = error.message || "An error occurred.";
  }
};

const promptDeleteUser = (user: any) => {
  userToDelete.value = user;
  showDeleteUserModal.value = true;
};

const confirmDeleteUser = async () => {
  if (!userToDelete.value) return;
  try {
    await deleteUser(userToDelete.value.id);
    await fetchUsers();
  } catch (error) {
    console.error("Delete failed:", error);
  } finally {
    showDeleteUserModal.value = false;
    userToDelete.value = null;
  }
};

const cancelDeleteUser = () => {
  showDeleteUserModal.value = false;
  userToDelete.value = null;
};

const filteredUsers = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return users.value.filter((user: any) =>
    user.firstname.toLowerCase().includes(query) ||
    user.lastname.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  );
});

const totalPages = computed(() =>
  Math.ceil(filteredUsers.value.length / itemsPerPage)
);

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredUsers.value.slice(start, start + itemsPerPage);
});

const goToPage = (page: number) => {
  currentPage.value = page;
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
};

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--;
};

const pageNumbers = computed(() => {
  const maxPagesToShow = 5;
  const pages = [];

  const start = Math.max(1, currentPage.value - 2);
  const end = Math.min(totalPages.value, start + maxPagesToShow - 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

onMounted(async () => {
  isLoading.value = true;
  await fetchUsers();
  isLoading.value = false;
});
</script>
