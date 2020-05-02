<template>
  <div>
    <section class="hero is-primary is-bold">
      <div class="hero-body">
        <div class="container">
          <nav class="level">
            <!-- Left side -->
            <div class="level-left">
              <div class="level-item">
                <div>
                  <p class="title" style="font-family: cursive;">
                    {{ title }}
                    <span class="tag is-dark" v-html="version"></span>
                  </p>
                  <p
                    style="padding-top: 10px; font-size: 13px;"
                    class="heading"
                    v-text="description"
                  ></p>
                </div>
              </div>
            </div>
            <!-- Right side -->
            <div class="level-right">
              <div class="level-item">
                <b-tooltip type="is-dark" label="Go to Options">
                  <a class="has-text-white" href="/options/options.html">
                    <i class="mdi mdi-settings mdi-24px"></i>
                  </a>
                </b-tooltip>
              </div>
              <div class="level-item">
                <b-tooltip type="is-dark" label="Go to Request Page">
                  <a class="has-text-white" href="/request/request.html">
                    <i class="mdi mdi-earth mdi-24px"></i>
                  </a>
                </b-tooltip>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import app from '../manifest.json'

export default {
  data() {
    return {
      title: app.name,
      description: app.description,
      version: app.version
    };
  },
};
</script>