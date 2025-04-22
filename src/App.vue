<template>
  <div class="App">
    <!-- Theme toggle button -->
    <div class="theme-toggle-container">
      <button @click="toggleTheme" class="theme-toggle">
        <font-awesome-icon v-if="isDarkTheme" :icon="['fas', 'sun']" />
        <font-awesome-icon v-else :icon="['fas', 'moon']" />
      </button>
    </div>

    <h1>Simple Task Manager v2.5</h1>

    <!-- Search functionality -->
    <div class="search-container">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Search tasks..." 
        class="search-input"
      />
      <font-awesome-icon :icon="['fas', 'search']" class="search-icon" />
    </div>

    <!-- Task statistics display -->
    <div class="task-stats">
      <div class="stat-item">
        <span class="stat-value">{{ taskStats.total }}</span>
        <span class="stat-label">Total</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ taskStats.pending }}</span>
        <span class="stat-label">Pending</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ taskStats.completed }}</span>
        <span class="stat-label">Completed</span>
      </div>
      <div class="stat-item highlight">
        <span class="stat-value">{{ taskStats.highPriority }}</span>
        <span class="stat-label">High Priority</span>
      </div>
    </div>

    <!-- Filter and sort controls -->
    <ControlBar 
      :currentFilter="filter"
      :currentSort="sortBy"
      :currentCategory="selectedCategory"
      :categories="categories"
      @update-filter="setFilter"
      @update-sort="setSortBy"
      @update-category="setCategory"
    />

    <div class="task-layout">
      <!-- Task form section -->
      <div class="task-form-wrapper">
        <TaskForm
            @add-task="addTask"
            :taskToEdit="taskToEdit"
            @cancel="taskToEdit = null"
            @update-task="updateTask"
        />
      </div>

      <!-- Task list section -->
      <div class="task-list-wrapper">
        <ul class="task-list">
          <transition-group name="task">
            <Task
                v-for="(task, index) in filteredTasks"
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

    <!-- Data import/export controls -->
    <div class="data-controls">
      <button @click="exportTasks" class="btn-secondary">
        <font-awesome-icon :icon="['fas', 'download']" />
        Export Tasks
      </button>
      <div>
        <input type="file" ref="fileInput" @change="importTasks" style="display: none" accept=".json" />
        <button @click="triggerFileInput" class="btn-secondary">
          <font-awesome-icon :icon="['fas', 'upload']" />
          Import Tasks
        </button>
      </div>
    </div>
  </div>
</template>


<script>
import { ref, onMounted, computed } from 'vue';
import Task from '@/components/Task.vue';
import TaskForm from '@/components/TaskForm.vue';
import ControlBar from '@/components/ControlBar.vue';

