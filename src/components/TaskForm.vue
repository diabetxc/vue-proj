<template>
  <div class="task-form-container">
    <form @submit.prevent="submitTask" class="task-form">
      <div class="form-group">
        <label for="task-title">Task Title:</label>
        <input
          id="task-title"
          type="text"
          v-model="taskData.title"
          placeholder="Enter task title"
          required
          />
      </div>

      <div class="form-group">
        <label for="task-description">Description:</label>
        <textarea
          id="task-description"
          v-model="taskData.description"
          placeholder="Task details (optional)"
          rows="3"
          ></textarea>
      </div>

      <div class="form-row">
        <div class="form-group half">
          <label for="task-due-date">Due Date:</label>
          <input
            id="task-due-date"
            type="date"
            v-model="taskData.dueDate"
            />
        </div>

        <div class="form-group half">
          <label for="task-priority">Priority:</label>
          <select id="task-priority" v-model="taskData.priority">
            <option value="1">Low</option>
            <option value="2">Medium</option>
            <option value="3">High</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label for="task-tags">Tags (comma separated):</label>
        <input
          id="task-tags"
          type="text"
          v-model="tagsInput"
          placeholder="e.g. work, personal, urgent"
          />
      </div>

      <div class="form-group">
        <label for="task-color">Task Color:</label>
        <input
          id="task-color"
          type="color"
          v-model="taskData.bgColor"
          />
      </div>

      <div class="form-actions">
        <button type="button" @click="resetForm" class="btn-secondary">
          Cancel
        </button>
        <button type="submit" class="btn-primary">
          {{ editMode ? 'Update Task' : 'Add Task' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { reactive, ref, computed, watch } from 'vue';

export default{
  props: {
    taskToEdit: {
      type: Object,
      default: null
    }
  },
  setup(props, { emit }) {
    const defaultTaskData= {
      title: '',
      description: '',
      dueDate: '',
      priority: '2', //medium by default
      bgColor: '#f9f9f9',
      completed: false,
      tags: []
    };

    const taskData = reactive({...defaultTaskData});
    const tagsInput = ref('');

    const editMode = computed(() => !!props.taskToEdit);

    //watch for changes in taskToEdit prop
    watch(() => props.taskToEdit, (newValue) => {
      if (newValue) {
        //populate with task data for editing
        Object.assign(taskData, newValue);
        tagsInput.value = newValue.tags ? newValue.tags.join(', ') : '';
      }
    }, { immediate: true });

    const submitTask = () => {
      //parse tags from comma-separated string
      const tags = tagsInput.value
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag !== '');

      const task = {
        ...taskData,
        tags,
        id: editMode.value ? props.taskToEdit.id : Date.now().toString(),
        priority: Number(taskData.priority)
      };

      if (editMode.value) {
        emit('update-task', task);
      }
      else {
        emit('add-task', task);
      }

      resetForm();
    };

    const resetForm = () => {
      Object.assign(taskData, defaultTaskData);
      tagsInput.value='';
      emit('cancel');
    };

    return {
      taskData,
      tagsInput,
      editMode,
      submitTask,
      resetForm
    };
  }
}

</script>

<style scoped>

</style>