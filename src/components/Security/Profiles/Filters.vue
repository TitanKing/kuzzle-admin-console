<template>
  <div class="Filters">
    <div class="row card-panel card-header">
      <div class="col s7">
        <role-chips
          :added-roles="addedRoles"
          @selected-role="onRoleSelected"
          @remove-role="removeRole"
        ></role-chips>
      </div>
      <div class="Filters-actions col s3">
        <button type="submit" class="btn btn-small waves-effect waves-light" @click.prevent="submitSearch">{{labelSearchButton}}</button>
        <button class="btn-flat btn-small waves-effect waves-light" @click="reset">Reset</button>
      </div>
    </div>
  </div>
</template>

<script>
import QuickFilter from '../Common/Filters/QuickFilter'
import RoleChips from './RoleChips'
import MSelect from '../../Common/MSelect'

export default {
  name: 'Filters',
  props: {
    labelSearchButton: {
      type: String,
      required: false,
      default: 'search'
    },
    currentFilter: Object
  },
  components: {
    QuickFilter,
    RoleChips,
    MSelect
  },
  data() {
    return {
      addedRoles: []
    }
  },
  methods: {
    onRoleSelected(role) {
      this.addedRoles.push(role)
    },
    removeRole(role) {
      this.addedRoles.splice(this.addedRoles.indexOf(role), 1)
    },
    submitSearch() {
      if (this.addedRoles.length === 0) {
        this.$emit('filters-updated', null)
        return
      }

      this.$emit('filters-updated', { roles: this.addedRoles })
    },
    reset() {
      this.addedRoles = []
      this.$emit('reset', null)
    }
  },
  watch: {
    currentFilter: {
      immediate: true,
      handler(value) {
        this.addedRoles = value && value.roles ? value.roles : []
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.Filters-actions {
  height: 48px;
  line-height: 48px;
}
</style>
