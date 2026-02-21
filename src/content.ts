import { CAT_IMAGES, getGitHubRawUrl, getLocalPreviewUrl } from "./cats";
import "./content.css";

const PICKER_CLASS = "praise-cat-picker";
const TRIGGER = "!n";

let activePicker: HTMLDivElement | null = null;
let activeTextarea: HTMLTextAreaElement | null = null;
let triggerStart = -1;

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
    const item = document.createElement("button");
    item.type = "button";
    item.className = "praise-cat-picker-item";
    item.title = cat.alt;

    const img = document.createElement("img");
    img.src = getLocalPreviewUrl(cat.file);
    img.alt = cat.alt;
    img.loading = "lazy";
    item.appendChild(img);

    const label = document.createElement("span");
    label.className = "praise-cat-picker-label";
    label.textContent = cat.alt;
    item.appendChild(label);

    item.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      insertImage(textarea, cat.file, cat.alt);
      closePicker();
    });

    picker.appendChild(item);
  });

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

  // トリガー文字列（!n...）を置換
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

  // textarea の下にピッカーを配置
  const rect = textarea.getBoundingClientRect();
  picker.style.top = `${window.scrollY + rect.bottom + 4}px`;
  picker.style.left = `${window.scrollX + rect.left}px`;
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

  // カーソル前のテキストからトリガーを探す
  const textBefore = value.slice(0, cursor);
  const triggerIdx = textBefore.lastIndexOf(TRIGGER);

  if (triggerIdx === -1) {
    closePicker();
    return;
  }

  // トリガーが行頭 or スペース/改行の後にあるか確認
  if (triggerIdx > 0) {
    const charBefore = value[triggerIdx - 1];
    if (charBefore !== " " && charBefore !== "\n" && charBefore !== "\t") {
      closePicker();
      return;
    }
  }

  // トリガー後のテキスト（検索ワード）にスペースや改行が含まれていないか
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

// GitHub の textarea で input イベントを監視
document.addEventListener("input", handleInput, true);
document.addEventListener("keydown", handleKeydown, true);

// ピッカー外クリックで閉じる
document.addEventListener("click", (e) => {
  if (!activePicker) return;
  const target = e.target as HTMLElement;
  if (!target.closest(`.${PICKER_CLASS}`)) {
    closePicker();
  }
});

console.debug("[praise-cat] Content script loaded");