export default {
  name: 'App',
  components: {
    Task,
    TaskForm,
    ControlBar
  },
  setup() {
    const tasks = ref([]);
    const taskToEdit = ref(null);
    const draggedTaskIndex = ref(null);
    const filter = ref('all');
    const sortBy = ref('date');
    const categories = ref(['Work', 'Personal', 'Shopping', 'Health']);
    const selectedCategory = ref('All');
    const searchQuery = ref('');

    // Load tasks from localStorage if available
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      tasks.value = JSON.parse(savedTasks);
    }

    // Save tasks to localStorage
    const saveTasks = () => {
      localStorage.setItem('tasks', JSON.stringify(tasks.value));
    };

    // Task management functions
    const addTask = (newTask) => {
      if (!newTask.dependencies) {
        newTask.dependencies = [];
      }
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
        
        // Track completion timestamp
        if (task.completed) {
          task.completedAt = new Date().toISOString();
        } else {
          delete task.completedAt;
        }
        
        saveTasks();
      }
    };

    const editTask = (id) => {
      taskToEdit.value = tasks.value.find(task => task.id === id);
    };

    // Drag and drop functionality
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

    // Theme management
    const isDarkTheme = ref(false);

    // Filter and sort functions
    const setFilter = (newFilter) => {
      filter.value = newFilter;
    };

    const setSortBy = (newSortBy) => {
      sortBy.value = newSortBy;
    };

    const setCategory = (newCategory) => {
      selectedCategory.value = newCategory;
    };

    const addCategory = (newCategory) => {
      if (newCategory && !categories.value.includes(newCategory)) {
        categories.value.push(newCategory);
        localStorage.setItem('categories', JSON.stringify(categories.value));
      }
    };

    // Task statistics
    const taskStats = computed(() => {
      const total = tasks.value.length;
      const completed = tasks.value.filter(t => t.completed).length;
      const pending = total - completed;
      const highPriority = tasks.value.filter(t => t.priority === 3 && !t.completed).length;
      
      return { total, completed, pending, highPriority };
    });
    
    // Filtered and sorted tasks
    const filteredTasks = computed(() => {
      let result = [...tasks.value];
      
      // Apply search filter
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(task => 
          task.title.toLowerCase().includes(query) || 
          (task.description && task.description.toLowerCase().includes(query)) ||
          (task.category && task.category.toLowerCase().includes(query))
        );
      }
      
      // Filter by category
      if (selectedCategory.value !== 'All') {
        result = result.filter(task => task.category === selectedCategory.value);
      }
      
      // Filter by completion status
      if (filter.value === 'active') {
        result = result.filter(task => !task.completed);
      } else if (filter.value === 'completed') {
        result = result.filter(task => task.completed);
      }
      
      // Apply sorting
      result.sort((a, b) => {
        if (sortBy.value === 'date') {
          return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
        } else if (sortBy.value === 'priority') {
          return b.priority - a.priority;
        } else if (sortBy.value === 'title') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
      
      return result;
    });

    // Due soon task monitoring
    const dueSoonTasks = computed(() => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const threeDaysFromNow = new Date(today);
      threeDaysFromNow.setDate(today.getDate() + 3);
      
      return tasks.value.filter(task => {
        if (!task.dueDate || task.completed) return false;
        
        const dueDate = new Date(task.dueDate);
        return dueDate >= today && dueDate <= threeDaysFromNow;
      });
    });

    // Component lifecycle hooks
    onMounted(() => {
      // Load theme preference
      const darkTheme = localStorage.getItem('darkTheme') === 'true';
      if (darkTheme) {
        document.body.classList.add('dark-theme');
        isDarkTheme.value = true;
      }
      
      // Check for due soon tasks
      setTimeout(() => {
        if (dueSoonTasks.value.length > 0) {
          const message = `You have ${dueSoonTasks.value.length} tasks due in the next 3 days.`;
          showNotification(message);
        }
      }, 1500);
      
      // Load saved categories
      const savedCategories = localStorage.getItem('categories');
      if (savedCategories) {
        categories.value = JSON.parse(savedCategories);
      }
    });

    const toggleTheme = () => {
      document.body.classList.toggle('dark-theme');
      isDarkTheme.value = !isDarkTheme.value;
      localStorage.setItem('darkTheme', isDarkTheme.value);
      
      // Notify components of theme change
      window.dispatchEvent(new CustomEvent('themeChange'));
    };

    // Notification system
    const showNotification = (message) => {
      const notification = document.createElement('div');
      notification.className = 'task-notification';
      notification.innerHTML = `
        <div class="notification-content">
          <font-awesome-icon :icon="['fas', 'bell']" />
          <span>${message}</span>
        </div>
        <button class="close-notification">&times;</button>
      `;
      
      document.body.appendChild(notification);
      
      notification.querySelector('.close-notification').addEventListener('click', () => {
        document.body.removeChild(notification);
      });
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 5000);
    };

    // Import/export functionality
    const fileInput = ref(null);

    const exportTasks = () => {
      const data = JSON.stringify(tasks.value);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `tasks-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    const triggerFileInput = () => {
      fileInput.value.click();
    };

    const importTasks = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedTasks = JSON.parse(e.target.result);
          tasks.value = importedTasks;
          saveTasks();
          alert('Tasks imported successfully!');
        } catch (error) {
          alert('Failed to import tasks. Invalid file format.');
        }
      };
      reader.readAsText(file);
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
      toggleTheme,
      filter,
      sortBy,
      taskStats,
      filteredTasks,
      setFilter,
      setSortBy,
      categories,
      selectedCategory,
      addCategory,
      searchQuery,
      fileInput,
      exportTasks,
      triggerFileInput,
      importTasks,
      setCategory
    };
  }
};
</script>

<style>
/* Styles imported in main.js */
</style>