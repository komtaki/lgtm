import { CAT_IMAGES, getGitHubRawUrl, getLocalPreviewUrl } from "./cats";
import "./content.css";

const BUTTON_CLASS = "praise-cat-btn";
const PICKER_CLASS = "praise-cat-picker";

function createCatButton(): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = BUTTON_CLASS;
  btn.textContent = "\uD83D\uDC31";
  btn.title = "Insert praise cat image";
  btn.setAttribute("aria-label", "Insert praise cat image");
  return btn;
}

function createPicker(textarea: HTMLTextAreaElement): HTMLDivElement {
  const picker = document.createElement("div");
  picker.className = PICKER_CLASS;

  CAT_IMAGES.forEach((cat) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "praise-cat-picker-item";
    item.title = cat.alt;

    const img = document.createElement("img");
    img.src = getLocalPreviewUrl(cat.file);
    img.alt = cat.alt;
    img.loading = "lazy";
    item.appendChild(img);

    item.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      insertMarkdown(textarea, cat.file, cat.alt);
      closePicker(picker);
    });

    picker.appendChild(item);
  });

  return picker;
}

function insertMarkdown(
  textarea: HTMLTextAreaElement,
  file: string,
  alt: string,
): void {
  const rawUrl = getGitHubRawUrl(file);
  const markdown = `![${alt}](${rawUrl})`;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;

  // カーソル位置が行頭でなければ改行を挿入
  const prefix = start > 0 && value[start - 1] !== "\n" ? "\n" : "";
  const suffix = end < value.length && value[end] !== "\n" ? "\n" : "";
  const insertion = `${prefix}${markdown}${suffix}`;

  textarea.value = value.slice(0, start) + insertion + value.slice(end);

  // カーソルを挿入テキストの末尾に移動
  const newPos = start + insertion.length;
  textarea.selectionStart = newPos;
  textarea.selectionEnd = newPos;
  textarea.focus();

  // GitHub の状態同期のため input イベントを dispatch
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

function closePicker(picker: HTMLDivElement): void {
  picker.remove();
}

function togglePicker(btn: HTMLButtonElement, textarea: HTMLTextAreaElement): void {
  const existing = btn.parentElement?.querySelector(`.${PICKER_CLASS}`);
  if (existing) {
    existing.remove();
    return;
  }

  // 他のピッカーを閉じる
  document.querySelectorAll(`.${PICKER_CLASS}`).forEach((el) => el.remove());

  const picker = createPicker(textarea);
  btn.parentElement?.appendChild(picker);
}

function findTextarea(toolbar: Element): HTMLTextAreaElement | null {
  // markdown-toolbar の親コンテナから textarea を探す
  const container = toolbar.closest(".js-comment-field-container")
    ?? toolbar.closest(".comment-form-head")?.parentElement
    ?? toolbar.parentElement;
  return container?.querySelector<HTMLTextAreaElement>(
    "textarea.js-comment-field, textarea[name='comment[body]'], textarea[name='pull_request_review[body]']",
  ) ?? null;
}

function injectButton(toolbar: Element): void {
  if (toolbar.querySelector(`.${BUTTON_CLASS}`)) return;

  const textarea = findTextarea(toolbar);
  if (!textarea) return;

  const btn = createCatButton();
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    togglePicker(btn, textarea);
  });

  toolbar.appendChild(btn);
}

function processToolbars(): void {
  document.querySelectorAll("markdown-toolbar").forEach(injectButton);
}

// ピッカー外クリックで閉じる
document.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  if (!target.closest(`.${PICKER_CLASS}`) && !target.closest(`.${BUTTON_CLASS}`)) {
    document.querySelectorAll(`.${PICKER_CLASS}`).forEach((el) => el.remove());
  }
});

// 初回実行
processToolbars();

// 動的 DOM 変更に対応
const observer = new MutationObserver(() => {
  processToolbars();
});
observer.observe(document.body, { childList: true, subtree: true });
