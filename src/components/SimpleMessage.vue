<script setup lang="ts">
import { getCurrentInstance, onMounted, ref } from "vue";
import { MessageFn } from "../renderers/api";
import TextWithControls from "./controls/TextWithControls.vue";

interface Message {
  id: number;
  content: string;
  closable: boolean;
  open: boolean;
}

const props = defineProps<{
  register: (showMessage: MessageFn) => void;
}>();

const messageQueue = ref<Message[]>([]);
const timers = ref(new Map<number, number>());
const instance = getCurrentInstance();

const queueMessage: MessageFn = (content, config) => {
  const msg = {
    id: Date.now(),
    content,
    closable: config?.closable ?? true,
    open: true,
  };

  if (config?.expires) {
    const id = window.setTimeout(() => {
      close(msg);
    }, config.expires);

    timers.value.set(msg.id, id);
  }

  let targetIndex = -1;
  if (config?.override) {
    targetIndex = messageQueue.value.findIndex(
      (msg) => msg.id === config.override
    );
  }

  if (targetIndex !== -1) {
    const oldId = messageQueue.value[targetIndex].id;
    window.clearTimeout(timers.value.get(oldId));
    timers.value.delete(oldId);

    messageQueue.value[targetIndex] = msg;
  } else {
    messageQueue.value.push(msg);
  }

  return Promise.resolve(msg.id);
};

const close = (message: Message) => {
  message.open = false;
  instance!.proxy!.$forceUpdate();

  window.setTimeout(() => {
    messageQueue.value.splice(messageQueue.value.indexOf(message), 1);
  }, 200);
};

onMounted(() => {
  props.register(queueMessage);
});
</script>

<template>
  <div class="message-wrapper">
    <div
      v-for="index in messageQueue.length + 1"
      :key="index"
      :class="{
        message: true,
        'message--visible': messageQueue[index - 1]?.open,
      }"
    >
      <div v-if="messageQueue[index - 1]">
        <button
          v-if="messageQueue[index - 1].closable"
          class="close-button"
          @click="() => close(messageQueue[index - 1])"
        >
          ✖
        </button>
        <TextWithControls :text="messageQueue[index - 1].content" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.message-wrapper {
  position: absolute;
  top: 30px;
  left: 10px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message {
  max-width: 300px;
  padding: 16px;
  box-sizing: border-box;
  border: 3px solid #000;
  background: #fff;
  z-index: 1;
  box-shadow: 5px 5px 10px -5px;
  transition: transform 0.2s;
  transform: translateX(-320px);

  &--visible {
    transform: translateX(0px);
  }

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
