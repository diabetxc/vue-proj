<template>
  <div
    class = "task-item"
    :class="{ completed: task.completed, 'dark-bg': isDarkBackground(task.bgColor) }"
    :style = "{ backgroundColor: task.bgColor, color: getContrastColor(task.bgColor) }"
    draggable = "true"
    @dragstart = "$emit('dragstart', $event)"
    @dragend = "$emit('dragend', $event)"
    @dragover.prevent
    @drop = "$emit('drop', $event)"
  >
  <div class = "task-header">
    <div class = "task-controls">
      <input
        type = "checkbox"
        :checked = "task.completed"
        @change = "$emit('toggle-complete', task.id)"
        class = "task-checkbox"
        />
        <span class = "task-priority" :class = "'priority-' + task.priority">
          {{ getPriorityLabel(task.priority) }}
          </span>
    </div>
    <div class = "task-actions">
      <button @click = "$emit('delete', task.id)" class = "btn-delete">
        <font-awesome-icon :icon="['fas', 'trash']" />
        </button>
    </div>
  </div>

    <h3 class="task-title" :class="{ 'completed-text': task.completed }">
      {{ task.title }}
    </h3>

    <div class = "task-body" v-if="task.description">
      <p>{{ task.description }}</p>
    </div>

    <div class = "task-footer">
      <div class="task-tags" v-if="task.tags && task.tags.length">
        <span v-for="tag in task.tags" :key="tag" class="task-tag">{{ tag }}</span>
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

  methods: {
    getContrastColor(hex) {
      const r = parseInt(hex.slice(1,3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);

      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

      return luminance < 150 ? '#FFFFFF' : '#000000';
    },

    isDarkBackground(hex) {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);

      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      return luminance < 150;
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

</style>