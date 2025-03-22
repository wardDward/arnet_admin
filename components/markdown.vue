<template>
  <div class="editor">
    <!-- Formatting Buttons -->
    <div class="toolbar">
      <button @click="formatText('bold')"><b>B</b></button>
      <button @click="formatText('italic')"><i>I</i></button>
      <button @click="formatText('code')">`Code`</button>
      <button @click="formatText('heading')">H1</button>
      <button @click="formatText('list')">• List</button>
    </div>

    <!-- Markdown Input -->
    <textarea v-model="markdownText" ref="textarea" @input="updateContent" placeholder="Write Markdown here..." />

    <!-- Preview -->
    <div class="preview" v-html="parsedMarkdown"></div>
  </div>
</template>

<script setup>
import { ref, computed, defineEmits } from "vue";
import { parseMarkdown } from "@/utils/markdownParser";

const markdownText = ref("");
const textarea = ref(null);
const emit = defineEmits(["update:modelValue"]);

// Emit content change
const updateContent = () => {
  emit("update:modelValue", markdownText.value);
};

// Function to apply formatting
const formatText = (type) => {
  const el = textarea.value;
  if (!el) return;

  const start = el.selectionStart;
  const end = el.selectionEnd;
  const selectedText = markdownText.value.substring(start, end);

  let newText = markdownText.value;

  if (type === "bold") {
    newText = `${markdownText.value.substring(0, start)} **${selectedText || "bold"}** ${markdownText.value.substring(end)}`;
  } else if (type === "italic") {
    newText = `${markdownText.value.substring(0, start)} *${selectedText || "italic"}* ${markdownText.value.substring(end)}`;
  } else if (type === "code") {
    newText = `${markdownText.value.substring(0, start)} \`${selectedText || "code"}\` ${markdownText.value.substring(end)}`;
  } else if (type === "heading") {
    newText = `${markdownText.value.substring(0, start)}\n# ${selectedText || "Heading"}\n${markdownText.value.substring(end)}`;
  } else if (type === "list") {
    newText = `${markdownText.value.substring(0, start)}\n- ${selectedText || "List Item"}\n${markdownText.value.substring(end)}`;
  }

  markdownText.value = newText;

  // Emit new content
  updateContent();

  // Set cursor position back
  setTimeout(() => {
    el.focus();
    el.selectionStart = start + 2;
    el.selectionEnd = end + 2;
  }, 0);
};

// Compute parsed Markdown for preview
const parsedMarkdown = computed(() => parseMarkdown(markdownText.value));
</script>


<style scoped>
.editor {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toolbar {
  display: flex;
  gap: 5px;
}

button {
  background: #eee;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 14px;
}

button:hover {
  background: #ddd;
}

textarea {
  width: 100%;
  height: 150px;
  padding: 10px;
  font-size: 16px;
}

.preview {
  padding: 10px;
  border: 1px solid #ddd;
  background: #f9f9f9;
  white-space: pre-wrap;
}
</style>
