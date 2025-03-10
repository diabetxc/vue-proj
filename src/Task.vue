<template>
  <div
    class = "task-item"
    :class="{ completed: task.completed }"
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
      <button @click = "$emit('edit', task.id)" class = "btn-edit">
        <font-awesome-icon :icon="['fas', 'trash']" />
        </button>
      <button @click = "$emit('delete', task.id)" class = "btn-delete">
        <font-awesome-icon :icon="['fas', 'trash']" />
        </button>
    </div>
  </div>




</template>

<script>



</script>

<style scoped>

</style>