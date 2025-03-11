import { defineStore } from 'pinia';

export const useTaskStore = defineStore('tasks', {
    state: () => ({
        tasks: [],
        filter: 'all',
        sortBy: 'date',
        theme: 'dark'
    }),

    getters: {
        filteredTasks: (state) => {
            let result = [...state.tasks];

            //apply filter
            if (state.filter === 'active') {
                result = result.filter(task => !task.completed);
            } else if (state.filter === 'completed') {
                result = result.filter(task => task.completed);
            }

            result.sort((a, b) => {
                if (state.sortBy === 'date') {
                    return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
                } else if (state.sortBy === 'priority') {
                    return b.priority - a.priority;
                } else if (state.sortBy === 'title') {
                    return a.title.localeCompare(b.title);
                }
                return 0;
            });
            return result;
        },

        getTaskById: (state) => (id) => {
            return state.tasks.find(task => task.id === id);
        }
    },

    actions: {
        addTask(task) {
            this.tasks.push(task);
            this.saveTasks();
        },

        updateTask(updatedTask) {
            const index = this.tasks.findIndex(t => t.id === updatedTask.id);
            if (index !== -1) {
                this.tasks[index] = updatedTask;
                this.saveTasks();
            }
        },

        deleteTask(id) {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveTasks();
        },

        toggleComplete(id) {
            const task = this.tasks.find(task => task.id === id);
            if (task) {
                task.completed = !task.completed;
                this.saveTasks();
            }
        },

        reorderTasks(fromIndex, toIndex) {
            const task = this.tasks.splice(fromIndex, 1)[0];
            this.tasks.splice(toIndex, 0, task);
            this.saveTasks();
        },

        setFilter(filter) {
            this.filter = filter;
        },

        setSortBy(sortBy) {
            this.sortBy = sortBy;
        },

        toggleTheme() {
            this.theme = this.theme === 'dark' ? 'light' : 'dark';
            document.body.setAttribute('data-theme', this.theme);
        },

        loadTasks() {
            const savedTasks = localStorage.getItem('tasks');
            if (savedTasks) {
                this.tasks = JSON.parse(savedTasks);
            }
        },

        saveTasks() {
            localStorage.setItem('tasks', JSON.stringify(this.tasks));
        }
    }

})