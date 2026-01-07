# Lia Chat Assistant - Interface Design

## Design Philosophy
This mobile app follows **Apple Human Interface Guidelines (HIG)** to feel like a native iOS app. The design prioritizes **one-handed usage** in **portrait orientation (9:16)** with intuitive gestures and clear visual hierarchy.

## Screen List

### 1. Chat Screen (Main/Home)
**Primary Content:**
- Scrollable message list showing conversation history
- Message bubbles (user messages on right, AI responses on left)
- Input field with send button at bottom
- Floating action button for new chat

**Functionality:**
- Send text messages to AI assistant
- View AI responses with typing indicator
- Scroll through conversation history
- Start new conversations
- Access tools/plugins menu

### 2. Tools Screen (Tab)
**Primary Content:**
- Grid/list of available tools and plugins
- Tool cards with icons and descriptions
- Search bar for finding specific tools

**Functionality:**
- Browse available tools (image generation, web search, calculations, etc.)
- Tap tool to activate/integrate into chat
- Search and filter tools
- View tool descriptions and capabilities

### 3. Settings Screen (Tab)
**Primary Content:**
- User preferences
- Theme toggle (light/dark)
- Chat history management
- About section

**Functionality:**
- Toggle dark/light mode
- Clear chat history
- Manage app preferences
- View app information

## Key User Flows

### Flow 1: Send Message to AI
1. User opens app → Chat Screen displayed
2. User taps input field → Keyboard appears
3. User types message → Text appears in input
4. User taps send button → Message sent to AI
5. Typing indicator shows → AI processes
6. AI response appears → Message bubble animates in

### Flow 2: Use Tool/Plugin
1. User taps Tools tab → Tools Screen displayed
2. User browses/searches tools → Tool cards shown
3. User taps tool card → Tool activated
4. User returns to Chat → Tool integrated in chat
5. User sends message with tool → AI uses tool in response

### Flow 3: Start New Chat
1. User on Chat Screen → Sees current conversation
2. User taps floating "+" button → New chat confirmation
3. User confirms → New empty chat created
4. User can start fresh conversation → Previous chat saved

## Color Choices

**Brand Colors:**
- **Primary:** `#7C3AED` (Purple) - Modern, AI-focused, energetic
- **Secondary:** `#EC4899` (Pink) - Accent for highlights and active states
- **Background (Light):** `#FFFFFF` - Clean, minimal
- **Background (Dark):** `#0F0F0F` - Deep black for OLED
- **Surface (Light):** `#F5F5F7` - Apple-style gray
- **Surface (Dark):** `#1C1C1E` - Elevated surfaces
- **Text (Light):** `#000000` - High contrast
- **Text (Dark):** `#FFFFFF` - High contrast
- **Muted (Light):** `#8E8E93` - Secondary text
- **Muted (Dark):** `#AEAEB2` - Secondary text

## Layout Patterns

### Message Bubbles
- User messages: Right-aligned, primary color background
- AI messages: Left-aligned, surface color background
- Max width: 80% of screen
- Rounded corners: 18px
- Padding: 12px horizontal, 10px vertical

### Input Area
- Fixed at bottom with safe area insets
- Background: Surface color
- Border: Subtle top border
- Height: Auto-expanding up to 5 lines
- Send button: Circle with primary color

### Tab Bar
- 3 tabs: Chat, Tools, Settings
- Icons: SF Symbols style
- Active tint: Primary color
- Height: 56px + safe area bottom

## Typography
- **Headings:** SF Pro Display, Bold, 28-34pt
- **Body:** SF Pro Text, Regular, 17pt
- **Message Text:** SF Pro Text, Regular, 16pt
- **Captions:** SF Pro Text, Regular, 13pt

## Interactions
- **Message Send:** Scale animation (0.97) + light haptic
- **Tool Selection:** Opacity (0.7) + medium haptic
- **Tab Switch:** Opacity (0.6) + light haptic
- **New Chat:** Scale + success haptic

## Native Features
- Haptic feedback for all interactions
- Dark mode support (automatic)
- Keyboard avoidance
- Safe area handling
- Pull-to-refresh on chat history
