<template>
  <div class="App">
    <h1>Simple Task Manager v1.0</h1>
    <div class="task-form">
      <input
          type="text"
          v-model="newTask"
          placeholder="Enter a new task"
      />
      <button @click="handleAddTask" class="add-task-button">
        <font-awesome-icon :icon="['fas', 'plus']" size="2x" />
      </button>
    </div>

    <div class="color-picker">
      <label for="bg-color">Pick a background color for the tasks:</label>
      <input
          type="color"
          id="bg-color"
          v-model="bgColor"
      />
    </div>

    <ul class="task-list">
      <transition-group name="task">
        <li
            v-for="(task, index) in tasks"
            :key="index"
            class="task-item"
            :style="{ backgroundColor: task.bgColor, color: getContrastColor(task.bgColor) }"
            draggable="true"
            @dragstart="handleDragStart(index)"
            @dragend="handleDragEnd"
            @dragover="handleDragOver($event, index)"
            @dragleave="handleDragLeave"
            @drop="handleDrop(index)"
        >
          <span>{{ task.task }}</span>
          <button @click="handleRemoveTask(index)">
            <font-awesome-icon :icon="['fas', 'minus']" size="2x" />
          </button>
        </li>
      </transition-group>
    </ul>
  </div>
</template>

<script>
import { ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

export default {
  name: 'App',
  components: { FontAwesomeIcon },
  setup() {
    const newTask = ref('');
    const bgColor = ref('#f9f9f9');
    const tasks = ref([]);
    const draggedTaskIndex = ref(null);

    const getContrastColor = (hex) => {
      //hex to rgb
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);

      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

      if (luminance < 120) {
        // Lighten text for dark backgrounds
        return '#FFFFE0'; // Light yellowish-white for better contrast
      } else if (luminance < 180) {
        // Slightly lighter gray for medium-dark backgrounds
        return '#FFFFFF';
      } else {
        // Dark text for light backgrounds
        return '#000000';
      }
    };

    const handleAddTask = () => {
      if (newTask.value.trim()) {
        tasks.value.push({ task: newTask.value, bgColor: bgColor.value });
        newTask.value = '';
      }
    };

    const handleRemoveTask = (index) => {
      tasks.value.splice(index, 1);
    };

    const handleDragStart = (index) => {
      draggedTaskIndex.value = index;
    };

    const handleDragOver = (event) => {
      event.preventDefault();
    };

    const handleDrop = (index) => {
      if (draggedTaskIndex.value !== null) {
        const draggedTask = tasks.value[draggedTaskIndex.value];
        tasks.value.splice(draggedTaskIndex.value, 1);
        tasks.value.splice(index, 0, draggedTask);
        draggedTaskIndex.value = null;
      }
    };

    return {
      newTask,
      bgColor,
      tasks,
      getContrastColor,
      handleAddTask,
      handleRemoveTask,
      handleDragStart,
      handleDragOver,
      handleDrop,
    };
  } //end of setup
};
</script>

<style scoped>
/* Importing App.css styles */
@import './App.css';
</style>