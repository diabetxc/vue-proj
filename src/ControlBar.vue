<template>
  <div class ="controls-bar">
    <div class="filter-group">
      <span class="filter-label">Filter:</span>
      <button
        @click="setFilter('all')"
        :class="['filter-btn', filter === 'all' ? 'active' : '']">
        All
      </button>
      <button
        @click="setFilter('active')"
        :class="['filter-btn', filter === 'active' ? 'active' : '']">
        Active
      </button>
      <button
        @click="setFilter('completed')"
        :class="['filter-btn', filter === 'completed' ? 'active' : '']">
        Completed
      </button>
    </div>

    <div class="sort-group">
      <span class="sort-label">Sort By:</span>
      <select v-model="sortOption" @change="setSort">
        <option value="date">Due Date</option>
        <option value="priority">Priority</option>
        <option value="title">Title</option>
      </select>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  props: {
    currentFilter: {
      type: String,
      default: 'all'
    },
    currentSort: {
      type: String,
      default: 'date'
    }
  },

  emits: ['update-filter', 'update-sort'],

  setup(props, { emit }) {
    const filter = ref(props.currentFilter);
    const sortOption = ref(props.currentSort);

    const setFilter = (newFilter) => {
      filter.value = newFilter;
      emit('update-filter', newFilter);
    };
    
    const setSort = () => {
      emit('update-sort', sortOption.value);
    };
    
    return {
      filter,
      sortOption,
      setFilter,
      setSort
    };
  }
}
</script>