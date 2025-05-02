<template>
  <div class="control-bar">
    <div class="filter-controls">
      <label>View:</label>
      <div class="button-group">
        <button 
          @click="$emit('update-filter', 'all')" 
          :class="{ active: currentFilter === 'all' }"
        >
          All
        </button>
        <button 
          @click="$emit('update-filter', 'active')" 
          :class="{ active: currentFilter === 'active' }"
        >
          Active
        </button>
        <button 
          @click="$emit('update-filter', 'completed')" 
          :class="{ active: currentFilter === 'completed' }"
        >
          Completed
        </button>
      </div>
    </div>
    
    <div class="sort-controls">
      <label>Sort by:</label>
      <select @change="$emit('update-sort', $event.target.value)" :value="currentSort">
        <option value="date">Due Date</option>
        <option value="priority">Priority</option>
        <option value="title">Title</option>
      </select>
    </div>
    
    <div v-if="categories.length > 1" class="category-filter">
      <label>Category:</label>
      <select @change="$emit('update-category', $event.target.value)" :value="currentCategory">
        <option value="All">All Categories</option>
        <option v-for="category in categories" :key="category" :value="category">
          {{ category }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';

export default {
  props: {
    currentFilter: {
      type: String,
      default: 'all'
    },
    currentSort: {
      type: String,
      default: 'date'
    },
    currentCategory: {
      type: String,
      default: 'All'
    },
    categories: {
      type: Array,
      default: () => []
    }
  },
  setup(props, { emit }) {
    // Add watchers to handle changes in categories
    watch(() => props.categories, (newCategories) => {
      // If the currently selected category was removed, reset to 'All'
      if (props.currentCategory !== 'All' && !newCategories.includes(props.currentCategory)) {
        emit('update-category', 'All');
      }
    });
    
    // Listen for custom category update events
    onMounted(() => {
      window.addEventListener('categoriesUpdated', () => {
        // The parent component will update the categories prop
      });
    });

    return {};
  }
}
</script>

<style scoped>
.control-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 0.75rem;
  background-color: var(--gray-100);
  border-radius: var(--radius-md);
}

body.dark-theme .control-bar {
  background-color: var(--gray-800);
}

.button-group {
  display: flex;
}

.button-group button {
  padding: 0.5rem 0.75rem;
  background-color: var(--gray-200);
  border: none;
  margin-right: 1px;
}

.button-group button:first-child {
  border-radius: var(--radius-sm) 0 0 var(--radius-sm);
}

.button-group button:last-child {
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  margin-right: 0;
}

.button-group button.active {
  background-color: var(--primary);
  color: white;
}

body.dark-theme .button-group button {
  background-color: var(--gray-700);
  color: var(--text-light);
}

body.dark-theme .button-group button.active {
  background-color: var(--primary);
}

label {
  margin-right: 0.5rem;
  font-weight: 600;
}

select {
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--gray-300);
}

body.dark-theme select {
  background-color: var(--gray-700);
  color: var(--text-light);
  border-color: var(--gray-600);
}
</style>