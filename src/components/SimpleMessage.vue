<script setup lang="ts">
import { onMounted, ref } from "vue";
import { MessageFn } from "../renderers/api";

interface Message {
  content: string;
  closable: boolean;
}

const props = defineProps<{
  register: (showMessage: MessageFn) => void;
}>();

const messageQueue = ref<Message[]>([]);
const firstMessage = ref<Message | undefined>();

const queueMessage: MessageFn = (content, config) => {
  const msg = { content, closable: config?.closable ?? true };
  if (config?.override) {
    messageQueue.value = [];
    firstMessage.value = msg;
    return;
  }

  messageQueue.value.push(msg);
  if (!firstMessage.value) {
    firstMessage.value = messageQueue.value.pop();
  }
};

const close = () => {
  firstMessage.value = messageQueue.value.pop();
};

onMounted(() => {
  props.register(queueMessage);
});
</script>

<template>
  <div v-if="firstMessage" class="message">
    <button v-if="firstMessage.closable" class="close-button" @click="close">
      ✖
    </button>
    <div>{{ firstMessage.content }}</div>
  </div>
</template>

<style lang="scss" scoped>
.message {
  position: absolute;
  top: 30px;
  left: 30px;
  max-width: 300px;
  padding: 20px;
  border: 3px solid #444;
  background: #fff;
  z-index: 1;
  box-shadow: 5px 5px 10px -5px;

  .close-button {
    position: absolute;
    right: 0px;
    top: 0px;
    padding: 3px 6px;
    border: 0;
    background: 0;
    cursor: pointer;
  }
}
</style>
