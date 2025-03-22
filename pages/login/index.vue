<template>
  <div class="flex justify-center items-center h-screen">
    <div
      class="w-full md:w-[50%] lg:w-[30%] xl:w-[25%] shadow-lg border-[1px] border-slate-200 bg-slate-100/30 p-4 rounded-md"
    >
      <div
        class="text-center text-lg md:text-2xl font-bold tracking-wide gradient-text mb-2"
      >
        Arnet
      </div>
      <form @submit.prevent="handleLogin">
        <div class="flex flex-col my-1">
          <label for="email" class="text-md text-gray-700">Email</label>
          <input
          v-model="email"
            type="email"
            class="w-full border border-slate-400 rounded-md px-2 py-2 placeholder:text-sm text-sm"
            placeholder="Enter your email"
          />
        </div>
        <div class="flex flex-col my-4">
          <label for="password" class="text-md text-gray-700">Password</label>
          <input
          v-model="password"
            type="password"
            class="w-full border border-slate-400 rounded-md px-2 py-2 placeholder:text-sm text-sm"
            placeholder="Enter your password"
          />
        </div>
        <p v-if="errorMessage" style="color: red">{{ errorMessage }}</p>
        <div class="w-full">
          <button
            :disabled="loading"
            type="submit"
            class="w-full flex items-center justify-center gradient py-1 text-black rounded-md font-[500] tracking-wide"
          >
            <svg
              v-if="loading"
              class="mr-3 -ml-1 size-5 animate-spin text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span> Log In </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
useHead({ title: "Login" });

const email = ref("");
const password = ref("");
const loading = ref(false);
const errorMessage = ref("");

const { login } = useAuth();
const router = useRouter();

const handleLogin = async () => {
  loading.value = true;
  errorMessage.value = "";
  

  if (!email.value || !password.value) {
    errorMessage.value = "Email and password are required.";
    password.value = ''
    loading.value = false;
    return;
  }

  if (!email.value.includes("@")) {
    errorMessage.value = "Invalid email format.";
    password.value = ''
    loading.value = false;
    return;
  }

  try {
    await login(email.value, password.value);
    router.push("/");
  } catch (error: any) {
    errorMessage.value =
      error.code === "auth/invalid-email"
        ? "Invalid email format. Please check your input."
        : error.code === "auth/user-not-found"
        ? "User not found. Please register."
        : error.code === "auth/wrong-password"
        ? "Incorrect password. Try again."
        : "Login failed. Please try again.";
  } finally {
    loading.value = false;
  }
};
</script>

