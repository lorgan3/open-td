<script setup lang="ts">
import { onMounted, ref } from "vue";
import { MessageFn } from "../renderers/api";

interface Message {
  content: string;
  closable: boolean;
  input?: { type: "keyboard" };
}

const props = defineProps<{
  register: (showMessage: MessageFn) => void;
}>();

const messageQueue = ref<Message[]>([]);
const firstMessage = ref<Message | undefined>();
const text = ref("");

let resolveMessage: (value: any) => void;
let cancelMessage: () => void;

const queueMessage: MessageFn = (content, config) => {
  const msg = {
    content,
    closable: config?.closable ?? true,
    input: config?.input ? config.input : undefined,
  };

  const previousRejectFn = cancelMessage;
  const promise = new Promise((resolve, reject) => {
    resolveMessage = resolve;
    cancelMessage = config?.input ? reject : resolve;
  });

  if (config?.override) {
    if (previousRejectFn) {
      previousRejectFn();
    }

    messageQueue.value = [];
    firstMessage.value = msg;
    return promise;
  }

  messageQueue.value.push(msg);
  if (!firstMessage.value) {
    firstMessage.value = messageQueue.value.pop();
  }

  return promise;
};

const close = () => {
  firstMessage.value = messageQueue.value.pop();
  cancelMessage();
};

const handleSubmit = (event: Event) => {
  resolveMessage(text.value);
  firstMessage.value = messageQueue.value.pop();
  event.preventDefault();
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
    <form
      v-if="firstMessage.input?.type === 'keyboard'"
      class="message-keyboard"
      @submit="handleSubmit"
    >
      <input v-model="text" class="message-keyboard-input" />
      <button type="submit">Submit</button>
    </form>
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

  &-keyboard {
    display: flex;
    gap: 8px;
    margin-top: 16px;

    &-input {
      flex: 1;
    }
  }
}
</style>
