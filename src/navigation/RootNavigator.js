import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AuthNavigator from "./AuthNavigator";
import AppNavigator from "./AppNavigator";
import { auth } from "../api/firebase";
import { useDispatch } from "react-redux";
import { setUser, clearUser, fetchUserRole } from "../redux/authSlice";
import { ActivityIndicator, View } from "react-native";

const RootNavigator = () => {
  const dispatch = useDispatch();
  const [initializing, setInitializing] = useState(true);
  const [user, setLocalUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      if (user) {
        setLocalUser(user);
        dispatch(setUser({ uid: user.uid, email: user.email }));
        dispatch(fetchUserRole(user.uid));
      } else {
        setLocalUser(null);
        dispatch(clearUser());
      }
      if (initializing) setInitializing(false);
    });

    return () => unsubscribe();
  }, [dispatch, initializing]);

  if (initializing) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#B6AE9F" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;
