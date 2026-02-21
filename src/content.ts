import { CAT_IMAGES, getGitHubRawUrl, getLocalPreviewUrl } from "./cats";
import "./content.css";

const PICKER_CLASS = "praise-cat-picker";
const TRIGGER = "!n";

let activePicker: HTMLDivElement | null = null;
let activeTextarea: HTMLTextAreaElement | null = null;
let triggerStart = -1;

function blockEvent(e: Event): void {
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
}

function createPicker(
  textarea: HTMLTextAreaElement,
  filter: string,
): HTMLDivElement {
  const picker = document.createElement("div");
  picker.className = PICKER_CLASS;

  const filtered = filter
    ? CAT_IMAGES.filter((cat) => cat.alt.toLowerCase().includes(filter.toLowerCase()))
    : CAT_IMAGES;

  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "praise-cat-picker-empty";
    empty.textContent = "見つかりません";
    picker.appendChild(empty);
    return picker;
  }

  filtered.forEach((cat) => {
    const item = document.createElement("div");
    item.className = "praise-cat-picker-item";
    item.title = cat.alt;
    item.dataset.file = cat.file;
    item.dataset.alt = cat.alt;

    const img = document.createElement("img");
    img.src = getLocalPreviewUrl(cat.file);
    img.alt = cat.alt;
    img.loading = "lazy";
    item.appendChild(img);

    const label = document.createElement("span");
    label.className = "praise-cat-picker-label";
    label.textContent = cat.alt;
    item.appendChild(label);

    picker.appendChild(item);
  });

  // mousedown/pointerdown をブロック（フォーカス移動を防止）
  for (const evt of ["mousedown", "pointerdown"]) {
    picker.addEventListener(evt, blockEvent, true);
  }

  // click で選択処理 + 伝播ブロック
  picker.addEventListener("click", (e) => {
    e.stopPropagation();
    e.stopImmediatePropagation();
    const item = (e.target as HTMLElement).closest<HTMLElement>(".praise-cat-picker-item");
    if (item?.dataset.file && item?.dataset.alt) {
      insertImage(textarea, item.dataset.file, item.dataset.alt);
      closePicker();
    }
  }, true);

  return picker;
}

function insertImage(
  textarea: HTMLTextAreaElement,
  file: string,
  alt: string,
): void {
  const rawUrl = getGitHubRawUrl(file);
  const markdown = `![${alt}](${rawUrl})`;

  const value = textarea.value;
  const cursorPos = textarea.selectionStart;

  const before = value.slice(0, triggerStart);
  const after = value.slice(cursorPos);
  textarea.value = before + markdown + after;

  const newPos = triggerStart + markdown.length;
  textarea.selectionStart = newPos;
  textarea.selectionEnd = newPos;
  textarea.focus();

  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

function showPicker(textarea: HTMLTextAreaElement, filter: string): void {
  closePicker();

  const picker = createPicker(textarea, filter);
  activePicker = picker;
  activeTextarea = textarea;

  const rect = textarea.getBoundingClientRect();
  picker.style.top = `${rect.bottom + 4}px`;
  picker.style.left = `${rect.left}px`;
  picker.style.width = `${Math.min(rect.width, 480)}px`;

  document.body.appendChild(picker);
}

function closePicker(): void {
  if (activePicker) {
    activePicker.remove();
    activePicker = null;
    activeTextarea = null;
    triggerStart = -1;
  }
}

function handleInput(e: Event): void {
  const textarea = e.target as HTMLTextAreaElement;
  if (!(textarea instanceof HTMLTextAreaElement)) return;

  const value = textarea.value;
  const cursor = textarea.selectionStart;

  const textBefore = value.slice(0, cursor);
  const triggerIdx = textBefore.lastIndexOf(TRIGGER);

  if (triggerIdx === -1) {
    closePicker();
    return;
  }

  if (triggerIdx > 0) {
    const charBefore = value[triggerIdx - 1];
    if (charBefore !== " " && charBefore !== "\n" && charBefore !== "\t") {
      closePicker();
      return;
    }
  }

  const query = textBefore.slice(triggerIdx + TRIGGER.length);
  if (/[\n\r]/.test(query)) {
    closePicker();
    return;
  }

  triggerStart = triggerIdx;
  showPicker(textarea, query.trim());
}

function handleKeydown(e: KeyboardEvent): void {
  if (!activePicker) return;

  if (e.key === "Escape") {
    e.preventDefault();
    closePicker();
  }
}

document.addEventListener("input", handleInput, true);
document.addEventListener("keydown", handleKeydown, true);

document.addEventListener("click", (e) => {
  if (!activePicker) return;
  const target = e.target as HTMLElement;
  if (!target.closest(`.${PICKER_CLASS}`)) {
    closePicker();
  }
});

console.debug("[praise-cat] Content script loaded");
