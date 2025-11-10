import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { auth } from "../../api/firebase";
import { useDispatch } from "react-redux";
import { setUser, fetchUserRole } from "../../redux/authSlice";
import { useNavigation } from "@react-navigation/native";
 import { navigate } from '../../navigation/navigationRef';

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
   const navigation = useNavigation();



const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert("Validation", "Please enter both email and password.");
    return;
  }

  setLoading(true);
  try {
    const res = await auth().signInWithEmailAndPassword(email, password);
    dispatch(setUser({ uid: res.user.uid, email: res.user.email }));
    dispatch(fetchUserRole(res.user.uid));

    navigate("Dashboard");
  } catch (err) {
    Alert.alert("Login Failed", err.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back 👋</Text>
      <Text style={styles.subtitle}>Login to continue your task journey</Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        placeholderTextColor="#777"
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Enter your password"
        placeholderTextColor="#777"
        secureTextEntry
        style={styles.input}
      />

      <TouchableOpacity
        onPress={handleLogin}
        style={styles.button}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.link}>
          Don't have an account?{" "}
          <Text style={styles.signupText}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#F8F5F1",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#3B2F2F",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "#6E5D52",
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "#C9B59C",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    color: "#000",
  },
  button: {
    backgroundColor: "#B6AE9F",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 17,
  },
  link: {
    textAlign: "center",
    marginTop: 18,
    color: "#6E5D52",
  },
  signupText: {
    color: "#B6AE9F",
    fontWeight: "700",
  },
});
