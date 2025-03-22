<template>
    <Navbar @tabSelected="activeTab = $event" />
    <div class="p-[60px] mt-2">
      <div class="mt-5">
      <component :is="currentComponent" />
    </div>
  </div>
</template>

<script setup>
useHead({
  title: 'Arnet'
})
import Navbar from "@/components/Navbar.vue";
import Accounts from "~/components/accounts.vue";
import Exercises from "~/components/exercises.vue";
import Lessons from "~/components/lessons.vue";

const activeTab = ref("Accounts");

const currentComponent = computed(() => {
  switch (activeTab.value) {
    case "Accounts":
      return Accounts;
    case "Lessons":
      return Lessons;
    case "Exercises":
      return Exercises;
    default:
      return Accounts;
  }
});

</script>

<style>
.gradient-text {
  background: linear-gradient(to bottom, rgb(49, 124, 133), rgb(8, 55, 55));
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.gradient {
  background: linear-gradient(to bottom, rgb(154, 213, 219), rgb(42, 160, 160));
}
</style>
