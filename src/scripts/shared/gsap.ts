// GSAP with every plugin the site uses registered once. Import gsap and the
// plugins from here, never from 'gsap' directly, so nothing runs before
// registration.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';

gsap.registerPlugin(ScrollTrigger, CustomEase, MorphSVGPlugin);

export { gsap, ScrollTrigger, CustomEase, MorphSVGPlugin };
