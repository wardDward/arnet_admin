import { ref, onMounted } from "vue";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { auth, db } from "@/utils/firebase";
import { doc, setDoc, getDoc, collection, getDocs, deleteDoc, updateDoc } from "firebase/firestore";

const user = ref<User | null>(null);
const userData = ref<any>(null);
const users = ref<any[]>([]); // Store all users

export const useAuth = () => {
  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      user.value = userCredential.user;
      return user.value;
    } catch (error: any) {
      console.error("Login failed:", error.message);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    user.value = null;
  };

  const isValidEmail = (email: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const register = async (
    email: string,
    password: string,
    firstname: string,
    lastname: string
  ) => {
    if (!email || !isValidEmail(email)) {
      console.error("Invalid email format");
      throw new Error("Invalid email address");
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      user.value = userCredential.user;

      await setDoc(doc(db, "profile", user.value.uid), {
        firstname,
        lastname,
        email,
      });

      userData.value = { firstname, lastname, email };
      return user.value;
    } catch (error: any) {
      console.error("Registration failed:", error.message);
      throw error;
    }
  };

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "profile"));
      users.value = querySnapshot.docs.map((doc) => {
        const userData = doc.data();
      return {
        id: doc.id,
        firstname: userData.firstname || "N/A",
        lastname: userData.lastname || "N/A",
        email: userData.email || "N/A",
      };
      });

      console.log("Fetched users:", users.value);
    } catch (error: any) {
      console.error("Error fetching users:", error.message);
    }
  };

  onMounted(() => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      user.value = firebaseUser;
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "profile", firebaseUser.uid));
        if (userDoc.exists()) {
          userData.value = userDoc.data();
        }
        await fetchUsers(); // Fetch all users when logged in
      } else {
        userData.value = null;
      }
    });
  });
  
  const deleteUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, "profile", userId));
      users.value = users.value.filter(user => user.id !== userId); // Update UI
    } catch (error: any) {
      console.error("Error deleting user:", error.message);
    }
  }

  
const updateUser = async (userId: string, updatedData: any) => {
  try {
    const userRef = doc(db, "profile", userId);
    await updateDoc(userRef, updatedData);
    await fetchUsers();
  } catch (error: any) {
    console.error("Error updating user:", error.message);
    throw error;
  }
};

  return { user, userData, users, register, login, logout, fetchUsers , deleteUser, updateUser };
};
