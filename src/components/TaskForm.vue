<template>
  <div class="task-form-container">
    <form class="task-form" @submit.prevent="submitTask">
      <!-- Step 1: Task Title -->
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
      </div>

      <!-- Step 2: Task Description -->
      <transition name="form-field">
        <div v-if="currentStep >= 2" class="form-group">
          <label for="task-description">Description:</label>
          <textarea
              id="task-description"
              v-model="taskData.description"
              placeholder="Task details (optional)"
              rows="3"
              @input="checkStepCompletion(2)"
          ></textarea>
        </div>
      </transition>

      <!-- Step 3: Due Date and Priority -->
      <transition name="form-field">
        <div v-if="currentStep >= 3" class="form-row">
          <div class="form-group half">
            <label for="task-due-date">Due Date:</label>
            <input
                id="task-due-date"
                v-model="taskData.dueDate"
                type="date"
                @change="checkStepCompletion(3)"
            />
          </div>

          <div class="form-group half">
            <label for="task-priority">Priority:</label>
            <select id="task-priority" v-model="taskData.priority" @change="checkStepCompletion(3)">
              <option value="1">Low</option>
              <option value="2">Medium</option>
              <option value="3">High</option>
            </select>
          </div>
        </div>
      </transition>

      <!-- Step 4: Task Color -->
      <transition name="form-field">
        <div v-if="currentStep >= 4" class="form-group">
          <label for="task-color">Task Color:</label>
          <input
              id="task-color"
              v-model="taskData.bgColor"
              type="color"
              @change="checkStepCompletion(4)"
          />
        </div>
      </transition>

      <!-- Step 5: Category -->
      <transition name="form-field">
        <div v-if="currentStep >= 4" class="form-group">
          <label for="task-category">Category:</label>
          <div class="category-select">
            <select id="task-category" v-model="taskData.category" @change="checkStepCompletion(4)">
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
      </transition>

      <!-- Form Actions -->
      <transition name="form-field">
        <div v-if="currentStep >= 4 || editMode" class="form-actions">
          <button class="btn-secondary" type="button" @click="resetForm">
            Cancel
          </button>
          <button class="btn-primary" type="submit">
            {{ editMode ? 'Update Task' : 'Add Task' }}
          </button>
        </div>
      </transition>

      <!-- Progress Bar -->
      <div v-if="!editMode" class="form-progress">
        <div :style="{ width: progressPercent + '%' }" class="progress-bar"></div>
        <div class="progress-steps">
          <span
              v-for="step in 4"
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
import {computed, reactive, ref, watch, onMounted} from 'vue';

export default {
  props: {
    taskToEdit: {
      type: Object,
      default: null
    }
  },
  setup(props, {emit}) {
    // Check dark mode
    const isDarkMode = ref(document.body.classList.contains('dark-theme'));
    
    const defaultTaskData = {
      title: '',
      description: '',
      dueDate: '',
      priority: '2', // medium by default
      bgColor: isDarkMode.value ? '#2a2a2a' : '#f9f9f9', // Different default color based on theme
      completed: false,
      category: ''
    };
    
    // Listen for theme changes
    onMounted(() => {
      window.addEventListener('themeChange', () => {
        isDarkMode.value = document.body.classList.contains('dark-theme');
        // Only update the bgColor if it's the default color
        if (taskData.bgColor === '#f9f9f9' || taskData.bgColor === '#2a2a2a') {
          taskData.bgColor = isDarkMode.value ? '#2a2a2a' : '#f9f9f9';
        }
      });
    });

    const taskData = reactive({...defaultTaskData});
    const currentStep = ref(1);
    const categories = ref(['Work', 'Personal', 'Shopping', 'Health']);
    const newCategory = ref('');
    const showNewCategoryInput = ref(false);

    const progressPercent = computed(() => {
      // Update to use 4 steps instead of 5
      return (currentStep.value / 4) * 100;
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

    // Load categories from localStorage on component mount
    onMounted(() => {
      const savedCategories = localStorage.getItem('categories');
      if (savedCategories) {
        categories.value = JSON.parse(savedCategories);
      }
    });

    // Update the step completion logic
    const checkStepCompletion = (step) => {
      if (editMode.value) {
        return; // Don't advance steps in edit mode
      }

      // Validation for each step
      if (step === 1 && taskData.title.trim().length >= 3 && currentStep.value === 1) {
        currentStep.value = 2;
      } else if (step === 2 && currentStep.value === 2) {
        // Always advance from description (optional)
        currentStep.value = 3;
      } else if (step === 3 && currentStep.value === 3) {
        // Due date and priority can be advanced to color & category (now step 4)
        currentStep.value = 4;
      }
      // Step 4 is now final (color & category)
    };

    const submitTask = () => {
      const task = {
        ...taskData,
        id: editMode.value ? props.taskToEdit.id : Date.now().toString(),
        priority: Number(taskData.priority)
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
      const currentDefaults = {
        ...defaultTaskData,
        bgColor: isDarkMode.value ? '#2a2a2a' : '#f9f9f9'
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
      toggleNewCategoryInput
    };
  }
}
</script>

<style scoped>
/* Progressive form animation styles */
.form-field-enter-active,
.form-field-leave-active {
  transition: all 0.5s ease;
  max-height: 200px;
  opacity: 1;
  transform: translateY(0);
}

.form-field-enter-from,
.form-field-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-20px);
  overflow: hidden;
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
</style>