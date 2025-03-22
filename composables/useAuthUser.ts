import { getAuth, onAuthStateChanged } from "firebase/auth";

export const useAuthUser = () => {
  const auth = getAuth();

  const user = useState<null | { uid: string; email: string | null; displayName: string | null }>(
    "authUser",
    () => null
  );

  onAuthStateChanged(auth, (u) => {
    user.value = u
      ? { uid: u.uid, email: u.email, displayName: u.displayName }
      : null;
  });

  return { user };
};
