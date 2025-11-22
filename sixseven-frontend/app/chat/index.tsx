// Constants
const DAILY_CREDIT_LIMIT = 20000;
import React, { useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Image,
  ImageBackground,
  LayoutAnimation,
  UIManager,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Animated,
  Easing,
  Keyboard,
  ActionSheetIOS,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { SvgXml } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image as ExpoImage } from 'expo-image';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { UnfoldMoreIcon, ArrowUp02Icon } from '@hugeicons/core-free-icons';
import * as Haptics from 'expo-haptics';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  // enable LayoutAnimation on Android
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const OUTER_WIDTH = Math.round(SCREEN_WIDTH * 0.9);

const chatIconSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14.1706 20.8905C18.3536 20.6125 21.6856 17.2332 21.9598 12.9909C22.0134 12.1607 22.0134 11.3009 21.9598 10.4707C21.6856 6.22838 18.3536 2.84913 14.1706 2.57107C12.7435 2.47621 11.2536 2.47641 9.8294 2.57107C5.64639 2.84913 2.31441 6.22838 2.04024 10.4707C1.98659 11.3009 1.98659 12.1607 2.04024 12.9909C2.1401 14.536 2.82343 15.9666 3.62791 17.1746C4.09501 18.0203 3.78674 19.0758 3.30021 19.9978C2.94941 20.6626 2.77401 20.995 2.91484 21.2351C3.05568 21.4752 3.37026 21.4829 3.99943 21.4982C5.24367 21.5285 6.08268 21.1757 6.74868 20.6846C7.1264 20.4061 7.31527 20.2668 7.44544 20.2508C7.5756 20.2348 7.83177 20.3403 8.34401 20.5513C8.8044 20.7409 9.33896 20.8579 9.8294 20.8905C11.2536 20.9852 12.7435 20.9854 14.1706 20.8905Z" stroke="#FFE0C2" stroke-width="1.5" stroke-linejoin="round"/>
<path d="M9.16 10.292C8.85067 10.292 8.59733 10.4147 8.4 10.66C8.208 10.9 8.088 11.26 8.04 11.74C8.17867 11.58 8.336 11.468 8.512 11.404C8.688 11.3347 8.88267 11.3 9.096 11.3C9.36267 11.3 9.6 11.356 9.808 11.468C10.0213 11.58 10.1867 11.7373 10.304 11.94C10.4213 12.1373 10.48 12.3587 10.48 12.604C10.48 12.908 10.408 13.1827 10.264 13.428C10.1253 13.668 9.92 13.86 9.648 14.004C9.38133 14.1427 9.064 14.212 8.696 14.212C8.14667 14.212 7.72533 14.0413 7.432 13.7C7.144 13.3533 7 12.876 7 12.268C7 11.724 7.09067 11.244 7.272 10.828C7.45867 10.4067 7.72 10.0813 8.056 9.852C8.39733 9.61733 8.79467 9.5 9.248 9.5C9.65867 9.5 9.99467 9.596 10.256 9.788C10.5227 9.97467 10.6747 10.2227 10.712 10.532L10.72 10.62C10.72 10.7587 10.6747 10.868 10.584 10.948C10.4987 11.0227 10.376 11.06 10.216 11.06C10.0987 11.06 10.0027 11.0307 9.928 10.972C9.85867 10.908 9.79733 10.8013 9.744 10.652C9.70133 10.54 9.62933 10.452 9.528 10.388C9.432 10.324 9.30933 10.292 9.16 10.292ZM8.856 12.1C8.62667 12.1 8.448 12.164 8.32 12.292C8.192 12.42 8.128 12.5907 8.128 12.804C8.128 12.996 8.18133 13.148 8.288 13.26C8.39467 13.372 8.544 13.428 8.736 13.428C8.94933 13.428 9.12 13.3613 9.248 13.228C9.38133 13.0893 9.448 12.9107 9.448 12.692C9.448 12.5107 9.39467 12.3667 9.288 12.26C9.18133 12.1533 9.03733 12.1 8.856 12.1Z" fill="#FFE0C2"/>
<path d="M16.8933 9.516C16.9786 9.516 17.048 9.556 17.1013 9.636C17.16 9.71067 17.1893 9.82533 17.1893 9.98C17.1893 10.124 17.16 10.2333 17.1013 10.308C17.0426 10.3773 16.968 10.4413 16.8773 10.5C16.792 10.5587 16.7306 10.6013 16.6933 10.628C16.128 11.0173 15.7333 11.4627 15.5093 11.964C15.2906 12.4653 15.1573 13.0013 15.1093 13.572C15.088 13.796 15.0266 13.9587 14.9253 14.06C14.8293 14.1613 14.7066 14.212 14.5573 14.212C14.408 14.212 14.2826 14.1613 14.1813 14.06C14.08 13.9533 14.0293 13.7693 14.0293 13.508C14.0293 13.204 14.0853 12.8707 14.1973 12.508C14.3146 12.14 14.4986 11.7747 14.7493 11.412C15.0053 11.0493 15.328 10.7267 15.7173 10.444L13.7493 10.476C13.6373 10.476 13.552 10.4387 13.4933 10.364C13.4346 10.2893 13.4053 10.196 13.4053 10.084C13.4053 9.94533 13.448 9.82267 13.5333 9.716C13.624 9.604 13.744 9.548 13.8933 9.548C14.1546 9.548 14.536 9.56667 15.0373 9.604C15.1386 9.60933 15.3253 9.62 15.5973 9.636C15.8693 9.652 16.0826 9.66 16.2373 9.66C16.3066 9.66 16.408 9.636 16.5413 9.588C16.568 9.58267 16.6186 9.56933 16.6933 9.548C16.7733 9.52667 16.84 9.516 16.8933 9.516Z" fill="#FFE0C2"/>
</svg>`;

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  image?: string; // Add image property
};

type Conversation = {
  id: string;
  title: string;
  lastMessage?: string;
  updatedAt: string;
  isArchived?: boolean;
};

const suggestionsDefault = [
  "What's trending with Gen Alpha today?",
  "Translate my text to Gen Alpha slang",
  "How do I sound more Alpha?",
];

// Model images loaded once for performance
const modelImages = {
  '1x': require('../../assets/images/models/1x.png'),
  '2x': require('../../assets/images/models/2x.png'),
  '3x': require('../../assets/images/models/3x.png'),
  '4x': require('../../assets/images/models/4x.png'),
};

export default function ChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [suggestions] = useState(suggestionsDefault);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('1x');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [hasChatStarted, setHasChatStarted] = useState(false);
  const [isDropdownAnimating, setIsDropdownAnimating] = useState(false);
  const [credits, setCredits] = useState(DAILY_CREDIT_LIMIT);
  const [maxCredits, setMaxCredits] = useState(DAILY_CREDIT_LIMIT);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [sidebarTranslateX] = useState(new Animated.Value(-300));
  const sidebarOpacity = sidebarTranslateX.interpolate({
    inputRange: [-300, 0],
    outputRange: [0, 1],
  });

  // Rename Modal State
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [conversationToRename, setConversationToRename] = useState<Conversation | null>(null);
  const [renameText, setRenameText] = useState('');
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const suggestionKey = useMemo(() => Math.random().toString(36).slice(2, 8), []);
  const flatListRef = useRef<ScrollView>(null); // Ref for scrolling messages

  // Function to fetch credits from API
  const fetchCredits = async () => {
    try {
      const token = await SecureStore.getItemAsync('session_token');
      if (token) {
        const BACKEND = Constants.expoConfig?.extra?.BACKEND_URL ?? 'http://localhost:3000';
        const response = await fetch(`${BACKEND}/api/user/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const userData = await response.json();
          console.log('Fetched user data:', userData); // Debug log
          console.log('dailyTokenCount:', userData.dailyTokenCount); // Debug log
          if (userData.dailyTokenCount !== undefined) {
            const calculatedCredits = Math.max(0, DAILY_CREDIT_LIMIT - userData.dailyTokenCount);
            console.log('Calculated credits:', calculatedCredits); // Debug log
            setCredits(calculatedCredits); // Ensure credits never go negative
            setMaxCredits(DAILY_CREDIT_LIMIT);
          }
        } else {
          console.error('Failed to fetch user data:', response.status, response.statusText);
        }
      } else {
        console.error('No session token found');
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  // Sync filteredConversations with conversations
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredConversations(conversations);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      setFilteredConversations(
        conversations.filter(c =>
          (c.title && c.title.toLowerCase().includes(lowerQuery)) ||
          (c.lastMessage && c.lastMessage.toLowerCase().includes(lowerQuery))
        )
      );
    }
  }, [conversations, searchQuery]);

  // Dropdown animation values
  const dropdownScale = useRef(new Animated.Value(0.8)).current;
  const dropdownOpacity = useRef(new Animated.Value(0)).current;
  const dropdownTranslateY = useRef(new Animated.Value(-10)).current;

  // Keyboard event listeners
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        LayoutAnimation.configureNext(LayoutAnimation.create(
          300,
          LayoutAnimation.Types.easeInEaseOut,
          LayoutAnimation.Properties.opacity
        ));
        setIsKeyboardVisible(true);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        LayoutAnimation.configureNext(LayoutAnimation.create(
          300,
          LayoutAnimation.Types.easeInEaseOut,
          LayoutAnimation.Properties.opacity
        ));
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // suggestion show animation
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [suggestionKey]);

  // load user avatar and model
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Get user data from API
        const token = await SecureStore.getItemAsync('session_token');
        if (token) {
          try {
            const BACKEND = Constants.expoConfig?.extra?.BACKEND_URL ?? 'http://localhost:3000';
            const response = await fetch(`${BACKEND}/api/user/me`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              const userData = await response.json();
              if (userData.picture) {
                setUserAvatar(userData.picture);
                // Update AsyncStorage with fresh data
                const existingUserData = await AsyncStorage.getItem('user');
                const userObj = existingUserData ? JSON.parse(existingUserData) : {};
                userObj.photo = userData.picture;
                userObj.name = userData.name;
                await AsyncStorage.setItem('user', JSON.stringify(userObj));
              }
              // Credits are now handled by fetchCredits function
            }
          } catch (apiError) {
            console.error('Error fetching user data from API:', apiError);
            // Fall back to AsyncStorage
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
              const user = JSON.parse(userData);
              if (user.photo) {
                setUserAvatar(user.photo);
              }
            }
          }
        } else {
          // No token, fall back to AsyncStorage
          const userData = await AsyncStorage.getItem('user');
          if (userData) {
            const user = JSON.parse(userData);
            if (user.photo) {
              setUserAvatar(user.photo);
            }
          }
        } const onboardingData = await AsyncStorage.getItem('onboarding');
        if (onboardingData) {
          const onboarding = JSON.parse(onboardingData);
          if (onboarding.alphaLevel) {
            setSelectedModel(onboarding.alphaLevel);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadUserData();
    fetchCredits(); // Fetch credits on component mount
  }, []);

  // Fetch credits periodically and after chat operations
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCredits();
    }, 30000); // Fetch credits every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Filter conversations based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter(conv =>
        conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConversations(filtered);
    }
  }, [conversations, searchQuery]);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const token = await SecureStore.getItemAsync('session_token');
      const BACKEND = Constants.expoConfig?.extra?.BACKEND_URL ?? 'http://localhost:3000';

      const response = await fetch(`${BACKEND}/api/conversations`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
        // Also fetch fresh credits when conversations are loaded
        fetchCredits();
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const deleteConversation = async (id: string) => {
    // Optimistic update
    const prevConversations = [...conversations];
    setConversations(prev => prev.filter(c => c.id !== id));

    try {
      const token = await SecureStore.getItemAsync('session_token');
      const BACKEND = Constants.expoConfig?.extra?.BACKEND_URL ?? 'http://localhost:3000';
      const response = await fetch(`${BACKEND}/api/conversations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      // If current conversation was deleted, reset
      if (conversationId === id) {
        createNewChat();
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      setConversations(prevConversations); // Revert
      Alert.alert('Error', 'Failed to delete conversation');
    }
  };

  const renameConversation = async (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;

    // Optimistic update
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
    setRenameModalVisible(false);

    try {
      const token = await SecureStore.getItemAsync('session_token');
      const BACKEND = Constants.expoConfig?.extra?.BACKEND_URL ?? 'http://localhost:3000';
      await fetch(`${BACKEND}/api/conversations/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle }),
      });
    } catch (error) {
      console.error('Rename error:', error);
      fetchConversations(); // Revert on error
    }
  };

  const archiveConversation = async (id: string) => {
    // Optimistic update (remove from list)
    setConversations(prev => prev.map(c => c.id === id ? { ...c, isArchived: true } : c));

    try {
      const token = await SecureStore.getItemAsync('session_token');
      const BACKEND = Constants.expoConfig?.extra?.BACKEND_URL ?? 'http://localhost:3000';
      await fetch(`${BACKEND}/api/conversations/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isArchived: true }),
      });
    } catch (error) {
      console.error('Archive error:', error);
      fetchConversations(); // Revert on error
    }
  };

  const unarchiveConversation = async (id: string) => {
    // Optimistic update
    setConversations(prev => prev.map(c => c.id === id ? { ...c, isArchived: false } : c));

    try {
      const token = await SecureStore.getItemAsync('session_token');
      const BACKEND = Constants.expoConfig?.extra?.BACKEND_URL ?? 'http://localhost:3000';
      await fetch(`${BACKEND}/api/conversations/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isArchived: false }),
      });
    } catch (error) {
      console.error('Unarchive error:', error);
      fetchConversations(); // Revert on error
    }
  };

  const handleLongPress = (conversation: Conversation) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedConversation(conversation);
    setOptionsModalVisible(true);
  };

  // Load a specific conversation
  const loadConversation = async (convId: string) => {
    try {
      const token = await SecureStore.getItemAsync('session_token');
      const BACKEND = Constants.expoConfig?.extra?.BACKEND_URL ?? 'http://localhost:3000';

      const response = await fetch(`${BACKEND}/api/conversations/${convId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const conversation = data.conversation;

        // Load messages
        if (conversation.messages && conversation.messages.length > 0) {
          const loadedMessages: Message[] = conversation.messages.map((msg: any) => ({
            id: msg.id || Date.now().toString(),
            text: msg.content || msg.text,
            isUser: msg.role === 'user',
            timestamp: new Date(msg.createdAt || Date.now()),
            image: msg.image, // Load image
          }));

          setMessages(loadedMessages);
          setConversationId(convId);
          setHasChatStarted(true);
        } else {
          // Empty conversation, start fresh
          setMessages([]);
          setConversationId(convId);
          setHasChatStarted(false);
        }
      } else {
        console.error('Failed to load conversation:', response.status);
        // Fallback to new chat
        createNewChat();
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      // Fallback to new chat
      createNewChat();
    }
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    if (showSidebar) {
      // Close
      Animated.timing(sidebarTranslateX, {
        toValue: -300,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start(() => setShowSidebar(false));
    } else {
      // Open
      setShowSidebar(true);
      fetchConversations();
      Animated.timing(sidebarTranslateX, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() && !selectedImage || loading) return;

    if (credits <= 0) {
      alert("You're out of credits for today! Come back tomorrow!");
      return;
    }

    if (!hasChatStarted) {
      setHasChatStarted(true);
    }

    // Store image before clearing state
    const imageToSend = selectedImage;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
      image: imageToSend ? `data:image/jpeg;base64,${imageToSend}` : undefined,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setSelectedImage(null);
    setLoading(true);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const token = await SecureStore.getItemAsync('session_token');
      const BACKEND = Constants.expoConfig?.extra?.BACKEND_URL ?? 'http://localhost:3000';

      const response = await fetch(`${BACKEND}/api/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: userMessage.text,
          image: imageToSend,
          model: selectedModel,
          conversationId: conversationId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.text,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);

      if (data.credits !== undefined) {
        setCredits(Math.max(0, data.credits)); // Ensure credits never go negative
      }
      if (data.maxCredits !== undefined) {
        setMaxCredits(data.maxCredits);
      }

      // Refresh credits from server to ensure accuracy
      setTimeout(() => fetchCredits(), 1000);

      // Store conversation ID for subsequent messages
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
        // Refresh conversations list to show the new conversation
        fetchConversations();
      }
    } catch (error) {
      console.error('Chat Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Yo, my bad. Something glitched. Try again?",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const onSuggestionPress = (value: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setInputText(value);
  };

  const toggleModelDropdown = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Prevent multiple animations
    if (isDropdownAnimating) return;

    setIsDropdownAnimating(true);

    if (showModelDropdown) {
      // Closing animation - smooth fade out and scale down
      Animated.parallel([
        Animated.timing(dropdownScale, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(dropdownOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(dropdownTranslateY, {
          toValue: -10,
          duration: 150,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
      ]).start(() => {
        setShowModelDropdown(false);
        setIsDropdownAnimating(false);
        // Reset animation values after animation cleanup
        requestAnimationFrame(() => {
          dropdownScale.setValue(0.8);
          dropdownOpacity.setValue(0);
          dropdownTranslateY.setValue(-10);
        });
      });
    } else {
      // Opening animation - ensure starting values are correct
      dropdownScale.setValue(0.8);
      dropdownOpacity.setValue(0);
      dropdownTranslateY.setValue(-10);

      setShowModelDropdown(true);
      Animated.parallel([
        Animated.timing(dropdownScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.5)), // Bouncy easing
        }),
        Animated.timing(dropdownOpacity, {
          toValue: 1,
          duration: 300, // Match scale duration for consistency
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(dropdownTranslateY, {
          toValue: 0,
          duration: 300, // Match scale duration for consistency
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.2)), // Bouncy easing
        }),
      ]).start(() => {
        setIsDropdownAnimating(false);
      });
    }
  };

  const selectModel = (model: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setSelectedModel(model);
    setShowModelDropdown(false);
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].base64 || null);
    }
  };

  const createNewChat = () => {
    setConversationId(null);
    setMessages([]);
    setHasChatStarted(false);
    setInputText('');
    setSelectedImage(null); // Clear selected image
    // Close sidebar if open
    if (showSidebar) {
      toggleSidebar();
    }
  };

  const onSubmitEditing = (_e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
    handleSend();
  };

  return (
    <ImageBackground
      source={require('../../assets/images/chatscreenbg.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <View style={styles.mainContainer}>
          {/* FIRST CONTAINER */}
          <View style={styles.firstContainer}>
            {/* Top Bar: left controls & right controls */}
            <View style={styles.topBar}>
              <View style={styles.leftSection}>
                <ActionButton onPress={createNewChat} />
                <CreditButton credits={credits} maxCredits={maxCredits} />
              </View>

              <View style={styles.rightSection}>
                <TouchableOpacity style={styles.searchButton} accessibilityLabel="Conversations" onPress={toggleSidebar}>
                  <Ionicons name="chatbubbles-outline" size={24} color="#FFE0C2" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.avatarButton}
                  onPress={() => router.push('/profile' as any)}
                >
                  {userAvatar ? (
                    <Image source={{ uri: userAvatar }} style={styles.avatarImage} />
                  ) : (
                    <Ionicons name="person-circle" size={50} color="#FFE0C2" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Logo */}
            {!hasChatStarted && !isKeyboardVisible && (
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../assets/images/chat-sixsevenlogo.png')}
                  style={styles.logo}
                  resizeMode="cover"
                />
              </View>
            )}
          </View>

          {/* Spacer for unstarted state */}
          {!hasChatStarted && <View style={{ flex: 1 }} />}

          {/* MESSAGES CONTAINER */}
          {hasChatStarted && (
            <View style={styles.messagesContainer}>
              <ScrollView
                ref={flatListRef}
                style={styles.messagesScrollView}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              >
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </ScrollView>
            </View>
          )}

          {/* SECOND CONTAINER */}
          <View style={styles.secondContainer}>
            {/* Suggested prompts */}
            {!hasChatStarted && !isKeyboardVisible && (
              <ScrollView
                style={styles.suggestedPromptsSection}
                contentContainerStyle={{ paddingBottom: 8 }}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              >
                {suggestions.map((s, i) => (
                  <SuggestionBox key={`${i}-${s}`} text={s} onPress={() => onSuggestionPress(s)} />
                ))}
              </ScrollView>
            )}

            {/* Input Section */}
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
              style={{ width: '100%' }}
            >
              <View style={styles.inputContainer}>
                {selectedImage && (
                  <View style={styles.imagePreviewContainer}>
                    <ExpoImage
                      source={{ uri: `data:image/jpeg;base64,${selectedImage}` }}
                      style={styles.imagePreview}
                      contentFit="cover"
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => setSelectedImage(null)}
                    >
                      <Ionicons name="close-circle" size={24} color="#FF4444" />
                    </TouchableOpacity>
                  </View>
                )}
                <View style={styles.inputRow}>
                  <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
                    <View style={styles.imageButtonInner}>
                      <Ionicons name="image-outline" size={24} color="#000" />
                    </View>
                  </TouchableOpacity>
                  <ChatInput
                    value={inputText}
                    onChangeText={setInputText}
                    onSubmitEditing={onSubmitEditing}
                    loading={loading}
                    selectedModel={selectedModel}
                    onToggleModelDropdown={toggleModelDropdown}
                    showModelDropdown={showModelDropdown}
                    onSelectModel={selectModel}
                    onCloseDropdown={() => setShowModelDropdown(false)}
                    dropdownOpacity={dropdownOpacity}
                    dropdownScale={dropdownScale}
                    dropdownTranslateY={dropdownTranslateY}
                  />
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </View>

        {/* Sidebar */}
        {showSidebar && (
          <>
            <TouchableWithoutFeedback onPress={toggleSidebar}>
              <Animated.View style={[styles.sidebarOverlay, { opacity: sidebarOpacity }]} />
            </TouchableWithoutFeedback>
            <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarTranslateX }] }]}>
              {/* Sidebar Header */}
              <View style={styles.sidebarHeader}>
                {showArchived ? (
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setShowArchived(false)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="arrow-back" size={22} color="#FFE0C2" />
                    <Text style={styles.headerTitle}>Archived Chats</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <View style={styles.sidebarBranding}>
                      <Image
                        source={require('../../assets/images/splashlogo.png')}
                        style={styles.brandingLogo}
                      />
                    </View>
                    <TouchableOpacity
                      style={styles.newChatButton}
                      onPress={createNewChat}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="sparkles" size={18} color="#FFE0C2" />
                      <Text style={styles.newChatText}>New Chat</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>

              {/* Section Title */}
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>{showArchived ? 'Archived' : 'Chats'}</Text>
                {!showArchived && conversations.filter(c => !c.isArchived).length > 0 && (
                  <Text style={styles.sectionCount}>{conversations.filter(c => !c.isArchived).length}</Text>
                )}
              </View>

              <ScrollView style={styles.conversationList}>
                {filteredConversations.filter(c => showArchived ? c.isArchived : !c.isArchived).length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>
                      {showArchived ? 'No archived chats' : 'No conversations yet'}
                    </Text>
                  </View>
                ) : (
                  filteredConversations
                    .filter(c => showArchived ? c.isArchived : !c.isArchived)
                    .map((conv) => (
                      <TouchableOpacity
                        key={conv.id}
                        style={[
                          styles.conversationItem,
                          conversationId === conv.id && styles.conversationItemActive
                        ]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          loadConversation(conv.id);
                          toggleSidebar();
                        }}
                        onLongPress={() => handleLongPress(conv)}
                      >
                        <Text style={[
                          styles.conversationTitle,
                          conversationId === conv.id && styles.conversationTitleActive
                        ]} numberOfLines={1}>
                          {conv.title || 'New Conversation'}
                        </Text>
                      </TouchableOpacity>
                    ))
                )}
              </ScrollView>
              {/* User Profile Section */}
              <View style={styles.sidebarFooter}>
                {!showArchived && (
                  <TouchableOpacity
                    style={styles.archivedButton}
                    onPress={() => setShowArchived(true)}
                  >
                    <Ionicons name="archive-outline" size={20} color="#666" />
                    <Text style={styles.archivedText}>Archived Chats</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.userProfileItem} onPress={() => router.push('/profile' as any)}>
                  <View style={styles.userAvatarSmall}>
                    {userAvatar ? (
                      <Image source={{ uri: userAvatar }} style={styles.avatarImageSmall} />
                    ) : (
                      <Ionicons name="person" size={16} color="#FFF" />
                    )}
                  </View>
                  <Text style={styles.userNameText}>My Profile</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </>
        )}

        {/* Rename Modal */}
        <Modal
          visible={renameModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setRenameModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Rename Chat</Text>
              <TextInput
                style={styles.modalInput}
                value={renameText}
                onChangeText={setRenameText}
                placeholder="Enter new name"
                placeholderTextColor="#666"
                autoFocus={true}
                maxLength={50}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => setRenameModalVisible(false)}
                >
                  <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm]}
                  onPress={() => {
                    if (conversationToRename) {
                      renameConversation(conversationToRename.id, renameText);
                    }
                  }}
                >
                  <Text style={styles.modalButtonTextConfirm}>Rename</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Options Modal (Bottom Sheet) */}
        <Modal
          visible={optionsModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setOptionsModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setOptionsModalVisible(false)}
          >
            <View style={styles.bottomSheet}>
              <View style={styles.bottomSheetHandle} />
              <Text style={styles.bottomSheetTitle} numberOfLines={1}>
                {selectedConversation?.title || 'Options'}
              </Text>

              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => {
                  setOptionsModalVisible(false);
                  if (selectedConversation) {
                    setConversationToRename(selectedConversation);
                    setRenameText(selectedConversation.title || '');
                    setTimeout(() => setRenameModalVisible(true), 100); // Delay to allow modal close
                  }
                }}
              >
                <Ionicons name="pencil-outline" size={24} color="#FFF" />
                <Text style={styles.optionText}>Rename</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => {
                  setOptionsModalVisible(false);
                  if (selectedConversation) {
                    if (selectedConversation.isArchived) {
                      unarchiveConversation(selectedConversation.id);
                    } else {
                      archiveConversation(selectedConversation.id);
                    }
                  }
                }}
              >
                <Ionicons
                  name={selectedConversation?.isArchived ? "refresh-outline" : "archive-outline"}
                  size={24}
                  color="#FFF"
                />
                <Text style={styles.optionText}>
                  {selectedConversation?.isArchived ? "Unarchive" : "Archive"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => {
                  setOptionsModalVisible(false);
                  if (selectedConversation) {
                    Alert.alert(
                      'Delete Chat',
                      'Are you sure you want to delete this chat?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => deleteConversation(selectedConversation.id) },
                      ]
                    );
                  }
                }}
              >
                <Ionicons name="trash-outline" size={24} color="#FF453A" />
                <Text style={[styles.optionText, { color: '#FF453A' }]}>Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.optionItem, styles.cancelOption]}
                onPress={() => setOptionsModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
}

