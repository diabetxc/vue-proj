<template>
  <div class="task-form-container">
    <form class="task-form" @submit.prevent="submitTask">
      <!-- Step 1: Task Title - Always visible -->
      <div :class="{ 'active': currentStep >= 1 }" class="form-group">
        <label for="task-title">Task Title:</label>
        <input
            id="task-title"
            v-model="taskData.title"
            placeholder="Enter task title"
            required
            type="text"
            @input="checkStepCompletion(1)"
        />
        <!-- Debug info -->
        <small v-if="taskData.title.trim().length >= 3" style="color: green">
          Title is valid ({{taskData.title.trim().length}} chars)
        </small>
        <small v-else style="color: red">
          Title needs at least 3 characters ({{taskData.title.trim().length}})
        </small>
      </div>

      <!-- Step 2: Task Description -->
      <div v-if="currentStep >= 2" class="form-group">
        <label for="task-description">Description:</label>
        <textarea
            id="task-description"
            v-model="taskData.description"
            placeholder="Task details (optional)"
            rows="3"
            @input="checkStepCompletion(2)"
            @click="checkStepCompletion(2)"
        ></textarea>
        <small style="color: gray">Optional - click or type to continue</small>
      </div>

      <!-- Step 3: Due Date Field -->
      <div v-if="currentStep >= 3" class="form-group">
        <label for="task-due-date">Due Date:</label>
        <input
            id="task-due-date"
            v-model="taskData.dueDate"
            type="date"
            @change="checkStepCompletion(3)"
        />
      </div>

      <!-- Step 4: Priority Field -->
      <div v-if="currentStep >= 4" class="form-group">
        <label for="task-priority">Priority:</label>
        <select 
          id="task-priority" 
          v-model="taskData.priority" 
          @change="checkStepCompletion(4)"
        >
          <option value="" disabled selected>-- Select Priority --</option>
          <option value="1">Low</option>
          <option value="2">Medium</option>
          <option value="3">High</option>
        </select>
        <small style="color: gray">Select a priority to continue</small>
      </div>

      <!-- Step 5: Task Color and Category all at once -->
      <div v-if="currentStep >= 5" class="form-group">
        <div class="form-row">
          <div class="form-column">
            <label for="task-color">Task Color:</label>
            <div class="color-options">
              <div 
                v-for="color in colorOptions" 
                :key="color.bg"
                class="color-option"
                :class="{ 
                  selected: taskData.bgColor === color.bg,
                  [`color-${color.name.toLowerCase()}`]: true
                }"
                :style="{ backgroundColor: color.bg }"
                @click="selectColor(color)"
              >
                <font-awesome-icon 
                  v-if="taskData.bgColor === color.bg"
                  :icon="['fas', 'check']" 
                  :style="{ color: color.text }"
                />
              </div>
            </div>
          </div>
          
          <div class="form-column">
            <label for="task-category">Category:</label>
            <div class="category-select">
              <select id="task-category" v-model="taskData.category">
                <option value="">-- Select Category --</option>
                <option v-for="category in categories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
              <div class="add-category">
                <input 
                  type="text" 
                  v-model="newCategory" 
                  placeholder="New category"
                  v-if="showNewCategoryInput" 
                />
                <button type="button" class="btn-icon" @click="toggleNewCategoryInput">
                  <font-awesome-icon :icon="['fas', showNewCategoryInput ? 'check' : 'plus']" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Form Actions included here as well -->
        <div class="form-actions">
          <button class="btn-secondary" type="button" @click="resetForm">
            Cancel
          </button>
          <button class="btn-primary" type="submit">
            {{ editMode ? 'Update Task' : 'Add Task' }}
          </button>
        </div>
      </div>

      <!-- Progress Bar -->
      <div v-if="!editMode" class="form-progress">
        <div :style="{ width: progressPercent + '%' }" class="progress-bar"></div>
        <div class="progress-steps">
          <span
              v-for="step in 5"
              :key="step"
              :class="{ 'active': currentStep >= step, 'completed': currentStep > step }"
              class="progress-step">
            {{ step }}
          </span>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import {computed, reactive, ref, watch, onMounted, nextTick} from 'vue';
import { useTaskStore } from '../stores/taskStore';

