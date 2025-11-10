import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { firestore } from "../../api/firebase";

const TaskDetailScreen = ({ route, navigation }) => {
  const { task } = route.params;
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState(task.status);
  const [assignedDate, setAssignedDate] = useState(task.assignedDate);
  const [dueDate, setDueDate] = useState(task.dueDate);

  const handleUpdateTask = async () => {
    try {
      await firestore().collection("tasks").doc(task.id).update({
        title,
        description,
        status,
        assignedDate,
        dueDate,
      });

      Alert.alert("Success", "Task updated successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error updating task:", error);
      Alert.alert("Error", "Failed to update task");
    }
  };

  const handleDeleteTask = async () => {
    try {
      await firestore().collection("tasks").doc(task.id).delete();
      Alert.alert("Deleted", "Task deleted successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Task Details</Text>

      <TextInput style={styles.input} value={title} onChangeText={setTitle} />
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        value={assignedDate}
        onChangeText={setAssignedDate}
      />
      <TextInput
        style={styles.input}
        value={dueDate}
        onChangeText={setDueDate}
      />
      <TextInput style={styles.input} value={status} onChangeText={setStatus} />

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.updateButton} onPress={handleUpdateTask}>
          <Icon name="save" size={18} color="#fff" />
          <Text style={styles.btnText}>Update</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteTask}>
          <Icon name="trash" size={18} color="#fff" />
          <Text style={styles.btnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TaskDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#EFE9E3" },
  header: { fontSize: 22, fontWeight: "700", marginBottom: 15 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 5,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  updateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0A400C",
    padding: 10,
    borderRadius: 8,
    width: "45%",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8A0000",
    padding: 10,
    borderRadius: 8,
    width: "45%",
  },
  btnText: { color: "#fff", fontWeight: "600", marginLeft: 5 },
});