/* ---------- Internal components (in-file) ---------- */

function MessageBubble({ message }: { message: Message }) {
  // Debug logging
  if (message.image) {
    console.log('MessageBubble - Image URI:', message.image?.substring(0, 80));
    console.log('MessageBubble - Is base64:', message.image?.startsWith('data:'));
    console.log('MessageBubble - Is URL:', message.image?.startsWith('http'));
  }

  return (
    <View style={[styles.messageBubble, message.isUser ? styles.userMessage : styles.aiMessage]}>
      {message.image && (
        <Image
          source={{ uri: message.image }}
          style={styles.messageImage}
          resizeMode="cover"
          onError={(error) => {
            console.log('Image load error:', error.nativeEvent.error);
            console.log('Failed URI:', message.image?.substring(0, 100));
          }}
          onLoad={() => console.log('Image loaded successfully:', message.image?.substring(0, 50))}
        />
      )}
      {message.text && (
        <Text style={[styles.messageText, message.isUser ? styles.userText : styles.aiText]}>
          {message.text}
        </Text>
      )}
    </View>
  );
}

/* ---------- Internal components (in-file) ---------- */

function ActionButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.85} accessibilityLabel="New Chat" style={{ height: 50, width: 60, borderRadius: 25, overflow: 'hidden' }} onPress={onPress}>
      <LinearGradient
        colors={['#2E2E2E', '#2A2A2A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ flex: 1, padding: 1 }}
      >
        <View style={{ flex: 1, backgroundColor: '#2A2A2A', borderRadius: 24, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="add" size={28} color="#FFE0C2" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function CreditButton({ credits = 0, maxCredits: maxCreditsProp }: { credits?: number; maxCredits?: number }) {
  const maxCredits = maxCreditsProp || DAILY_CREDIT_LIMIT;
  const usedCredits = Math.max(0, maxCredits - credits); // Ensure usedCredits never goes negative
  const progress = Math.min(1, Math.max(0, usedCredits / maxCredits)); // Clamp progress between 0 and 1
  const circumference = 2 * Math.PI * 14; // radius = 14
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <TouchableOpacity activeOpacity={0.85} accessibilityLabel="Credits" style={{ height: 50, borderRadius: 25, overflow: 'hidden' }}>
      <LinearGradient
        colors={['#FFFFFF', '#FFE0C2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ flex: 1, padding: 1 }}
      >
        <View
          style={{ flex: 1, backgroundColor: '#FFE0C2', borderRadius: 24, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 6, gap: 8 }}
        >
          {/* Circular Progress */}
          <View style={{ width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }}>
            <SvgXml
              xml={`
                <svg width="32" height="32" viewBox="0 0 32 32">
                  <!-- Background circle -->
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    stroke="rgba(0, 0, 0, 0.1)"
                    strokeWidth="3"
                    fill="none"
                  />
                  <!-- Progress circle -->
                  <circle
                    cx="16"
                    cy="16"
                    r="14"
                    stroke="#000"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray="${circumference}"
                    strokeDashoffset="${strokeDashoffset}"
                    strokeLinecap="round"
                    transform="rotate(-90 16 16)"
                  />
                </svg>
              `}
              width={32}
              height={32}
            />
          </View>

          <Text style={styles.creditText}>{credits}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function SuggestionBox({ text, onPress }: { text: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.suggestionBox} onPress={onPress} activeOpacity={0.85}>
      {/* Inner shadow overlay with blur */}
      <View style={styles.innerShadowOverlay} pointerEvents="none">
        <BlurView intensity={10} style={styles.innerShadowBlur}>
          <LinearGradient
            colors={['rgba(70, 70, 70, 0.4)', 'transparent', 'transparent', 'rgba(70, 70, 70, 0.3)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.innerShadowGradient}
          />
        </BlurView>
      </View>
      <SvgXml xml={chatIconSvg} width={24} height={24} />
      <Text style={styles.suggestionText}>{text}</Text>
    </TouchableOpacity>
  );
}

function ChatInput({
  value,
  onChangeText,
  onSubmitEditing,
  loading,
  selectedModel,
  onToggleModelDropdown,
  showModelDropdown,
  onSelectModel,
  onCloseDropdown,
  dropdownOpacity,
  dropdownScale,
  dropdownTranslateY,
}: {
  value: string;
  onChangeText: (v: string) => void;
  onSubmitEditing: (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => void;
  loading: boolean;
  selectedModel: string;
  onToggleModelDropdown: () => void;
  showModelDropdown: boolean;
  onSelectModel: (model: string) => void;
  onCloseDropdown: () => void;
  dropdownOpacity: Animated.Value;
  dropdownScale: Animated.Value;
  dropdownTranslateY: Animated.Value;
}) {
  return (
    <View style={styles.inputWrapper}>
      <View style={styles.inputInner}>
        <View style={styles.topContainer}>
          <TextInput
            style={styles.inputField}
            placeholder="Let's do 67"
            placeholderTextColor="#B4B4B4"
            value={value}
            onChangeText={onChangeText}
            multiline
            maxLength={2000}
            returnKeyType="send"
            onSubmitEditing={onSubmitEditing}
            selectionColor="#ffe1c249"
            cursorColor='#FFE0C2'
          />
        </View>
        <View style={styles.bottomContainer}>
          <View style={styles.leftContainer}>
            <TouchableOpacity style={styles.modelSelector} activeOpacity={0.8} onPress={onToggleModelDropdown}>
              <Image source={modelImages[selectedModel as keyof typeof modelImages]} style={styles.modelImage} />
              <HugeiconsIcon
                icon={UnfoldMoreIcon}
                size={18}
                color="#B4B4B4"
                strokeWidth={1.5}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.rightContainer}>
            <TouchableOpacity
              style={styles.sendButton}
              onPress={onSubmitEditing as any}
              activeOpacity={0.85}
              accessibilityLabel="Send"
            >
              {loading ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <View style={styles.sendInner}>
                  <HugeiconsIcon
                    icon={ArrowUp02Icon}
                    size={26}
                    color="#000"
                    strokeWidth={2.0}
                  />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
        {showModelDropdown && (
          <>
            <TouchableWithoutFeedback onPress={onCloseDropdown}>
              <View style={styles.dropdownBackdrop} />
            </TouchableWithoutFeedback>
            <Animated.View style={[styles.modelDropdown, {
              opacity: dropdownOpacity,
              transform: [
                { scale: dropdownScale },
                { translateY: dropdownTranslateY },
              ],
            }]}>
              {['1x', '2x', '3x', '4x'].map((model) => (
                <TouchableOpacity
                  key={model}
                  style={[
                    styles.modelOption,
                    selectedModel === model && styles.modelOptionSelected,
                  ]}
                  onPress={() => onSelectModel(model)}
                  activeOpacity={Platform.OS === 'ios' ? 0.7 : 0.8}
                >
                  <Image
                    source={modelImages[model as keyof typeof modelImages]}
                    style={[
                      styles.modelOptionImage,
                      selectedModel === model && styles.modelOptionImageSelected
                    ]}
                  />
                  <Text style={[
                    styles.modelOptionText,
                    selectedModel === model && styles.modelOptionTextSelected
                  ]}>Alpha {model}</Text>
                </TouchableOpacity>
              ))}
            </Animated.View>
          </>
        )}
      </View>
    </View>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
  },

  // Main container (90% width)
  mainContainer: {
    width: OUTER_WIDTH,
    height: '100%',
    flexDirection: 'column',
  },

  /* FIRST CONTAINER */
  firstContainer: {
    gap: 50, // spacing between top bar and logo
  },

  topBar: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  leftSection: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },

  creditText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#081A1B',
    // optional: fontFamily: 'SpaceGrotesk_700Bold',
  },

  rightSection: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },

  searchButton: {
    height: 50,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarButton: {
    height: 50,
    aspectRatio: 1,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },

  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 160,
    height: 160,
    borderRadius: 36,
  },

  /* MESSAGES CONTAINER */
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },

  messagesScrollView: {
    flex: 1,
  },

  messagesContent: {
    paddingVertical: 16,
    gap: 12,
  },

  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#1A1A1A', // Fallback background
  },

  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#FFE0C2',
  },

  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#2A2A2A',
  },

  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },

  userText: {
    color: '#000000',
  },

  aiText: {
    color: '#FFE0C2',
  },

  /* SECOND CONTAINER */
  secondContainer: {
    gap: 20, // Adjusted gap to accommodate image preview
    width: '100%',
    paddingBottom: 20,
  },

  suggestedPromptsSection: {
    gap: 12,
  },

  suggestionBox: {
    textDecorationColor: 'FFE0C2',
    backgroundColor: '#141414',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#404040',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 12,
    overflow: 'hidden',
    // Remove outer shadow - inner shadows need overlay approach
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  innerShadowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    overflow: 'hidden',
  },
  innerShadowBlur: {
    flex: 1,
    borderRadius: 12,
  },
  innerShadowGradient: {
    flex: 1,
    borderRadius: 12,
  },
  suggestionText: {
    fontSize: 16,
    color: '#FFE0C2',
    flex: 1,
    // fontFamily: 'SpaceGrotesk_400Regular',
  },

  inputSection: {
    width: '100%',
  },

  inputContainer: {
    width: '100%',
    backgroundColor: '#222222',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#21201C',
  },

  imagePreviewContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    position: 'relative',
    alignSelf: 'flex-start',
  },

  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFE0C2',
    backgroundColor: '#1A1A1A',
  },

  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#000',
    borderRadius: 16,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },

  imageButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  imageButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFE0C2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFE0C2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  inputInner: {
    width: '100%',
    gap: 38,
  },

  inputField: {
    fontSize: 18,
    color: '#B4B4B4',
    maxHeight: 160,
    fontFamily: 'SpaceGrotesk_400Regular',
    flex: 1,
  },

  inputWrapper: {
    flex: 1,
  },

  topContainer: {
    width: '100%',
  },

  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  leftContainer: {
    flex: 1,
    position: 'relative',
  },

  rightContainer: {
    marginLeft: 12,
  },

  modelSelector: {
    backgroundColor: '#313130',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4C4C4B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  modelSelectorText: {
    color: '#B4B4B4',
    fontSize: 14,
  },

  modelImage: {
    width: 24,
    height: 24,
  },

  modelDropdown: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    width: 140,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(42, 42, 42, 0.95)' : '#2A2A2A',
    borderRadius: Platform.OS === 'ios' ? 16 : 12,
    borderWidth: Platform.OS === 'ios' ? 0 : 1,
    borderColor: '#404040',
    marginBottom: 8,
    paddingVertical: 8,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 8 } : { width: 0, height: -2 },
    shadowOpacity: Platform.OS === 'ios' ? 0.3 : 0.1,
    shadowRadius: Platform.OS === 'ios' ? 16 : 4,
    elevation: Platform.OS === 'ios' ? 0 : 4,
  },

  modelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderRadius: 10,
    minHeight: Platform.OS === 'ios' ? 40 : 36,
    marginHorizontal: 4,
    marginVertical: 1,
  },

  modelOptionSelected: {
    backgroundColor: '#FFE0C2',
    shadowColor: '#FFE0C2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  modelOptionImage: {
    width: 18,
    height: 18,
  },

  modelOptionImageSelected: {
    tintColor: '#000000',
  },

  modelOptionText: {
    color: '#B4B4B4',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },

  modelOptionTextSelected: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  dropdownBackdrop: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },

  sendButton: {
    marginLeft: 8,
    backgroundColor: '#FFE0C2',
    borderRadius: 22,
    height: 44,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Sidebar styles
  sidebarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 300,
    backgroundColor: '#0A0A0A',
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    borderRightWidth: 1,
    borderRightColor: '#1F1F1F',
    zIndex: 1000,
    elevation: 10,
  },
  sidebarBranding: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  brandingLogo: {
    width: 50,
    height: 50,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  newChatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 224, 194, 0.15)',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 224, 194, 0.2)',
  },
  newChatText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFE0C2',
    fontFamily: 'Outfit_600SemiBold',
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666',
    fontFamily: 'Outfit_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  sectionCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#444',
    fontFamily: 'Outfit_600SemiBold',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  conversationList: {
    flex: 1,
    paddingHorizontal: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    opacity: 0.5,
  },
  emptyStateText: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
  },
  conversationItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 10,
    marginBottom: 4,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  conversationItemActive: {
    backgroundColor: 'rgba(255, 224, 194, 0.06)',
    borderLeftColor: '#FFE0C2',
    borderWidth: 1,
    borderColor: 'rgba(255, 224, 194, 0.15)',
  },
  conversationTitle: {
    fontSize: 14,
    color: '#AAA',
    fontFamily: 'Outfit_400Regular',
    letterSpacing: 0.3,
  },
  conversationTitleActive: {
    color: '#FFE0C2',
    fontWeight: '600',
    fontFamily: 'Outfit_600SemiBold',
  },
  sidebarFooter: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
    backgroundColor: '#0A0A0A',
  },
  userProfileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#111',
  },
  archivedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    marginHorizontal: 4,
    backgroundColor: '#111',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  archivedText: {
    fontSize: 14,
    color: '#AAA',
    fontWeight: '500',
    fontFamily: 'Outfit_500Medium',
    letterSpacing: 0.2,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
    fontFamily: 'Outfit_600SemiBold',
    letterSpacing: 0.3,
  },
  userAvatarSmall: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#2A2A2A',
  },
  avatarImageSmall: {
    width: '100%',
    height: '100%',
  },
  userNameText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
    fontFamily: 'Outfit_600SemiBold',
    letterSpacing: 0.2,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 16,
    fontFamily: 'Outfit_600SemiBold',
  },
  modalInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 16,
    marginBottom: 24,
    fontFamily: 'Outfit_400Regular',
    borderWidth: 1,
    borderColor: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  modalButtonCancel: {
    backgroundColor: 'transparent',
  },
  modalButtonConfirm: {
    backgroundColor: '#FFE0C2',
  },
  modalButtonTextCancel: {
    color: '#AAA',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Outfit_500Medium',
  },
  modalButtonTextConfirm: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Outfit_600SemiBold',
  },
  // Bottom Sheet Styles
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 50 : 24,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  bottomSheetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Outfit_600SemiBold',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  optionText: {
    fontSize: 17,
    color: '#FFF',
    fontWeight: '500',
    fontFamily: 'Outfit_500Medium',
  },
  cancelOption: {
    borderBottomWidth: 0,
    justifyContent: 'center',
    marginTop: 8,
  },
  cancelText: {
    fontSize: 17,
    color: '#666',
    fontWeight: '600',
    fontFamily: 'Outfit_600SemiBold',
  },
});
