# Sage Flow - Smart Study Companion

**Stay in touch with your studies**

Sage Flow is a comprehensive study management application designed to help students stay organized and productive. Built with modern web technologies including React, TypeScript, and Tailwind CSS, it provides an intuitive interface for managing your academic life. Whether you're juggling multiple subjects, preparing for exams, or trying to maintain a consistent study routine, Sage Flow has the tools you need to succeed.

## 🚀 Live Demo

**[View Live Demo](https://sage-flow-gamma.vercel.app)**

## 📸 Screenshots

### Login Page
![Login](screenshots/loginpage.png)

### Dashboard Overview
![Dashboard](screenshots/overview.png)

## Features

### Task Management

Keep track of everything you need to do with our task management system. You can create tasks with different priority levels (Low, Medium, High) and set due dates to ensure nothing falls through the cracks. Mark tasks as complete when you finish them, or delete them if they're no longer relevant. The system helps you visualize what needs your attention most urgently.

![Tasks](screenshots/tasks.png)

### Study Planner

The study planner is designed to help you prepare for multiple exams simultaneously. Start by adding your subjects along with their exam dates, then break each subject down into topics with estimated study hours. Once you've set everything up, the planner automatically generates a balanced study schedule that distributes your topics across available days. You can customize how many hours per day you want to study, and the system ensures you cover everything before your exams. If you miss a session, there's a reschedule feature that moves missed sessions to upcoming days. You can also drag and drop sessions between days to adjust your schedule as needed, and print your schedule for offline reference.

![Study Planner](screenshots/studyplanner.png)

### Test Generator

Practice makes perfect, and the test generator helps you create practice tests from any study material. Simply paste your text content, and the system generates multiple-choice questions and fill-in-the-blank exercises. After completing a test, you get instant feedback with your score and can review which questions you got right or wrong. All your test attempts are saved in the history so you can track your improvement over time.

![Test Generator](screenshots/testgenerator.png)

### Pomodoro Timer

Stay focused with the built-in Pomodoro timer. You can customize your work and break intervals to match your preferences, and the timer will automatically transition between work sessions and breaks. Audio notifications alert you when it's time to switch, and the system tracks how many sessions you've completed. This technique helps maintain concentration while preventing burnout.

### Flashcards

Flashcards are perfect for memorizing facts, definitions, and concepts. Create custom decks for different subjects or topics, then add cards with questions on one side and answers on the other. When reviewing, simply click to flip between question and answer. You can shuffle the deck for varied practice or go through cards in order. It's a simple but effective way to reinforce your learning.

![Flashcards](screenshots/flashcards.png)

### Analytics Dashboard

Understand your study patterns with the analytics dashboard. It shows you statistics about your task completion rates, how many hours you've studied for each subject, and your test score trends over time. Visual charts and graphs make it easy to see where you're excelling and where you might need to focus more attention.

![Analytics](screenshots/analytics.png)

### Settings

Personalize your experience through the settings page. You can edit your profile information, change your password for security, and toggle dark mode for comfortable studying at any time of day. The export feature lets you backup all your data as a JSON file, which you can later import if you switch devices or need to restore your information. There's also an option to delete your account if needed.

![Settings](screenshots/settings.png)

## Tech Stack

The application is built using React 18 with TypeScript for type safety and better development experience. Tailwind CSS handles all the styling, while shadcn/ui components (built on Radix UI) provide accessible and customizable interface elements. React Router v6 manages navigation between pages, and Recharts powers the analytics visualizations. Lucide React supplies the icons throughout the app. Vite serves as the build tool for fast development and optimized production builds. All data is stored locally in your browser using LocalStorage, which means your information stays private and accessible even offline.


