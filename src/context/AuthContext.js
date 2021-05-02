import React, { useContext, useState, useEffect } from "react";
import { auth } from "../backend/firebase";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateUser, setUpdateUser] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

  function signUp(email, password) {
    console.log("signUp in called");
    console.log("email = " + email);
    console.log("password = " + password);
    setUpdateUser(false);
    return auth.createUserWithEmailAndPassword(email, password);
  }

  function signIn(email, password) {
    console.log("sign in called");
    console.log("email = " + email);
    console.log("password = " + password);
    setUpdateUser(true);
    return auth.signInWithEmailAndPassword(email, password);
  }

  function signOut() {
    console.log("sign out called");
    setUpdateUser(true);
    return auth.signOut();
  }

  function resetPassword(email) {
    console.log("reset password");
    console.log("email = " + email);
    setUpdateUser(false);
    return auth.sendPasswordResetEmail(email);
  }

  function persistLoggedInUserData(userDoc) {
    console.log("persistLoggedInUserData");
    setLoggedInUser(userDoc);
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log("onAuthStateChanged");
      if (updateUser) {
        console.log("USER UPDATED");
        setAuthUser(user);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [updateUser]);

  const actions = {
    authUser: authUser,
    loggedInUser,
    signUp,
    signIn,
    signOut,
    resetPassword,
    persistLoggedInUserData,
  };

  return (
    <AuthContext.Provider value={actions}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
