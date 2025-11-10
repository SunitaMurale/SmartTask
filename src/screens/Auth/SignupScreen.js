import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";
import { auth, firestore } from "../../api/firebase";
import { useNavigation } from "@react-navigation/native";

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigation();

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert("Validation", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {

      const res = await auth().createUserWithEmailAndPassword(email, password);
      const uid = res.user.uid;

     
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        const fcmToken = await messaging().getToken();
        console.log("FCM Token:", fcmToken);

       
        await AsyncStorage.setItem("fcm_token", fcmToken);

        await firestore().collection("users").doc(uid).set({
          email,
          fcmToken,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

        console.log("User and token saved ");
      } else {
        console.warn("FCM permission not");
      }

      Alert.alert("Success", "Account created successfully!");
      setTimeout(() => nav.replace("Login"), 300);
    } catch (err) {
      console.error("Signup error:", err);
      Alert.alert("Signup Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us and manage your tasks easily</Text>
          </View>

          <View style={styles.inputContainer}>
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
              onPress={handleSignup}
              style={styles.button}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => nav.navigate("Login")}>
              <Text style={styles.link}>
                Already have an account?{" "}
                <Text style={styles.loginText}>Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F5F1",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  headerContainer: {
    alignItems: "flex-start",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#3B2F2F",
  },
  subtitle: {
    fontSize: 16,
    color: "#6E5D52",
    marginTop: 6,
  },
  inputContainer: {
    marginTop: 50,
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
  loginText: {
    color: "#B6AE9F",
    fontWeight: "700",
  },
});
