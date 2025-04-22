<template>
  <div
    class="task-item"
    :class="{ 
      completed: task.completed, 
      'dark-bg': isDarkBackground(task.bgColor),
      'light-bg': !isDarkBackground(task.bgColor)
    }"
    :style="{ 
      backgroundColor: task.bgColor
    }"
    draggable="true"
    @dragstart="$emit('dragstart', $event)"
    @dragend="$emit('dragend', $event)"
    @dragover.prevent
    @drop="$emit('drop', $event)"
  >
  <div class="task-header">
    <div class="task-controls">
      <input
        type="checkbox"
        :checked="task.completed"
        @change="$emit('toggle-complete', task.id)"
        class="task-checkbox"
      />
      <span class="task-priority" :class="'priority-' + task.priority">
        {{ getPriorityLabel(task.priority) }}
      </span>
    </div>
    <div class="task-actions">
      <button @click="$emit('delete', task.id)" class="icon-button delete">
        <font-awesome-icon :icon="['fas', 'trash']" />
      </button>
    </div>
  </div>

    <h3 class="task-title" :class="{ 'completed-text': task.completed }">
      {{ task.title }}
    </h3>

    <div class="task-body" v-if="task.description">
      <p>{{ task.description }}</p>
    </div>

    <div class="task-footer">
      <div class="task-category" v-if="task.category">
        <span class="task-category-label">{{ task.category }}</span>
      </div>
      <div class="task-date" v-if="task.dueDate">
        Due: {{ formatDate(task.dueDate) }}
      </div>
    </div>
  </div>

</template>

<script>
export default{
  props: {
    task: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      isDarkMode: document.body.classList.contains('dark-theme')
    };
  },
  created() {
    // Listen for theme changes
    window.addEventListener('themeChange', this.checkTheme);
  },
  beforeUnmount() {
    window.removeEventListener('themeChange', this.checkTheme);
  },
  methods: {
    checkTheme() {
      this.isDarkMode = document.body.classList.contains('dark-theme');
    },
    getContrastColor(hex) {
      // Default colors for system default backgrounds
      if (!hex || hex === '#f9f9f9' || hex === '#2a2a2a') {
        return this.isDarkMode ? '#FFFFFF' : '#000000';
      }

      // Parse hex color to RGB values
      let r, g, b;
      try {
        r = parseInt(hex.slice(1, 3), 16);
        g = parseInt(hex.slice(3, 5), 16);
        b = parseInt(hex.slice(5, 7), 16);
      } catch (e) {
        // If parsing fails, use default colors
        return this.isDarkMode ? '#FFFFFF' : '#000000';
      }

      // Calculate luminance using RGB values
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      
      // Use the same contrast logic regardless of theme
      // If background is dark, use light text; if background is light, use dark text
      return luminance > 0.5 ? '#000000' : '#FFFFFF';
    },

    isDarkBackground(hex) {
      if (!hex || hex === '#f9f9f9' || hex === '#2a2a2a') {
        return this.isDarkMode;
      }

      try {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);

        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        // Use consistent threshold regardless of theme
        return luminance <= 0.5;
      } catch (e) {
        return this.isDarkMode;
      }
    },

    getPriorityLabel(priority) {
      const labels = {
        1: 'Low',
        2: 'Medium',
        3: 'High'
      };
      return labels[priority] || '';
    },
    formatDate(dateString){
      const date = new Date(dateString);
      return date.toLocaleDateString();
    }
  }
}
</script>

<style scoped>
.task-category-label {
  background-color: rgba(67, 97, 238, 0.1);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 500;
  /* Add subtle text shadow for better visibility on any background */
  text-shadow: 0 0 2px rgba(255, 255, 255, 0.3);
}

/* Enhance visibility in dark mode */
body.dark-theme .task-category-label {
  background-color: rgba(67, 97, 238, 0.2);
}

/* Improve visibility on dark backgrounds */
.dark-bg .task-category-label {
  background-color: rgba(67, 97, 238, 0.3);
}

/* Force text colors based on background darkness */
.dark-bg.task-item,
.dark-bg .task-title,
.dark-bg .task-description,
.dark-bg .task-body p,
.dark-bg .task-footer,
.dark-bg .task-date {
  color: #FFFFFF !important;
}

.light-bg.task-item,
.light-bg .task-title,
.light-bg .task-description,
.light-bg .task-body p,
.light-bg .task-footer,
.light-bg .task-date {
  color: #000000 !important;
}

/* Improve visibility for task categories */
.light-bg .task-category-label {
  color: var(--primary) !important;
  background-color: rgba(67, 97, 238, 0.1);
  font-weight: 600;
}

.dark-bg .task-category-label {
  color: white !important;
  background-color: rgba(67, 97, 238, 0.4);
}

/* Ensure task description text is visible */
.task-body p {
  color: inherit !important;
}
</style>