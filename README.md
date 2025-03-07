# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/722e654a-9186-4001-b9d7-89d16f8b1f4c

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/722e654a-9186-4001-b9d7-89d16f8b1f4c) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/722e654a-9186-4001-b9d7-89d16f8b1f4c) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)


jayakumar notes:-
Once you have your API key in src/lib/api.ts, you'll need to update the configuration in your application's code. Also, make note of the Data API URL that MongoDB provides, as you'll need to update that in your code as well.

After creating your API key, you should update these values in the src/lib/api.ts file:


// Update these values with your actual MongoDB Data API information
const MONGODB_CONFIG: MongoDBConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY_HERE", // Replace with the API key you just created
  dataSource: "Cluster0",
  database: "KishoreDB",
  collection: "entries"
};

// Replace with your actual Data API URL
const MONGODB_API_URL = "https://data.mongodb-api.com/app/data-abcde/endpoint/data/v1"; 
The Data API URL will be shown on the Data API page in your MongoDB Atlas dashboard.

Note that api.ts is getting quite long (393 lines). Once you have everything working, consider asking me to refactor it for better maintainability.
