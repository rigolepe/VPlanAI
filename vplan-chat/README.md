# VPlan Chat

VPlan Chat is a TypeScript + React web application that combines SVG visualization with LLM-powered chat functionality. The application is designed to provide an interactive interface for viewing and manipulating SVG images while engaging in AI-assisted conversations.

## Features

### SVG Panel
- Displays an SVG image with multiple layers
- Left sidebar with toggle buttons for each SVG layer
- Zoom in/out functionality using mouse scroll
- Panning when zoomed in beyond image edges

### Chat Panel
- LLM chat client supporting multiple chat histories
- Multiple reusable agents (stored system prompts for LLM interaction)
- Interface for adding and editing agents
- Agent configuration includes name, LLM API URL, user key, and system prompt
- Programmatic chat context management
- Support for function calling

### Data Management
- Load and store JSON data in the browser's local storage
- List data sources with toggle buttons for including in chat context
- Select data source for SVG rendering

### Layout
- Two main panels divided by a sliding edge
- Responsive design for various screen sizes

## Technical Stack
- Frontend: TypeScript, React
- Backend: TypeScript, Node.js
- State Management: React Context API and hooks
- Styling: CSS Modules
- SVG Manipulation: Custom React components
- Chat Functionality: Integration with external LLM APIs

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm start`
4. Open your browser and navigate to `http://localhost:3000`

## Project Structure

- `src/`: Contains all the frontend source code
  - `components/`: React components
  - `services/`: API and data management services
  - `hooks/`: Custom React hooks
  - `types/`: TypeScript type definitions
  - `utils/`: Utility functions
- `server/`: Contains the backend source code
- `public/`: Static assets

## Next steps

1 Implement the sliding edge between SVG and Chat panels.
2 Add zoom and pan functionality to the SVG viewer.
3 Implement the agent management interface (adding, editing agents).
4 Create the JSON data source loading and management system.
5 Implement the actual LLM API calls and function calling framework.
6 Add more detailed styling and responsiveness.
7 Implement proper error handling and loading states.
8 Set up proper state management for chat histories.
9 Implement the SVG rendering logic based on the selected data source.

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License

This project has a proprietary license.
