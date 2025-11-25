import {
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./config";
import { User } from "@/types";

export const login = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Check if user is admin
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      await signOut(auth);
      throw new Error("আপনার অ্যাক্সেস নেই। দয়া করে /admin/setup এ যান");
    }
    
    const userData = { id: userDoc.id, ...userDoc.data() } as User;
    
    // Verify user has admin role
    if (!userData.role || (userData.role !== "super_admin" && userData.role !== "admin")) {
      await signOut(auth);
      throw new Error("আপনার অ্যাক্সেস নেই");
    }
    
    return { user, userData };
  } catch (error: any) {
    // If it's already our custom error, throw it as is
    if (error.message && (error.message.includes("অ্যাক্সেস") || error.message.includes("লগইন"))) {
      throw error;
    }
    // Otherwise, handle Firebase errors
    if (error.code === "auth/user-not-found") {
      throw new Error("ইউজার পাওয়া যায়নি");
    } else if (error.code === "auth/wrong-password") {
      throw new Error("পাসওয়ার্ড ভুল");
    } else if (error.code === "auth/invalid-email") {
      throw new Error("ইমেইল ফরম্যাট ভুল");
    } else {
      throw new Error(error.message || "লগইন ব্যর্থ হয়েছে");
    }
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message || "লগআউট ব্যর্থ হয়েছে");
  }
};

export const changePassword = async (newPassword: string) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("কোনো ব্যবহারকারী লগইন নেই");
    
    await updatePassword(user, newPassword);
    // Logout all devices by signing out
    await signOut(auth);
    return true;
  } catch (error: any) {
    throw new Error(error.message || "পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে");
  }
};

export const getCurrentUser = (): Promise<FirebaseUser | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

export const getUserData = async (uid: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as User;
    }
    return null;
  } catch (error) {
    return null;
  }
};

