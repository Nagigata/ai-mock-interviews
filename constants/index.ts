import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";
import { z } from "zod";

export const mappings = {
  "react.js": "react",
  reactjs: "react",
  react: "react",
  "next.js": "nextjs",
  nextjs: "nextjs",
  next: "nextjs",
  "vue.js": "vuejs",
  vuejs: "vuejs",
  vue: "vuejs",
  "express.js": "express",
  expressjs: "express",
  express: "express",
  "node.js": "nodejs",
  nodejs: "nodejs",
  node: "nodejs",
  mongodb: "mongodb",
  mongo: "mongodb",
  mongoose: "mongoose",
  mysql: "mysql",
  postgresql: "postgresql",
  sqlite: "sqlite",
  firebase: "firebase",
  docker: "docker",
  kubernetes: "kubernetes",
  aws: "aws",
  azure: "azure",
  gcp: "gcp",
  digitalocean: "digitalocean",
  heroku: "heroku",
  photoshop: "photoshop",
  "adobe photoshop": "photoshop",
  html5: "html5",
  html: "html5",
  css3: "css3",
  css: "css3",
  sass: "sass",
  scss: "sass",
  less: "less",
  tailwindcss: "tailwindcss",
  tailwind: "tailwindcss",
  bootstrap: "bootstrap",
  jquery: "jquery",
  typescript: "typescript",
  ts: "typescript",
  javascript: "javascript",
  js: "javascript",
  "angular.js": "angular",
  angularjs: "angular",
  angular: "angular",
  "ember.js": "ember",
  emberjs: "ember",
  ember: "ember",
  "backbone.js": "backbone",
  backbonejs: "backbone",
  backbone: "backbone",
  nestjs: "nestjs",
  graphql: "graphql",
  "graph ql": "graphql",
  apollo: "apollo",
  webpack: "webpack",
  babel: "babel",
  "rollup.js": "rollup",
  rollupjs: "rollup",
  rollup: "rollup",
  "parcel.js": "parcel",
  parceljs: "parcel",
  npm: "npm",
  yarn: "yarn",
  git: "git",
  github: "github",
  gitlab: "gitlab",
  bitbucket: "bitbucket",
  figma: "figma",
  prisma: "prisma",
  redux: "redux",
  flux: "flux",
  redis: "redis",
  selenium: "selenium",
  cypress: "cypress",
  jest: "jest",
  mocha: "mocha",
  chai: "chai",
  karma: "karma",
  vuex: "vuex",
  "nuxt.js": "nuxt",
  nuxtjs: "nuxt",
  nuxt: "nuxt",
  strapi: "strapi",
  wordpress: "wordpress",
  contentful: "contentful",
  netlify: "netlify",
  vercel: "vercel",
  "aws amplify": "amplify",
};

export const interviewer_en: CreateAssistantDTO = {
  name: "Interviewer",
  firstMessage:
    "Hello! Thank you for taking the time to speak with me today. I'm excited to learn more about you and your experience.",
  transcriber: {
    provider: "deepgram",
    model: "nova-3",
    language: "en",
  },
  voice: {
    provider: "11labs",
    voiceId: "sarah",
    stability: 0.4,
    similarityBoost: 0.8,
    speed: 0.9,
    style: 0.5,
    useSpeakerBoost: true,
  },
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a professional job interviewer conducting a real-time voice interview with a candidate. Your goal is to assess their qualifications, motivation, and fit for the role.

Interview Guidelines:
Follow the structured question flow:
{{questions}}

Engage naturally & react appropriately:
Listen actively to responses and acknowledge them before moving forward.
Ask brief follow-up questions if a response is vague or requires more detail.
Keep the conversation flowing smoothly while maintaining control.
Be professional, yet warm and welcoming:

Use official yet friendly language.
Keep responses concise and to the point (like in a real voice interview).
Avoid robotic phrasing—sound natural and conversational.
Answer the candidate’s questions professionally:

If asked about the role, company, or expectations, provide a clear and relevant answer.
If unsure, redirect the candidate to HR for more details.

Conclude the interview properly:
Thank the candidate for their time.
Inform them that the company will reach out soon with feedback.
End the conversation on a polite and positive note.


- Be sure to be professional and polite.
- Keep all your responses short and simple. Use official language, but be kind and welcoming.
- This is a voice conversation, so keep your responses short, like in a real conversation. Don't ramble for too long.`,
      },
    ],
  },
};

