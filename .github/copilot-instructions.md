<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->
- [x] Verify that the copilot-instructions.md file in the .github directory is created.

- [x] Clarify Project Requirements
	<!-- Project: Next.js Admin Dashboard with TypeScript, Tailwind CSS, Shadcn/UI, 4-digit PIN auth, sidebar navigation, CRUD for ad records -->

- [x] Scaffold the Project
	<!--
	Ensure that the previous step has been marked as completed.
	Call project setup tool with projectType parameter.
	Run scaffolding command to create project files and folders.
	Use '.' as the working directory.
	If no appropriate projectType is available, search documentation using available tools.
	Otherwise, create the project structure manually using available file creation tools.
	-->

- [x] Customize the Project
	<!--
	Verify that all previous steps have been completed successfully and you have marked the step as completed.
	Develop a plan to modify codebase according to user requirements.
	Apply modifications using appropriate tools and user-provided references.
	Skip this step for "Hello World" projects.
	-->

- [x] Install Required Extensions
	<!-- No additional extensions needed for this project -->

- [x] Compile the Project
	<!--
	Verify that all previous steps have been completed.
	Install any missing dependencies.
	Run diagnostics and resolve any issues.
	Check for markdown files in project folder for relevant instructions on how to do this.
	-->

- [x] Create and Run Task
	<!--
	Verify that all previous steps have been completed.
	Check https://code.visualstudio.com/docs/debugtest/tasks to determine if the project needs a task. If so, use the create_and_run_task to create and launch a task based on package.json, README.md, and project structure.
	Skip this step otherwise.
	 -->

- [x] Launch the Project
	<!--
	Verify that all previous steps have been completed.
	Prompt user for debug mode, launch only if confirmed.
	 -->

- [x] Ensure Documentation is Complete

## Project Overview

This is a Next.js Admin Dashboard with TypeScript, Tailwind CSS, and Shadcn/UI components. The dashboard features:

- 4-digit PIN authentication system
- Sidebar navigation with responsive design
- Add/View/Delete functionality for ad records
- Form validation for MAC address, name, and phone number
- Local storage for data persistence
- Modern, clean UI with accessibility features

## Development

- Run `npm run dev` to start the development server
- Run `npm run build` to build for production
- Default PIN is 1234 (configurable in .env.local)

## Architecture

- Next.js 14 with App Router
- Client-side authentication and data management
- Responsive design with Tailwind CSS
- Component-based architecture with TypeScript