export default {
  props: {
    taskToEdit: {
      type: Object,
      default: null
    }
  },
  setup(props, {emit}) {
    const taskStore = useTaskStore();
    const colorOptions = computed(() => taskStore.colorOptions);
    
    // Fix dark mode detection - check for app-container.dark
    const isDarkMode = ref(document.querySelector('.app-container')?.classList.contains('dark') || false);
    
    // Get default color based on theme
    const getDefaultColorForTheme = () => {
      const darkThemeColor = colorOptions.value.find(c => c.name === 'Dark') || 
                            { bg: '#2a2a2a', text: '#ffffff' };
      const lightThemeColor = colorOptions.value.find(c => c.name === 'White') || 
                             { bg: '#ffffff', text: '#000000' };
      return isDarkMode.value ? darkThemeColor : lightThemeColor;
    };
    
    const defaultColor = getDefaultColorForTheme();
    
    const defaultTaskData = {
      title: '',
      description: '',
      dueDate: '',
      priority: '', // Empty initially to show placeholder
      bgColor: defaultColor.bg,
      textColor: defaultColor.text,
      completed: false,
      category: ''
    };
    
    // First, initialize taskData
    const taskData = reactive({...defaultTaskData});
    const currentStep = ref(1);
    const categories = ref(['Work', 'Personal', 'Shopping', 'Health']);
    const newCategory = ref('');
    const showNewCategoryInput = ref(false);

    // Then set up event listeners
    onMounted(() => {
      window.addEventListener('themeChange', () => {
        isDarkMode.value = document.querySelector('.app-container')?.classList.contains('dark') || false;
        if (taskData.bgColor === '#ffffff' || taskData.bgColor === '#2a2a2a') {
          const defaultColor = getDefaultColorForTheme();
          taskData.bgColor = defaultColor.bg;
          taskData.textColor = defaultColor.text;
        }
      });
      
      // Load categories
      const savedCategories = localStorage.getItem('categories');
      if (savedCategories) {
        categories.value = JSON.parse(savedCategories);
      }
    });

    const progressPercent = computed(() => {
      // Each step is worth approximately 20% (100/5)
      const stepValue = 100 / 5;
      
      if (taskData.title.trim().length < 3) {
        return 0; // No progress until title is valid
      }
      
      // Calculate progress based on current step
      return Math.min(currentStep.value * stepValue, 100);
    });

    const editMode = computed(() => !!props.taskToEdit);

    // Watch for changes in taskToEdit prop
    watch(() => props.taskToEdit, (newValue) => {
      if (newValue) {
        // Populate with task data for editing
        Object.assign(taskData, newValue);
        currentStep.value = 4; // Show all fields when editing (now 4 steps total)
      }
    }, {immediate: true});

    // Update the checkStepCompletion function for handling priority selection
    const checkStepCompletion = (step) => {
      if (editMode.value) {
        return; // Don't advance steps in edit mode
      }
    
      // For step 1 (title), check if we have at least 3 characters
      if (step === 1 && taskData.title.trim().length >= 3) {
        console.log('Title valid, advancing to step 2');
        currentStep.value = 2;
      } 
      // For description field (step 2), always advance when interacted with
      else if (step === 2) {
        console.log('Description field interacted with, advancing to step 3');
        currentStep.value = 3;
      }
      // For due date field (step 3), always advance when changed
      else if (step === 3) {
        console.log('Due date field changed, advancing to step 4');
        currentStep.value = 4;
      }
      // For priority field (step 4), advance only when a value is selected
      else if (step === 4 && taskData.priority) {
        console.log('Priority selected:', taskData.priority, 'advancing to step 5');
        currentStep.value = 5;
      }
    
      // Force a re-render by using nextTick
      nextTick(() => {
        console.log('Current step is now:', currentStep.value);
      });
    };

    const submitTask = () => {
      const task = {
        ...taskData,
        id: editMode.value ? props.taskToEdit.id : Date.now().toString(),
        priority: Number(taskData.priority || '2') // Default to medium (2) if not selected
      };

      if (editMode.value) {
        emit('update-task', task);
      } else {
        emit('add-task', task);
      }

      resetForm();
    };

    // Update resetForm to use the correct default color based on current theme
    const resetForm = () => {
      const defaultColor = colorOptions.value.find(c => 
        c.bg === (isDarkMode.value ? '#2a2a2a' : '#ffffff')
      ) || colorOptions.value[0];
      
      const currentDefaults = {
        ...defaultTaskData,
        bgColor: defaultColor.bg,
        textColor: defaultColor.text
      };
      
      Object.assign(taskData, currentDefaults);
      currentStep.value = 1; // Reset to first step
      emit('cancel');
    };
    
    const toggleNewCategoryInput = () => {
      if (showNewCategoryInput.value && newCategory.value) {
        // Add the new category if it doesn't exist already
        if (!categories.value.includes(newCategory.value)) {
          categories.value.push(newCategory.value);
          taskData.category = newCategory.value;
          localStorage.setItem('categories', JSON.stringify(categories.value));
        }
        newCategory.value = '';
      }
      showNewCategoryInput.value = !showNewCategoryInput.value;
    };

    // Update the selectColor method
    const selectColor = (color) => {
      taskData.bgColor = color.bg;
      taskData.textColor = color.text;
      
      // Directly set to step 6 after color selection instead of calling checkStepCompletion
      if (currentStep.value === 5) {
        console.log('Color selected, advancing to step 6');
        currentStep.value = 6;
      }
    };

    return {
      taskData,
      isDarkMode,
      editMode,
      currentStep,
      progressPercent,
      checkStepCompletion,
      submitTask,
      resetForm,
      categories,
      newCategory,
      showNewCategoryInput,
      toggleNewCategoryInput,
      colorOptions,
      selectColor,
      getDefaultColorForTheme
    };
  }
}
</script>

