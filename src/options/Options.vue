<template>
<div>
  <transition name="dropdown">
    <div class="config-updated" v-if="isShowConfigUpdated">
      {{ $t('opt:storage_updated') }}
    </div>
  </transition>
  <div class="opt-container">
    <div class="page-header">
      <h1>{{ $t('opt:title') }}
        <a class="new-version" v-if="newVersionAvailable" href="http://www.crimx.com/crx-saladict/" target="_blank">{{ $t('opt:new_version') }}</a>
      </h1>
      <div class="page-header-info">
        <p class="page-header-acknowledgement-wrap">
          <a href="https://github.com/crimx/crx-saladict/wiki#acknowledgement" @mouseenter="showAcknowledgement(true)" @mouseleave="showAcknowledgement(false)" @click.prevent="void 0">{{ $t('opt:acknowledgement') }}</a>
          <transition name="fade">
            <div class="page-header-acknowledgement" v-if="isShowAcknowledgement" @mouseenter="showAcknowledgement(true)"  @mouseleave="showAcknowledgement(false)">
              <ol>
                <li><a href="https://github.com/stockyman" rel="nofollow" target="_blank">stockyman</a> {{ $t('opt:acknowledgement_trans_tw') }}</li>
              </ol>
            </div>
          </transition>
        </p>
        <p><a href="https://github.com/crimx/crx-saladict/wiki" target="_blank" rel="noopener">{{ $t('opt:instructions') }}</a></p>
        <p class="page-header-social-media-wrap">
          <a href="mailto:straybugs@gmail.com" @mouseenter="showSocialMedia(true)" @mouseleave="showSocialMedia(false)" @click.prevent="void 0">{{ $t('opt:contact_author') }}</a>
          <transition name="fade">
            <div class="page-header-social-media" v-if="isShowSocial" @mouseenter="showSocialMedia(true)"  @mouseleave="showSocialMedia(false)">
              <social-media />
            </div>
          </transition>
        </p>
        <p><a href="https://github.com/crimx/crx-saladict/issues" target="_blank" rel="noopener">{{ $t('opt:report_issue') }}</a></p>
      </div>
    </div>
    <div class="text-right">
      <input type="file" id="config-import" class="btn-file" @change="handleImport">
      <label class="btn btn-default btn-xs" for="config-import">{{ $t('opt:import') }}</label>
      <button type="button" class="btn btn-default btn-xs" @click="handleExport">{{ $t('opt:export') }}</button>
      <button type="button" class="btn btn-danger btn-xs" @click="handleReset">{{ $t('opt:reset') }}</button>
    </div>
    <opt-app-active />
    <opt-preference />
    <opt-privacy />
    <opt-language />
    <opt-dict-panel />
    <opt-mode />
    <opt-pin-mode />
    <opt-popup />
    <opt-triple-ctrl />
    <opt-autopron />
    <opt-dicts />
    <opt-context-menu />
  </div>

  <!--Alert Modal-->
  <alert-modal ref="alert" />

  <!--赏杯咖啡呗-->
  <coffee />
</div>
</template>

<script>
import {storage, message} from '@/_helpers/browser-api'
import appConfigFactory from '@/app-config'
import { mergeConfig } from '@/_helpers/merge-config'
import Coffee from './Coffee'
import SocialMedia from './SocialMedia'
import AlertModal from '@/components/AlertModal'

import OptAppActive from './OptAppActive'
import OptPreference from './OptPreference'
import OptPrivacy from './OptPrivacy'
import OptDictPanel from './OptDictPanel'
import OptMode from './OptMode'
import OptPinMode from './OptPinMode'
import OptPopup from './OptPopup'
import OptTripleCtrl from './OptTripleCtrl'
import OptLanguage from './OptLanguage'
import OptAutopron from './OptAutopron'
import OptDicts from './OptDicts'
import OptContextMenu from './OptContextMenu'

