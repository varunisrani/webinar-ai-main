# 📡 AI Webinar SaaS – Installation Manual & Feature Guide

Quick tip: Paste this file on this website [https://markdownlivepreview.com/](https://markdownlivepreview.com/) to view in preview mode!

Project Description:
Welcome to the **AI Webinar SaaS** platform – an advanced, AI-enhanced webinar hosting solution with real-time streaming, automated sales agents, and payment integration.

# Where to access each bonus offered in the Spotlight bundle

Some bonuses were only if you purchased this codebase during the launch period. If you don't find some bonuses, its because the offer has ended. Please download all bonuses right away and activate them if needed so you don't lose them when they are turned off.

- Sending emails to attendees when the webinar begins (In readme)
- Installation manual (in readme)
- Future proof feature ideas to expand upon (In readme)
- Record webinars and render them on the stream ended page (already in the codebase)
- Payments on the AI agent call page (Already added inside the codebase inside the live stream page)
- Custom onboarding steps showing customers progress on the home page (Already added inside home page)
- Improve UI and themes for the livestream page and chat menu (Few upgrades already added)
- Free License (Send us an email to support@webprodigies.com with your domain name to activate the license)
- Figma File (Should be included inside the email you received with the codebase)

---

> 🎁 This project includes a **Free Commercial License**. Please send an email to support@webprodigies.com with the domain name you wish to attach to your project. This will be used as an activation key for your project. You can read our license terms on our website webprodigies/license to learn more on how you can use the license.

Note: Some links in this file may have special offers, discounts or limited time bonuses. Not using the links simply means you're saying no to the special offers but does not mean things wont work. Few links are kick back links for us to grab some coffee while we code these awesome projects for you! Thank you in advance for supporting us and hope you love the discounts!

---

# 🛠 Installation Manual

> 📺 I've attached Loom video to a few so you can follow along visually, without having to watch the entire 10hr + youtube video. [Quick message](https://www.loom.com/share/4cf6bf335f024e09b834b1314ee43491?sid=54ae83fe-a870-4fe9-91b2-5bc95a54273c)

### 1️⃣ Install Dependencies

Only use npm. bun or other cli tools could resolve folders and your node_modules differently which will cause conflicts between your code and ours.

```bash
npm i --legacy-peer-deps
```

---

### 2️⃣ Generate Prisma Client

```bash
npx prisma generate
```

📺 Loom: [Watch Prisma setup](https://www.loom.com/share/fed28aab2e054c4397fe64d63442bdb9?sid=eae94d2a-644f-406c-9216-5f85e5b32afe). 

This video also shows you how to install prisma but you don't need to do that because you already installed it with npm i.

---

### Update all ENV variables before starting anything.

follow this guide step by step to get your project started.

### 3️⃣ Add Database URL

📺 Loom: [Watch DB config](https://www.loom.com/share/38e87220449649c4a3a383b99309b28f?sid=b1d631c8-a1bd-4d84-b0c9-97096393336f)

[Link to get 10 free projects with Neon DB](https://fyi.neon.tech/J5YG0hX)

---

### 4️⃣ Add Clerk API Keys

📺 Loom: [Watch Clerk setup](https://www.loom.com/share/5d53b1f7d4a04d3c97a20045b0bd86b8?sid=454b28eb-0a8e-4e8b-8cb5-bcc04d2aeb67)

[Clerk free plan](https://go.clerk.com/CqBMVjW)

---

### 5️⃣ Add Stripe API Keys

📺 Loom: [Watch Stripe setup](https://www.loom.com/share/ee65d563a10d4953971e59dc029404db?sid=654efc02-daa3-464e-9f18-a51f58745ae0)

[Stripe API keys](https://dashboard.stripe.com/apikeys)

---

### 6️⃣ Add Vapi API Key

📺 Loom: [Watch Vapi setup](https://www.loom.com/share/f233c0482a2e4aa1ba041f4c7caa20d9?sid=f8e122ba-0fdf-40d6-a440-0f3c382614e5)

[Get a free account with 1000 free minutes per month + our sales prompt + use code WEBPRODIGIES @ checkout to get additional 500 free minutes](https://vapi.ai/?aff=emmanuel)

---

### 7️⃣ Add GetStream.io Keys

📺 Loom: [Watch GetStream.io setup](https://www.loom.com/share/66eb6d5436954cb286edbe2ee9dabf3c?sid=89cae3a5-8294-4992-81e1-cbac3b938533)

[Get stream IO Maker account](https://getstream.io/maker-account/)

---

### 8️⃣ Add Resend API Key

📺 Loom: [Watch Resend setup](https://www.loom.com/share/c64c83e76f794c69b5043829954da2fc?sid=97a43856-faa4-4411-b9b9-2a284636d776)
[Resend](https://resend.com/?utm_source=webprodigies)

---

### 9️⃣ Deploy on hostinger and coolify

📺 Loom: [Watch Histinger setup](https://www.loom.com/share/60b7ce65c53847a7a5563b3bea75f4c6?sid=12cda5ec-c576-4f8b-8609-2c7a0864c321)
[Watch hostinger setup with coolify](https://www.loom.com/share/5d27ec1a40fb435da451f4dd0c0967be?sid=51744fb4-a322-4fde-8884-46c7e2370054)

[Get 61% off with my link, and use code WEBPRODIGIES at checkout to get an additional 10% off on the KVM2 VPS plans](https://hostinger.com/webprodigies)

---

## ✨ Bonus Features

### 🔮 Future-Proof Feature Ideas

### Live add to cart count that creates urgency.

- The key to having people take action is to give them a reason. By showing them how many spots are available, or how many are currently vieweing the product on stripe, they are more likely going to want to take action and move closer to their goals. It creates a sense of urgency! This metric can also be used to show data to the marketers on their dashboard.

## Smart follow-ups for attendees who didn’t convert.

- After the attendees has hoped on a sales call with the AI agent, you need to follow up with customers if they don't convert. Use resend to send emails / follow up sequences to customers. This is huge for marketers! You can also take on the email costs (skool does this too).

## Niche specific template agents

- Vapi has many template agents but they arent taylored to perform the way you like. Create a few templates that are niche specific that can help marketers start today! for example, instead of Sales agent, call it Sales agents for fitness coaches selling programs between $2k - $15k. This makes your product feel more unique and you'll stand out.

## Real time sound notifications when attendees pay

- Using dopamine to create stickiness is awesome! When you trigger visual or auditory feedback for customersr (it has to sound nice, not alarming), it gets them to want more. Skool does this, and they do it really well! When a customer comes through it makes a cash register noise that gets people excited. It's also a fun way to market your SAAS.

## Webinar explore page (Not tested)

- You can create an explore page for attendees to search and find what they're looking for. If you have good enough SEO and traffic, other marketers will see good traffic and signups.

## Gamify the process

- Create rewards, leaderboard, or the highest revenue generating webinar and offer monetary incentives, or free educational / inperson experiences to keep people motivated to stay longer.

## Affiliate system

- The best way to get customers to stick is through an affiliate system. If somone makes money by exchanging money, they will never churn. This is the closest they will ever get to passive income.

---

## 🙌 Final Notes

If you're launching this as a SaaS, you're going to need more than just code. You’ll need a powerful CRM that can host your websites, manage leads, build unlimited automations, and scale with you. Some of you might also need mentorship, design help, copywriting, or just someone to guide you through the chaos.

- Inside Prodigies University, our clients get access to:
- A free CRM platform (value $3,564/y) built to run your SaaS (unlimited features included)
- Live coaching calls and on-demand mentorship
- All our codebases, Figma files, and courses
- Step-by-step strategies for lead generation, sales, systems, and growth
- Our client aquisition system and offer creation blueprint to help you convert more
- A private network of trusted talent so you never have to rely on Upwork again
- And most importantly, a community of real SaaS builders who are in it with you
- There’s more — but I’d rather walk you through it personally.

👉 If this sounds like something you need, see if you qualify to work with us. [webprodigies.com/pu](https://webprodigies.com/pu?utm_source=readmefilepremiumCodebase)
(Yes, this is paid — but so is everything that’s actually worth it.)

**You can also DM us on instagram with the word "mentor" and our team members will hop in to see if we can give any free advise.**

---

Made with ❤️ by [Web Prodigies](https://www.youtube.com/@webprodigies)