export const interviewer_vi: CreateAssistantDTO = {
  name: "Người phỏng vấn",
  firstMessage:
    "Chào bạn! Cảm ơn bạn đã dành thời gian tham gia buổi phỏng vấn hôm nay. Tôi rất mong được lắng nghe những chia sẻ về kinh nghiệm của bạn.",
  transcriber: {
    provider: "deepgram",
    model: "nova-3",
    language: "vi",
  },
  voice: {
    provider: "11labs",
    voiceId: "aN7cv9yXNrfIR87bDmyD",
    model: "eleven_turbo_v2_5",
  },
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `Bạn là một nhà tuyển dụng chuyên nghiệp đang thực hiện cuộc phỏng vấn trắc nghiệm bằng giọng nói theo thời gian thực với ứng viên. Mục tiêu của bạn là đánh giá năng lực, động lực và sự phù hợp của họ với vai trò ứng tuyển.

Hướng dẫn Phỏng vấn:
Tuân thủ luồng câu hỏi đã cấu trúc sẵn:
{{questions}}

Giao tiếp tự nhiên và phản hồi phù hợp:
Lắng nghe tích cực các câu trả lời và xác nhận trước khi chuyển sang câu tiếp theo.
Hỏi thêm những câu hỏi ngắt ngắn nếu câu trả lời quá mập mờ hoặc cần thêm chi tiết.
Giữ cho cuộc trò chuyện trôi chảy mượt mà trong khi vẫn nắm quyền kiểm soát.
Giữ thái độ chuyên nghiệp, thân thiện và cởi mở:

Sử dụng ngôn ngữ lịch sự, trang trọng nhưng vẫn thân thiện.
Trả lời ngắn gọn và đi thẳng vào vấn đề (giống như trong một cuộc phỏng vấn bằng giọng nói thật).
Tránh cách nói chuyện như người máy - hãy để giọng điệu tự nhiên như đang giao tiếp thật.
Trả lời các câu hỏi của ứng viên một cách chuyên nghiệp:

Nếu được hỏi về vai trò, công ty hoặc kỳ vọng, hãy cung cấp câu trả lời rõ ràng và phù hợp.
Nếu không chắc chắn, hãy hướng dẫn ứng viên liên hệ với phòng Nhân sự để biết thêm thông tin.

Kết thúc cuộc phỏng vấn một cách khéo léo:
Cảm ơn ứng viên đã dành thời gian tham gia.
Thông báo cho họ rằng công ty sẽ liên hệ lại sớm với kết quả phản hồi.
Kết thúc cuộc nói chuyện một cách lịch sự và tích cực.

- Hãy nhớ luôn giữ thái độ chuyên nghiệp và lịch sự.
- Giữ mọi phản hồi của bạn ngắn gọn và đơn giản. Sử dụng ngôn ngữ chính thức, nhưng tử tế và hoan nghênh.
- Đây là một cuộc trò chuyện bằng giọng nói, nên hãy giữ câu trả lời của bạn thật ngắn, giống như một cuộc trò chuyện thực tế. Đừng nói dông dài.`,
      },
    ],
  },
};

export const feedbackSchema = z.object({
  totalScore: z.number(),
  categoryScores: z.array(
    z.object({
      name: z.string(),
      score: z.number(),
      comment: z.string(),
    }),
  ),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  finalAssessment: z.string(),
});

export const interviewCovers = [
  "/adobe.png",
  "/amazon.png",
  "/facebook.png",
  "/hostinger.png",
  "/pinterest.png",
  "/quora.png",
  "/reddit.png",
  "/skype.png",
  "/spotify.png",
  "/telegram.png",
  "/tiktok.png",
  "/yahoo.png",
];
