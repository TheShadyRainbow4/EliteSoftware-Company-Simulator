# GEMINI.md - EliteSoftware Client Simulator

This document provides a comprehensive overview of the EliteSoftware Client Simulator project, its architecture, and development conventions.

## Project Overview

The EliteSoftware Client Simulator is a React-based web application that simulates a corporate environment. Users can take on the role of an employee at "EliteSoftware," a fictional company, and interact with a simulated corporate world. The application is designed to be a rich, interactive experience, with features like:

*   **Email:** A fully functional email client where users can send and receive emails from other users and AI-powered coworkers.
*   **Projects:** Users can create and manage projects, assign team members, and track progress.
*   **Directory and Org Chart:** A company directory and organizational chart to visualize the company's structure.
*   **Instant Messenger:** A real-time chat application for instant communication.
*   **Social Media:** An internal social media feed for company-wide announcements and discussions.
*   **AI-Powered Coworkers:** The simulation is populated with AI-powered coworkers who have distinct personalities, roles, and relationships. These AI coworkers will proactively interact with the user and each other, creating a dynamic and unpredictable environment.
*   **Admin View:** An admin panel for managing users, coworkers, and other aspects of the simulation.

The application is built with React, Vite, and TypeScript, and it uses the `@google/genai` library to power its AI features.

## Building and Running

### Prerequisites

*   Node.js
*   A Gemini API key

### Running the Application

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Set up your environment:**
    Create a `.env.local` file in the root of the project and add your Gemini API key:
    ```
    GEMINI_API_KEY=your_api_key_here
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

### Building for Production

To create a production build, run:
```bash
npm run build
```
The output will be in the `dist` directory.

### Previewing the Production Build

To preview the production build locally, run:
```bash
npm run preview
```

## Development Conventions

### Code Style

*   The project uses Prettier for code formatting. It is recommended to use a Prettier extension in your editor to format code on save.
*   The project follows standard React and TypeScript best practices.
*   Use functional components with hooks.
*   Use descriptive names for variables, functions, and components.

### Component Structure

*   Components are organized in the `src/components` directory.
*   Each component should be in its own file.
*   Icons are stored in `src/components/icons`.

### State Management

*   The application uses a combination of `useState` and `useLocalStorage` for state management.
*   `useLocalStorage` is a custom hook that persists state in the browser's local storage.
*   Global state is managed in the `App.tsx` component and passed down to child components via props.

### AI Integration

*   All interactions with the Gemini API are handled in `src/services/geminiService.ts`.
*   This service exports functions for generating AI responses, creating projects, and other AI-powered features.
*   The service uses the `@google/genai` library to interact with the Gemini models.

### Types

*   All data types are defined in `src/types.ts`.
*   This file serves as a single source of truth for the application's data structures.
