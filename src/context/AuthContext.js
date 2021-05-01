import React, { useContext, useState, useEffect } from "react";
import { auth } from "../firebase";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState();
  const [loading, setLoading] = useState(true);
  const [updateUser, setUpdateUser] = useState(false);

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
  
  const value = {
    authUser: authUser,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
