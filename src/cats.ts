export interface CatImage {
  file: string;
  alt: string;
}

export const CAT_IMAGES: CatImage[] = [
  { file: "01.png", alt: "LGTM" },
  { file: "02.png", alt: "コードがきれい！" },
  { file: "03.png", alt: "Hello World" },
  { file: "04.png", alt: "さすがです" },
  { file: "05.png", alt: "進捗どうですか" },
  { file: "06.png", alt: "進捗ダメです" },
  { file: "07.png", alt: "定時あがり" },
  { file: "08.png", alt: "VR帰宅" },
  { file: "09.png", alt: "仕事はやい" },
  { file: "10.png", alt: "元気出して" },
  { file: "11.png", alt: "神" },
  { file: "12.png", alt: "すごい" },
  { file: "13.png", alt: "ありがとうございます" },
  { file: "14.png", alt: "いつも助かります" },
  { file: "15.png", alt: "了解です" },
  { file: "16.png", alt: "おねがいします" },
  { file: "17.png", alt: "やるしかない" },
  { file: "18.png", alt: "おすしどぞ" },
  { file: "19.png", alt: "寝るまでが今日" },
  { file: "20.png", alt: "優勝した" },
  { file: "21.png", alt: "泣" },
  { file: "22.png", alt: "ハート" },
  { file: "23.png", alt: "オワタ" },
  { file: "24.png", alt: "もしかして" },
  { file: "25.png", alt: "ちえんで遅れます" },
  { file: "26.png", alt: "自宅作業します" },
  { file: "27.png", alt: "仕様です" },
  { file: "28.png", alt: "今話しかけても大丈夫かな…" },
  { file: "29.png", alt: "おつかれさま" },
  { file: "30.png", alt: "やすもう" },
  { file: "31.png", alt: "おやすみ" },
  { file: "32.png", alt: "みのむし" },
  { file: "33.png", alt: "いいね" },
  { file: "34.png", alt: "サク飲みしよう" },
  { file: "35.png", alt: "リリースしました" },
  { file: "36.png", alt: "なるほどわからん" },
  { file: "37.png", alt: "良いエンジニア紹介して" },
  { file: "38.png", alt: "あ、良いエンジニア" },
  { file: "39.png", alt: "年棒5億" },
  { file: "40.png", alt: "それでは、良いエンジニアライフを。" },
];

/**
 * GitHub raw URL のベースパス。
 * リポジトリに push 後、ここを実際の URL に差し替える。
 */
export const GITHUB_RAW_BASE_URL =
  "https://raw.githubusercontent.com/komtaki/lgtm/main/public/cats";

export function getGitHubRawUrl(file: string): string {
  return `${GITHUB_RAW_BASE_URL}/${file}`;
}

export function getLocalPreviewUrl(file: string): string {
  return chrome.runtime.getURL(`cats/${file}`);
}
