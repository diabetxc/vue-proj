<template>
  <div class="App">
    <!--theme toggle -->
    <div class="theme-toggle-container">
      <button @click="toggleTheme" class="theme-toggle">
        <font-awesome-icon v-if="isDarkTheme" :icon="['fas', 'sun']" />
        <font-awesome-icon v-else :icon="['fas', 'moon']" />
      </button>
    </div>

    <h1>Simple Task Manager v2.5</h1>

    <div class="task-layout">
      <!-- Split into left and right sides -->
      <!-- Left side -->
      <div class="task-form-wrapper">
        <TaskForm
            @add-task="addTask"
            :taskToEdit="taskToEdit"
            @cancel="taskToEdit = null"
            @update-task="updateTask"
        />
      </div>

      <!-- Right Side -->
      <div class="task-list-wrapper">
        <ul class="task-list">
          <transition-group name="task">
            <Task
                v-for="(task, index) in tasks"
                :key="task.id || index"
                :task="task"
                @toggle-complete="toggleComplete"
                @edit="editTask"
                @delete="removeTask"
                @dragstart="handleDragStart($event, index)"
                @dragend="handleDragEnd"
                @dragover.prevent
                @drop="handleDrop($event, index)"
            />
          </transition-group>
        </ul>
      </div>
    </div>
  </div>
</template>


<script>
import { ref, onMounted } from 'vue';
import Task from './components/Task.vue';
import TaskForm from './components/TaskForm.vue';

export default {
  name: 'App',
  components: {
    Task,
    TaskForm
  },
  setup() {
    const tasks = ref([]);
    const taskToEdit = ref(null);
    const draggedTaskIndex = ref(null);

    // Load tasks from localStorage if available
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      tasks.value = JSON.parse(savedTasks);
    }

    // Save tasks to localStorage
    const saveTasks = () => {
      localStorage.setItem('tasks', JSON.stringify(tasks.value));
    };

    const addTask = (newTask) => {
      tasks.value.push(newTask);
      saveTasks();
    };

    const updateTask = (updatedTask) => {
      const index = tasks.value.findIndex(t => t.id === updatedTask.id);
      if (index !== -1) {
        tasks.value[index] = updatedTask;
        saveTasks();
      }
      taskToEdit.value = null;
    };

    const removeTask = (id) => {
      tasks.value = tasks.value.filter(task => task.id !== id);
      saveTasks();
    };

    const toggleComplete = (id) => {
      const task = tasks.value.find(task => task.id === id);
      if (task) {
        task.completed = !task.completed;
        saveTasks();
      }
    };

    const editTask = (id) => {
      taskToEdit.value = tasks.value.find(task => task.id === id);
    };

    const handleDragStart = (event, index) => {
      draggedTaskIndex.value = index;
    };

    const handleDragEnd = () => {
      // Optional handling for drag end
    };

    const handleDrop = (event, index) => {
      if (draggedTaskIndex.value !== null) {
        const draggedTask = tasks.value[draggedTaskIndex.value];
        tasks.value.splice(draggedTaskIndex.value, 1);
        tasks.value.splice(index, 0, draggedTask);
        draggedTaskIndex.value = null;
        saveTasks();
      }
    };

    // Define isDarkTheme as a reactive property
    const isDarkTheme = ref(false);

    // Load theme preference on component mount
    onMounted(() => {
      const darkTheme = localStorage.getItem('darkTheme') === 'true';
      if (darkTheme) {
        document.body.classList.add('dark-theme');
        isDarkTheme.value = true;
      }
    });

    const toggleTheme = () => {
      document.body.classList.toggle('dark-theme');
      isDarkTheme.value = !isDarkTheme.value;
      localStorage.setItem('darkTheme', isDarkTheme.value);
    };


    return {
      tasks,
      taskToEdit,
      addTask,
      updateTask,
      removeTask,
      toggleComplete,
      editTask,
      handleDragStart,
      handleDragEnd,
      handleDrop,
      isDarkTheme,
      toggleTheme
    };
  }
};
</script>

<style>
/* No need to import here as we're importing in main.js */
</style>