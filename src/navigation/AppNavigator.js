import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TaskDashboardScreen from "../screens/Dashboard/TaskDashboardScreen";
import TaskDetailScreen from "../screens/Dashboard/TaskDetailScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#B6AE9F" },
        headerTitleStyle: { color: "#000", fontWeight: "bold" },
        headerTintColor: "#000",
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={TaskDashboardScreen}
        options={{ title: "Tasks" }}
      />
      <Stack.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={{ title: "Task Detail" }}
      />
    </Stack.Navigator>
  );
}
