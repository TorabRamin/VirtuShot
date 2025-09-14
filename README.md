# VirtuShot: AI Product Photography Studio

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

VirtuShot is a full-stack, production-ready, AI-powered web application designed to generate professional product photography for e-commerce, blogs, and marketing materials. Users can upload an image of a product, describe a scene, and leverage the power of Google's Gemini AI to create stunning, studio-quality photos in seconds.

The application is built with a modern three-tier architecture, fully containerized with Docker for easy deployment and scalability.

<!-- Placeholder for a GIF of the app in action -->
<!-- ![VirtuShot Demo](link-to-your-demo.gif) -->

---

## ✨ Key Features

### For Clients & End-Users
- **Secure Authentication**: Robust Sign Up and Login system using JWT.
- **Generous Free Tier**: New users receive 10 free credits to get started.
- **Intuitive Image Uploader**: Easy drag-and-drop or click-to-upload interface for product images (PNG, JPG, WEBP).
- **Powerful Scene Description**: Describe any scene imaginable, with a curated list of inspiring examples to spark creativity.
- **Multiple Artistic Styles**: Choose from Photorealistic, Vintage, Minimalist, Futuristic, and more, or generate an "All Styles Preview" grid.
- **Generate Variations**: Create multiple unique versions of a shot from a single prompt.
- **Real-time Credit System**: Credits are tracked and deducted in real-time.
- **Simulated Credit Purchasing**: A modal to "purchase" more credits, demonstrating a complete SaaS workflow.
- **In-Browser Image Editor**: Fine-tune generated images with adjustments for brightness, contrast, and saturation, plus cropping tools for various aspect ratios (1:1, 4:3, etc.).
- **Download High-Quality Images**: Easily download the final edited or unedited images directly to your device.

### For Administrators
- **Password-Protected Admin Portal**: A separate, secure dashboard for application management.
- **At-a-Glance Overview**: Dashboard with key metrics like total images generated, active clients, and recent API calls.
- **Live Activity Feed**: See new client signups and image generations as they happen.
- **Full Client Management (CRUD)**: Create, view, update, and manage all client accounts.
- **Credit & Status Control**: Manually add credits to any user and revoke or re-activate their access.
- **API Key Management**: View client API keys for integration purposes.
- **Developer-Ready Documentation**: Built-in API documentation and code examples (PHP, JavaScript) for integrating VirtuShot into other applications.
- **WordPress Plugin**: Provides ready-to-use, functional code for a WordPress plugin that integrates VirtuShot directly into the WooCommerce product editor.

---

## 🛠️ Technology Stack

This project utilizes a modern, robust technology stack chosen for performance, scalability, and developer experience.

| Tier         | Technology                                                                                                  | Description                                                                 |
|--------------|-------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------|
| **Frontend** | **React 19**, **TypeScript**, **Vite**, **Tailwind CSS**                                                      | A fast, modern, and type-safe single-page application for a seamless UX.    |
| **Backend**  | **Node.js**, **Express.js**, **Mongoose**                                                                   | A performant and scalable REST API server handling all business logic.      |
| **AI Model** | **Google Gemini API (`gemini-2.5-flash-image-preview`)**                                                      | The core AI engine for state-of-the-art image-in, image-out generation.     |
| **Database** | **MongoDB**                                                                                                 | A flexible and scalable NoSQL database for storing user and application data. |
| **Auth**     | **JSON Web Tokens (JWT)**, **bcrypt.js**                                                                    | Secure, stateless authentication with robust password hashing.              |
| **Deployment**| **Docker**, **Docker Compose**, **Nginx**                                                                    | Containerized services for consistent environments and easy deployment. Nginx serves the frontend and proxies API requests. |

---

## 🚀 Deployment & Setup

This application is containerized with Docker and orchestrated with Docker Compose, making deployment on a VPS or a service like Dockge straightforward.

### Prerequisites
-   A server/VPS with Docker and Docker Compose installed.
-   Git installed on your server.
-   A **Google Gemini API Key**. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Setup Instructions

1.  **Clone the Repository**
    Log in to your server via SSH and clone the project repository.
    ```bash
    git clone https://github.com/your-username/virtushot.git
    cd virtushot
    ```

2.  **Configure Environment Variables**
    The application uses an `.env` file to manage sensitive information. Copy the example file to create your own configuration.
    ```bash
    cp .env.example .env
    ```
    Now, open the `.env` file with a text editor (like `nano` or `vim`) and set the following variables:

    ```env
    # Your secret key from Google AI Studio
    API_KEY=your_gemini_api_key_goes_here

    # A long, random, secret string for signing JWT tokens
    # You can generate one here: https://www.uuidgenerator.net/
    JWT_SECRET=your_super_secret_jwt_string_here

    # The MongoDB connection string.
    # The default value is configured to work with the docker-compose setup and should not be changed unless you are using an external database.
    MONGO_URI=mongodb://db:27017/virtushot
    ```

3.  **Build and Run with Docker Compose**
    From the root directory of the project, run the following command. This will build the Docker images for the client and server, and start all three containers in detached mode (`-d`).
    ```bash
    docker-compose up --build -d
    ```
    - `--build`: Rebuilds the images if the code has changed.
    - `-d`: Runs the containers in the background.

4.  **Access Your Application**
    The application will now be running. The Nginx container is configured to listen on port `8080`. You can access it in your browser at:
    `http://<your_vps_ip_address>:8080`

### Using with Dockge

Dockge simplifies managing Docker Compose projects.
1.  After cloning the repo and setting up the `.env` file on your VPS, navigate to your Dockge UI.
2.  Click "Compose" and then "Scan Stacks Folder". Dockge should detect the `docker-compose.yml` file in your cloned repository.
3.  Alternatively, you can create a new stack, name it `virtushot`, and paste the contents of `docker-compose.yml` into the editor.
4.  Ensure the working directory for the stack points to the `virtushot` folder you cloned.
5.  Click "Up" or "Start" in the Dockge UI to deploy your application. You can now manage logs, start/stop, and update the application directly from Dockge.

### Stopping the Application
To stop the application, navigate to the project directory and run:
```bash
docker-compose down
```
To stop the containers and also remove the database volume (deleting all data):
```bash
docker-compose down -v
```
---

## 🏛️ Project Structure

```
.
├── client/             # React Frontend Application
│   ├── src/            # Source code, components, pages
│   ├── Dockerfile      # Builds the production client and sets up Nginx
│   └── nginx.conf      # Nginx config to serve the app and proxy API calls
├── server/             # Node.js Backend API
│   ├── src/            # Express server, routes, models, middleware
│   └── Dockerfile      # Builds the Node.js server image
├── .env                # Your local environment variables (ignored by git)
├── .env.example        # Example environment file
└── docker-compose.yml  # Orchestrates all services (client, server, db)
```
---

## 📄 License

This project is licensed under the MIT License. See the `LICENSE.md` file for details if one is included in the project.
