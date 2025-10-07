# cheap-gpt.xyz
Cheap-GPT is a modern, minimal, and elegant web app designed to make AI chat more affordable by optimizing token usage through intelligent language translation.

🌍 Overview

Cheap-GPT acts as a lightweight ChatGPT-style interface powered by the OpenAI API.
It allows users to interact with different OpenAI models in a clean, responsive chat environment.

The key feature:
When the "Cheap" mode is enabled, user messages are automatically translated into Traditional Chinese before being sent to the model, and then translated back to the user’s original language upon response.
Since Traditional Chinese often uses fewer tokens, this approach can reduce API costs while keeping the same conversational meaning.

🚀 Features
⚙️ API Key Input — Enter your OpenAI API key (hidden behind asterisks for privacy).
💬 Chat Interface — Real-time, bubble-style conversation UI similar to ChatGPT.
🔄 Model Selector — Choose from various OpenAI models (configurable).
💡 Normal / Cheap Mode Switch — Toggle between standard chat and token-saving mode.
🌐 Automatic Translation — Detects the user’s language and translates as needed.
🧹 Stateless Design — Messages are not stored after a page refresh for privacy.
🎨 Modern UI — Clean, responsive design built with modern front-end tech.

🧠 How It Works
The user enters a message in any language.
If Cheap Mode is active:
The system detects the language.
Translates the text to Traditional Chinese.
Sends it to the OpenAI API.
Translates the AI’s response back to the user’s original language.
If Normal Mode is active, no translation occurs.

This process reduces token usage and helps you chat smarter for less.