<style scoped>
/* Progressive form animation styles - UPDATED */
.form-field-enter-active,
.form-field-leave-active {
  transition: all 0.3s ease;
  max-height: 200px; 
  overflow: hidden;
}

.form-field-enter-from,
.form-field-leave-to {
  opacity: 0;
  max-height: 0;
  margin-bottom: 0;
  padding: 0;
  overflow: hidden;
}

/* Add this new rule */
.form-group {
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

/* Progress bar styles */
.form-progress {
  margin-top: 1.5rem;
  position: relative;
  height: 30px;
  background-color: var(--gray-200);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.app-container.dark .form-progress {
  background-color: var(--gray-800);
}

.progress-bar {
  height: 100%;
  background-color: var(--primary);
  transition: width 0.5s ease;
}

.progress-steps {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10px;
}

.progress-step {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: var(--gray-300);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
  color: var(--gray-700);
  transition: all 0.3s ease;
  z-index: 2;
}

.progress-step.active {
  background-color: var(--primary);
  color: white;
  transform: scale(1.1);
}

.progress-step.completed {
  background-color: var(--primary-dark);
  color: white;
}

body.dark-theme .progress-step {
  background-color: var(--gray-700);
  color: var(--gray-300);
}

body.dark-theme .form-progress {
  background-color: var(--gray-800);
}

/* Active field highlight */
.form-group.active label {
  color: var(--primary);
  font-weight: 700;
}

.form-group.active input,
.form-group.active textarea,
.form-group.active select {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(67, 97, 238, 0.2);
}

/* Add this after your existing styles */
/* Fix for priority dropdown */
select {
  -webkit-appearance: menulist; /* Force the dropdown arrow in WebKit browsers */
  appearance: menulist; /* Standard */
  height: auto;
  min-height: 40px; /* Ensure enough height for the arrow */
  padding-right: 25px; /* Make space for the arrow */
  cursor: pointer;
}

/* Ensure proper sizing for all form controls */
.form-group.half select,
.form-group.half input {
  width: 100%;
  box-sizing: border-box;
}

/* Add new color picker styles */
.color-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}



.color-option {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border: 2px solid transparent;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.color-dark {
  color: white;
}

.color-option.color-white {
  color: black;
}

.color-option.selected {
  border-color: var(--primary);
  transform: scale(1.1);
  box-shadow: 0 0 0 2px rgba(67, 97, 238, 0.3);
}

/* Add these styles for the new layout */
.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
}

.form-column {
  flex: 1;
  min-width: 200px;
}



/* Keep your existing styles too */
</style>