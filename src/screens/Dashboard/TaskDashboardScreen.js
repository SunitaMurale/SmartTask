import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { firestore } from "../../api/firebase";

const TaskDashboardScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Not Started");
  const [assignedDate, setAssignedDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [showAssignedPicker, setShowAssignedPicker] = useState(false);
  const [showDuePicker, setShowDuePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("assignedDateDesc"); 

  
  useEffect(() => {
    console.log("start");
    const unsubscribe = firestore()
      .collection("tasks")
      .orderBy("createdAt", "desc")
      .onSnapshot(
        (snapshot) => {
          console.log("count:", snapshot.docs.length);
          const fetched = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setTasks(fetched);
        },
        (error) => console.error("Error fetching tasks:", error)
      );

    return () => {
      console.log("Unsubscribing");
      unsubscribe();
    };
  }, []);


  const handleAddTask = async () => {
    if (!title.trim()) {
      Alert.alert("Validation", "Please enter a task title");
      return;
    }

    setModalVisible(false);
    setTitle("");
    setDescription("");
    setStatus("Not Started");
    setAssignedDate("");
    setDueDate("");

    try {
      const newTaskRef = await firestore().collection("tasks").add({
        title: title.trim(),
        description: description.trim(),
        status,
        assignedDate,
        dueDate,
        createdAt: firestore.Timestamp.now(),
      });

      console.log("Task created:", newTaskRef.id);
      Alert.alert("Success", "Task created successfully!");
    } catch (error) {
      console.error(" Error adding task:", error);
      Alert.alert("Error", "Failed to add task");
    }
  };

 
  const handleDeleteTask = async (id) => {
    try {
      await firestore().collection("tasks").doc(id).delete();
      console.log("🗑️ Task deleted:", id);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };


  const formatDate = (date) => (date ? date.toISOString().split("T")[0] : "");

 
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      const dateA = new Date(a[sortOption.includes("assigned") ? "assignedDate" : "dueDate"]);
      const dateB = new Date(b[sortOption.includes("assigned") ? "assignedDate" : "dueDate"]);

      if (sortOption.endsWith("Asc")) return dateA - dateB;
      else return dateB - dateA;
    });
  }, [tasks, searchQuery, sortOption]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📋 Task Dashboard</Text>

      
      <View style={styles.searchSortContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() =>
            setSortOption((prev) =>
              prev === "assignedDateDesc"
                ? "assignedDateAsc"
                : prev === "assignedDateAsc"
                ? "dueDateDesc"
                : prev === "dueDateDesc"
                ? "dueDateAsc"
                : "assignedDateDesc"
            )
          }
        >
          <Icon name="filter" size={20} color="#fff" />
          <Text style={styles.sortText}>
            {sortOption.includes("assigned") ? "Assigned" : "Due"}{" "}
            {sortOption.endsWith("Asc") ? "↑" : "↓"}
          </Text>
        </TouchableOpacity>
      </View>


      <FlatList
        data={filteredAndSortedTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.taskCard}
            onPress={() => navigation.navigate("TaskDetail", { task: item })}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.taskTitle}>{item.title}</Text>
              <Text style={styles.taskDescription}>{item.description}</Text>
              <Text style={styles.taskDate}>
                📅 {item.assignedDate || "N/A"} → {item.dueDate || "N/A"}
              </Text>
              <Text
                style={[
                  styles.statusBadge,
                  item.status === "Completed"
                    ? styles.statusCompleted
                    : item.status === "In Progress"
                    ? styles.statusInProgress
                    : styles.statusNotStarted,
                ]}
              >
                {item.status || "Not Started"}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleDeleteTask(item.id)}>
              <Icon name="trash" size={22} color="#ff6b6b" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

    
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setModalVisible(true)}
      >
        <Icon name="add" size={32} color="#fff" />
      </TouchableOpacity>

 
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Add New Task</Text>

            <TextInput
              style={styles.input}
              placeholder="Task Title"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Task Description"
              multiline
              value={description}
              onChangeText={setDescription}
            />

        
            <TouchableOpacity
              onPress={() => setShowAssignedPicker(true)}
              style={styles.input}
            >
              <Text>
                {assignedDate ? `Assigned: ${assignedDate}` : "Select Assigned Date"}
              </Text>
            </TouchableOpacity>
            {showAssignedPicker && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedDate) => {
                  setShowAssignedPicker(false);
                  if (selectedDate) setAssignedDate(formatDate(selectedDate));
                }}
              />
            )}

            
            <TouchableOpacity
              onPress={() => setShowDuePicker(true)}
              style={styles.input}
            >
              <Text>{dueDate ? `Due: ${dueDate}` : "Select Due Date"}</Text>
            </TouchableOpacity>
            {showDuePicker && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedDate) => {
                  setShowDuePicker(false);
                  if (selectedDate) setDueDate(formatDate(selectedDate));
                }}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveButton} onPress={handleAddTask}>
                <Text style={styles.saveText}>Add Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default TaskDashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0E4D3",
    padding: 15,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 10,
  },
  searchSortContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#DCC5B2",
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  sortButton: {
    flexDirection: "row",
    backgroundColor: "#850E35",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
  },
  sortText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 5,
  },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#C5C7BC",
    padding: 15,
    borderRadius: 15,
    marginVertical: 6,
    elevation: 4,
  },
  taskTitle: { fontSize: 16, fontWeight: "700", color: "#850E35" },
  taskDescription: { color: "#140309ff", marginTop: 4 },
  taskDate: { fontSize: 13, color: "#140309ff", marginTop: 4 },
  statusBadge: {
    marginTop: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  statusCompleted: { backgroundColor: "#28a745" },
  statusInProgress: { backgroundColor: "#ffc107" },
  statusNotStarted: { backgroundColor: "#6c757d" },
  floatingButton: {
    position: "absolute",
    right: 25,
    bottom: 35,
    backgroundColor: "#850E35",
    width: 65,
    height: 65,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#EFE9E3",
    borderRadius: 15,
    padding: 20,
    elevation: 10,
  },
  modalHeader: { color: "#000", fontSize: 18, fontWeight: "700", marginBottom: 10 },
  input: {
    backgroundColor: "#f7f9fc",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  cancelButton: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    width: "45%",
    alignItems: "center",
  },
  cancelText: { color: "#000", fontWeight: "600" },
  saveButton: {
    backgroundColor: "#C9B59C",
    padding: 10,
    borderRadius: 8,
    width: "45%",
    alignItems: "center",
  },
  saveText: { color: "#000", fontWeight: "800" },
});
