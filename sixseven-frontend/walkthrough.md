# SixSeven App - Recent Updates Walkthrough

## 1. Sidebar UI Refinement
The chat sidebar has been completely redesigned to match the app's minimalist, dark-themed aesthetic with "Peach" (`#FFE0C2`) accents.

### Key Changes:
- **New Chat Button**: Now uses the app's primary accent color (`#FFE0C2`) with black text, consistent with other primary actions.
- **Clean Layout**: Removed gradients and unnecessary visual noise. The background is a deep dark gray (`#0F0F0F`) to distinguish it from the main chat area.
- **Active State**: The currently selected conversation is highlighted with a subtle peach tint and accent-colored text.
- **User Profile**: Added a "My Profile" section at the bottom for quick access.
- **Interaction**: Tapping a conversation loads it instantly. Tapping "New Chat" resets the view.

## 2. Chat Backend & AI Titles
The backend now fully supports conversation persistence and AI-generated titles.

### Features:
- **Conversation Storage**: All messages are saved to the database via Prisma.
- **AI Titles**: When a new conversation starts, the backend uses `gemini-2.5-flash` to generate a concise (4-5 words) title based on the first message.
- **Usage Tracking**: Token usage is tracked per user, enforcing the daily limit.

## 3. Authentication
- **Email OTP**: Fully implemented with a custom UI in the bottom sheet.
- **Google Sign-In**: Optimized for Android Expo Go by forcing the web-based flow (`WebBrowser`), ensuring it works without native development builds during testing.

## 4. Deployment & Verification

### Critical Step: Vercel Environment Variable
**You MUST add the `GEMINI_API_KEY` to your Vercel project settings for the chat to work in production.**

1.  Go to Vercel Dashboard > Project > Settings > Environment Variables.
2.  Add `GEMINI_API_KEY` with your API key.
3.  Redeploy the latest commit.

### How to Test:
1.  **Sidebar**: Open the chat, click the chat bubble icon. Verify the sidebar opens smoothly.
2.  **New Chat**: Click "New Chat". Verify the chat resets.
3.  **Send Message**: Send a message. Verify:
    -   AI responds.
    -   Sidebar updates with a new conversation.
    -   Title is auto-generated (might take a second refresh or be instant).
4.  **Conversation Options**: Long-press a conversation in the sidebar. Verify:
    -   A custom bottom sheet opens (matching app theme).
    -   **Rename**: Opens a dialog to change the title.
    -   **Archive**: Conversation disappears from the list.
    -   **Delete**: Conversation is permanently removed.
5.  **Load History**: Click a previous conversation. Verify messages load correctly.
6.  **Profile**: Click "My Profile" in the sidebar. Verify navigation.

## Next Steps
-   **Test on Device**: Run `npx expo start` and test on your physical device.
-   **Monitor Usage**: Check the database to ensure `UsageLog` entries are being created.
