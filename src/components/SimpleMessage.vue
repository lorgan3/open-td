<script setup lang="ts">
import { getCurrentInstance, onMounted, ref } from "vue";
import { DEFAULT_EXPIRE_TIME, MessageFn } from "../renderers/api";
import TextWithControls from "./controls/TextWithControls.vue";
import Icon from "./hud/Icon.vue";
import { IconType } from "./hud/constants";

interface Message {
  id: number;
  content: string;
  closable: boolean;
  open: boolean;
  removing: boolean;
}

let id = 1;

const props = defineProps<{
  register: (showMessage: MessageFn) => void;
}>();

const createEmptyMessage = (): Message => ({
  id: id++,
  content: "",
  closable: true,
  open: false,
  removing: false,
});

const messageQueue = ref<Message[]>([createEmptyMessage()]);

const timers = ref(new Map<number, number>());
const instance = getCurrentInstance();

const queueMessage: MessageFn = (content, config) => {
  let msg: Message;

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

    msg = messageQueue.value[targetIndex];
  } else {
    msg = messageQueue.value.at(-1)!;
    messageQueue.value.push(createEmptyMessage());
  }

  msg.closable = config?.closable ?? true;
  msg.open = true;
  msg.content = content;

  const expires = config?.expires ?? DEFAULT_EXPIRE_TIME;
  if (expires) {
    const id = window.setTimeout(() => {
      close(msg);
    }, expires);

    timers.value.set(msg.id, id);
  }

  return Promise.resolve(msg.id);
};

const close = (message: Message) => {
  message.open = false;
  message.removing = true;
  instance!.proxy!.$forceUpdate();

  window.setTimeout(() => {
    const index = messageQueue.value.indexOf(message);
    if (index > -1) {
      messageQueue.value.splice(index, 1);
    }
  }, 700);
};

onMounted(() => {
  props.register(queueMessage);
});
</script>

<template>
  <div class="message-wrapper">
    <div
      v-for="message in messageQueue"
      :key="message.id"
      :class="{
        message: true,
        'message--visible': message.open,
        'message--removing': message.removing,
      }"
    >
      <div class="message-inner">
        <button
          v-if="message.closable"
          class="close-button"
          @click="() => close(message)"
        >
          <Icon :type="IconType.Cross" />
        </button>
        <TextWithControls :text="message.content" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.message-wrapper {
  position: absolute;
  bottom: 10px;
  left: 10px;
  z-index: 2;
  display: flex;
  flex-direction: column-reverse;
}

.message {
  width: 400px;
  box-sizing: border-box;
  z-index: 1;
  box-shadow: 5px 5px 10px -5px;
  border-radius: 10px;
  transition: transform 0.2s, max-height 0.5s ease 0.2s;
  transform: translateX(-420px);
  max-height: 300px;
  overflow: hidden;
  max-width: calc(100vw - 20px);
  margin-top: 8px;

  &-inner {
    position: relative;
    background: #fff;
    padding: 16px;
    border: 3px solid #000;
    border-radius: 10px;

    &:hover {
      opacity: 0.3;
      transition: opacity 1s 1s linear;
    }
  }

  &--visible {
    transform: translateX(0px);
  }

  &--removing {
    max-height: 0px;
  }

  .close-button {
    position: absolute;
    right: 0px;
    top: 0px;
    padding: 3px 6px;
    border: 0;
    background: 0;
    cursor: pointer;
    font-size: 22px;
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
