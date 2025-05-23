<template>
  <div>
    <div v-if="isMessage" class="absolute top-0 right-0 w-[200px] bg-white z-[10000] p-[20px] border border-l-[4px] border-l-green-500 rounded-md">
        User is updated
    </div>
    <!-- Background Overlay -->
    <div v-if="toggleModal || showEditUserModal" class="bg-black/50 absolute inset-0 z-[9998]"></div>

    <!-- Cancel Icon for Modal -->
    <div v-if="toggleModal || showEditUserModal" class="text-white fixed right-[50px] top-[20px] z-[9999] cursor-pointer">
      <Icon name="material-symbols:cancel-outline" style="color: white" class="h-[30px] w-[30px]"
        @click.prevent="closeModals" />
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteUserModal"
      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[999999] bg-white w-full md:w-[45%] lg:w-[45%] xl:w-[35%] p-4 rounded-lg shadow-lg">
      <div class="text-center text-lg font-semibold text-black mb-4">
        Are you sure you want to delete
        <strong>{{ userToDelete?.firstname }} {{ userToDelete?.lastname }}</strong>?
      </div>
      <div class="flex justify-center gap-4">
        <button class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded" @click="confirmDeleteUser">
          Yes, Delete
        </button>
        <button class="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded" @click="cancelDeleteUser">
          Cancel
        </button>
      </div>
    </div>

    <!-- Top Bar with Add and Search -->
    <div class="flex justify-between items-center my-4">
      <button class="text-sm hover:underline gradient-text" type="button" @click.prevent="toggleModal = true">
        Add Account
      </button>

      <input type="text" v-model="searchQuery" placeholder="Search by student number or email"
        class="w-full md:w-[300px] border border-slate-300 px-3 py-1 rounded" />
    </div>

    <!-- Add Account Modal -->
    <div v-if="toggleModal"
      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[999999] bg-white w-full md:w-[45%] lg:w-[45%] xl:w-[35%] p-2 rounded-lg shadow-lg">
      <div class="text-center text-lg font-semibold tracking-wide mb-2">
        Add Account
      </div>
      <hr />
      <form class="p-4" @submit.prevent="handleRegister">
        <div class="flex flex-col mb-2">
          <label class="text-sm">Student Number</label>
          <input type="text" v-model="studno" class="w-full border border-slate-300 py-1 rounded-md px-2" />
          <span v-if="errors.studno" class="text-red-500 text-xs">{{ errors.studno }}</span>
        </div>
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
        <button type="submit" class="gradient w-full text-white text-lg font-medium tracking-wide py-2 rounded-md">
          Add
        </button>
      </form>
    </div>

    <!-- Edit User Modal -->
    <div v-if="showEditUserModal"
      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[999999] bg-white w-full md:w-[45%] lg:w-[45%] xl:w-[35%] p-2 rounded-lg shadow-lg">
      <div class="text-center text-lg font-semibold tracking-wide mb-2">
        Edit Account
      </div>
      <hr />
      <form class="p-4" @submit.prevent="handleEdit">
        <div class="flex flex-col mb-2">
          <label class="text-sm">Student Number</label>
          <input type="text" v-model="editStudno" class="w-full border border-slate-300 py-1 rounded-md px-2" />
          {{ editErrors.studno }}
        </div>
        <div class="flex flex-col mb-2">
          <label class="text-sm">Firstname</label>
          <input type="text" v-model="editFirstname" class="w-full border border-slate-300 py-1 rounded-md px-2" />
          <span v-if="editErrors.firstname" class="text-red-500 text-xs">
            {{ editErrors.firstname }}
          </span>
        </div>
        <div class="flex flex-col mb-2">
          <label class="text-sm">Lastname</label>
          <input type="text" v-model="editLastname" class="w-full border border-slate-300 py-1 rounded-md px-2" />
          <span v-if="editErrors.lastname" class="text-red-500 text-xs">
            {{ editErrors.lastname }}
          </span>
        </div>
        <div class="flex flex-col mb-2">
          <label class="text-sm">Email Address</label>
          <input type="email" v-model="editEmail" class="w-full border border-slate-300 py-1 rounded-md px-2" />
          <span v-if="editErrors.email" class="text-red-500 text-xs">
            {{ editErrors.email }}
          </span>
        </div>
    
        <button type="submit" class="gradient w-full text-white text-lg font-medium tracking-wide py-2 rounded-md">
          Save Changes
        </button>
      </form>
    </div>

    <!-- Loading Spinner -->
    <div v-if="isLoading" class="fixed inset-0 z-[9999999] bg-black bg-opacity-50 flex items-center justify-center">
      <div class="border-4 border-white border-t-transparent h-12 w-12 rounded-full animate-spin"></div>
    </div>

    <!-- User Table -->
    <table v-if="!isLoading" class="w-full text-sm text-left text-gray-500">
      <thead class="text-xs text-gray-700 uppercase bg-gray-50">
        <tr>
          <th class="px-6 py-3">Student Number</th>
          <th class="px-6 py-3">Firstname</th>
          <th class="px-6 py-3">Lastname</th>
          <th class="px-6 py-3">Email</th>
          <th class="px-6 py-3">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in paginatedUsers" :key="user.id" class="bg-white border-b">
          <td class="px-6 py-4">{{ user.studno }}</td>
          <td class="px-6 py-4">{{ user.firstname }}</td>
          <td class="px-6 py-4">{{ user.lastname }}</td>
          <td class="px-6 py-4">{{ user.email }}</td>
          <td class="px-6 py-4 flex space-x-2">
            <button @click="openEditModal(user)" class="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
              Edit
            </button>
            <button @click="promptDeleteUser(user)" class="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600">
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination Controls -->
    <div v-if="!isLoading && totalPages > 1" class="flex justify-center gap-2 mt-4">
      <button @click="prevPage" :disabled="currentPage === 1" class="px-3 py-1 rounded border"
        :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }">
        Prev
      </button>

      <button v-for="page in pageNumbers" :key="page" @click="goToPage(page)"
        :class="['px-3 py-1 rounded border', currentPage === page ? 'bg-green-500 text-white' : 'bg-white']">
        {{ page }}
      </button>

      <button @click="nextPage" :disabled="currentPage === totalPages" class="px-3 py-1 rounded border"
        :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }">
        Next
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useAuth } from "@/composables/useAuth";

