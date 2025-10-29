import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated';
import { SvgXml } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const OUTER_WIDTH = Math.round(SCREEN_WIDTH * 0.9);

const SP = { xs: 8, sm: 16, md: 24, lg: 32, xl: 48 };

const leftArrowSvg = `
<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.5 16.6L7.06664 11.1667C6.42497 10.525 6.42497 9.475 7.06664 8.83334L12.5 3.4" stroke="white" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const maleGenderSvg = `
<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="50" height="50" rx="12" fill="#222222"/>
<g filter="url(#filter0_i_37_86)">
<path d="M28.3333 31.0001L33.288 32.4904C35.1379 33.0565 36.5121 34.5404 36.9684 36.3467C37.1487 37.0609 36.5319 37.6668 35.7915 37.6668H14.2085C13.4681 37.6668 12.8513 37.0609 13.0317 36.3467C13.4879 34.5404 14.8621 33.0565 16.712 32.4904L21.6667 31.0001V28.4164C19.2922 26.558 17.6667 24.3332 17.6667 19.5556C17.6667 14.7692 20.273 12.3332 24.3231 12.3332C27.1911 12.3332 28.3847 13.6666 28.3847 13.6666C31.7692 13.6666 32.3333 16.4628 32.3333 19.5556C32.3333 24.3332 30.7077 26.558 28.3333 28.4164V31.0001Z" fill="#FFE0C2"/>
</g>
<path d="M28.3333 31.0001L33.288 32.4904C35.1379 33.0565 36.5121 34.5404 36.9684 36.3467C37.1487 37.0609 36.5319 37.6668 35.7915 37.6668H14.2085C13.4681 37.6668 12.8513 37.0609 13.0317 36.3467C13.4879 34.5404 14.8621 33.0565 16.712 32.4904L21.6667 31.0001V28.4164C19.2922 26.558 17.6667 24.3332 17.6667 19.5556C17.6667 14.7692 20.273 12.3332 24.3231 12.3332C27.1911 12.3332 28.3847 13.6666 28.3847 13.6666C31.7692 13.6666 32.3333 16.4628 32.3333 19.5556C32.3333 24.3332 30.7077 26.558 28.3333 28.4164V31.0001Z" stroke="#FFE1C2" stroke-width="1.5" stroke-linejoin="round"/>
<defs>
<filter id="filter0_i_37_86" x="12.246" y="11.5832" width="25.5081" height="30.8336" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_37_86"/>
</filter>
</defs>
</svg>
`;

const femaleGenderSvg = `
<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="50" height="50" rx="12" fill="#222222"/>
<g filter="url(#filter0_i_39_87)">
<path d="M28.3333 31L33.288 32.4903C35.1379 33.0564 36.5121 34.5404 36.9684 36.3465C37.1487 37.0608 36.5319 37.6667 35.7915 37.6667H14.2085C13.4681 37.6667 12.8513 37.0608 13.0317 36.3465C13.4879 34.5404 14.8621 33.0564 16.712 32.4903L21.6667 31V28.1267C19.9536 27.9096 18.3739 27.5293 17 27.0215C17.6667 25.7096 18.3333 23.7417 18.3333 19.1502C18.3333 11.2789 25.6667 11.2788 27.6667 13.9023C31.6667 13.2467 31.6667 16.5264 31.6667 20.4621C31.6667 23.6105 32.5556 26.1469 33 27.0215C31.6261 27.5293 30.0464 27.9096 28.3333 28.1267V31Z" fill="#FFE0C2"/>
</g>
<path d="M28.3333 31L33.288 32.4903C35.1379 33.0564 36.5121 34.5404 36.9684 36.3465C37.1487 37.0608 36.5319 37.6667 35.7915 37.6667H14.2085C13.4681 37.6667 12.8513 37.0608 13.0317 36.3465C13.4879 34.5404 14.8621 33.0564 16.712 32.4903L21.6667 31V28.1267C19.9536 27.9096 18.3739 27.5293 17 27.0215C17.6667 25.7096 18.3333 23.7417 18.3333 19.1502C18.3333 11.2789 25.6667 11.2788 27.6667 13.9023C31.6667 13.2467 31.6667 16.5264 31.6667 20.4621C31.6667 23.6105 32.5556 26.1469 33 27.0215C31.6261 27.5293 30.0464 27.9096 28.3333 28.1267V31Z" stroke="#FFE0C2" stroke-width="1.5" stroke-linejoin="round"/>
<defs>
<filter id="filter0_i_39_87" x="12.246" y="11.5833" width="25.5081" height="30.8333" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_39_87"/>
</filter>
</defs>
</svg>
`;

const otherGenderSvg = `
<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="50" height="50" rx="12" fill="#222222"/>
<g filter="url(#filter0_i_39_95)">
<path d="M35.8201 13H32.1775C31.8649 13 31.5652 13.1242 31.3442 13.3452C31.1232 13.5662 30.999 13.866 30.999 14.1786C30.999 14.4911 31.1232 14.7909 31.3442 15.0119C31.5652 15.2329 31.8649 15.3571 32.1775 15.3571H32.9751L29.7841 18.5483C28.4008 17.5198 26.723 16.9643 24.9993 16.9643C23.2756 16.9643 21.5978 17.5198 20.2146 18.5483L19.8091 18.1428L21.226 16.7264C21.3354 16.6169 21.4223 16.487 21.4815 16.3439C21.5407 16.2009 21.5712 16.0476 21.5712 15.8928C21.5712 15.738 21.5407 15.5847 21.4815 15.4417C21.4223 15.2987 21.3354 15.1687 21.226 15.0593C21.1165 14.9498 20.9866 14.863 20.8435 14.8037C20.7005 14.7445 20.5472 14.714 20.3924 14.714C20.0798 14.714 19.78 14.8382 19.5589 15.0593L18.1426 16.4762L17.0235 15.3571H17.8212C18.1337 15.3571 18.4335 15.2329 18.6545 15.0119C18.8755 14.7909 18.9997 14.4911 18.9997 14.1786C18.9997 13.866 18.8755 13.5662 18.6545 13.3452C18.4335 13.1242 18.1337 13 17.8212 13H14.1785C13.8659 13 13.5662 13.1242 13.3452 13.3452C13.1242 13.5662 13 13.866 13 14.1786V17.8214C13 18.1339 13.1242 18.4337 13.3452 18.6547C13.5662 18.8758 13.8659 18.9999 14.1785 18.9999C14.4911 18.9999 14.7908 18.8758 15.0118 18.6547C15.2328 18.4337 15.357 18.1339 15.357 17.8214V17.0237L16.4761 18.1428L15.0608 19.5581C14.949 19.667 14.8599 19.7971 14.7988 19.9407C14.7376 20.0843 14.7056 20.2386 14.7046 20.3946C14.7036 20.5507 14.7335 20.7054 14.7928 20.8498C14.852 20.9942 14.9394 21.1254 15.0497 21.2358C15.1601 21.3461 15.2913 21.4335 15.4357 21.4927C15.58 21.552 15.7348 21.582 15.8908 21.5809C16.0469 21.5799 16.2012 21.5479 16.3448 21.4867C16.4884 21.4256 16.6184 21.3365 16.7273 21.2247L18.1426 19.8094L18.5481 20.2149C17.5178 21.5973 16.9622 23.2758 16.9641 24.9999C16.9641 29.4307 20.5687 33.0355 24.9993 33.0355C26.7265 33.0374 28.4078 32.4798 29.7916 31.446L31.0526 32.7087L29.6308 34.1305C29.4098 34.3515 29.2856 34.6514 29.2856 34.964C29.2856 35.2767 29.4098 35.5765 29.6308 35.7976C29.8519 36.0187 30.1517 36.1429 30.4644 36.1429C30.777 36.1429 31.0768 36.0187 31.2979 35.7976L32.7169 34.378L34.9866 36.6537C35.2074 36.875 35.5071 36.9996 35.8197 37C36.1323 37.0004 36.4323 36.8766 36.6537 36.6558C36.875 36.435 36.9996 36.1353 37 35.8227C37.0004 35.51 36.8766 35.21 36.6558 34.9887L34.3829 32.7141L35.7966 31.3003C36.0176 31.0792 36.1418 30.7794 36.1418 30.4668C36.1418 30.1541 36.0176 29.8543 35.7966 29.6332C35.5755 29.4121 35.2757 29.2879 34.9631 29.2879C34.6504 29.2879 34.3506 29.4121 34.1295 29.6332L32.718 31.0448L31.4565 29.7794C32.4823 28.3963 33.0357 26.7196 33.0346 24.9975C33.0336 23.2755 32.4781 21.5995 31.4506 20.2176L34.6416 17.0237V17.8214C34.6416 18.1339 34.7658 18.4337 34.9868 18.6547C35.2078 18.8758 35.5076 18.9999 35.8201 18.9999C36.1327 18.9999 36.4325 18.8758 36.6535 18.6547C36.8745 18.4337 36.9986 18.1339 36.9986 17.8214V14.1786C36.9986 13.866 36.8745 13.5662 36.6535 13.3452C36.4325 13.1242 36.1327 13 35.8201 13ZM19.3211 24.9999C19.3211 23.8768 19.6541 22.7789 20.278 21.8451C20.902 20.9112 21.7888 20.1834 22.8264 19.7536C23.8639 19.3238 25.0056 19.2114 26.1071 19.4305C27.2086 19.6496 28.2203 20.1904 29.0145 20.9846C29.8086 21.7787 30.3494 22.7905 30.5685 23.892C30.7876 24.9936 30.6751 26.1353 30.2453 27.1729C29.8156 28.2105 29.0878 29.0974 28.154 29.7214C27.2202 30.3453 26.1224 30.6784 24.9993 30.6784C23.4939 30.6767 22.0506 30.0778 20.9861 29.0133C19.9216 27.9487 19.3228 26.5054 19.3211 24.9999Z" fill="#FFE0C2"/>
<path d="M19.3211 24.9999C19.3211 23.8768 19.6541 22.7789 20.278 21.8451C20.902 20.9112 21.7888 20.1834 22.8264 19.7536C23.8639 19.3238 25.0056 19.2114 26.1071 19.4305C27.2086 19.6496 28.2203 20.1904 29.0145 20.9846C29.8086 21.7787 30.3494 22.7905 30.5685 23.892C30.7876 24.9936 30.6751 26.1353 30.2453 27.1729C29.8156 28.2105 29.0878 29.0974 28.154 29.7214C27.2202 30.3453 26.1224 30.6784 24.9993 30.6784C23.4939 30.6767 22.0506 30.0778 20.9861 29.0133C19.9216 27.9487 19.3228 26.5054 19.3211 24.9999Z" fill="#FFE0C2"/>
</g>
<path d="M35.8201 13H32.1775C31.8649 13 31.5652 13.1242 31.3442 13.3452C31.1232 13.5662 30.999 13.866 30.999 14.1786C30.999 14.4911 31.1232 14.7909 31.3442 15.0119C31.5652 15.2329 31.8649 15.3571 32.1775 15.3571H32.9751L29.7841 18.5483C28.4008 17.5198 26.723 16.9643 24.9993 16.9643C23.2756 16.9643 21.5978 17.5198 20.2146 18.5483L19.8091 18.1428L21.226 16.7264C21.3354 16.6169 21.4223 16.487 21.4815 16.3439C21.5407 16.2009 21.5712 16.0476 21.5712 15.8928C21.5712 15.738 21.5407 15.5847 21.4815 15.4417C21.4223 15.2987 21.3354 15.1687 21.226 15.0593C21.1165 14.9498 20.9866 14.863 20.8435 14.8037C20.7005 14.7445 20.5472 14.714 20.3924 14.714C20.0798 14.714 19.78 14.8382 19.5589 15.0593L18.1426 16.4762L17.0235 15.3571H17.8212C18.1337 15.3571 18.4335 15.2329 18.6545 15.0119C18.8755 14.7909 18.9997 14.4911 18.9997 14.1786C18.9997 13.866 18.8755 13.5662 18.6545 13.3452C18.4335 13.1242 18.1337 13 17.8212 13H14.1785C13.8659 13 13.5662 13.1242 13.3452 13.3452C13.1242 13.5662 13 13.866 13 14.1786V17.8214C13 18.1339 13.1242 18.4337 13.3452 18.6547C13.5662 18.8758 13.8659 18.9999 14.1785 18.9999C14.4911 18.9999 14.7908 18.8758 15.0118 18.6547C15.2328 18.4337 15.357 18.1339 15.357 17.8214V17.0237L16.4761 18.1428L15.0608 19.5581C14.949 19.667 14.8599 19.7971 14.7988 19.9407C14.7376 20.0843 14.7056 20.2386 14.7046 20.3946C14.7036 20.5507 14.7335 20.7054 14.7928 20.8498C14.852 20.9942 14.9394 21.1254 15.0497 21.2358C15.1601 21.3461 15.2913 21.4335 15.4357 21.4927C15.58 21.552 15.7348 21.582 15.8908 21.5809C16.0469 21.5799 16.2012 21.5479 16.3448 21.4867C16.4884 21.4256 16.6184 21.3365 16.7273 21.2247L18.1426 19.8094L18.5481 20.2149C17.5178 21.5973 16.9622 23.2758 16.9641 24.9999C16.9641 29.4307 20.5687 33.0355 24.9993 33.0355C26.7265 33.0374 28.4078 32.4798 29.7916 31.446L31.0526 32.7087L29.6308 34.1305C29.4098 34.3515 29.2856 34.6514 29.2856 34.964C29.2856 35.2767 29.4098 35.5765 29.6308 35.7976C29.8519 36.0187 30.1517 36.1429 30.4644 36.1429C30.777 36.1429 31.0768 36.0187 31.2979 35.7976L32.7169 34.378L34.9866 36.6537C35.2074 36.875 35.5071 36.9996 35.8197 37C36.1323 37.0004 36.4323 36.8766 36.6537 36.6558C36.875 36.435 36.9996 36.1353 37 35.8227C37.0004 35.51 36.8766 35.21 36.6558 34.9887L34.3829 32.7141L35.7966 31.3003C36.0176 31.0792 36.1418 30.7794 36.1418 30.4668C36.1418 30.1541 36.0176 29.8543 35.7966 29.6332C35.5755 29.4121 35.2757 29.2879 34.9631 29.2879C34.6504 29.2879 34.3506 29.4121 34.1295 29.6332L32.718 31.0448L31.4565 29.7794C32.4823 28.3963 33.0357 26.7196 33.0346 24.9975C33.0336 23.2755 32.4781 21.5995 31.4506 20.2176L34.6416 17.0237V17.8214C34.6416 18.1339 34.7658 18.4337 34.9868 18.6547C35.2078 18.8758 35.5076 18.9999 35.8201 18.9999C36.1327 18.9999 36.4325 18.8758 36.6535 18.6547C36.8745 18.4337 36.9986 18.1339 36.9986 17.8214V14.1786C36.9986 13.866 36.8745 13.5662 36.6535 13.3452C36.4325 13.1242 36.1327 13 35.8201 13ZM19.3211 24.9999C19.3211 23.8768 19.6541 22.7789 20.278 21.8451C20.902 20.9112 21.7888 20.1834 22.8264 19.7536C23.8639 19.3238 25.0056 19.2114 26.1071 19.4305C27.2086 19.6496 28.2203 20.1904 29.0145 20.9846C29.8086 21.7787 30.3494 22.7905 30.5685 23.892C30.7876 24.9936 30.6751 26.1353 30.2453 27.1729C29.8156 28.2105 29.0878 29.0974 28.154 29.7214C27.2202 30.3453 26.1224 30.6784 24.9993 30.6784C23.4939 30.6767 22.0506 30.0778 20.9861 29.0133C19.9216 27.9487 19.3228 26.5054 19.3211 24.9999Z" fill="#FFE0C2"/>
<path d="M19.3211 24.9999C19.3211 23.8768 19.6541 22.7789 20.278 21.8451C20.902 20.9112 21.7888 20.1834 22.8264 19.7536C23.8639 19.3238 25.0056 19.2114 26.1071 19.4305C27.2086 19.6496 28.2203 20.1904 29.0145 20.9846C29.8086 21.7787 30.3494 22.7905 30.5685 23.892C30.7876 24.9936 30.6751 26.1353 30.2453 27.1729C29.8156 28.2105 29.0878 29.0974 28.154 29.7214C27.2202 30.3453 26.1224 30.6784 24.9993 30.6784C23.4939 30.6767 22.0506 30.0778 20.9861 29.0133C19.9216 27.9487 19.3228 26.5054 19.3211 24.9999Z" stroke="#FFE0C2" stroke-width="0.4"/>
<defs>
<filter id="filter0_i_39_95" x="12.8" y="12.8" width="24.3999" height="28.4" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="4"/>
<feGaussianBlur stdDeviation="2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_39_95"/>
</filter>
</defs>
</svg>
`;

export default function GenderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string | null>(null);
  // shared values for smooth selection color animation
  const maleAnim = useSharedValue(0);
  const femaleAnim = useSharedValue(0);
  const otherAnim = useSharedValue(0);
  const [progress, setProgress] = useState(40);
  const maskWidthPx = Math.round((OUTER_WIDTH * Math.max(0, Math.min(100, progress))) / 100);
  const tightOverlayWidth = Math.max(Math.round(maskWidthPx * 0.6), 60);
  const wideOverlayWidth = Math.max(Math.round(maskWidthPx * 1.6), 140);

  let IOSBordersWrapper: any = ({ children }: { children: any }) => children;
  if (Platform.OS === 'ios') {
    try {
      const mod = require('react-ios-borders');
      IOSBordersWrapper = mod && (mod.default || mod);
    } catch (e) {
      IOSBordersWrapper = ({ children }: { children: any }) => children;
    }
  }

  const options = ['Male', 'Female', 'Other'];

  const animateTo = (key: string) => {
    maleAnim.value = withTiming(key === 'Male' ? 1 : 0, { duration: 260 });
    femaleAnim.value = withTiming(key === 'Female' ? 1 : 0, { duration: 260 });
    otherAnim.value = withTiming(key === 'Other' ? 1 : 0, { duration: 260 });
  };

  function OptionItem({ label, iconXml, anim, onPress }: { label: string; iconXml: string; anim: any; onPress: () => void }) {
    const animatedStyle = useAnimatedStyle(() => ({
      backgroundColor: interpolateColor(anim.value, [0, 1], ['#141414', '#1E1E1E']),
      borderColor: interpolateColor(anim.value, [0, 1], ['#191919', '#FFE0C2']),
    }));

    return (
      <Pressable onPress={onPress} accessibilityRole="button">
        <Animated.View style={[styles.option, animatedStyle]}>
          <View style={styles.optionRow}>
            <View style={styles.optionIconWrapper}>
              <SvgXml xml={iconXml} width={50} height={50} />
            </View>
            <Text style={[styles.optionText, selected === label ? styles.optionTextSelected : null]}>{label}</Text>
          </View>
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
              accessibilityLabel="Back"
            >
              <SvgXml xml={leftArrowSvg} width={20} height={20} />
            </Pressable>

            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressMask, { width: `${progress}%` }]}>
                  <View style={{ width: '100%', height: '100%' }}>
                    <LinearGradient
                      colors={["#592D00", "#FFE1C2"]}
                      start={[0, 0]}
                      end={[1, 0]}
                      style={{ flex: 1 }}
                    />
                  </View>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.75)', 'rgba(255,255,255,0)']}
                    start={[0, 0.5]}
                    end={[1, 0.5]}
                    style={[styles.innerShadowOverlay, { left: -35, width: tightOverlayWidth, opacity: 0.8 }]}
                  />
                  <LinearGradient
                    colors={['rgba(255,255,255,0.38)', 'rgba(255,255,255,0)']}
                    start={[0, 0.5]}
                    end={[1, 0.5]}
                    style={[styles.innerShadowOverlay, { left: -35, width: wideOverlayWidth, opacity: 0.38 }]}
                  />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.title}>Chat, What’s my gender?</Text>
            <Text style={styles.subtitle}>Who you rollin’ as? Boy, girl?</Text>
          </View>

          <View style={styles.optionsContainer}>
            {options.map((o) => {
              const iconXml = o === 'Female' ? femaleGenderSvg : o === 'Other' ? otherGenderSvg : maleGenderSvg;
              const anim = o === 'Female' ? femaleAnim : o === 'Other' ? otherAnim : maleAnim;

              return (
                <OptionItem
                  key={o}
                  label={o}
                  iconXml={iconXml}
                  anim={anim}
                  onPress={() => {
                    setSelected(o);
                    animateTo(o);
                  }}
                />
              );
            })}
          </View>
        </View>

        <View style={[styles.bottomContainer, { paddingBottom: SP.md + insets.bottom }]}>
          <IOSBordersWrapper>
            <View style={styles.nextButtonWrapper}>
              <Pressable
                style={[styles.nextButtonInner, !selected && styles.nextButtonDisabled]}
                onPress={() => selected && router.push('/onboarding/age' as any)}
                disabled={!selected}
                accessibilityRole="button"
                accessibilityLabel="Next"
              >
                <Text style={styles.nextButtonText}>Next</Text>
              </Pressable>
            </View>
          </IOSBordersWrapper>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#111111' },
  screen: { flex: 1, alignItems: 'center', justifyContent: 'space-between' },
  contentContainer: { width: OUTER_WIDTH, paddingTop: SP.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SP.lg },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#222222', alignItems: 'center', justifyContent: 'center', marginRight: SP.md },
  progressContainer: { flex: 1 },
  progressTrack: { height: 10, backgroundColor: '#222222', borderRadius: 10, overflow: 'hidden' },
  progressFill: { width: '40%', height: '100%', backgroundColor: '#FFE0C2' },
  progressMask: { height: '100%', overflow: 'hidden', position: 'relative' },
  innerShadowOverlay: { position: 'absolute', top: 0, bottom: 0, width: '100%', opacity: 0.65, borderRadius: 10, pointerEvents: 'none' },
  titleBlock: { marginBottom: SP.md },
  title: { color: '#fff', fontSize: 32, fontFamily: 'SpaceGrotesk_700Bold', fontWeight: '700' },
  subtitle: { color: '#fff', fontSize: 16, marginTop: 4, fontFamily: 'SpaceGrotesk_400Regular' },
  optionsContainer: { marginTop: SP.md },
  option: { width: '100%', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 16, backgroundColor: '#141414', borderWidth: 2, borderColor: '#191919', marginBottom: 12 },
  optionRow: { flexDirection: 'row', alignItems: 'center' },
  optionIconWrapper: { marginRight: 12, width: 50, height: 50, alignItems: 'center', justifyContent: 'center' },
  optionSelected: { backgroundColor: '#1E1E1E', borderColor: '#FFE0C2', borderWidth: 2 },
  optionText: { color: '#fff', fontSize: 22, fontFamily: 'SpaceGrotesk_400Regular' },
  optionTextSelected: { color: '#fff' },
  bottomContainer: { width: '100%', paddingTop: SP.lg, paddingHorizontal: SP.sm, backgroundColor: 'transparent' },
  nextButtonWrapper: { width: OUTER_WIDTH, borderRadius: 16, padding: 2, backgroundColor: 'rgba(255,224,194,0.9)' },
  nextButtonInner: { width: '100%', height: 56, borderRadius: 16, backgroundColor: '#FFE0C2', alignItems: 'center', justifyContent: 'center' },
  nextButtonDisabled: { opacity: 0.45 },
  nextButtonText: { color: '#000', fontSize: 24, fontFamily: 'Outfit_600SemiBold', fontWeight: '600' },
});