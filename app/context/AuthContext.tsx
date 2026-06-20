"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  onAuthStateChanged,
  getAdditionalUserInfo,
  deleteUser,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, googleProvider, isFirebaseConfigured, db } from "../../Firebaseconfig";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: "teacher" | "student";
  isMock?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isDemoMode: boolean;
  loginWithEmail: (email: string, password: string) => Promise<UserProfile>;
  signUpWithEmail: (email: string, password: string, name: string, role: "teacher" | "student") => Promise<UserProfile>;
  loginWithGoogle: (intent: "login" | "signup", role?: "teacher" | "student") => Promise<UserProfile>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isDemoMode = !isFirebaseConfigured;

  useEffect(() => {
    if (!isDemoMode && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          let role: "teacher" | "student" = "student";
          if (db) {
            try {
              const docSnap = await getDoc(doc(db, "users", firebaseUser.uid));
              if (docSnap.exists() && docSnap.data().role) {
                role = docSnap.data().role;
              }
            } catch (e) {
              console.error("Failed to fetch user role from Firestore", e);
            }
          }
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role,
            isMock: false,
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Demo/Mock mode: load user from localStorage if it exists
      const savedUser = localStorage.getItem("mindhub_demo_user");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error("Failed to parse local storage demo user", e);
        }
      }
      setLoading(false);
    }
  }, [isDemoMode]);

  const loginWithEmail = async (email: string, password: string): Promise<UserProfile> => {
    setLoading(true);
    try {
      if (!isDemoMode && auth) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        let role: "teacher" | "student" = "student";
        if (db) {
          const docSnap = await getDoc(doc(db, "users", fbUser.uid));
          if (docSnap.exists() && docSnap.data().role) role = docSnap.data().role;
        }
        const profile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || email.split("@")[0],
          photoURL: fbUser.photoURL,
          role,
          isMock: false,
        };
        setUser(profile);
        return profile;
      } else {
        // Mock authentication
        await new Promise((resolve) => setTimeout(resolve, 800));
        const accountsData = localStorage.getItem("mindhub_demo_accounts");
        const accounts = accountsData ? JSON.parse(accountsData) : {};
        if (accounts[email] && accounts[email].password === password) {
          const profile: UserProfile = {
            uid: accounts[email].uid,
            email: email,
            displayName: accounts[email].name,
            photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(accounts[email].name)}`,
            role: accounts[email].role || "student",
            isMock: true,
          };
          localStorage.setItem("mindhub_demo_user", JSON.stringify(profile));
          setUser(profile);
          return profile;
        } else if (accounts[email]) {
          throw new Error("auth/wrong-password");
        } else {
          throw { code: "auth/user-not-found", message: "No user found with this email." };
        }
      }
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string, role: "teacher" | "student"): Promise<UserProfile> => {
    setLoading(true);
    try {
      if (!isDemoMode && auth) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        await updateProfile(fbUser, { displayName: name });
        if (db) {
          await setDoc(doc(db, "users", fbUser.uid), { role });
        }
        const profile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: name,
          photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
          role,
          isMock: false,
        };
        setUser(profile);
        return profile;
      } else {
        // Mock Registration
        await new Promise((resolve) => setTimeout(resolve, 800));
        const accountsData = localStorage.getItem("mindhub_demo_accounts");
        const accounts = accountsData ? JSON.parse(accountsData) : {};
        if (accounts[email]) throw new Error("auth/email-already-in-use");
        const uid = "demo-uid-" + Math.random().toString(36).substr(2, 9);
        accounts[email] = { password, name, role, uid };
        localStorage.setItem("mindhub_demo_accounts", JSON.stringify(accounts));
        const profile: UserProfile = {
          uid, email, displayName: name,
          photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
          role,
          isMock: true,
        };
        localStorage.setItem("mindhub_demo_user", JSON.stringify(profile));
        setUser(profile);
        return profile;
      }
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (intent: "login" | "signup", role?: "teacher" | "student"): Promise<UserProfile> => {
    setLoading(true);
    try {
      if (!isDemoMode && auth && googleProvider) {
        const result = await signInWithPopup(auth, googleProvider);
        const fbUser = result.user;
        const additionalInfo = getAdditionalUserInfo(result);

        // Enforce intent
        if (intent === "login" && additionalInfo?.isNewUser) {
          // User clicked "Log In" but they are a brand new user.
          // Instantly delete the accidentally created Firebase account and throw an error.
          await deleteUser(fbUser);
          await signOut(auth);
          throw { code: "auth/account-not-found", message: "User not registered, please register." };
        }

        let finalRole: "teacher" | "student" = role || "student";
        if (db) {
          const docSnap = await getDoc(doc(db, "users", fbUser.uid));
          if (docSnap.exists() && docSnap.data().role) {
            // They already have an account and a role in Firestore
            finalRole = docSnap.data().role;
          } else {
            // First time signup or role missing
            await setDoc(doc(db, "users", fbUser.uid), { role: finalRole });
          }
        }
        const profile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL,
          role: finalRole,
          isMock: false,
        };
        setUser(profile);
        return profile;
      } else {
        // Mock Google Login
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const accountsData = localStorage.getItem("mindhub_demo_accounts");
        const accounts = accountsData ? JSON.parse(accountsData) : {};
        const demoEmail = "alex.mercer@mindhub.ai";

        if (intent === "login" && !accounts[demoEmail]) {
          throw { code: "auth/account-not-found", message: "No account found. Please go to the Sign Up tab to choose your role first." };
        }

        const profile: UserProfile = {
          uid: accounts[demoEmail]?.uid || "google-mock-uid-" + Math.random().toString(36).substr(2, 9),
          email: demoEmail,
          displayName: "Alex Mercer (Google Demo)",
          photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=Alex%20Mercer",
          role: accounts[demoEmail]?.role || role || "student",
          isMock: true,
        };

        if (intent === "signup" && !accounts[demoEmail]) {
          accounts[demoEmail] = { password: "google-oauth", name: profile.displayName, role: profile.role, uid: profile.uid };
          localStorage.setItem("mindhub_demo_accounts", JSON.stringify(accounts));
        }

        localStorage.setItem("mindhub_demo_user", JSON.stringify(profile));
        setUser(profile);
        return profile;
      }
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      if (!isDemoMode && auth) {
        await signOut(auth);
      }
    } catch (error) {
      console.error("Firebase Signout Error:", error);
    } finally {
      localStorage.removeItem("mindhub_demo_user");
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isDemoMode,
        loginWithEmail,
        signUpWithEmail,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
