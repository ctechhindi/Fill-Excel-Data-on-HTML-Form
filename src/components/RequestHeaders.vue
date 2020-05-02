<template>
  <div id="requestHeaders">
    <b-collapse :open="false" aria-id="customRequestHeaderCol">
      <a slot="trigger" aria-controls="customRequestHeaderCol">
        <p style="margin-bottom: 10px;">
          <strong>&nbsp;> Set Request Custom Headers</strong>
        </p>
      </a>
      <div class="content" style="margin-bottom: 10px;">
        <div class="container">
          <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
            <thead>
              <tr>
                <th>#</th>
                <th>Header Name</th>
                <th>Header Value</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(data, index) in headers" :key="index">
                <td>{{ index + 1 }}</td>
                <td>
                  <input
                    type="text"
                    class="input is-small"
                    v-model="data.name"
                    placeholder="Header Name"
                    :tabIndex="(index + 1)"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    class="input is-small"
                    v-model="data.value"
                    placeholder="Header Name"
                    :tabIndex="(index + 2)"
                  />
                </td>
                <td>
                  <button
                    class="button is-success is-small"
                    @click="insertHeader(index)"
                    v-if="repeatPlusBtn === true || index === 0"
                    title="Add New Header"
                  >
                    <i class="mdi mdi-plus"></i>
                  </button>&nbsp;
                  <button
                    class="button is-danger is-small"
                    @click="deleteHeader(index)"
                    title="Delete Header"
                  >
                    <i class="mdi mdi-delete"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </b-collapse>
  </div>
</template>

<script>
export default {
  name: "RequestHeaders",
  props: {
    // repeat-plus-btn
    repeatPlusBtn: {
      default: true,
      type: Boolean
    },
    value: {
      type: Array
    }
  },

  data() {
    return {
      headers: this.value
    };
  },

  watch: {
    headers: {
      handler(newObject) {
        this.$emit("input", newObject);
      },
      deep: true
    }
  },

  methods: {
    insertHeader() {
      this.headers.push({
        name: "",
        value: ""
      });
    },

    deleteHeader(index) {
      if (index !== undefined && index >= 0) {
        if (this.headers[index] !== undefined && this.headers.length !== 1) {
          this.headers.splice(index, 1);
        }
      }
    }
  },

  mounted() {
    if (this.value === undefined || this.value.length <= 0) {
      if (this.value.name === undefined || this.value.name === "") {
        this.headers.push({ name: "", value: "" });
      }
    }
  }
};
</script>