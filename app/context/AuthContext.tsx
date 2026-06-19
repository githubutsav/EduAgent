"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "../../Firebaseconfig";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isMock?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isDemoMode: boolean;
  loginWithEmail: (email: string, password: string) => Promise<UserProfile>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<UserProfile>;
  loginWithGoogle: () => Promise<UserProfile>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isDemoMode = !isFirebaseConfigured;

  useEffect(() => {
    if (!isDemoMode && auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
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
        const profile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || email.split("@")[0],
          photoURL: fbUser.photoURL,
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
            isMock: true,
          };
          localStorage.setItem("mindhub_demo_user", JSON.stringify(profile));
          setUser(profile);
          return profile;
        } else if (accounts[email]) {
          throw new Error("auth/wrong-password");
        } else {
          const mockName = email.split("@")[0];
          const profile: UserProfile = {
            uid: "demo-uid-" + Math.random().toString(36).substr(2, 9),
            email: email,
            displayName: mockName.charAt(0).toUpperCase() + mockName.slice(1),
            photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(email)}`,
            isMock: true,
          };
          localStorage.setItem("mindhub_demo_user", JSON.stringify(profile));
          setUser(profile);
          return profile;
        }
      }
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string): Promise<UserProfile> => {
    setLoading(true);
    try {
      if (!isDemoMode && auth) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        await updateProfile(fbUser, { displayName: name });
        const profile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: name,
          photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
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
        accounts[email] = { password, name, uid };
        localStorage.setItem("mindhub_demo_accounts", JSON.stringify(accounts));
        const profile: UserProfile = {
          uid, email, displayName: name,
          photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
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

  const loginWithGoogle = async (): Promise<UserProfile> => {
    setLoading(true);
    try {
      if (!isDemoMode && auth && googleProvider) {
        const result = await signInWithPopup(auth, googleProvider);
        const fbUser = result.user;
        const profile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL,
          isMock: false,
        };
        setUser(profile);
        return profile;
      } else {
        // Mock Google Login
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const profile: UserProfile = {
          uid: "google-mock-uid-" + Math.random().toString(36).substr(2, 9),
          email: "alex.mercer@mindhub.ai",
          displayName: "Alex Mercer (Google Demo)",
          photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=Alex%20Mercer",
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
