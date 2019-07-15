<template>
  <div class="hello">
    <div class="bx--grid">
      <div class="bx--row">
        <div class="bx--col">
          <cv-file-uploader :label="fileUploaderLabel" :helperText="helperText" :buttonLabel="fileUploaderButtonLabel"
            :accept="fileUploaderAccept" :clear-on-reselect="fileUploaderClearOnReselect"
            :initial-state-uploading="fileUploaderInitialStateUploading" :multiple="fileUploaderMultiple"
            :removable="fileUploaderRemovable" @change="onChange" v-model="storyFiles" ref="fileUploader">
          </cv-file-uploader>
          <cv-button @click="transcribe" :disabled="!storyFiles">Transcribe</cv-button>
        </div>
        <div class="bx--col">
          <cv-text-area :label="transcriptionLabel" v-model="transcription" placeholder="Your transcription will be rendered here">
          </cv-text-area>
        </div>
      </div>
    </div>


    <cv-loading v-if="loading" :active="loading" :overlay="overlay"></cv-loading>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  data: () => ({
    transcriptionLabel: "Transcription",
    fileUploaderLabel: "Select an audio file",
    storyFiles: null,
    helperText: "",
    fileUploaderButtonLabel: "Add File",
    fileUploaderAccept: "",
    fileUploaderClearOnReselect: true,
    fileUploaderInitialStateUploading: false,
    fileUploaderMultiple: false,
    transcription: "",
    fileUploaderRemovable: true,
    loading: false,
    overlay: true
  }),
  methods: {
    onChange() {
      console.log(this.storyFiles)
    },
    transcribe() {
      if (this.storyFiles) {
        let formData = new FormData();
        this.transcription = ""
        formData.append('file', this.storyFiles[0].file)
        this.loading = true;
        axios.post('/transcribe', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }).then(res => {
            this.loading = false;
            console.log(res)
            res.data.results.forEach(text => {
              console.log(text.alternatives[0].transcript)
              this.transcription += text.alternatives[0].transcript + '\n'
            })
            console.log(this.transcription)
          })
          .catch(err => {
            console.log('FAILURE!!');
            console.log(err)
            this.loading = false;
          });
      }
    }
  },
  name: 'HelloWorld',
  props: {
    msg: String
  }
}
</script>
<style lang="sass">
@import './style'
</style>
