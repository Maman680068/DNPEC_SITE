export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

export type ChatApiRequest = {
  messages: { role: ChatRole; content: string }[];
  locale: "fr" | "en";
};

export type ChatApiResponse = {
  content: string;
  mode: "demo" | "claude";
};
