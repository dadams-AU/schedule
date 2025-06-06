# Group Availability Scheduler

## 1. Project Overview

The Group Availability Scheduler is a full-stack web application designed to help teams find common available dates by allowing users to mark their unavailability on a shared calendar for specific projects. It provides a clear monthly view, project-based organization, and visual cues for unavailability. The entire application is containerized using Docker for ease of deployment and development.

## 2. Features

*   **Monthly Calendar View:** Displays a standard monthly calendar.
*   **Project-Based Scheduling:** Users can create new projects and select existing ones to manage availability.
*   **User Unavailability:** Users can set their name and mark specific dates they are unavailable for the selected project.
*   **Shared View:** Unavailability marked by all users for a selected project is visible on the calendar. A tooltip on unavailable days lists the users who are unavailable.
*   **Weekend Exclusion:** Saturdays and Sundays are visually distinct and cannot be selected as unavailable.
*   **Dockerized:** The entire application (frontend, backend, database) runs in Docker containers, orchestrated by Docker Compose.

## 3. Technology Stack

*   **Frontend:** HTML, CSS, JavaScript (Vanilla), Nginx (as web server and reverse proxy)
*   **Backend:** Node.js, Express.js, Sequelize (ORM for PostgreSQL)
*   **Database:** PostgreSQL
*   **Containerization:** Docker, Docker Compose

## 4. Prerequisites

*   **Docker Desktop** (or Docker Engine + Docker Compose CLI) installed and running.