export default {
  name: 'options',
  store: ['config', 'newVersionAvailable', 'searchText'],
  data () {
    return {
      text: 'salad',
      frameSource: 'https://baidu.com',
      isShowConfigUpdated: false,
      isShowSocial: false,
      isShowAcknowledgement: false,
    }
  },
  methods: {
    showSocialMedia (flag) {
      clearTimeout(this.__showSocialMediaTimeout)
      if (flag) {
        this.isShowSocial = true
      } else {
        this.__showSocialMediaTimeout = setTimeout(() => {
          this.isShowSocial = false
        }, 400)
      }
    },
    showAcknowledgement (flag) {
      clearTimeout(this.__showAcknowledgementTimeout)
      if (flag) {
        this.isShowAcknowledgement = true
      } else {
        this.__showAcknowledgementTimeout = setTimeout(() => {
          this.isShowAcknowledgement = false
        }, 400)
      }
    },
    handleImport (e) {
      const fr = new FileReader()
      fr.onload= () => {
        try {
          const content = JSON.parse(fr.result)
          if (content.version) {
            this.$store.config = mergeConfig(content, this.$store.config)
          }
        } catch (err) {
          if (process.env.NODE_ENV !== 'production' || process.env.DEV_BUILD) {
            console.warn(err)
          }
        }
      }
      fr.readAsText(e.currentTarget.files[0])
    },
    handleExport () {
      browser.runtime.getPlatformInfo()
        .then(({ os }) => {
          let config = JSON.stringify(this.$store.config, null, '  ')
          if (os === 'win') {
            config = config.replace(/\r\n|\n/g, '\r\n')
          }
          const file = new Blob([config], { type: 'text/plain;charset=utf-8' })
          const a = document.createElement('a')
          a.href = URL.createObjectURL(file)
          a.download = `config-${Date.now()}.saladict`
          a.click()
        })
    },
    handleReset () {
      this.$refs.alert.$emit('show', {
        title: this.$t('opt:reset_modal_title'),
        content: this.$t('opt:reset_modal_content'),
        onConfirm: () => {
          storage.sync.set({config: appConfigFactory()})
            .then(() => storage.sync.get('config'))
            .then(({config}) => {
              if (config) {
                this.config = config
              } else {
                // something wrong with the sync storage, use default config without syncing
                const defaultConfig = appConfigFactory()
                storage.sync.set({config: defaultConfig})
                this.config = defaultConfig
              }
            })
        }
      })
    }
  },
  watch: {
    config: {
      deep: true,
      handler () {
        storage.sync.set({config: this.config})
          .then(() => {
            this.isShowConfigUpdated = true
            clearTimeout(this.showConfigUpdatedTimeout)
            this.showConfigUpdatedTimeout = setTimeout(() => {
              this.isShowConfigUpdated = false
            }, 1500)
          })
      }
    },
  },
  components: {
    OptAppActive,
    OptPreference,
    OptPrivacy,
    OptDictPanel,
    OptMode,
    OptPinMode,
    OptPopup,
    OptTripleCtrl,
    OptLanguage,
    OptAutopron,
    OptDicts,
    OptContextMenu,
    Coffee,
    SocialMedia,
    AlertModal
  },
  mounted () {
    this.searchText()
  }
}
</script>

<style lang="scss">
@import "src/_sass_global/z-indices";
/*------------------------------------*\
   Bootstrap
\*------------------------------------*/
@import "~bootstrap-sass/assets/stylesheets/bootstrap/variables";
@import "~bootstrap-sass/assets/stylesheets/bootstrap/mixins";

// Reset and dependencies
@import "~bootstrap-sass/assets/stylesheets/bootstrap/normalize";

// Core CSS
@import "~bootstrap-sass/assets/stylesheets/bootstrap/scaffolding";
@import "~bootstrap-sass/assets/stylesheets/bootstrap/type";
@import "~bootstrap-sass/assets/stylesheets/bootstrap/grid";
@import "~bootstrap-sass/assets/stylesheets/bootstrap/forms";
@import "~bootstrap-sass/assets/stylesheets/bootstrap/buttons";

// Components
@import "~bootstrap-sass/assets/stylesheets/bootstrap/button-groups";
@import "~bootstrap-sass/assets/stylesheets/bootstrap/input-groups";
@import "~bootstrap-sass/assets/stylesheets/bootstrap/panels";
@import "~bootstrap-sass/assets/stylesheets/bootstrap/close";
@import "~bootstrap-sass/assets/stylesheets/bootstrap/alerts";

// Components w/ JavaScript
@import "~bootstrap-sass/assets/stylesheets/bootstrap/modals";

.checkbox-inline {
  margin-right: 10px;

  + .checkbox-inline {
    margin-left: 0;
  }

  &:last-child {
    margin-right: 0;
  }
}

.modal {
  // leave space for the dict panel
  padding-right: 470px;
}

.modal-body {
  overflow-y: auto;
  max-height: 80vh;
}

.input-group {
  margin: 10px 0;
}

.btn-file {
  position: absolute;
  z-index: -20000;
  left: -100%;

  &:active + label,
  &:focus + label {
    @include tab-focus;
    color: #333;
    background-color: #e6e6e6;
    border-color: #8c8c8c;
  }

  &:hover + label {
    color: #333;
    background-color: #e6e6e6;
    border-color: #adadad;
    text-decoration: none;
  }

  &:active + label {
    outline: 0;
    background-image: none;
    @include box-shadow(inset 0 3px 5px rgba(0,0,0,.125));
  }
}

/*------------------------------------*\
   Base
\*------------------------------------*/
html {
  overflow-y: scroll;
}

