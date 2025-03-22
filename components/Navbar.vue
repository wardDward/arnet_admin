<template>
  <div
    class="flex items-center justify-between py-2 px-5 border-b-[1px] border-slate-10 relative"
  >
    <NuxtLink to="/" class="gradient-text font-semibold text-lg"
      >Arnet</NuxtLink
    >
    <div class="hidden md:flex items-center">
      <div
        v-for="tab in tabs"
        :key="tab"
        class="text-sm hover:underline text-black cursor-pointer mx-2"
        :class="{ 'font-bold underline': activeTab === tab }"
        @click="$emit('tabSelected', tab)"
      >
        {{ tab }}
      </div>
    </div>
    <button @click="handleLogout" class="text-sm hidden md:block">
      Logout
    </button>
    <Icon
      name="material-symbols:menu"
      style="color: black"
      class="h-[20px] w-[20px] block md:hidden"
      @click.prevent="toggleMenu = !toggleMenu"
    />
    <div
      v-if="toggleMenu"
      class="absolute w-[200px] bg-slate-100/50 border flex flex-col right-0 top-full"
    >
      <NuxtLink
        to="#"
        class="text-sm hover:underline text-black cursor-pointer py-1 px-3 hover:bg-slate-200"
      >
        Accounts
      </NuxtLink>
      <NuxtLink
        to="#"
        class="text-sm hover:underline text-black cursor-pointer py-1 px-3 hover:bg-slate-200"
      >
        Lesson
      </NuxtLink>
      <NuxtLink
        to="#"
        class="text-sm hover:underline text-black cursor-pointer py-1 px-3 hover:bg-slate-200"
      >
        Exercise
      </NuxtLink>
      <div>
        <button @click="handleLogout" class="text-sm hover:underline text-black cursor-pointer py-1 px-3 hover:bg-slate-200">Logout</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const { user } = useAuthUser();
const { logout } = useAuth();
const router = useRouter();

const tabs = ["Accounts", "Lessons", "Exercises"];

const toggleMenu = ref(false);

const handleLogout = async () => {
  try {
    await logout();
    router.push("/login");
    console.log("User logged out successfully");
  } catch (error) {
    console.error("Logout failed:", error);
  }
};
</script>

<style>
.gradient-text {
  background: linear-gradient(to bottom, rgb(154, 213, 219), rgb(42, 160, 160));
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.gradient {
  background: linear-gradient(to bottom, rgb(154, 213, 219), rgb(42, 160, 160));
}
</style>
