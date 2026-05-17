import { create } from 'zustand';

export const useChatStore = create((set) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  unreadCounts: {},

  setActiveConversation: (id) => set({ activeConversationId: id }),
  
  setConversations: (conversations) => set({ conversations }),
  
  appendMessage: (userId, message) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [userId]: [...(state.messages[userId] || []), message],
      },
    }));
  },

  prependMessages: (userId, newMessages) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [userId]: [...newMessages, ...(state.messages[userId] || [])],
      },
    }));
  },

  setMessages: (userId, messages) => {
    set((state) => ({
      messages: { ...state.messages, [userId]: messages },
    }));
  },

  markConversationRead: (userId) => {
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [userId]: 0 },
      conversations: state.conversations.map((c) =>
        c.user_id === userId ? { ...c, unread_count: 0 } : c
      ),
    }));
  },

  setUnreadCount: (userId, count) => {
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [userId]: count },
    }));
  },

  updateConversationLastMessage: (userId, message) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.user_id === userId ? { ...c, last_message: message, updated_at: new Date().toISOString() } : c
      ),
    }));
  },

  addConversation: (conversation) => {
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    }));
  },
}));

export default useChatStore;
