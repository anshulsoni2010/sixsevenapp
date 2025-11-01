import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hey fam! Ready to translate your texts to Gen Alpha? Just send me your message or a screenshot! 🔥',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  // Verify subscription on mount - redirect to paywall if not subscribed
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await SecureStore.getItemAsync('session_token');
        if (!token) {
          if (mounted) router.replace('/onboarding' as any);
          return;
        }

        const BACKEND = Constants.expoConfig?.extra?.BACKEND_URL ?? 'http://localhost:3000';
        const response = await fetch(`${BACKEND}/api/user/me`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          if (!data.subscribed && mounted) {
            // Not subscribed - redirect to paywall
            router.replace('/paywall' as any);
          }
        } else {
          // Error checking status - redirect to onboarding
          if (mounted) router.replace('/onboarding' as any);
        }
      } catch (e) {
        console.error('Error verifying subscription:', e);
        if (mounted) router.replace('/paywall' as any);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router]);

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      // TODO: Implement actual API call for Gen Alpha translation
      const token = await SecureStore.getItemAsync('session_token');
      const BACKEND = Constants.expoConfig?.extra?.BACKEND_URL ?? 'http://localhost:3000';

      // Simulate AI response for now
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `Yo bestie! Here's your text in Gen Alpha speak: "${userMessage.text}" but make it ✨ sigma rizz fr fr no cap 🔥💯`,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setLoading(false);
      }, 1500);

    } catch (error) {
      console.error('Send message error:', error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('session_token');
      await AsyncStorage.removeItem('isLoggedIn');
      router.replace('/onboarding' as any);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <LinearGradient
      colors={['#1a1a1a', '#0a0a0a']}
      style={styles.container}
    >
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Gen Alpha Chat</Text>
            <Text style={styles.headerSubtitle}>Talk the Alpha, Walk the Alpha</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageRow,
                message.isUser ? styles.messageRowUser : styles.messageRowBot,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  message.isUser ? styles.messageBubbleUser : styles.messageBubbleBot,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.isUser ? styles.messageTextUser : styles.messageTextBot,
                  ]}
                >
                  {message.text}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    message.isUser ? styles.messageTimeUser : styles.messageTimeBot,
                  ]}
                >
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              </View>
            </View>
          ))}

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#6366f1" />
              <Text style={styles.loadingText}>Translating...</Text>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Type your message..."
                placeholderTextColor="#6b7280"
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
                onPress={handleSend}
                disabled={!inputText.trim() || loading}
              >
                <LinearGradient
                  colors={inputText.trim() && !loading ? ['#6366f1', '#4f46e5'] : ['#374151', '#1f2937']}
                  style={styles.sendGradient}
                >
                  <Text style={styles.sendButtonText}>Send</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
    fontFamily: 'Outfit_400Regular',
    marginTop: 2,
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 14,
    color: '#ef4444',
    fontFamily: 'Outfit_600SemiBold',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 10,
  },
  messageRow: {
    marginBottom: 16,
  },
  messageRowUser: {
    alignItems: 'flex-end',
  },
  messageRowBot: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
  },
  messageBubbleUser: {
    backgroundColor: '#6366f1',
    borderBottomRightRadius: 4,
  },
  messageBubbleBot: {
    backgroundColor: '#1f1f1f',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: 'Outfit_400Regular',
  },
  messageTextUser: {
    color: '#ffffff',
  },
  messageTextBot: {
    color: '#e5e7eb',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    fontFamily: 'Outfit_400Regular',
  },
  messageTimeUser: {
    color: '#c7d2fe',
  },
  messageTimeBot: {
    color: '#6b7280',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#9ca3af',
    fontFamily: 'Outfit_400Regular',
  },
  inputContainer: {
    padding: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  inputWrapper: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#ffffff',
    fontFamily: 'Outfit_400Regular',
    maxHeight: 100,
  },
  sendButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  sendButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'SpaceGrotesk_700Bold',
  },
});
