import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getVertexAI, getGenerativeModel } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-vertexai.js";

const firebaseConfig = {
  apiKey: "AIzaSyBIWyG1LQVhjXatvsDYPQipirowklMB5Q8",
  authDomain: "sexcapades-8adb4.firebaseapp.com",
  projectId: "sexcapades-8adb4",
  storageBucket: "sexcapades-8adb4.firebasestorage.app",
  messagingSenderId: "275514100407",
  appId: "1:275514100407:web:4a9adf9532b2abc93c5b32",
  measurementId: "G-HHF1Z8NEZZ"
};

try {
  const app = initializeApp(firebaseConfig);
  const vertexAI = getVertexAI(app);
  const geminiModel = getGenerativeModel(vertexAI, { model: "gemini-1.5-flash" });

  window.SexcapadesGemini = {
    app: app,
    model: geminiModel,
    generateText: async function (prompt) {
      if (!prompt) return "";
      const result = await geminiModel.generateContent(prompt);
      return result.response.text();
    }
  };
  console.log("[Sexcapades] Firebase AI (Gemini) initialized successfully.");
} catch (err) {
  console.error("[Sexcapades] Failed to initialize Firebase AI:", err);
}