## 5. Local Setup and Running (with Docker Compose)

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    ```
    (Replace `<repository-url>` with the actual URL of your repository)

2.  **Navigate to the project directory:**
    ```bash
    cd <project-directory>
    ```
    (Replace `<project-directory>` with the name of the cloned folder)

3.  **Create and configure the environment file:**
    *   In the project root, copy the example environment file:
        ```bash
        cp .env.example .env
        ```
    *   The `.env.example` file contains default credentials for the PostgreSQL database:
        ```env
        # .env.example
        # PostgreSQL Connection Details for Docker Compose
        DB_USERNAME=mycalendaruser
        DB_PASSWORD=mysecretcalendarpassword
        DB_NAME=calendar_app_dev
        ```
    *   You can customize these values in the newly created `.env` file if needed. The `docker-compose.yml` is set up to use these values, with defaults provided if `.env` is not present or variables are missing.

4.  **Build the Docker images:**
    This command builds the images for the frontend and backend services as defined in the `docker-compose.yml` file.
    ```bash
    docker-compose build
    ```

5.  **Start the application:**
    This command starts all the services (frontend, backend, database) in attached mode, so you'll see logs in your terminal.
    ```bash
    docker-compose up
    ```
    Alternatively, to run in detached mode (in the background):
    ```bash
    docker-compose up -d
    ```

6.  **Access the application:**
    Open your web browser and go to:
    [http://localhost:8080](http://localhost:8080)

7.  **Stopping the application:**
    *   If running in attached mode (with `docker-compose up`), press `Ctrl+C` in the terminal.
    *   Then, or if running in detached mode, run:
        ```bash
        docker-compose down
        ```
    *   To stop the application and remove the database volume (all data will be lost):
        ```bash
        docker-compose down -v
        ```

## 6. Project Structure (Brief)

```
.
├── backend/                    # Node.js backend application
│   ├── Dockerfile              # Dockerfile for the backend service
│   ├── config/                 # Sequelize database configuration
│   │   └── config.js
│   ├── models/                 # Sequelize models (Project, Unavailability)
│   │   └── index.js
│   ├── node_modules/           # (Gitignored, created by npm install)
│   ├── package-lock.json
│   ├── package.json
│   └── server.js               # Main Express server file
├── nginx_config/               # Nginx configuration
│   └── default.conf            # Custom Nginx config for frontend & proxy
├── .dockerignore               # Specifies files to ignore for Docker build contexts (root)
├── .env.example                # Example environment variables for Docker Compose
├── Dockerfile                  # Dockerfile for the Nginx frontend service
├── docker-compose.yml          # Docker Compose file to orchestrate all services
├── index.html                  # Frontend HTML, CSS, and JavaScript
├── README.md                   # This file
└── schema.sql                  # PostgreSQL schema definition (for reference)
```

## 7. Cloudron Deployment Considerations

This application is designed to be deployed using Docker and is well-suited for platforms like Cloudron.

*   **Database Requirement:** The application requires a PostgreSQL database. Cloudron can provide this as an addon/service.
*   **Environment Variables:** For Cloudron deployment, the following environment variables must be configured in the Cloudron application settings to connect to the Cloudron-managed PostgreSQL database:
    *   `DB_HOST` (e.g., `postgresql.service.internal` or as provided by Cloudron)
    *   `DB_USERNAME`
    *   `DB_PASSWORD`
    *   `DB_NAME`
    *   `DB_PORT` (usually `5432`)
    *   `NODE_ENV=production` (recommended for Cloudron deployments)
*   **Services:** The application consists of two main services that would need to be mapped in Cloudron based on the `docker-compose.yml` structure:
    *   **Frontend (Nginx):** This service (defined by the root `Dockerfile`) serves the static `index.html` and acts as a reverse proxy for `/api/*` requests. Cloudron would typically expose this service on port 80/443.
    *   **Backend (Node.js):** This service (defined by `backend/Dockerfile`) handles the API logic and database interactions. Cloudron's internal networking would route requests from the Nginx proxy (e.g., `http://backend:3001` as specified in `nginx_config/default.conf`) to this backend service. The `backend` service name in `docker-compose.yml` might need to be adjusted or mapped via Cloudron's service discovery.
*   **Database Volume:** The persistent volume for PostgreSQL data (`postgres_data` in `docker-compose.yml`) will be managed by Cloudron's volume management for its database addon.
*   **Build Process:** Cloudron can build the Docker images directly from the Dockerfiles present in the repository.
*   **Port Exposure:** The backend's port (3001) does not need to be explicitly exposed to the internet by Cloudron, as Nginx (frontend) will proxy requests to it. Only the Nginx port (80) needs to be exposed.

The application structure is generally compatible with Cloudron's Docker-based deployment model.

## Deploying to Cloudron

This application is configured for deployment on Cloudron using the LAMP stack (Apache, PHP).

Key components for Cloudron deployment:

*   **`CloudronManifest.json`**: Defines the application for the Cloudron platform, including necessary addons, environment variables, and start scripts.
*   **`apache_config/apache.conf`**: Custom Apache configuration. It serves static files from the `public` directory and proxies API requests from `/api/` to the backend Node.js application.
*   **`start.sh`**: Script used by Cloudron to start the Apache server and the backend Node.js application.
*   **`public/`**: This directory contains the static frontend assets (e.g., `index.html`).
*   **`backend/Dockerfile`**: Defines the environment for the Node.js backend.

**Prerequisites for Cloudron Deployment:**

*   A Cloudron instance.
*   The Cloudron CLI installed and configured if you are deploying from your local machine.

**Build & Deploy Steps (General Guide):**

1.  **Ensure your backend is configured to use environment variables** for any necessary services (like database connections). These can be set in the Cloudron application's settings or within the `CloudronManifest.json`.
2.  **Install the application on Cloudron:**
    *   You can push this repository to a Git service (like Gitea, GitLab, GitHub) that your Cloudron instance can connect to.
    *   Alternatively, you can use the Cloudron CLI to push the application directly:
        ```bash
        cloudron push --app <your-app-domain-on-cloudron>
        ```
3.  During the first installation, Cloudron will build the backend Docker image (if not already built and pushed to a registry specified in the manifest, which is not the case here) and set up the LAMP environment according to the manifest.
4.  The `start.sh` script will be executed to run Apache and the backend service.

Refer to the official Cloudron documentation for more detailed deployment instructions.
