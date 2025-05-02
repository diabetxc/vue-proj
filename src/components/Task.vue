<template>
  <div
    class="task-item"
    :class="[
      `color-${getColorNameByBg(task.bgColor)}`,
      { 'dark-text': !isDarkBackground(task.bgColor), 'light-text': isDarkBackground(task.bgColor) }
    ]"
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
        <button @click="$emit('edit', task.id)" class="icon-button edit">
          <font-awesome-icon :icon="['fas', 'edit']" />
        </button>
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
import { useTaskStore } from '../stores/taskStore';
import { computed } from 'vue';

export default {
  props: {
    task: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const taskStore = useTaskStore();
    
    const isDarkBackground = (hex) => {
      if (!hex) return true;
      
      // Try to parse the hex color
      let r, g, b;
      
      try {
        // Remove # if present
        const cleanHex = hex.charAt(0) === '#' ? hex.substring(1) : hex;
        
        // Parse hex to RGB
        r = parseInt(cleanHex.substring(0, 2), 16);
        g = parseInt(cleanHex.substring(2, 4), 16);
        b = parseInt(cleanHex.substring(4, 6), 16);
        
        // Calculate relative luminance using the formula for perceptual brightness
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        // If luminance is less than 0.5, background is dark
        return luminance < 0.5;
      } catch (e) {
        console.error("Error parsing color", e);
        return true; // Default to dark background assumption if parsing fails
      }
    };
    
    const getColorNameByBg = (bgColor) => {
      // Match with the predefined colors in taskStore
      const colorOption = taskStore.colorOptions.find(c => c.bg === bgColor);
      return colorOption ? colorOption.name.toLowerCase() : 'custom';
    };

    const getPriorityLabel = (priority) => {
      const labels = {
        1: 'Low',
        2: 'Medium',
        3: 'High'
      };
      return labels[priority] || '';
    };
    
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    };
    
    return {
      isDarkBackground,
      getColorNameByBg,
      getPriorityLabel,
      formatDate
    };
  }
}
</script>

<style scoped>
/* Base task item styling to apply content-specific styling */
.task-item {
  position: relative;
}

/* Text color styling based on background */
.task-item.light-text {
  color: #ffffff;
}

.task-item.dark-text {
  color: #000000;
}

/* Make sure all text elements inherit the correct color */
.task-title,
.task-body p,
.task-date,
.task-footer {
  color: inherit;
}

/* Style differences for different background colors */
.color-blue .task-category-label,
.color-red .task-category-label,
.color-teal .task-category-label, 
.color-orange .task-category-label,
.color-purple .task-category-label,
.color-dark .task-category-label {
  background-color: rgba(255, 255, 255, 0.2);
  color: inherit;
}

.color-green .task-category-label,
.color-yellow .task-category-label,
.color-white .task-category-label {
  background-color: rgba(0, 0, 0, 0.15);
  color: inherit;
}

/* Adjustments for icon buttons based on text color */
.light-text .icon-button {
  color: rgba(255, 255, 255, 0.8);
}
.light-text .icon-button:hover {
  color: #ffffff;
}

.dark-text .icon-button {
  color: rgba(0, 0, 0, 0.7);
}
.dark-text .icon-button:hover {
  color: #000000;
}

/* Styling for checkboxes to ensure visibility */
.light-text .task-checkbox {
  border-color: rgba(255, 255, 255, 0.6);
}

.dark-text .task-checkbox {
  border-color: rgba(0, 0, 0, 0.5);
}

/* Add styles for the edit button */
.icon-button.edit {
  color: inherit;
  opacity: 0.7;
}

.light-text .icon-button.edit:hover {
  color: #ffffff;
  opacity: 1;
}

.dark-text .icon-button.edit:hover {
  color: #000000;
  opacity: 1;
}
</style>