body {
  font-size: 14px;
  font-family: "Helvetica Neue", Helvetica, Arial, "Hiragino Sans GB", "Hiragino Sans GB W3", "Microsoft YaHei UI", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif;
}

/* type.css */
kbd {
  display: inline-block;
  padding: .25em .5em .2em;
  margin-left: .25em;
  margin-right: .25em;
  font: 75%/1 monaco, menlo, consolas, 'courier new', courier, monospace;
  border: solid 1px #ccc;
  border-bottom-color: #bbb;
  border-radius: 3px;
  white-space: nowrap;
  word-wrap: normal;
  text-transform: capitalize;
  color: #555;
  background-color: #fefefe;
  background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.05), transparent);
  box-shadow: 0 2px 0 #ccc, 0 3px 1px #999, inset 0 1px 1px #fff;
}

/*------------------------------------*\
   Components
\*------------------------------------*/
.config-updated {
  @extend .alert-success;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: $global-zindex-popover;
  padding: 5px;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}

.opt-container {
  min-width: 800px;
  margin-right: 470px;
  padding: 0 15px;
}

.new-version {
  text-decoration: none;
  color: #16a085;
}

.page-header {
  display: flex;
  justify-content: space-between;
  margin: 0 0 8px 0;
}

.page-header-info {
  display: flex;
  align-items: flex-end;

  & > * {
    margin: 0 0 0 8px;
  }
}

.page-header-acknowledgement-wrap {
  position: relative;
}

.page-header-acknowledgement {
  position: absolute;
  z-index: 99999;
  top: 150%;
  right: 0;
  width: 300px;
  padding: 20px 8px;
  background-color: #fff;
  border-radius: 15px;
  box-shadow: 3px 4px 31px -8px rgba(0,0,0,0.8);
}

.page-header-social-media-wrap {
  position: relative;
}

.page-header-social-media {
  position: absolute;
  z-index: 99999;
  top: 150%;
  right: 0;
}

.opt-item {
  @extend .row;
  position: relative;
  margin-bottom: 10px;
}

.opt-item__header {
  @extend .col-xs-2;
  width: percentage(2/12);
  text-align: right;
}

.opt-item__body {
  @extend .col-xs-6;
  width: percentage(6.5/12);
  background-color: #fafafa;

  &:hover + .opt-item__description-wrap {
    opacity: 1;
    z-index: 100;
  }
}

.opt-item__description-wrap {
  @extend .col-xs-4;
   width: percentage(3.5/12);
  position: absolute;
  z-index: -1;
  right: 0;
  padding-left: 15px;
  opacity: 0;
  transition: all 400ms;

  &:hover {
    opacity: 1;
    z-index: 100;
  }
}

.opt-item__description {
  border-left: 1px solid #666;
  padding-left: 15px;
  line-height: 1.8;
  color: #666;
}

.frame-container {
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: 470px;
}

.saladict-frame {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  overflow: hidden;
  border: 0 none;
  box-shadow: rgba(0, 0, 0, 0.8) 0px 4px 23px -6px;
  transition: all 1s;
}

.panel-list__add {
  text-align: right;
  margin: 15px 0;
}

.panel-list__header {
  @extend .panel-heading;
  cursor: pointer;
}

.panel-list__title {
  cursor: move;
}

.panel-list__header {
  cursor: move;
}

.panel-list__icon {
  width: 16px;
  height: 16px;
  vertical-align: text-bottom;
}

.panel-list__body {
  transition: height 600ms;
  overflow: hidden;
}

.double-click-delay {
  overflow: hidden;
  height: 0;
  transition: height 400ms;

  > .input-group {
    margin: 0;
  }
}

.select-box-container {
  margin: 10px 0;
}

.select-box {
  margin-left: 10px;
  margin-right: 10px;
}

.select-label {
  padding-left: 5px;
}

/*------------------------------------*\
   States
\*------------------------------------*/
// Utility classes
@import "~bootstrap-sass/assets/stylesheets/bootstrap/utilities";

.panel-list {
  transition: all 600ms;
}

.panel-list-enter, .panel-list-leave-to {
  opacity: 0;
}

.panel-list-leave-active {
  position: absolute;
  left: 15px;
  right: 15px;
}

.sortable-drag,
.sortable-ghost {
  opacity: 0;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 500ms;
}
.fade-enter, .fade-leave-active {
  opacity: 0;
}

.popup-enter-active {
  transition: all 1.5s 1s;
}
.popup-enter {
  opacity: 0;
  transform: translate3d(0px, 40px, 0px);
}

.dropdown-enter-active, .dropdown-leave-active {
  transition: transform 500ms;
}
.dropdown-enter, .dropdown-leave-active {
  transform: translateY(-100%);
}

@media (max-width: 1024px) {
  .opt-container {
    width: 100%;
  }

  .frame-container {
    display: none;
  }
}
</style>
