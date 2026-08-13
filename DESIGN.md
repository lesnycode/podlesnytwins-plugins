# Design

## Theme

Premium dark plugin landing page. Дух Cradle The God Particle: минимум декора, большая типографика, щедрый воздух, UI-плагин как главный герой.

## Color

- Background: `#0a0c0d` (около чёрного, тёмная студия)
- Surface: `#131619`
- Surface 2: `#1a1f22`
- Border: `#23282c`
- Text: `#f0f2f4`
- Muted: `#8a9199`
- Accent: `#5ee7b3` (teal из UI Ricochet)
- Accent dim: `#3d9e7a`
- Accent glow: `rgba(94, 231, 179, 0.15)`

## Typography

- Display / headings: `SaarSP`, Arial, sans-serif
- Body / UI: `Work Sans`, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif
- Bold emphasis: `LiteralBold`, Arial, sans-serif

Шрифты подгружаются с основного сайта credits.podlesnytwins.com / static.tildacdn.com.

## Layout

- Max width: 1200px
- Generous vertical rhythm: 6–8rem между секциями
- Hero centered, остальное — левая колонка или split
- FAQ — суженная центральная колонка 720px

## Components

- Buttons: rounded 8px, primary — accent на тёмном тексте, secondary — обводка
- Cards: no nested cards; использовать только когда нужно группирование
- FAQ: native `<details>`

## Motion

- Intentional reveals (opacity + translateY) с `prefers-reduced-motion` fallback
- Hover — мягкое glow на primary кнопках
- No bounce, no elastic
