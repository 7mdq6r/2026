# سبحة — Tasbih

تطبيق سبحة إلكترونية بتصميم فاتح وهادئ. يعمل كـ PWA على الويب وكتطبيق أصلي على iOS و Android عبر Capacitor.

## البنية

```
tasbih/
├── www/              # ملفات الويب (يخدمها Capacitor)
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   ├── manifest.json
│   └── sw.js         # Service Worker للعمل بدون إنترنت
├── package.json
├── capacitor.config.json
└── README.md
```

## تشغيل نسخة الويب

```bash
cd tasbih
npm install
npm run serve
```

ثم افتح `http://localhost:8080`.

أو افتح `www/index.html` مباشرة في المتصفح.

## تحويله إلى تطبيق iOS (يتطلب macOS + Xcode)

```bash
cd tasbih
npm install
npx cap add ios
npx cap sync ios
npx cap open ios
```

سيفتح مشروع Xcode. اضغط زر التشغيل لتجربته على المحاكي أو جهاز حقيقي.

### للنشر على App Store
1. افتح المشروع في Xcode
2. غيّر **Bundle Identifier** و **Team** و **App Name**
3. أضف أيقونات التطبيق (Assets.xcassets → AppIcon)
4. `Product → Archive` ثم ارفع عبر Xcode Organizer إلى App Store Connect
5. يتطلب حساب Apple Developer ($99/سنة)

## تحويله إلى تطبيق Android

```bash
cd tasbih
npm install
npx cap add android
npx cap sync android
npx cap open android
```

سيفتح Android Studio.

## إعادة مزامنة التغييرات

بعد تعديل أي ملف داخل `www/`:

```bash
npx cap sync
```

## الميزات

- عداد تسبيح بزر مركزي كبير
- شريط تقدم دائري
- 8 أذكار قابلة للاختيار
- اهتزاز عند الضغط (Capacitor Haptics للتطبيق الأصلي، Web Vibration للمتصفح)
- صوت نقرة خفيف (Web Audio API)
- حفظ تلقائي في localStorage
- يعمل بدون إنترنت (Service Worker)
