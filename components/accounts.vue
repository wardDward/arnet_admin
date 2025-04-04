<template>
  <div>
  <div v-if="toggleModal" class="bg-black/50 absolute inset-0"></div>
  <div
    v-if="toggleModal"
    class="text-white fixed right-[50px] top-[20px] z-[9999] cursor-pointer"
  >
    <Icon
      name="material-symbols:cancel-outline"
      style="color: white"
      class="h-[30px] w-[30px]"
      @click.prevent="toggleModal = !toggleModal"
    />
  </div>

    <!-- Delete Confirmation Modal for Users -->
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

    <div>
      <button
        class="text-sm hover:underline mb-2 gradient-text"
        type="button"
        @click.prevent="toggleModal = !toggleModal"
      >
        Add Account
      </button>
      <div
        v-if="toggleModal"
        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[999999] cursor-pointer bg-white w-full md:w-[45%] lg:w-[45%] xl:w-[35%] p-2 rounded-lg shadow-lg"
      >
        <div class="text-center text-lg font-semibold tracking-wide mb-2">
          Add Account
        </div>
        <hr />
        <form class="p-4" @submit.prevent="handleRegister">
          <div class="flex flex-col mb-2">
            <label class="text-sm">Firstname</label>
            <input
              type="text"
              v-model="firstname"
              class="w-full border border-slate-300 py-1 rounded-md px-2"
            />
            <span v-if="errors.firstname" class="text-red-500 text-xs">{{
              errors.firstname
            }}</span>
          </div>
          <div class="flex flex-col mb-2">
            <label class="text-sm">Lastname</label>
            <input
              type="text"
              v-model="lastname"
              class="w-full border border-slate-300 py-1 rounded-md px-2"
            />
            <span v-if="errors.lastname" class="text-red-500 text-xs">{{
              errors.lastname
            }}</span>
          </div>
          <div class="flex flex-col mb-2">
            <label class="text-sm">Email Address</label>
            <input
              type="email"
              v-model="email"
              class="w-full border border-slate-300 py-1 rounded-md px-2"
            />
            <span v-if="errors.email" class="text-red-500 text-xs">{{
              errors.email
            }}</span>
          </div>
          <div class="flex flex-col mb-2">
            <label class="text-sm">Password</label>
            <input
              type="password"
              v-model="password"
              class="w-full border border-slate-300 py-1 rounded-md px-2"
            />
            <span v-if="errors.password" class="text-red-500 text-xs">{{
              errors.password
            }}</span>
          </div>
          <button
            type="submit"
            class="gradient w-full rouned-md text-lg font-[300] tracking-wide rounded-md px-2"
          >
            Add
          </button>
        </form>
      </div>

      <div v-if="isLoading" class="fixed inset-0 z-[9999999] bg-black/40 flex items-center justify-center">
        <svg class="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      </div>

      <table
        v-if="!isLoading"
        class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
      >
        <thead
          class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
        >
          <tr>
            <th scope="col" class="px-6 py-3">Firstname</th>
            <th scope="col" class="px-6 py-3">Lastname</th>
            <th scope="col" class="px-6 py-3">Email</th>
            <th scope="col" class="px-6 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" class="bg-white">
            <td class="px-6 py-4">{{ user.firstname }}</td>
            <td class="px-6 py-4">{{ user.lastname }}</td>
            <td class="px-6 py-4">{{ user.email }}</td>
            <td class="px-6 py-4">
          <button 
            @click="promptDeleteUser(user)" 
            class="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600">
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
import { ref } from "vue";
import { useAuth } from "@/composables/useAuth";

const firstname = ref("");
const lastname = ref("");
const email = ref("");
const password = ref("");
const toggleModal = ref(false);
const errors = ref({ firstname: "", lastname: "", email: "", password: "" });
const { register, users, fetchUsers,deleteUser  } = useAuth();
const isLoading = ref(false);

const handleRegister = async () => {
  errors.value = { firstname: "", lastname: "", email: "", password: "" };

  if (!firstname.value.trim())
    errors.value.firstname = "Firstname is required.";
  if (!lastname.value.trim()) errors.value.lastname = "Lastname is required.";
  if (!email.value.trim()) errors.value.email = "Email is required.";
  if (!password.value.trim()) errors.value.password = "Password is required.";

  if (Object.values(errors.value).some((error) => error !== "")) {
    return;
  }

  try {
    await register(
      email.value,
      password.value,
      firstname.value,
      lastname.value
    );

    firstname.value = "";
    lastname.value = "";
    email.value = "";
    password.value = "";

    toggleModal.value = false;
  } catch (error: any) {
    errors.value.email = error.message;
  }
};

onMounted(async () => {
  isLoading.value = true;
  await fetchUsers();
  isLoading.value = false;
});

const showDeleteUserModal = ref(false);
const userToDelete = ref<any>(null);

const promptDeleteUser = (user: any) => {
  userToDelete.value = user;
  showDeleteUserModal.value = true;
};

const confirmDeleteUser = async () => {
  if (!userToDelete.value) return;
  try {
    await deleteUser(userToDelete.value.id);
    await fetchUsers(); // refresh list
  } catch (error) {
    console.error("Error deleting user:", error);
  } finally {
    showDeleteUserModal.value = false;
    userToDelete.value = null;
  }
};

const cancelDeleteUser = () => {
  showDeleteUserModal.value = false;
  userToDelete.value = null;
};

</script>

<style></style>
