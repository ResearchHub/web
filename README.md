# The [ResearchHub](https://researchhub.com) Web App

---

# 🚀 Our Mission 🚀

### Accelerate the pace of scientific research

We believe that by empowering scientists to independently fund, create, and publish academic content we can revolutionize the speed at which new knowledge is created and transformed into life-changing products.

---

# 👀 Important Links

💡 Got an idea or request? Found a bug? 🐛 [Open an issue on GitHub](https://github.com/ResearchHub/web/issues).  
➕ Want to contribute to this project? [Introduce yourself in our Discord community](https://discord.gg/ZcCYgcnUp5).  
📰 Read the [ResearchCoin White Paper](https://www.researchhub.com/paper/819400/the-researchcoin-whitepaper)  
👷 [See what we are working on](https://github.com/orgs/ResearchHub/projects/3/views/3)

---

# ⚙️ Installation ⚙️

## Prerequisites
- [ResearchHub API](https://github.com/ResearchHub/researchhub-backend#readme) (backend) setup completed
- [Node.js](https://nodejs.org/)
- [Prettier](https://prettier.io/)
  - [VSCode extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
  - [WebStorm plugin](https://plugins.jetbrains.com/plugin/10456-prettier)

## Setup
1. Get `.npmrc` and `.env.development` files from the team and put them in the project root
2. Install dependencies:
   ```shell
   npm install
   ```

## Run the app
1. Install dependencies (not necessary every time, but doesn't hurt):
   ```shell
   npm install
   ```
2. Start local dev:
   ```shell
   npm run dev
   ```
3. Go to http://localhost:3000/ in the browser
4. Log in, or create a user if you haven't already:
    1. Go through signup flow with your email, adding a `+#` before the `@` (ex: `bill_nye+1@gmail.com`)
        - A yellow error box with a singe `|` will appear when submitting the email address, indicating (for local dev) that it needs to be verified
    2. Open the `account_emailaddress` table in the `researchhub` DB
    3. Find your email row and set `verified` to `True`, then submit/save the change
    4. Log in with that email address and your password