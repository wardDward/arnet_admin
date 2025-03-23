export default defineNuxtRouteMiddleware(async (to, from) => {
  const nuxtApp = useNuxtApp();
  const auth = nuxtApp.$auth;
  const userPromise = nuxtApp.$userPromise;

  if (!auth) return navigateTo("/login");

  // 🚀 Wait for Firebase to restore the session before checking user
  const user = await userPromise;

  if (!user && to.path !== "/login") {
    return navigateTo("/login");
  }

  if (user && to.path === "/login") {
    return navigateTo("/");
  }
});
