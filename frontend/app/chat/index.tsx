// app/screens/ChatScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { SvgXml } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { UnfoldMoreIcon, ArrowUp02Icon } from '@hugeicons/core-free-icons';
import * as Haptics from 'expo-haptics';

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
  const [suggestions] = useState(suggestionsDefault);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('1x');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const suggestionKey = useMemo(() => Math.random().toString(36).slice(2, 8), []);

  // suggestion show animation
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [suggestionKey]);

  // load user avatar and model
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Get user data from API
        const token = await AsyncStorage.getItem('token');
        if (token) {
          try {
            const response = await fetch(`${process.env.BACKEND_URL}/api/user/me`, {
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
        }

        const onboardingData = await AsyncStorage.getItem('onboarding');
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
  }, []);

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

    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Yo bestie! Here's your text in Gen Alpha speak: "${userMessage.text}" but make it ✨ sigma rizz fr fr no cap 🔥💯`,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setLoading(false);
    }, 1200);
  };

  const onSuggestionPress = (value: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setInputText(value);
  };

  const toggleModelDropdown = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      LayoutAnimation.configureNext({
        duration: 300,
        create: {
          type: LayoutAnimation.Types.spring,
          property: LayoutAnimation.Properties.scaleXY,
          springDamping: 0.7,
        },
        update: {
          type: LayoutAnimation.Types.spring,
          springDamping: 0.7,
        },
        delete: {
          type: LayoutAnimation.Types.spring,
          property: LayoutAnimation.Properties.scaleXY,
          springDamping: 0.7,
        },
      });
    } else {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setShowModelDropdown(!showModelDropdown);
  };

  const selectModel = (model: string) => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setSelectedModel(model);
    setShowModelDropdown(false);
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
                <ActionButton />
                <CreditButton />
              </View>

              <View style={styles.rightSection}>
                <TouchableOpacity style={styles.searchButton} accessibilityLabel="Search">
                  <Image source={require('../../assets/icon/search-icon.png')} style={{ height: '100%', aspectRatio: 1 }} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.avatarButton}
                  onPress={() => router.push('/subscription' as any)}
                >
                  {userAvatar ? (
                    <Image source={{ uri: userAvatar }} style={{ width: 50, height: 50, borderRadius: 25 }} />
                  ) : (
                    <Ionicons name="person-circle" size={50} color="#FFE0C2" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/chat-sixsevenlogo.png')}
                style={styles.logo}
                resizeMode="cover"
              />
            </View>
          </View>

          {/* SECOND CONTAINER */}
          <View style={styles.secondContainer}>
            {/* Suggested prompts */}
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

            {/* Input Section */}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
              <View style={styles.inputSection}>
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
                />
              </View>
            </KeyboardAvoidingView>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

/* ---------- Internal components (in-file) ---------- */

function ActionButton() {
  return (
    <TouchableOpacity activeOpacity={0.85} accessibilityLabel="Add" style={{ height: 50, width: 60, borderRadius: 25, overflow: 'hidden' }}>
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

function CreditButton() {
  return (
    <TouchableOpacity activeOpacity={0.85} accessibilityLabel="Credits" style={{ height: 50, borderRadius: 25, overflow: 'hidden' }}>
      <LinearGradient
        colors={['#FFFFFF', '#FFE0C2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ flex: 1, padding: 1 }}
      >
        <View
          style={{ flex: 1, backgroundColor: '#FFE0C2', borderRadius: 24, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 6, gap: 12 }}
        >
          <Image source={require('../../assets/images/crediticon.png')} style={styles.coinIcon} />
          <Text style={styles.creditText}>24</Text>
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
}) {
  return (
    <View style={styles.inputInner}>
      <View style={styles.topContainer}>
        <TextInput
          style={styles.inputField}
          placeholder="Let's do 67"
          placeholderTextColor="#B4B4B4"
          value={value}
          onChangeText={onChangeText}
          multiline
          maxLength={500}
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
            <BlurView
              intensity={Platform.OS === 'ios' ? 20 : 50}
              tint={Platform.OS === 'ios' ? 'dark' : 'default'}
              style={styles.dropdownBackdrop}
            />
          </TouchableWithoutFeedback>
          <View style={styles.modelDropdown}>
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
          </View>
        </>
      )}
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
    justifyContent: 'space-between',
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

  coinIcon: {
    width: 30,
    height: 30,
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
    width: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
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

  /* SECOND CONTAINER */
  secondContainer: {
    gap: 125,
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

  inputInner: {
    width: '100%',
    backgroundColor: '#222222',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#21201C',
    padding: 16,
    gap: 38,
  },

  inputField: {
    flex: 1,
    fontSize: 18,
    color: '#B4B4B4',
    minHeight: 50,
    fontFamily: 'SpaceGrotesk_400Regular',
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
    shadowOpacity: Platform.OS === 'ios' ? 0.15 : 0.25,
    shadowRadius: Platform.OS === 'ios' ? 24 : 8,
    elevation: Platform.OS === 'ios' ? 0 : 8,
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
});