const studno = ref("");
const firstname = ref("");
const lastname = ref("");
const email = ref("");
const password = ref("");
const toggleModal = ref(false);
const showDeleteUserModal = ref(false);
const userToDelete = ref<any>(null);
const searchQuery = ref("");
const isLoading = ref(false);

// Edit user state
const showEditUserModal = ref(false);
const userToEdit = ref<any>(null);
const editStudno = ref("");
const editFirstname = ref("");
const editLastname = ref("");
const editEmail = ref("");
const editErrors = ref({
  studno: "",
  firstname: "",
  lastname: "",
  email: "",
});

const errors = ref({
  studno: "",
  firstname: "",
  lastname: "",
  email: "",
  password: "",
});

const currentPage = ref(1);
const itemsPerPage = 6;

const { register, users, fetchUsers, deleteUser, updateUser } = useAuth();

const handleRegister = async () => {
  errors.value = { firstname: "", lastname: "", email: "", password: "", studno: "" };

  if (!studno.value.trim()) errors.value.firstname = "Student number is required.";
  if (!firstname.value.trim()) errors.value.firstname = "Firstname is required.";
  if (!lastname.value.trim()) errors.value.lastname = "Lastname is required.";
  if (!email.value.trim()) errors.value.email = "Email is required.";
  if (!password.value.trim()) errors.value.password = "Password is required.";

  const existingUser = users.value.find(
    (user: any) => user.studno === studno.value || user.email === email.value
  );

  if (existingUser) {
    if (existingUser.studno === studno.value) errors.value.studno = "Student number already exists.";
    if (existingUser.email === email.value) errors.value.email = "Email already exists.";
  }

  if (Object.values(errors.value).some((err) => err)) return;

  try {
    await register(email.value, password.value, firstname.value, lastname.value, studno.value, );
    firstname.value = "";
    lastname.value = "";
    email.value = "";
    password.value = "";
    studno.value = "";
    toggleModal.value = false;
    await fetchUsers(); // refresh the list
  } catch (error: any) {
    errors.value.email = error.message || "An error occurred.";
  }
};

const openEditModal = (user: any) => {
  userToEdit.value = user;
  editStudno.value = user.studno;
  editFirstname.value = user.firstname;
  editLastname.value = user.lastname;
  editEmail.value = user.email;
  showEditUserModal.value = true;
};

const isMessage = ref(false)
const handleEdit = async () => {
  editErrors.value = { studno: "", firstname: "", lastname: "", email: "" };

  if (!editStudno.value.trim()) editErrors.value.firstname = "Student number is required.";
  if (!editFirstname.value.trim()) editErrors.value.firstname = "Firstname is required.";
  if (!editLastname.value.trim()) editErrors.value.lastname = "Lastname is required.";
  if (!editEmail.value.trim()) editErrors.value.email = "Email is required.";

  const existingUser = users.value.find(
    (user: any) =>
      user.id !== userToEdit.value.id &&
      (user.studno === editStudno.value || user.email === editEmail.value)
  );

  if (existingUser) {
    if (existingUser.studno === editStudno.value) editErrors.value.studno = "Student number already exists.";
    if (existingUser.email === editEmail.value) editErrors.value.email = "Email already exists.";
  }

  if (Object.values(editErrors.value).some((err) => err)) return;

  try {
    await updateUser(userToEdit.value.id, {
      studno: editStudno.value,
      firstname: editFirstname.value,
      lastname: editLastname.value,
      email: editEmail.value
    });
    showEditUserModal.value = false;
    isMessage.value = true
    await fetchUsers();
    setTimeout(() => {
      isMessage.value = false
    }, (3000));
  } catch (error: any) {
    editErrors.value.email = error.message || "An error occurred during update.";
  }
};

const closeModals = () => {
  toggleModal.value = false;
  showEditUserModal.value = false;
  showDeleteUserModal.value = false;
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
    user.studno.toLowerCase().includes(query) ||
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